import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import BaseGame from "@/pages/BaseGame";
import CustomGame from "@/pages/CustomGame";
import OAuthCallback from "@/pages/OAuthCallback";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BaseGame />} />
        <Route path="/custom" element={<CustomGame />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
