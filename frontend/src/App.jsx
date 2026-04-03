import React, { useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import DragDropErea from "./components/DragDropErea";
import SuccessArea from "./components/SuccessArea"; // 🚀 引入新組件
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFilesAdded = (addedFiles) => {
    setFiles(addedFiles);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setFiles([]);
    setIsSuccess(false);
  };

  const handleUploadAndProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post(
        "https://word-add-header-598245268617.europe-west1.run.app/process",
        formData,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "附件標註結果.zip");
      document.body.appendChild(link);
      link.click();
      handleReset();
    } catch (error) {
      alert("傳輸失敗，請檢查後端狀態");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {!isSuccess ? (
          <DragDropErea
            onFilesAdded={handleFilesAdded}
            isProcessing={isProcessing}
          />
        ) : (
          <SuccessArea
            fileCount={files.length}
            onDownload={handleUploadAndProcess}
            onReset={handleReset}
            isProcessing={isProcessing}
          />
        )}
      </main>
    </div>
  );
}

export default App;
