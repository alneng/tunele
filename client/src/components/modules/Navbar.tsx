import React from "react";

const Navbar: React.FC = () => {
	const redirectCustomPlaylist = () => {
		window.location.href = "./custom";
	};

	const handleShowStats = () => {
		// implement using chrome local storage to get stored data
		// create a modal popup in the center of the page with the user's stats
	};

	const handleShowHelp = () => {
		// implement
		// create a modal popup in the center of the page with how to play the game
	};

	return (
		<div className="bg-[#131213] h-16 flex items-center justify-between border-b-2 border-white">
			<div className="ml-4">
				<button
					className="text-white p-2 focus:outline-none"
					onClick={redirectCustomPlaylist}
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
						className="feather feather-edit-2"
					>
						<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
					</svg>
				</button>
			</div>
			<div className="text-white">Tunele</div>
			<div className="mr-4">
				<button
					className="text-white p-2 focus:outline-none"
					onClick={handleShowStats}
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
						className="feather feather-bar-chart-2"
					>
						<line x1="18" y1="20" x2="18" y2="10"></line>
						<line x1="12" y1="20" x2="12" y2="4"></line>
						<line x1="6" y1="20" x2="6" y2="14"></line>
					</svg>
				</button>
				<button
					className="text-white p-2 focus:outline-none"
					onClick={handleShowHelp}
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
						className="feather feather-help-circle"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
						<line x1="12" y1="17" x2="12.01" y2="17"></line>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default Navbar;
