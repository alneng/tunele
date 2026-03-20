import { GameResult } from "@/types";

export interface NumberToNumberMapping {
  [key: number]: number;
}

/**
 * Counts the scores of an array of GameResult
 *
 * @param array the array of GameResult
 * @returns the count of each score
 */
export function countScores(array: GameResult[] = []): NumberToNumberMapping {
  const scoreCounts: NumberToNumberMapping = Object.fromEntries(
    Array.from({ length: 7 }, (_, i) => [i, 0]),
  );
  array.forEach((item) => {
    scoreCounts[item.score]++;
  });
  return scoreCounts;
}

/**
 * Gets the highest occurrence of a single score.
 *
 * @param scores the scores to find the highest of
 * @returns the highest value of a single score
 */
function getHighestScore(scores: NumberToNumberMapping): number {
  return Math.max(...Object.values(scores));
}

/**
 * Calculates the bar heights for the stats of the given data
 *
 * @param localData the data to calculate the bar heights for
 * @returns the correct bar heights for the data's scores
 */
export function calculateBarHeights(localData: GameResult[]): NumberToNumberMapping {
  const scores = countScores(localData);
  const max: number = getHighestScore(scores);
  if (max === 0) return Array(7).fill(0);
  for (let i = 0; i <= 6; i++) {
    scores[i] = (scores[i] / max) * 100;
  }
  return scores;
}

/**
 * Gets the stats information for the given data
 *
 * @param localData the data to calculate the stats information for
 * @returns the stats information
 */
export function calculateStatsBottom(localData: GameResult[]): {
  statsCorrectString: string;
  statsCorrectPercentageString: string;
} {
  const correct = localData.reduce((acc, game) => acc + (game.score > 0 ? 1 : 0), 0);

  return {
    statsCorrectString: `${correct}/${localData.length}`,
    statsCorrectPercentageString: localData.length
      ? `${((correct / localData.length) * 100).toFixed(1)}`
      : "0.0",
  };
}
