import React, { useState, useRef, useEffect } from "react";
import {
  SendHorizontal,
  Bot,
  Sparkles,
  Menu,
  Paperclip,
  X,
} from "lucide-react";
import axios from "axios";
import ChatMessage from "../components/ChatMessage";
import Sidebar from "../components/Sidebar";
import io from "socket.io-client";

function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  // const [isFirstMessage, setIsFirstMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const responseRef = useRef(null);

  useEffect(() => {
    socketRef.current = null;
    return () => {
      socketRef.current && socketRef.current.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleResponse = (data) => {
      const content = data.message;
      if (responseRef.current) {
        console.log(content);
        responseRef.current += content;
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1].content += content;
          return updatedMessages;
        });
      } else {
        responseRef.current = content;
        setMessages((prev) => [...prev, { role: "assistant", content }]);
      }
    };

    const handleEndResponse = (data) => {
      console.log(data.message);
      responseRef.current = null;
      // setIsFirstMessage(() => true); // Reset isFirstMessage for the next response
    };

    socketRef.current.on("response", handleResponse);
    socketRef.current.on("end_response", handleEndResponse);

    return () => {
      socketRef.current.off("response", handleResponse);
      socketRef.current.off("end_response", handleEndResponse);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || isLoading) return;

    const formData = new FormData();
    formData.append("message", input);
    if (attachment) {
      formData.append("file", attachment);
    }

    const userMessage = {
      role: "user",
      content: input,
      attachment: attachment
        ? {
            name: attachment.name,
            size: attachment.size,
            type: attachment.type,
          }
        : null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachment(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });
      if (!response.body)
        throw new Error("ReadableStream not yet supported in this browser.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let message = "";
      let isFirstMessage = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {                              
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        message += chunk;

        if (isFirstMessage) {
          console.log('nahi')
          setMessages((prev) => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1].content = message;
            return updatedMessages;
          });
        } else {
          console.log('ha')
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: message },
          ]);
          isFirstMessage=true;
        }
      }
    } catch (error) {
      console.log(error);
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting to the server. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);                
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = "";
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-800">
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 p-4 flex items-center">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 dark:text-white hover:bg-gray-100 dark:hover:bg-black rounded-lg lg:hidde"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 px-4">
            <Sparkles className="text-purple-600" size={20} />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              AI Assistant
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <Bot size={40} className="text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-600 dark:text-white max-w-md">
                Try saying "Hello" or "How are you?" to start a conversation!
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-8 px-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} {...message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin">
                    <Bot size={20} />
                  </div>
                  <span>Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="space-y-2 dark:bg-slate-800">
              {attachment && (
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg">
                  <Paperclip size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message AI Assistant..."
                  className="w-full p-4 pr-24 dark:bg-slate-800 dark:text-white rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt,.js,.jsx,.ts,.tsx,.md,.json,.css,.html,.pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isLoading || attachment !== null}
                  >
                    <Paperclip size={20} className="dark:hover:text-black" />
                  </button>
                  <button
                    type="submit"
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                    disabled={(!input.trim() && !attachment) || isLoading}
                  >
                    <SendHorizontal size={20} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
