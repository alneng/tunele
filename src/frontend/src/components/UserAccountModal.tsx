import React from "react";
import { useUser } from "../hooks/user.hooks";
import { CloudDownloadIcon, CloudUploadIcon } from "lucide-react";

const UserAccountModal: React.FC = () => {
  const {
    signedIn,
    username,
    id,
    handleGoogleLogin,
    handleLogout,
    updateLocalData,
    syncDataToRemote,
  } = useUser();

  return (
    <>
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>
      {!signedIn && (
        <div>
          <p>
            Sign in with one of our account providers to save your progress to
            the cloud
          </p>
          <div className="my-4">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55"
            >
              <svg
                className="mr-2 -ml-1 w-4 h-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      )}
      {signedIn && (
        <div>
          <div className="my-2">
            <p>Welcome back, {username}</p>
            <p>ID: {id}</p>
            <button className="underline" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className="p-4">
            <div className="my-2">
              <button
                onClick={updateLocalData}
                type="button"
                className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55"
              >
                <CloudDownloadIcon />
                <span className="ml-2">Pull saved data</span>
              </button>
            </div>
            <div className="my-2">
              <button
                onClick={syncDataToRemote}
                type="button"
                className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55"
              >
                <CloudUploadIcon />
                <span className="ml-2">Save data to cloud</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <p className="mt-10 text-gray-300">
        Tunele's{" "}
        <a href="/privacy" target="_blank" className="underline">
          Privacy Policy
        </a>
      </p>
    </>
  );
};

export default UserAccountModal;
