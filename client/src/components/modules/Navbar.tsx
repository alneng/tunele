import React from "react";

interface NavbarProps {
	setHelpModal: (state: boolean) => void;
	setStatsModal: (state: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setHelpModal, setStatsModal }) => {
	const redirectCustomPlaylist = () => {
		window.location.href = "./custom";
	};

	const redirectToGithub = () => {
		window.open("https://github.com/wildrxge/tunele", "_blank");
	};

	const handleShowStats = () => {
		setStatsModal(true);
	};

	const handleShowHelp = () => {
		setHelpModal(true);
	};

	return (
		<div className="absolute top-0 left-0 right-0 bg-[#131213] h-16 flex items-center justify-between border-b-2 border-white">
			<div className="ml-4">
				<button
					className="text-white p-2 focus:outline-none"
					onClick={redirectCustomPlaylist}
					title="Custom Playlist"
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
				<button
					className="text-white p-2 focus:outline-none"
					onClick={redirectToGithub}
					title="GitHub"
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
						className="feather feather-github"
					>
						<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
					</svg>
				</button>
			</div>
			<div className="text-white">
				<a href="/">
					<img
						src="/tunele-transparent-bg.png"
						alt="Tunele (logo)"
						className="max-h-5"
					/>
				</a>
			</div>
			<div className="mr-4">
				<button
					className="text-white p-2 focus:outline-none"
					onClick={handleShowStats}
					title="Stats"
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
					title="Help"
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
