type RewardTierId = "legendary" | "brave" | "young" | "baby" | "grumpy";

type RewardTier = {
  id: RewardTierId;
  minimumRatio: number;
  name: string;
  eggLabel: string;
  imagePath: string;
  message: string;
};

const REWARD_TIERS: readonly RewardTier[] = [
  {
    id: "legendary",
    minimumRatio: 1,
    name: "Legendary Dragon",
    eggLabel: "golden egg",
    imagePath: "/rewards/legendary-dragon.webp",
    message:
      "Perfect score! Your golden egg hatched into a Legendary Dragon!",
  },
  {
    id: "brave",
    minimumRatio: 0.8,
    name: "Brave Dragon",
    eggLabel: "colorful egg",
    imagePath: "/rewards/brave-dragon.webp",
    message: "Great job! Your egg hatched into a Brave Dragon!",
  },
  {
    id: "young",
    minimumRatio: 0.55,
    name: "Young Dragon",
    eggLabel: "bright egg",
    imagePath: "/rewards/young-dragon.webp",
    message:
      "Good effort! Your egg hatched into a Young Dragon. Keep practicing to unlock a stronger one!",
  },
  {
    id: "baby",
    minimumRatio: 0.3,
    name: "Baby Dragon",
    eggLabel: "plain egg",
    imagePath: "/rewards/baby-dragon.webp",
    message:
      "You are learning! Your egg hatched into a Baby Dragon. Try again to make it stronger!",
  },
  {
    id: "grumpy",
    minimumRatio: 0,
    name: "Grumpy Little Dragon",
    eggLabel: "cracked dull egg",
    imagePath: "/rewards/grumpy-dragon.webp",
    message:
      "Oops! This egg hatched into a Grumpy Little Dragon. Try again, or choose a different topic.",
  },
] as const;

export function getRewardTier(score: number, totalQuestions: number) {
  const safeTotal = Math.max(1, totalQuestions);
  const safeScore = Math.min(Math.max(0, score), safeTotal);
  const scoreRatio = safeScore / safeTotal;

  return (
    REWARD_TIERS.find((tier) => scoreRatio >= tier.minimumRatio) ??
    REWARD_TIERS[REWARD_TIERS.length - 1]
  );
}

type RewardPrizeProps = {
  score: number;
  totalQuestions: number;
};

export function RewardPrize({ score, totalQuestions }: RewardPrizeProps) {
  const reward = getRewardTier(score, totalQuestions);
  const headingId = `reward-${reward.id}-heading`;

  return (
    <section
      className={`reward-prize reward-prize--${reward.id}`}
      aria-labelledby={headingId}
      data-testid="reward-prize"
      data-reward-tier={reward.id}
    >
      <p className="reward-prize__eyebrow">Prize unlocked!</p>

      <div
        className="reward-prize__stage"
        aria-label={`A ${reward.eggLabel} hatches into a ${reward.name}`}
        role="img"
      >
        <span className="reward-prize__burst" aria-hidden="true" />
        <span className="reward-prize__spark reward-prize__spark--one" aria-hidden="true">
          {"\u2726"}
        </span>
        <span className="reward-prize__spark reward-prize__spark--two" aria-hidden="true">
          {"\u2605"}
        </span>
        <span className="reward-prize__spark reward-prize__spark--three" aria-hidden="true">
          {"\u2726"}
        </span>

        <div className="reward-egg" aria-hidden="true">
          <span className="reward-egg__half reward-egg__half--left" />
          <span className="reward-egg__half reward-egg__half--right" />
          <span className="reward-egg__crack">{"\u03DF"}</span>
        </div>

        <div className="reward-creature" aria-hidden="true">
          <span className="reward-flight-cloud reward-flight-cloud--one" />
          <span className="reward-flight-cloud reward-flight-cloud--two" />
          <div className="reward-dragon-flight">
            <img
              className="reward-dragon-image"
              data-testid="reward-dragon"
              src={reward.imagePath}
              alt=""
            />
          </div>
        </div>
      </div>

      <h2 id={headingId} className="reward-prize__name">
        {reward.name}!
      </h2>
      <p className="reward-prize__message" aria-live="polite">
        {reward.message}
      </p>
    </section>
  );
}
