import React from 'react';
import { Link } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import './App.css';
import Lottie from 'react-lottie';
import animationData from './Animation - 1709406018252.json';

function App() {
  const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
    
  return (
    <div className="flex flex-col items-center pt-10 bg-white dark:bg-gray-900 pb-8">
      <h1 className="text-center text-lg md:text-2xl lg:text-4xl font-bold font-mono mb-4 dark:text-white">Welcome to the Personal Chat Assistant</h1>
      <p className="text-center text-sm md:text-lg text-gray-600 dark:text-gray-50">
        This is a chat assistant that can help you with various tasks and answer your questions.
      </p>
      
      <div className="">
        <Lottie 
          options={defaultOptions}
          // height={400}
          // width={600}
        />
      </div>
      <Link
        to="/chat"
        className="px-6 py-3 text-white rounded-bl-3xl rounded-tr-3xl bg-gradient-to-tr from-blue-700 to-purple-700 hover:bg-gradient-to-tr hover:to-blue-800 hover:from-purple-800 transition duration-300 "
      >
        Start Chatting
      </Link>
    </div>
  );
};

export default App;
