import { TOTAL_FRACTION_QUESTIONS } from "./fractionsEngine";

export type FractionStarRating = 1 | 2 | 3 | 4 | 5;

export function getFractionStarRating(score: number): FractionStarRating {
  const normalizedScore = Math.min(
    TOTAL_FRACTION_QUESTIONS,
    Math.max(0, Math.floor(score)),
  );

  if (normalizedScore >= 18) return 5;
  if (normalizedScore >= 14) return 4;
  if (normalizedScore >= 9) return 3;
  if (normalizedScore >= 1) return 2;
  return 1;
}

export function formatFractionStars(rating: FractionStarRating) {
  return `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
}
