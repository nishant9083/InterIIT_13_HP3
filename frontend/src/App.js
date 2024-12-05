import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MessageInterface from "./pages/chatInterface";
import ErrorPage from "./pages/Error";
import Dashboard from "./pages/Dashboard";
import { CssBaseline } from "@mui/material";


function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/chat" element={<MessageInterface />} />
        <Route path="/new" element={<Dashboard />} />
        <Route path="/c/:id" element={<Dashboard />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
