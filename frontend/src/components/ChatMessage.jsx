import React from "react";
import { Bot, User, Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatMessage({ role, content, attachment }) {
  const isBot = role === "assistant";

  return (
    <div
      className={`flex gap-4 mb-6 ${
        isBot ? "bg-gray-50 dark:bg-gray-700 rounded-lg p-4" : ""
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
        ${
          isBot
            ? "bg-purple-600 text-white"
            : "bg-gray-700 dark:bg-gray-600 text-white"
        }`}
      >
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-1">
          {isBot ? "AI Assistant" : "You"}
        </div>
        <div className="prose prose-sm max-w-none dark:prose-dark dark:text-white">
          {content && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-4 last:mb-0">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-blue-400 hover:text-blue-500 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-4 last:mb-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-4 last:mb-0">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1 last:mb-0">{children}</li>
                ),
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-100 text-gray-800 p-3 rounded-lg overflow-x-auto">
                      <code>{children}</code>
                    </pre>
                  ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600">
                    {children}
                  </blockquote>
                ),
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-bold mb-2">{children}</h3>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
          {attachment && (
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-600 p-2 rounded mt-2">
              <Paperclip size={16} className="text-gray-500 dark:text-black" />
              <span className="text-sm text-gray-700 dark:text-white">
                {attachment.name} ({Math.round(attachment.size / 1024)}KB)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
