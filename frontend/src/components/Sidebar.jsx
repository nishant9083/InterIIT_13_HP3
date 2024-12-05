import React, { useEffect, useState, useContext } from "react";
import { X, MessageSquare, Plus, Menu } from "lucide-react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function Sidebar({ show, onClose }) {
    const { toggleTheme } = useContext(ThemeContext);
    const { themeType } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleNewChat = () => {
      const newChatId = uuidv4();
      navigate(`/c/${newChatId}`);
      onClose();
    };

  return (
    <>
      {/* Overlay */}
      {show && (
        <div
          className="fixed inset-0 bg-black/30 lg:hidde z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 w-72 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out z-50
        ${show ? "translate-x-0" : "-translate-x-full static"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}          
          <div className="p-4 flex items-center justify-between">
            <button onClick={handleNewChat} className="flex items-center gap-2 hover:bg-gray-800 px-3 py-2 rounded-lg w-full">
              <Plus size={20} />
              <span>New Chat</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg lg:hidde"
            >
              <X size={20} className="" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto flex flex-col relative">
            <div className="px-2 py-4">
              <div className="text-gray-400 text-sm px-2 mb-2">Today</div>
              {[
                "Understanding React Hooks",
                "TypeScript Best Practices",
                "Modern CSS Techniques",
              ].map((chat, index) => (
                <button
                  key={index}
                  className="flex items-center gap-2 w-full px-2 py-3 hover:bg-gray-800 rounded-lg mb-1 transition-colors"
                >
                  <MessageSquare size={16} />
                  <span className="text-sm truncate">{chat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="flex flex-row justify-between dark:border-zinc-700 border-t-2 p-4">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 hover:bg-gray-700 rounded-lg">
              {/* Profile */}
              <img
                src="https://randomuser.me/api/portraits/women/32.jpg"
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm">Profile</span>
            </div>
            <div className="flex items-center  px-3 py-2 hover:bg-gray-700 rounded-lg">
              {/* Settings */}
              <button className="" onClick={toggleTheme}>
                {themeType === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
