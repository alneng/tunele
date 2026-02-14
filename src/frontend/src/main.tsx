import React from "react";
import ReactDOM from "react-dom/client";
import { initFaro } from "@/lib/faro";
import App from "@/app/App.tsx";
import "@/index.css";
import "react-toastify/dist/ReactToastify.css";

initFaro();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
