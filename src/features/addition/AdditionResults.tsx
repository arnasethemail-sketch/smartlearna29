import { TOTAL_ADDITION_QUESTIONS } from "./additionEngine";
import { formatAdditionTime } from "./additionTimer";
import { RewardPrize } from "./RewardPrize";

type AdditionResultsProps = {
  score: number;
  elapsedSeconds: number;
  bestTimeSeconds: number | null;
  isNewBestTime: boolean;
  onRestart: () => void;
  onBackToTopics: () => void;
};

export function AdditionResults({
  score,
  elapsedSeconds,
  bestTimeSeconds,
  isNewBestTime,
  onRestart,
  onBackToTopics,
}: AdditionResultsProps) {
  const accuracy = Math.round((score / TOTAL_ADDITION_QUESTIONS) * 100);

  return (
    <section className="mx-auto w-full max-w-3xl rounded-[2.25rem] bg-white px-5 py-8 text-center shadow-[0_22px_70px_rgba(31,20,96,0.30)] sm:px-10 sm:py-10" aria-labelledby="addition-results-heading">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6b4ce6]">
        Round complete
      </p>
      <h1 id="addition-results-heading" className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#17213b] sm:text-4xl">
        Addition practice finished!
      </h1>

      <RewardPrize
        score={score}
        totalQuestions={TOTAL_ADDITION_QUESTIONS}
      />

      <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#f0ebff] p-5">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#6b4ce6]">Final score</p>
          <p className="mt-2 text-2xl font-black text-[#17213b]">{score} out of {TOTAL_ADDITION_QUESTIONS}</p>
        </div>
        <div className="rounded-2xl bg-[#eafaf4] p-5">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#16805c]">Accuracy</p>
          <p className="mt-2 text-2xl font-black text-[#17213b]">{accuracy}%</p>
        </div>
        <div className="rounded-2xl bg-[#fff0e8] p-5">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#c54820]">Final time</p>
          <p
            aria-label="Final time"
            className="mt-2 font-mono text-2xl font-black tabular-nums text-[#17213b]"
          >
            {formatAdditionTime(elapsedSeconds)}
          </p>
        </div>
        <div className="rounded-2xl bg-[#fff4ce] p-5">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#8c6900]">Best Time</p>
          <p
            aria-label="Best time"
            className="mt-2 font-mono text-2xl font-black tabular-nums text-[#17213b]"
          >
            {bestTimeSeconds === null
              ? "--"
              : formatAdditionTime(bestTimeSeconds)}
          </p>
        </div>
      </div>

      {isNewBestTime ? (
        <p
          role="status"
          className="mx-auto mt-5 w-fit rounded-full bg-[#ffd84d] px-6 py-3 text-lg font-black text-[#33286e] shadow-[0_4px_0_#d6aa00]"
        >
          New Best Time!
        </p>
      ) : null}

      <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-13 items-center justify-center rounded-full bg-[#ff6633] px-7 py-3.5 text-base font-black text-white shadow-[0_6px_0_#c93d17] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] active:translate-y-1 active:shadow-none"
        >
          Practice Addition Again
        </button>
        <button
          type="button"
          onClick={onBackToTopics}
          className="inline-flex min-h-13 items-center justify-center rounded-full border-3 border-[#6b4ce6] bg-white px-7 py-3.5 text-base font-black text-[#5d43dc] transition hover:bg-[#f0ebff] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d]"
        >
          Choose Another Topic
        </button>
      </div>
    </section>
  );
}
