import React, { useState } from "react";
import { AxiosApiError } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ErrorMessageProps {
  error: AxiosApiError;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  const [showTrace, setShowTrace] = useState(false);

  return (
    <div className="font-sf-pro flex flex-col justify-center items-center h-screen bg-[#131213] text-center text-white">
      <div className="text-lg">Encountered the following error</div>

      <div className="text-lg text-gray-300 max-w-[calc(100vw-2rem)] md:max-w-2xl">
        {error.response?.data && JSON.stringify(error.response.data, null, 2)}
      </div>

      <button
        onClick={() => setShowTrace(!showTrace)}
        className="flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      >
        {showTrace ? "Hide" : "Show"} Error Trace
        {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showTrace && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg text-sm text-gray-300 max-w-[calc(100vw-2rem)] md:max-w-2xl max-h-96 overflow-auto">
          {JSON.stringify(error, null, 2)}
        </div>
      )}

      <div className="mt-4 text-base max-w-[calc(100vw-2rem)]">
        Try refreshing the page, or email{" "}
        <a
          href="mailto:support@tunele.app"
          className="underline text-blue-500 hover:text-blue-400 transition-colors"
        >
          support@tunele.app
        </a>{" "}
        with a screenshot of this error if the issue persists
      </div>
    </div>
  );
};

export default ErrorMessage;
