import { TOTAL_FRACTION_QUESTIONS } from "./fractionsEngine";
import { formatFractionTime } from "./fractionRecords";
import {
  formatFractionStars,
  getFractionStarRating,
} from "./fractionStars";

type FractionResultsProps = {
  score: number;
  elapsedSeconds: number;
  bestTimeSeconds: number | null;
  isNewBestTime: boolean;
  onRestart: () => void;
  onBackToTopics: () => void;
};

function getEncouragingMessage(score: number) {
  if (score === TOTAL_FRACTION_QUESTIONS) {
    return "Perfect shading! You are a fraction superstar!";
  }

  if (score >= 16) {
    return "Fantastic work! You understand equal parts really well.";
  }

  if (score >= 11) {
    return "Good work! Keep practicing and fractions will feel even easier.";
  }

  return "Nice effort! Every shape you shade helps your fraction skills grow.";
}

export function FractionResults({
  score,
  elapsedSeconds,
  bestTimeSeconds,
  isNewBestTime,
  onRestart,
  onBackToTopics,
}: FractionResultsProps) {
  const accuracy = Math.round((score / TOTAL_FRACTION_QUESTIONS) * 100);
  const starRating = getFractionStarRating(score);

  return (
    <section
      className="mx-auto w-full max-w-3xl overflow-hidden rounded-[1.7rem] border-2 border-[#dedfe2] bg-white text-center shadow-[0_14px_34px_rgba(33,35,44,0.08)]"
      aria-labelledby="fraction-results-heading"
    >
      <div className="bg-[#fff0e9] px-6 py-10">
        <span
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#9b3f28] bg-[#ff7657] text-5xl font-black text-white shadow-[6px_7px_0_#ffd3c7]"
          aria-hidden="true"
        >
          {"\u00bd"}
        </span>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#b34d35]">
          Round complete
        </p>
        <h1
          id="fraction-results-heading"
          className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl"
        >
          Fraction practice finished!
        </h1>
      </div>

      <div className="px-6 py-9 sm:px-10">
        <div className="mx-auto grid max-w-xl gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#eef1ff] p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#3f57c8]">
              Final score
            </p>
            <p className="mt-2 text-3xl font-black">
              {score} / {TOTAL_FRACTION_QUESTIONS}
            </p>
          </div>
          <div className="rounded-2xl bg-[#eff7bf] p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#627500]">
              Accuracy
            </p>
            <p className="mt-2 text-3xl font-black">{accuracy}%</p>
          </div>
          <div className="rounded-2xl bg-[#fff4ce] p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7b5c00]">
              Final time
            </p>
            <p
              aria-label="Final time"
              className="mt-2 font-mono text-3xl font-black tabular-nums"
            >
              {formatFractionTime(elapsedSeconds)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#fff0e9] p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#a6422d]">
              Best time
            </p>
            <p
              aria-label="Best time"
              className="mt-2 font-mono text-3xl font-black tabular-nums"
            >
              {bestTimeSeconds === null
                ? "--"
                : formatFractionTime(bestTimeSeconds)}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-5 max-w-xl rounded-3xl border-2 border-[#f0c13d] bg-[#fff9dc] px-5 py-5 shadow-[0_5px_0_#f0c13d]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7b5c00]">
            Stars earned
          </p>
          <p
            aria-label="Star rating"
            className="mt-2 text-4xl font-black tracking-wider text-[#e3a500] sm:text-5xl"
          >
            {formatFractionStars(starRating)}
          </p>
          <p className="mt-2 text-base font-black text-[#5f4900]">
            You earned {starRating} {starRating === 1 ? "star" : "stars"}!
          </p>
        </div>

        {isNewBestTime ? (
          <div className="mt-5 flex justify-center">
            <p className="rounded-full bg-[#dfff38] px-5 py-2.5 text-base font-black text-[#293200] shadow-[0_3px_0_#a7bf21]">
              New Best Time!
            </p>
          </div>
        ) : null}

        <p className="mx-auto mt-6 max-w-xl text-lg font-bold leading-7 text-[#56585e]">
          {getEncouragingMessage(score)}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-13 items-center justify-center rounded-xl bg-[#ff7657] px-7 py-3.5 text-base font-black text-white shadow-[0_4px_0_#b6422a] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#4f6df5] active:translate-y-1 active:shadow-none"
          >
            Practice Fractions Again
          </button>
          <button
            type="button"
            onClick={onBackToTopics}
            className="inline-flex min-h-13 items-center justify-center rounded-xl border-2 border-[#4f6df5] bg-white px-7 py-3.5 text-base font-black text-[#3f57c8] transition hover:bg-[#eef1ff] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#dfff38]"
          >
            Back to Topics
          </button>
        </div>
      </div>
    </section>
  );
}
