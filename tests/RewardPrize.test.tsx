// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RewardPrize } from "../src/features/addition/RewardPrize";

afterEach(cleanup);

describe("Addition reward prize", () => {
  const rewardImages: Record<string, string> = {
    legendary: "/rewards/legendary-dragon.webp",
    brave: "/rewards/brave-dragon.webp",
    young: "/rewards/young-dragon.webp",
    baby: "/rewards/baby-dragon.webp",
    grumpy: "/rewards/grumpy-dragon.webp",
  };

  it.each([
    [20, "legendary", "Perfect score! Your golden egg hatched into a Legendary Dragon!"],
    [16, "brave", "Great job! Your egg hatched into a Brave Dragon!"],
    [19, "brave", "Great job! Your egg hatched into a Brave Dragon!"],
    [11, "young", "Good effort! Your egg hatched into a Young Dragon. Keep practicing to unlock a stronger one!"],
    [15, "young", "Good effort! Your egg hatched into a Young Dragon. Keep practicing to unlock a stronger one!"],
    [6, "baby", "You are learning! Your egg hatched into a Baby Dragon. Try again to make it stronger!"],
    [10, "baby", "You are learning! Your egg hatched into a Baby Dragon. Try again to make it stronger!"],
    [5, "grumpy", "Oops! This egg hatched into a Grumpy Little Dragon. Try again, or choose a different topic."],
    [0, "grumpy", "Oops! This egg hatched into a Grumpy Little Dragon. Try again, or choose a different topic."],
  ])("shows the correct reward tier for a score of %i", (score, tier, message) => {
    render(<RewardPrize score={score} totalQuestions={20} />);

    expect(screen.getByTestId("reward-prize").dataset.rewardTier).toBe(tier);
    expect(
      (screen.getByTestId("reward-dragon") as HTMLImageElement).src,
    ).toContain(rewardImages[String(tier)]);
    expect(document.querySelector(".reward-dragon-flight")).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
  });
});
