import { useEffect } from "react";
import { useUserStore } from "@/store/user.store";
import { CloudDownloadIcon, CloudUploadIcon } from "lucide-react";
import { toastError, toastSuccess } from "@/utils/toast.utils";

const UserAccountModal = () => {
  const {
    signedIn,
    username,
    id,
    isLoading,
    checkAuth,
    init,
    login,
    logout,
    syncDataFromServer,
    syncDataToServer,
  } = useUserStore();

  // Check authentication status when component mounts
  useEffect(() => {
    if (!init) checkAuth();
  }, [checkAuth, init]);

  // Handle pulling data from server
  const handlePullData = async () => {
    try {
      await syncDataFromServer();
      toastSuccess("Successfully updated local data!");
    } catch {
      toastError("There was an error pulling your cloud data");
    }
  };

  // Handle pushing data to server
  const handleSaveToCloud = async () => {
    try {
      await syncDataToServer();
      toastSuccess("Successfully saved data to cloud!");
    } catch {
      toastError("There was an error saving your data");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      )}

      {!isLoading && !signedIn && (
        <div>
          <p>Sign in with one of our account providers to save your progress to the cloud</p>
          <div className="my-4">
            <button
              onClick={login}
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

      {!isLoading && signedIn && (
        <div>
          <div className="my-2">
            <p>Welcome back, {username}</p>
            <p>ID: {id}</p>
            <button className="underline" onClick={logout}>
              Logout
            </button>
          </div>
          <div className="p-4">
            <div className="my-2">
              <button
                onClick={handlePullData}
                disabled={isLoading}
                type="button"
                className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 disabled:opacity-50"
              >
                <CloudDownloadIcon />
                <span className="ml-2">Pull saved data</span>
              </button>
            </div>
            <div className="my-2">
              <button
                onClick={handleSaveToCloud}
                disabled={isLoading}
                type="button"
                className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 disabled:opacity-50"
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
