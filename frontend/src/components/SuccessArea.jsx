import React from "react";
import "../styles/SuccessArea.css";
import download from "../assets/download.svg";
import cancel from "../assets/cancel.svg";
const SuccessArea = ({ fileCount, onDownload, onReset, isProcessing }) => {
  return (
    <div className="success-area">
      <div className="success-icon">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="#EED4B7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="success-text">
        上傳成功，共有 <span className="highlight">{fileCount}</span> 個檔案
      </p>

      <div className="button-group">
        <button className="nav-btn-action reset-btn" onClick={onReset}>
          <img src={cancel} alt="" /> 取消
        </button>
        <button
          className="nav-btn-action download-btn"
          onClick={onDownload}
          disabled={isProcessing}
        >
          <img src={download} alt="" />
          {isProcessing ? "處理中..." : "下載"}
        </button>
      </div>
    </div>
  );
};

export default SuccessArea;
