import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import BaseGame from "./pages/BaseGame";
import CustomGame from "./pages/CustomGame";
import NotFound from "./pages/NotFound";

const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<BaseGame />} />
				<Route path="/custom" element={<CustomGame />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
};

export default App;
