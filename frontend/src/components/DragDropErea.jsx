import React, { useState, useRef } from "react"; // 1. 匯入 useRef
import FilePlus from "../assets/add_file.svg";
import "../styles/DragDropErea.css";

const DragDropErea = ({ onFilesAdded, isProcessing }) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null); // 2. 建立遙控器

  // 點擊 div 時，轉發點擊給隱藏的 input
  const handleClick = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 處理點擊選取的檔案（包含資料夾）
  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    // 過濾出 Word 檔案並傳回父組件
    const wordFiles = files.filter((file) => file.name.match(/\.(doc|docx)$/));
    onFilesAdded(wordFiles);

    // 重設 input 值，確保選同一個資料夾時還能觸發
    e.target.value = "";
  };

  // 原有的遞迴讀取資料夾邏輯 (用於 Drag and Drop)
  const traverseFileTree = async (entry) => {
    let wordFiles = [];
    if (entry.isFile) {
      const file = await new Promise((res) => entry.file(res));
      if (file.name.match(/\.(doc|docx)$/)) wordFiles.push(file);
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const entries = await new Promise((res) => reader.readEntries(res));
      for (let e of entries) {
        wordFiles = wordFiles.concat(await traverseFileTree(e));
      }
    }
    return wordFiles;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (isProcessing) return;

    const items = e.dataTransfer.items;
    let allFiles = [];
    for (let item of items) {
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) allFiles = allFiles.concat(await traverseFileTree(entry));
    }
    onFilesAdded(allFiles);
  };

  return (
    <div
      className={`drag-area ${isHovering ? "hover" : ""}`}
      onClick={handleClick} // 3. 綁定點擊事件
      onDragOver={(e) => {
        e.preventDefault();
        setIsHovering(true);
      }}
      onDragLeave={() => setIsHovering(false)}
      onDrop={handleDrop}
    >
      {/* 4. 隱藏的 input，設定 webkitdirectory 讓它選資料夾 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleInputChange}
        webkitdirectory="true" // Chrome/Edge/Safari 選資料夾關鍵
        mozdirectory="true" // Firefox 相容
        multiple
      />

      <img src={FilePlus} alt="Add File" className="upload-icon" />
      <p className="drag-text">請將檔案或資料夾拖曳至此，或點擊選取</p>

      {isProcessing && <div className="processing-overlay">處理中...</div>}
    </div>
  );
};

export default DragDropErea;
