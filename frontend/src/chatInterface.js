import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { TextareaAutosize } from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import { FaFile, FaMicrophone } from "react-icons/fa6";
import { MdAttachFile } from "react-icons/md";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ListItemText from "@mui/material/ListItemText";
import { BsFillSendFill } from "react-icons/bs";
import HistoryIcon from "@mui/icons-material/History";
import { useState, useEffect, useRef } from "react";
import renderMessageContent from "./RenderMarkdown";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MessageIcon from "@mui/icons-material/Message";
import PersonIcon from "@mui/icons-material/Person";
import Avatar from "@mui/material/Avatar";
import io from "socket.io-client";

import CloseIcon from "@mui/icons-material/Close";
const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [file, setFile] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null); // For smooth scrolling
  const inputValueRef = useRef(null); // For smooth scrolling
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [themeType, setThemeType] = useState("light");
  const [isFirstRes, setIsFirstRes] = useState(true);

  const fileInputRef = useRef(null);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    setThemeType(() => {
      return prefersDarkMode ? "dark" : "light";
    });
  }, [prefersDarkMode]);
  useEffect(() => {
    let ws = io("http://localhost:5000");
    setSocket(ws);
  }, []);

  const CHUNK_SIZE = 64 * 1024;  // 64 KB chunks

  const sendFileInChunks = (file) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let currentChunk = 0;

    const reader = new FileReader();

    reader.onload = (event) => {
      const base64Chunk = event.target.result.split(',')[1];  // Extract base64 data
      socket.emit('file_chunk', {
        chunk: base64Chunk,
        chunkNumber: currentChunk,
        totalChunks: totalChunks,
        fileName: file.name,
        fileType: file.type
      });

      currentChunk += 1;
      if (currentChunk < totalChunks) {
        loadNextChunk();
      } else {
        socket.emit('file_complete', { fileName: file.name });
      }
    };

    const loadNextChunk = () => {
      const start = currentChunk * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const blob = file.slice(start, end);
      reader.readAsDataURL(blob);  // Read next chunk as base64
    };

    loadNextChunk();  // Start reading the first chunk
  };

  const Usertheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeType,
          primary: {
            main: "#90caf9",
          },
        },
      }),
    [themeType]
  );

  useEffect(() => {
    const handleResponse = (data) => {
      const newChunk = data.status;
      // alert(newChunk);
    }
 

    socket && socket.on("file-status", handleResponse);

    return () => {
      if (socket) {
        socket.off("file-status", handleResponse);
      }
    };
  }, [socket]);
    

  useEffect(() => {
    const handleResponse = (data) => {
      const newChunk = data.message;
      // setMessages((prevMessages) => {
      //   // const lastMessage = prevMessages[prevMessages.length - 1];
      //   // if (lastMessage && lastMessage.sender === "server") {
      //   //   // Append to the last message if it's from the server
      //   //   const updatedLastMessage = { ...lastMessage, content: lastMessage.content + newChunk };
      //   //   return [...prevMessages.slice(0, -1), updatedLastMessage];
      //   // } else {
      //     // Otherwise, create a new message object
      //     return [...prevMessages, { content: newChunk, sender: "server" }];
      //   // }
      // });
      console.log(messages);
      // if(messages === null)
      // messages = []
      messages &&
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[1] = [
            ...newMessages[1],
            { content: newChunk, sender: "server" },
          ];
          return newMessages;
        });
      console.log(messages);
    };

    socket && socket.on("response", handleResponse);

    return () => {
      if (socket) {
        socket.off("response", handleResponse);
      }
    };
  }, [socket]); // Add dependencies if needed

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const sendMessage = () => {
    if (socket && inputValue.trim() !== "") {
      const messageData = {
        message: inputValue,
        file: null,
      };

      const message = {
        content: inputValue,
        sender: "user",
      };
      if (messages.length === 0) {
        const id = new Date().toISOString();
        setMessages((prevState) => {
          return [id, [message]];
        });
      } else {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[1] = [...newMessages[1], message];
          return newMessages;
        });

        // messages[1].push({ content: '', sender: "server" });
      }
      if (file) {        
        socket.emit('file_start', { fileName: file.name, text: inputValue });  // Notify server of new file transfer
        sendFileInChunks(file);
        setFile(null);  // Clear file after sending
        fileInputRef.current.value = null;        
      }
      socket.emit("message", inputValue);
      // Clear the input after sending
      setInputValue("");
    }
  };

  const handleMicrophoneClick = () => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Your browser does not support speech recognition.");
    }
  };
  const handleThemeChange = () => {
    setThemeType(themeType === "light" ? "dark" : "light");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      console.log(file);
    }
  };
  const handleRemoveFile = () => {
    setFile(null);
    fileInputRef.current.value = null;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ThemeProvider theme={Usertheme}>
      <Box
        sx={{
          display: "flex ",
          overflowY: "auto",
        }}
        className="custom-scrollbar"
      >
        <CssBaseline />
        <AppBar
          key={theme.palette.mode}
          //   sx={{backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff',
          // color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
          // }}
          position="fixed"
          open={open}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              sx={{ fontFamily: "Monospace" }}
              variant="h6"
              noWrap
              component="div"
            >
              Naina
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={
            {
              // "& .MuiDrawer-paper": {
              //   backgroundColor: "#eff3ff",
              // },
            }
          }
          variant="permanent"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem key={1} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => {
                  if (messages.length < 1) return;
                  const historyId =
                    history.length > 0 ? history.map((item) => item[0]) : [];
                  if (historyId.includes(messages[0])) {
                    const index = history.indexOf(messages[0]);
                    history[index] = messages;
                    setMessages([]);
                  } else {
                    history.push(messages);
                    setMessages([]);
                  }
                }}
                title="New Chat"
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <MessageIcon />
                </ListItemIcon>
                <ListItemText
                  primary="New Chat"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem key={2} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => {
                  setOpen(!open);
                }}
                title="History"
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="History"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
              <Box
                className={`${
                  !open ? "hidden" : ""
                } ml-6 mr-6  overflow-y-auto custom-scrollbar max-h-32`}
              >
                <List className="m-auto space-y-2">
                  {history.length > 0 &&
                    history.map((chat, index) => (
                      <ListItem
                        key={chat[0]}
                        disablePadding
                        sx={{ display: "block" }}
                        className={`p-1 rounded-md hover:bg-slate-500 hover:cursor-pointer overflow-hidden text-ellipsis
                    ${chat[0] === messages[0] ? "bg-slate-500" : ""}
                    `}
                        onClick={() => {
                          if (messages.length < 1) {
                            // Set messages to clicked item messages
                            setMessages(chat);
                            return;
                          }
                          const currentId =
                            messages.length > 0 ? messages[0] : "";
                          const historyId =
                            history.length > 0
                              ? history.map((item) => item[0])
                              : [];

                          if (historyId.includes(currentId)) {
                            // Set messages to clicked item messages
                            setMessages(chat);
                          } else {
                            // Add messages to history
                            history.push(messages);
                            setMessages(chat);
                          }
                        }}
                      >
                        {chat[1][0].content}
                      </ListItem>
                    ))}
                </List>
              </Box>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem key={1} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={handleThemeChange}
                title="Change Theme"
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <IconButton>
                    {themeType === "dark" ? (
                      <DarkModeIcon />
                    ) : (
                      <LightModeIcon />
                    )}
                  </IconButton>
                </ListItemIcon>
                <ListItemText
                  primary={themeType === "light" ? "Light Mode" : "Dark Mode"}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
        {/* <Box
          className="flex flex-col h-screen w-screen"
          component="main"
          sx={{ backgroundColor: "" }}
        > */}
        <Box
          className={`flex flex-grow p-4 flex-wrap m-auto mt-10 mb-10 h-full max-w-screen-md`}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "left",
                alignItems: "center",

                height: "inherit", // Adjust as needed
                marginTop: "6rem",
              }}
            >
              <Typography
                sx={{ fontFamily: "cursive" }}
                variant=""
                className="text-6xl sm:text-8xl md:text-9xl  font-serif bg-gradient-to-br from-pink-500 to-blue-900 text-transparent bg-clip-text"
              >
                Welcome
              </Typography>
            </Box>
          ) : (
            <List className="flex flex-col gap-2 text-wrap w-full pb-16">
              {messages[1].map((message, index) => (
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: message.sender === "user" ? "flex-end" : "",
                  }}
                  // className={`flex`}
                  key={index}
                >
                  {message.sender === "server" && (
                    <Avatar>
                      <img
                        className="h-full w-full"
                        src="https://img.icons8.com/fluency/48/message-bot.png"
                        alt="message-bot"
                      />
                    </Avatar>
                  )}
                  <Box
                    sx={{ wordBreak: "break-word", textWrap: "wrap" }}
                    key={index}
                    className={`p-2 rounded-lg font-google-sans break-words 
                             ${
                               message.sender === "user"
                                 ? "bg-blue-500 text-white dark:bg-blue-500 max-w-fit"
                                 : `${
                                     themeType === "light"
                                       ? "text-black"
                                       : "text-white"
                                   } max-w-full`
                             }`}
                  >
                    {renderMessageContent(message.content)}
                  </Box>
                  {message.sender === "user" && (
                    <Avatar sx={{ marginLeft: "0.5rem" }}>
                      {/* <FaRegCircleUser className=" h-8 w-8 text-black dark:ircleUser className=" h-8 w-8 text-black dark:text-white" /> */}
                      <PersonIcon />
                    </Avatar>
                  )}
                </ListItem>
              ))}
              <Box ref={messagesEndRef} /> {/* Reference for scrolling */}
            </List>
          )}
        </Box>
        <Box
          sx={{
            position: "fixed",
            bottom: "0",
            left: "50%",
            transform: "translateX(-45%)",
            width: "calc(min(60%, 768px))",
            backgroundColor: "transparent",
          }}
          className="flex justify-center items-center py-2"
        >
          <Box
            className={`flex w-full max-w-screen-md rounded-3xl ${
              inputValue.split("\n").length > 1 ? "rounded-xl" : "rounded-full"
            }shadow-gray-400 dark:bg-gray-700 text-white dark:text-white dark:border-gray-600`}
          >
            <Box className="flex items-center pl-2">
              <MdAttachFile
                onClick={() => fileInputRef.current.click()}
                className="h-6 w-6 hover:rounded-full text-black dark:text-white cursor-pointer hover:bg-slate-500 "
              />
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {file && (
                <Box className="flex items-center ml-2">
                  <Typography variant="body2" className="mr-2">
                    {file.name}
                  </Typography>
                  <IconButton onClick={handleRemoveFile}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
            <TextareaAutosize
              ref={inputValueRef}
              placeholder="Enter your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                } else if (e.key === "Enter" && e.shiftKey) {
                  e.preventDefault();
                  const currentValue = e.target.value + "\n";
                  setInputValue(currentValue);
                  if (inputValueRef.current) {
                    inputValueRef.current.scrollIntoView(false, {
                      behavior: "smooth",
                    });
                  }
                }
              }}
              minRows={1}
              maxRows={isFocused ? 6 : 1}
              onFocus={() => setIsFocused(true)} // Set isFocused to true when the textarea is focused
              onBlur={() => setIsFocused(false)} // Set isFocused to false when the textarea loses focus
              wrap="soft"
              className={`flex-grow resize-none px-4 py-4 
               custom-scrollbar  bg-inherit ${
                 inputValue.split("\n").length > 1
                   ? "rounded-xl"
                   : "rounded-full"
               }
              outline-none focus:outline-none w-full dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition duration-300`}
            />
            <Box
              className={`flex  items-end pb-4 pl-1 pr-3 space-x-4 bg-inherit ${
                inputValue.split("\n").length > 1
                  ? "rounded-xl"
                  : "rounded-full"
              }`}
            >
              <FaMicrophone
                onClick={handleMicrophoneClick}
                className="h-6 w-6 hover:cursor-pointer hover:text-green-600 dark:text-white text-black"
                color={isListening ? "red" : ""}
              />
              <BsFillSendFill
                onClick={sendMessage}
                className="h-6 w-6  text-white  hover:cursor-pointer hover:text-green-600"
              />
            </Box>
          </Box>
        </Box>
      </Box>
      {/* </Box> */}
    </ThemeProvider>
  );
}
