/**
 * Initialize local game storage data if it doesn't exist.
 */
export const initializeGameStorage = () => {
  if (!localStorage.getItem("userData")) {
    localStorage.setItem("userData", JSON.stringify({ main: [], custom: {} }));
  }
};
