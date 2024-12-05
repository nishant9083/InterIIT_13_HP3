// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000'); // Replace with your backend URL

// const BackendActivity = () => {
//   const [activities, setActivities] = useState([]);

//   useEffect(() => {
//     socket.on('agent_process', (activity) => {
//       setActivities((prevActivities) => [...prevActivities, activity.message]);
//     });

//     return () => {
//       socket.off('agent_process');
//     };
//   }, []);

//   return (
//     <div className="p-4 bg-gray-100 rounded-lg shadow-md">
//       <h2 className="text-xl font-bold mb-4">Backend Activities</h2>
//       <ul>
//         {activities.map((activity, index) => (
//           <li key={index} className="mb-2">
//             {activity}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default BackendActivity;
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";

const socket = null//io("http://localhost:5000"); // Replace with your backend URL

const Node = ({ value, index, isActive }) => (
  <div className="flex flex-col items-center">
    {" "}
    <motion.div
      className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${
        isActive ? "bg-green-500" : "bg-blue-500"
      }`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {" "}
      {value}{" "}
    </motion.div>{" "}
    <span className="mt-2">Node {index + 1}</span>{" "}
  </div>
);

const DataFlow = () => {
  const [values, setValues] = useState({
    node1: null,
    node2: null,
    node3: null,
  });
  const [activeNode, setActiveNode] = useState(null);

  useEffect(() => {
    socket && socket.on("agent_process", (data) => {
      setValues((prevValues) => ({
        ...prevValues,
        [data.message]: data.message,
      }));
      setActiveNode(data.node);

      // Reset active node after animation
      setTimeout(() => setActiveNode(null), 1000); // Adjust the timeout duration as needed
    });

    return () => {
      socket && socket.off("agent_process");
    };
  }, []);

  return (
    <div className="flex justify-around flex-wrap mt-10">
      {" "}
      {Object.keys(values).map((node, index) => (
        <Node
          key={node}
          value={values[node]}
          index={index}
          isActive={activeNode === node}
        />
      ))}{" "}
    </div>
  );
};
export default DataFlow;
