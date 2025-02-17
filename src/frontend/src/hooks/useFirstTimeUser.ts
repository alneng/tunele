import { useEffect } from "react";

const useFirstTimeUser = (openHelpModal: (state: boolean) => void) => {
  useEffect(() => {
    if (localStorage.getItem("firstTimeUser") !== "false") {
      localStorage.setItem("firstTimeUser", "false");
      openHelpModal(true);
    }
  });
};

export default useFirstTimeUser;
