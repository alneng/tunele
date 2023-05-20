import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import BaseGame from "./pages/BaseGame";
import CustomGame from "./pages/CustomGame";
import NotFound from "./pages/NotFound";

const API_ORIGIN: string = "https://tunele-api.alaneng.com";

const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<BaseGame apiOrigin={API_ORIGIN} />} />
				<Route
					path="/custom"
					element={<CustomGame apiOrigin={API_ORIGIN} />}
				/>
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
};

export default App;
