import { useEffect } from "react";

/**
 * React hook to check if the user is a first time user.
 *
 * @param openHelpModal function to set the help modal state
 */
export const useFirstTimeUser = (openHelpModal: (state: boolean) => void) => {
  useEffect(() => {
    if (localStorage.getItem("firstTimeUser") !== "false") {
      localStorage.setItem("firstTimeUser", "false");
      openHelpModal(true);
    }
  });
};
