import React from "react";
import { Link } from "react-router-dom";
import "tailwindcss/tailwind.css";
import "../App.css";
import Lottie from "react-lottie";
import animationData from "../utils/Animation - 1709406018252.json";

function Home() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    // rendererSettings: {
    //   preserveAspectRatio: 'xMidYMid slice'
    // }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center pt-10 bg-white dark:bg-gray-900 pb-8 h-screen max-h-full">
      <div className="md:w-1/2 flex justify-center">
        <Lottie options={defaultOptions} height={500} width={500} />
      </div>
      <div className="md:w-1/2 flex flex-col items-center md:items-start md:pl-10">
        <h1 className="text-center md:text-left text-lg md:text-3xl lg:text-4xl font-bold font-mono mb-4 dark:text-white">
          Welcome to Rag2Richers
        </h1>
        <p className="text-center md:text-left text-sm md:text-lg text-gray-600 dark:text-gray-50 mb-4">
          This is your one stop solution for any kind of Financial Assistant.
        </p>
        <Link
          to="/chat"
          className="px-6 py-3 text-white rounded-bl-3xl rounded-tr-3xl bg-gradient-to-tr from-blue-700 to-purple-700 hover:bg-gradient-to-tr hover:to-blue-800 hover:from-purple-800 transition duration-300 "
        >
          Start Chatting
        </Link>
      </div>
    </div>
  );
}

export default Home;
