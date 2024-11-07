import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import BrowserRouter, Switch, and Route
import './index.css';
import App from './App';
import MessageInterface from './bot';
import reportWebVitals from './reportWebVitals';
import MiniDrawer from './chatInterface';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>} /> {/* Add a route for the root path */}
        <Route path="/chatI" element = {<MessageInterface/>}/>
        <Route path="/chat" element = {<MiniDrawer/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
