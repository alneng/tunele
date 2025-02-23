import React from "react";
import { useAuthCallback } from "@/hooks/auth.hooks";

const OAuthCallback: React.FC = () => {
  useAuthCallback();

  return (
    <div className="font-sf-pro flex flex-col justify-center items-center h-screen bg-[#131213] text-center text-white">
      <div className="text-lg">Redirecting...</div>
      <div className="text-lg text-gray-300">
        Click{" "}
        <a href="/" className="underline text-white">
          here
        </a>{" "}
        if you aren't automatically redirected
      </div>
    </div>
  );
};

export default OAuthCallback;
