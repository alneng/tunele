import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import mergeGameData from "../utils/saved-data.utils";

import SavedGameData from "../types/SavedGameData";

const googleSsoParams = {
  redirect_uri: `https://tunele.app/auth/callback`,
  client_id:
    "602759062179-f1bmctur05h9p4uu60r08870b89hu3bl.apps.googleusercontent.com",
};

const UserAccountModal: React.FC<{ apiOrigin: string }> = ({ apiOrigin }) => {
  const [successfulLogin, setSuccessfulLogin] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [id, setId] = useState<string>("");

  useEffect(() => {
    let response: Response;
    fetch(`${apiOrigin}/api/auth/vat`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        response = res;
        return res.json();
      })
      .then((data) => {
        switch (response.status) {
          case 200:
            setUserName(data.given_name);
            setId(data.id);
            setSuccessfulLogin(true);
            break;
          case 500:
            if (data?.retry) refreshTokens();
            break;
          case 401:
            if (data?.retry) refreshTokens();
            break;
          default:
            console.log("Unable to validate or generate a new access token");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successfulLogin]);

  const refreshTokens = () => {
    fetch(`${apiOrigin}/api/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 200) setSuccessfulLogin(true);
        else if (response.status === 500) resetUserSession();
        else if (response.status === 401) resetUserSession();
        else {
          console.error("Handled unexpected error");
          resetUserSession();
        }
      })
      .catch(() => {
        resetUserSession();
      });
  };

  const resetUserSession = async () => {
    await fetch(`${apiOrigin}/api/auth/logout`, {
      method: "get",
      credentials: "include",
    });
    setSuccessfulLogin(false);
  };

  const handleGoogleSSO = () => {
    const baseUrl = "https://accounts.google.com";
    const endpoint = "/o/oauth2/v2/auth";
    const queryParams = {
      ...googleSsoParams,
      prompt: "consent",
      response_type: "code",
      scope: "email profile",
      access_type: "offline",
    };

    const url = new URL(endpoint, baseUrl);
    url.search = new URLSearchParams(queryParams).toString();
    window.location.href = url.href;
  };

  const updateLocalData = () => {
    fetch(`${apiOrigin}/api/user/${id}/fetch-data`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data: SavedGameData) => {
        const clientData: SavedGameData = JSON.parse(
          localStorage.getItem("userData") ?? '{ "main": [], "custom": {} }'
        );
        const dataToMerge: SavedGameData = mergeGameData(clientData, data);
        localStorage.setItem("userData", JSON.stringify(dataToMerge));
        toast.success("Successfully updated local data! Reloading page...", {
          position: toast.POSITION.BOTTOM_CENTER,
          pauseOnFocusLoss: false,
          hideProgressBar: true,
          autoClose: 2500,
          theme: "dark",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      })
      .catch(() => {
        toast.error("There was an error pulling your cloud data", {
          position: toast.POSITION.BOTTOM_CENTER,
          pauseOnFocusLoss: false,
          hideProgressBar: true,
          autoClose: 2500,
          theme: "dark",
        });
      });
  };

  const saveDataToCloud = () => {
    fetch(`${apiOrigin}/api/user/${id}/post-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: localStorage.getItem("userData"),
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          toast.success("Successfully saved data to cloud!", {
            position: toast.POSITION.BOTTOM_CENTER,
            pauseOnFocusLoss: false,
            hideProgressBar: true,
            autoClose: 2500,
            theme: "dark",
          });
        } else {
          toast.error("There was an error saving your data", {
            position: toast.POSITION.BOTTOM_CENTER,
            pauseOnFocusLoss: false,
            hideProgressBar: true,
            autoClose: 2500,
            theme: "dark",
          });
        }
      })
      .catch(() => {
        toast.error("There was an error saving your data", {
          position: toast.POSITION.BOTTOM_CENTER,
          pauseOnFocusLoss: false,
          hideProgressBar: true,
          autoClose: 2500,
          theme: "dark",
        });
      });
  };

  return (
    <>
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>
      {!successfulLogin && (
        <div>
          <p>
            Sign in with one of our account providers to save your progress to
            the cloud
          </p>
          <div className="my-4">
            <button
              onClick={handleGoogleSSO}
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
      {successfulLogin && (
        <div>
          <div className="my-2">
            <p>
              Welcome back, <span>{userName}</span>
            </p>
            <p>
              ID: <span>{id}</span>
            </p>
            <p>
              <button className="underline" onClick={resetUserSession}>
                Logout
              </button>
            </p>
          </div>
          <div className="p-4">
            <div className="my-2">
              <button
                onClick={updateLocalData}
                type="button"
                className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-download-cloud"
                >
                  <polyline points="8 17 12 21 16 17"></polyline>
                  <line x1="12" y1="12" x2="12" y2="21"></line>
                  <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path>
                </svg>
                <span className="ml-2">Pull saved data</span>
              </button>
            </div>
            <div className="my-2">
              <button
                onClick={saveDataToCloud}
                type="button"
                className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-upload-cloud"
                >
                  <polyline points="16 16 12 12 8 16"></polyline>
                  <line x1="12" y1="12" x2="12" y2="21"></line>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                  <polyline points="16 16 12 12 8 16"></polyline>
                </svg>
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
      <ToastContainer />
    </>
  );
};

export default UserAccountModal;
