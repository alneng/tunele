import { toast, ToastOptions } from "react-toastify";

const toastConfig: ToastOptions = {
  position: toast.POSITION.BOTTOM_CENTER,
  pauseOnFocusLoss: false,
  hideProgressBar: true,
  autoClose: 2500,
  theme: "dark",
};

export const toastSuccess = (message: string) => {
  toast.success(message, toastConfig);
};

export const toastError = (message: string) => {
  toast.error(message, toastConfig);
};
