import React from "react";
import { FileText, History, Settings, LogOut } from "lucide-react";
import "../styles/Sidebar.css";
import word from "../assets/word.svg";
import goBack from "../assets/go_back.svg";
const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logos">
        <div className="top">
          <img src={word} className="icons" title="word" />
        </div>
        <div className="buttom">
          <img src={goBack} className="icons" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
