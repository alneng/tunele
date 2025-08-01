import React, { useMemo } from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  calculateBarHeights,
  calculateStatsBottom,
  countScores,
} from "@/utils/stats.utils";
import { GameResult } from "@/types";

const StatBar = ({
  label,
  count,
  height,
  isFailure = false,
}: {
  label: string;
  count: number;
  height: number;
  isFailure?: boolean;
}) => (
  <div className="relative">
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full flex items-center justify-center text-gray-300">
      <div className="absolute top-0 -mt-8 text-center w-full">{label}</div>
    </div>
    <Tooltip title={count} placement="bottom" arrow>
      <div
        className={`${isFailure ? "bg-red" : "bg-green"} w-4`}
        style={{ height: `${height}px` }}
      />
    </Tooltip>
  </div>
);

interface StatsModalProps {
  gameData: GameResult[];
}

const StatsModal: React.FC<StatsModalProps> = ({ gameData }) => {
  // State for scores and stats
  const scores = useMemo(() => countScores(gameData), [gameData]);
  const statsBarHeights = useMemo(
    () => (gameData ? calculateBarHeights(gameData) : Array(7).fill(0)),
    [gameData]
  );
  const { statsCorrectString, statsCorrectPercentageString } = useMemo(() => {
    if (gameData) return calculateStatsBottom(gameData);
    return {
      statsCorrectString: "0/0",
      statsCorrectPercentageString: "0.0",
    };
  }, [gameData]);

  const scoreCategories = [
    { label: "1°", score: 1 },
    { label: "2°", score: 2 },
    { label: "3°", score: 3 },
    { label: "4°", score: 4 },
    { label: "5°", score: 5 },
    { label: "6°", score: 6 },
    { label: "X", score: 0, isFailure: true },
  ];

  return (
    <div className="flex flex-col items-center">
      <p className="text-2xl font-semibold mb-4">Stats</p>

      <div className="flex pt-8 pb-4 space-x-6" style={{ height: "150px" }}>
        {scoreCategories.map((category) => (
          <div key={category.score}>
            <StatBar
              label={category.label}
              count={scores[category.score] || 0}
              height={statsBarHeights[category.score] || 0}
              isFailure={category.isFailure}
            />
          </div>
        ))}
      </div>

      <p className="text-gray-300">Your score distribution</p>

      <div className="flex flex-row w-full border-t-2 border-gray-800 mt-4 pt-2">
        <div className="flex flex-col items-center w-1/2">
          <div className="text-xl font-semibold">{statsCorrectString}</div>
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
