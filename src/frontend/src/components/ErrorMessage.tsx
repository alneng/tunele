import React from "react";

const ErrorMessage: React.FC<{ message: unknown }> = ({ message }) => {
  return (
    <div className="font-sf-pro flex flex-col justify-center items-center h-screen bg-[#131213] text-center text-white">
      <div className="text-lg">Encountered the following error:</div>
      <div className="text-lg text-gray-300">{JSON.stringify(message)}</div>

      <div className="mt-4">
        Try refreshing the page, or email{" "}
        <a
          href="mailto:support@tunele.app"
          className="underline pointer text-blue-500"
        >
          support@tunele.app
        </a>{" "}
        with a screenshot of this error if the issue persists
      </div>
    </div>
  );
};

export default ErrorMessage;
