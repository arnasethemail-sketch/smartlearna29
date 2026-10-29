import { TOTAL_ADDITION_QUESTIONS } from "./additionEngine";

export type AdditionStarRating = 1 | 2 | 3 | 4 | 5;

export function getAdditionStarRating(score: number): AdditionStarRating {
  const normalizedScore = Math.min(
    TOTAL_ADDITION_QUESTIONS,
    Math.max(0, Math.floor(score)),
  );

  if (normalizedScore >= 18) return 5;
  if (normalizedScore >= 14) return 4;
  if (normalizedScore >= 9) return 3;
  if (normalizedScore >= 1) return 2;
  return 1;
}

export function formatAdditionStars(rating: AdditionStarRating) {
  return `${"\u2605".repeat(rating)}${"\u2606".repeat(5 - rating)}`;
}
