import React, { useState } from "react";

const PlaylistSearch: React.FC = () => {
	const [inputValue, setInputValue] = useState<string>("");

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const handlePlaylistSearch = () => {
		if (inputValue.length !== 0)
			window.location.href = `/custom?playlist=${inputValue}`;
	};

	return (
		<div className="bg-[#131213] flex flex-col h-screen">
			<div className="flex-1 flex flex-col items-center">
				<div className="mt-16 mb-4">
					<h1 className="text-white text-center">
						Enter your playlist below
					</h1>
				</div>
				<input
					type="text"
					name="playlist"
					id="playlist"
					value={inputValue}
					onChange={handleInputChange}
					placeholder="Spotify Playlist URL"
					className="w-64 md:w-1/3 h-12 px-4 py-2 rounded bg-white text-black focus:outline-none"
				/>
				<button
					onClick={handlePlaylistSearch}
					className="mt-5 px-6 py-3 rounded-full bg-[#1fd660] text-black hover:bg-[#18b853] focus:outline-none"
				>
					Start Custom Game
				</button>
			</div>
		</div>
	);
};

export default PlaylistSearch;
