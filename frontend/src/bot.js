import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark, atomDark, darcula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import TextareaAutosize from 'react-textarea-autosize';
import { FaRegCircleUser } from "react-icons/fa6";
import { FiMenu } from 'react-icons/fi'; // import the icon you want to use
import NavbarComponent from './NavBar';

function MessageInterface() {
    const [messages, setMessages] = useState([ {
        content: `**3. Freeze Initial Layers:**
        - Freeze the initial layers of the pre-trained model to preserve their learned features.
        - Typically, the first few convolutional layers or transformer encoder layers are frozen.
                        
        **4. Add New Layers:**
        - Add new layers to the end of the pre-trained model to account for your specific task.
        - These layers can include dense layers, pooling layers, or additional convolutions.
        
        **5. Train the New Layers:**
        - Train the new layers while keeping the frozen layers fixed.`,
        sender: "server",
      }]);
    const [inputValue, setInputValue] = useState('');
    const [socket, setSocket] = useState(null);  
    const [isSidebarShown, setIsSidebarShown] = useState(true);  
    const messageBuffer = useRef('');
    const messagesEndRef = useRef(null); // For smooth scrolling 
    const inputValueRef = useRef(null); // For smooth scrolling 

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        setSocket(ws);

        ws.onmessage = (event) => {
            const newChunk = event.data;
            // messageBuffer.current += newChunk;         
            setMessages((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                const updatedMessages = [...prevMessages];
                if (lastMessage && lastMessage.sender === 'server') {
                    lastMessage.content += newChunk;
                } else {
                    updatedMessages.push({ content: newChunk, sender: 'server' });
                }
                return updatedMessages;
            });
            // } else {
            //     // Handle the case when newChunk is 'END-SERVER'
            //     // Add your code here
            // }

            // Extract partial message content from the buffer
            // let partialMessage = '';
            // while (messageBuffer.current.length > 0) {
            //     try {
            //         const partialMessage = messageBuffer.current.slice(0, messageBuffer.current.indexOf('\n') + 1); // Extract up to newline
            //         messageBuffer.current = messageBuffer.current.slice(partialMessage.length); // Remove processed content

            // Render the partial message immediately
            //     // setMessages((prevMessages) => [...prevMessages, createTemporaryMessage(partialMessage)]); // Mark as temporary
            // } catch (error) {
            //     // Handle parsing errors (optional)
            //     break;
            // }
        }

        // function createTemporaryMessage(content) {
        //     return { content, sender: 'server', temporary: true };
        // }

        // // If the buffer is empty, it signifies the end of a complete message
        // if (messageBuffer.current.length === 0) {
        //     // Parse the remaining buffer (if any) for complete messages
        //     const completeMessages = parseMessages(messageBuffer.current);
        //     if (completeMessages.length > 0) {
        //         setMessages((prevMessages) => [...prevMessages, ...completeMessages]);
        //         messageBuffer.current = ''; // Clear buffer after processing complete messages
        //     }

        //     // Update temporary messages to regular messages after receiving the complete content
        //     setMessages((prevMessages) =>
        //         prevMessages.map((message) =>
        //             message.temporary ? { ...message, temporary: false } : message
        //         )
        // );
        // }
        // };

        // Clean up the WebSocket connection on unmount
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    // const parseMessages = (buffer) => {
    //     const messages = [];
    //     while (buffer.length > 0) {
    //         try {
    //             const messageObj = JSON.parse(buffer);
    //             messages.push(messageObj);
    //             buffer = buffer.slice(messageObj.content.length + 1); // Remove processed message from buffer
    //         } catch (error) {
    //             // Handle incomplete messages gracefully, potentially accumulating in the buffer until a complete message is received
    //             break;
    //         }
    //     }
    //     return messages;
    // };

    const sendMessage = () => {
        if (socket && inputValue.trim() !== '') {
            const message = {
                content: inputValue,
                timestamp: new Date().toISOString(),
                sender: 'user',
            };

            setMessages((prevMessages) => [...prevMessages, message]);
            setInputValue('');
            socket.send(inputValue);
        }
    };

    const renderMessageContent = (content) => {
        // Implement logic to handle Markdown formatting or other potential message types (e.g., images, links)
        // You can use libraries like marked.js for Markdown processing: https://marked.js.org

        // Example basic rendering for plain text (replace with your Markdown handling)
        return <Markdown components={{
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
        }} remarkPlugins={[remarkGfm]}>{content}</Markdown>;
    };
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    useEffect(() => {
        inputValueRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [inputValue]);
    return (
        <>
        <NavbarComponent />
        <div className="grid grid-cols-4 w-full rounded-lg border overflow-hidden border-gray-200 divide-y divide-gray-200">            
            {isSidebarShown && (<div className="col-span-1 bg-gray-300">
                
                <nav className="p-4 space-y-4">
                    <Link className="block py-2 text-gray-700 hover:text-gray-900" href="#">
                        New Chat
                    </Link>
                    <Link className="block py-2 text-gray-700 hover:text-gray-900" href="#">
                        Profile
                    </Link>
                    <Link className="block py-2 text-gray-700 hover:text-gray-900" href="#">
                        Settings
                    </Link>
                    <Link className="block py-2 text-gray-700 hover:text-gray-900" href="#">
                        Logout
                    </Link>
                </nav>

            </div>)}
            <div className={` ${isSidebarShown ? 'col-span-3' : 'col-span-4'}`}>                
                <div className="flex flex-col h-screen border-4 border-green-700 bg-white dark:bg-gray-800">
                    <div className={`flex ${messages.length === 0 ? "justify-center" : ""} flex-grow p-4 flex-wrap mr-4 mt-4 overflow-y-auto custom-scrollbar ml-4 h-full`}>
                        <div className="flex flex-col gap-2 text-wrap w-full">
                            {messages.map((message, index) => (

                                <div className={`flex ${message.sender === 'user' ? "justify-end" : ""}`} key={index}>
                                    {message.sender === 'server' && (<div className='flex flex-grow-0 items-center pr-2 h-10 w-10'>
                                        <img className='h-full w-full' src="https://img.icons8.com/fluency/48/message-bot.png" alt="message-bot" />
                                    </div>)}
                                    <div
                                        key={index}
                                        className={`p-2 rounded-lg text-wrap break-before-auto break-words font-google-sans
                             ${message.sender === 'user'
                                                ? 'bg-blue-500 text-white dark:bg-blue-700 max-w-fit'
                                                : ' dark:bg-gray-900 dark:text-white max-w-full'
                                            }`}
                                    >
                                        {message.temporary ? (
                                            <div className="animate-pulse">
                                                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div> {/* Adjust width as needed */}
                                            </div>
                                        ) : (
                                            renderMessageContent(message.content)
                                        )}

                                    </div>
                                    {message.sender === 'user' && (
                                        <div className="flex items-center pl-2">
                                            <FaRegCircleUser className="mr-2 h-8 w-8 text-black dark:text-blue-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div className="font-serif text-start text-4xl sm:text-7xl lg:text-9xl m-auto bg-gradient-to-br from-violet-700 to-lime-500 text-transparent bg-clip-text">Welcome</div>
                            )}
                            <div ref={messagesEndRef} /> {/* Reference for scrolling */}
                        </div>
                    </div>
                    <div className="pb-4 pl-4 pr-4" >
                        <div className="flex w-full justify-center">
                            <TextareaAutosize
                                ref={inputValueRef}
                                type="text"
                                placeholder='Enter your message...'
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                    else if (e.key === 'Enter' && e.shiftKey) {
                                        e.preventDefault();
                                        const currentValue = e.target.value + '\n';
                                        setInputValue(currentValue);
                                        if (inputValueRef.current) {
                                            inputValueRef.current.scrollIntoView(false, { behavior: 'smooth' }); // Optional: Add smooth scrolling behavior
                                        }

                                    }
                                }
                                }
                                minRows={1}
                                maxRows={6}
                                wrap='soft'
                                className={`flex-grow resize-none px-4 py-4 mr-2 border overflow-auto custom-scrollbar border-gray-300 ${inputValue.split('\n').length > 1 ? 'rounded-xl' : 'rounded-full'} focus:outline-none  max-w-screen-md shadow-xl shadow-gray-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition duration-300`}
                            />
                            {/* <button
                        onClick={sendMessage}
                        className="px-4 py-2 text-white bg-blue-500 h-16 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  hover:bg-blue-600 transition duration-300"
                    >
                        Send
                    </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default MessageInterface;
