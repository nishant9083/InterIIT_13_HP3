import React from 'react';
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  dark,
  atomDark,
  darcula,
} from "react-syntax-highlighter/dist/esm/styles/prism";


export default function renderMessageContent(content) {
    const components = {
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
      
          const language = match ? match[1] : 'text'; // Default to 'text' if no language specified
      
          return (
            <SyntaxHighlighter
              key={node.key}
              {...rest}
              language={language}
              pretag="div"
              children={String(children).replace(/\n$/, "")}
              style={atomDark}
            />
          );
        },
        // Add more components here for other elements with specific rendering requirements
      };
    return (
        <Markdown components={{
            code(props) {
                const { children, className, node, ...rest } = props
                const match = /language-(\w+)/.exec(className || '')
                return match ? (
                    <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        children={String(children).replace(/\n$/, '')}
                        language={match[1]}
                        style={atomDark}
                    />
                ) : (
                    <code {...rest} className={className}>
                        {children}
                    </code>
                )
            }
        }} remarkPlugins={[remarkGfm]}>{content}</Markdown>
    );

  };