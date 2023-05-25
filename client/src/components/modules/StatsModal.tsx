import React from "react";

interface StatsBarHeightsState {
	[key: number]: number;
}

interface StatsModalProps {
	statsBarHeights: StatsBarHeightsState;
	statsCorrectString: string;
	statsCorrectPercentageString: string;
}

const StatsModal: React.FC<StatsModalProps> = ({
	statsBarHeights,
	statsCorrectString,
	statsCorrectPercentageString,
}) => {
	return (
		<div className="flex flex-col items-center">
			<p className="text-2xl font-semibold mb-4">Stats</p>

			<div className="flex pt-8 pb-4" style={{ height: "150px" }}>
				<div className="relative">
					<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex items-center justify-center text-gray-300">
						<div className="absolute top-0 -mt-8 text-center w-full">
							1°
						</div>
					</div>
					<div
						className={`bg-green w-4`}
						style={{ height: `${statsBarHeights[1]}px` }}
					></div>
				</div>
				<div className="relative ml-6">
					<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex items-center justify-center text-gray-300">
						<div className="absolute top-0 -mt-8 text-center w-full">
							2°
						</div>
					</div>
					<div
						className={`bg-green w-4`}
						style={{ height: `${statsBarHeights[2]}px` }}
					></div>
				</div>
				<div className="relative ml-6">
					<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex items-center justify-center text-gray-300">
						<div className="absolute top-0 -mt-8 text-center w-full">
							3°
						</div>
					</div>
					<div
						className={`bg-green w-4`}
						style={{ height: `${statsBarHeights[3]}px` }}
					></div>
				</div>
				<div className="relative ml-6">
					<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex items-center justify-center text-gray-300">
						<div className="absolute top-0 -mt-8 text-center w-full">
							4°
						</div>
					</div>
					<div
						className={`bg-green w-4`}
						style={{ height: `${statsBarHeights[4]}px` }}
					></div>
				</div>
				<div className="relative ml-6">
					<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex items-center justify-center text-gray-300">
						<div className="absolute top-0 -mt-8 text-center w-full">
							5°
						</div>
					</div>
					<div
						className={`bg-green w-4`}
						style={{ height: `${statsBarHeights[5]}px` }}
					></div>
				</div>
				<div className="relative ml-6">
					<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex items-center justify-center text-gray-300">
						<div className="absolute top-0 -mt-8 text-center w-full">
							6°
						</div>
					</div>
					<div
						className={`bg-green w-4`}
						style={{ height: `${statsBarHeights[6]}px` }}
					></div>
				</div>
				<div className="relative ml-6">
					<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex items-center justify-center text-gray-300">
						<div className="absolute top-0 -mt-8 text-center w-full">
							X
						</div>
					</div>
					<div
						className={`bg-red w-4`}
						style={{ height: `${statsBarHeights[0]}px` }}
					></div>
				</div>
			</div>

			<p className="text-gray-300">Your score distribution</p>

			<div className="flex flex-row w-full border-t-2 border-gray-800 mt-4 pt-2">
				<div className="flex flex-col items-center w-1/2">
					<div className="text-xl font-semibold">
						{statsCorrectString}
					</div>
					<div className="text-gray-300">Correct</div>
				</div>
				<div className="flex flex-col items-center w-1/2">
					<div className="text-xl font-semibold">
						{statsCorrectPercentageString}%
					</div>
					<div className="text-gray-300">Correct %</div>
				</div>
			</div>
		</div>
	);
};

export default StatsModal;
