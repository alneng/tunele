import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="bg-[#131213] flex flex-col justify-center items-center h-screen text-white">
      <div id="spinner" className="animate-spin rounded-full h-8 w-8 border-y-2 border-l-2 border-white"></div>
    </div>
  );
};

export default Loader;
