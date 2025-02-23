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
export function countScores(array: GameResult[]): NumberToNumberMapping {
  const scoreCounts: NumberToNumberMapping = {};
  for (let i = 0; i <= 6; i++) scoreCounts[i] = 0;
  if (!array) return scoreCounts;

  for (const item of array) {
    const score = item.score;
    scoreCounts[score] += 1;
  }

  return scoreCounts;
}

/**
 * Gets the highest occurence of a single score
 *
 * @param scores the scores to find the highest of
 * @returns the highest value of a single score
 */
function getHighestScore(scores: NumberToNumberMapping): number {
  let maxIndex = 0;
  for (let i = 0; i <= 6; i++) {
    if (scores[i] > scores[maxIndex]) maxIndex = i;
  }
  return scores[maxIndex];
}

/**
 * Calculates the bar heights for the stats of the given data
 *
 * @param localData the data to calculate the bar heights for
 * @returns the correct bar heights for the data's scores
 */
export function calculateBarHeights(
  localData: GameResult[]
): NumberToNumberMapping {
  const scores = countScores(localData);
  const max: number = getHighestScore(scores);
  if (max === 0) return Array(7).fill(0);
  for (let i = 0; i <= 6; i++) {
    const previousValue = scores[i];
    scores[i] = (previousValue / max) * 100;
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
  statsNumCorrectString: string;
  statsCorrectPercentageString: string;
} {
  const totalLength = localData.length;
  let numCorrect = 0;
  for (const game of localData) {
    if (game.score > 0) numCorrect++;
  }
  const formattedString = `${numCorrect}/${totalLength}`;
  const formattedPercentageString = `${(
    (numCorrect / totalLength) *
    100
  ).toFixed(1)}`;
  return {
    statsNumCorrectString: formattedString,
    statsCorrectPercentageString: formattedPercentageString,
  };
}
