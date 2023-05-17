import React from "react";

const Navbar: React.FC = () => {
	const redirectCustomPlaylist = () => {
		window.location.href = "./custom";
	};

	return (
		<div className="bg-slate-800 h-16 text-white flex align-middle">
			<div className="flex w-1/4">
				<button onClick={redirectCustomPlaylist}>Custom</button>
			</div>
			<div className="flex w-1/2 place-items-center align-middle">
				<div>Logo</div>
			</div>
			<div className="flex w-1/4">Buttons</div>
		</div>
	);
};

export default Navbar;
