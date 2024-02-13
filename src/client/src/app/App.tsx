import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import BaseGame from "../pages/BaseGame";
import CustomGame from "../pages/CustomGame";
import OAuthCallback from "../pages/OAuthCallback";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import NotFound from "../pages/NotFound";

const API_ORIGIN: string =
  import.meta.env.MODE === "development"
    ? "http://localhost:7600"
    : "https://api.tunele.app";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BaseGame apiOrigin={API_ORIGIN} />} />
        <Route path="/custom" element={<CustomGame apiOrigin={API_ORIGIN} />} />
        <Route
          path="/auth/callback"
          element={<OAuthCallback apiOrigin={API_ORIGIN}></OAuthCallback>}
        />
        <Route path="/privacy" element={<PrivacyPolicy></PrivacyPolicy>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
