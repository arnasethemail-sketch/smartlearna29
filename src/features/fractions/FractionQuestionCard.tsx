import { FractionShape } from "./FractionShape";
import {
  getFractionPartCount,
  getRequiredColoredPartCount,
  type FractionQuestion,
} from "./fractionsEngine";

export type FractionFeedback =
  | "correct"
  | "try-again"
  | "incorrect"
  | null;

type FractionQuestionCardProps = {
  question: FractionQuestion;
  selectedParts: number[];
  feedback: FractionFeedback;
  isLastQuestion: boolean;
  onTogglePart: (partIndex: number) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
};

const SHAPE_NAMES: Record<FractionQuestion["shape"], string> = {
  "horizontal-bar": "rectangle",
  "vertical-bar": "rectangle",
  grid: "square",
  circle: "circle",
};

export function FractionQuestionCard({
  question,
  selectedParts,
  feedback,
  isLastQuestion,
  onTogglePart,
  onCheckAnswer,
  onNextQuestion,
}: FractionQuestionCardProps) {
  const answerIsSettled =
    feedback === "correct" || feedback === "incorrect";
  const shapeName = SHAPE_NAMES[question.shape];
  const totalParts = getFractionPartCount(question);
  const requiredColoredParts = getRequiredColoredPartCount(question);
  const isEquivalentFractionChallenge = question.partitionMultiplier > 1;

  return (
    <section className="overflow-hidden rounded-[1.7rem] border-2 border-[#dedfe2] bg-white shadow-[0_14px_34px_rgba(33,35,44,0.08)]">
      <div className="border-b-2 border-[#d8c7ff] bg-[#f5f0ff] px-5 py-7 text-center sm:px-8">
        {isEquivalentFractionChallenge ? (
          <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#6b4fd3]">
            Equivalent fraction challenge
          </p>
        ) : null}
        <h2
          className="mx-auto flex w-fit items-center justify-center gap-2 text-[#17181a] sm:gap-3"
          aria-label={`Color ${question.numerator}/${question.denominator} of the ${shapeName}.`}
        >
          <span className="text-xl font-black leading-tight sm:text-3xl">
            Color
          </span>
          <span className="flex w-12 flex-col items-center sm:w-14">
            <span className="text-3xl font-black leading-none sm:text-4xl">
              {question.numerator}
            </span>
            <span className="my-1 block h-1 w-full rounded-full bg-[#17181a]" />
            <span className="text-3xl font-black leading-none sm:text-4xl">
              {question.denominator}
            </span>
          </span>
          <span className="text-xl font-black leading-tight sm:text-3xl">
            of the {shapeName}.
          </span>
        </h2>
      </div>

      <div className="px-5 py-8 sm:px-10">
        <FractionShape
          question={question}
          selectedParts={selectedParts}
          disabled={answerIsSettled}
          onTogglePart={onTogglePart}
        />

        <p
          className="mt-6 text-center text-sm font-black text-[#65676d]"
          aria-live="polite"
        >
          You colored {selectedParts.length} of {totalParts} parts.
        </p>

        {feedback === "correct" ? (
          <div
            role="status"
            className="mt-6 rounded-2xl border-2 border-[#8da700] bg-[#eff7bf] px-5 py-4 text-[#334000]"
          >
            <p className="text-xl font-black">Correct! Great coloring!</p>
            <p className="mt-1 font-bold">
              {requiredColoredParts} of {totalParts} parts is the same as{" "}
              {question.numerator}/{question.denominator}. Move on when
              you&apos;re ready.
            </p>
          </div>
        ) : null}

        {feedback === "try-again" ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border-2 border-[#e3a500] bg-[#fff4ce] px-5 py-4 text-[#6b4f00]"
          >
            <p className="text-xl font-black">Not quite. Try again!</p>
            <p className="mt-1 font-bold">
              Look at all {totalParts} equal parts. Color the same amount
              as {question.numerator}/{question.denominator}.
            </p>
          </div>
        ) : null}

        {feedback === "incorrect" ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border-2 border-[#df6449] bg-[#fff0e9] px-5 py-4 text-[#7f2f20]"
          >
            <p className="text-xl font-black">Good try! Let&apos;s move on.</p>
            <p className="mt-1 font-bold">
              The correct answer was {requiredColoredParts} of {totalParts}{" "}
              parts, which is equal to {question.numerator}/
              {question.denominator}.
            </p>
          </div>
        ) : null}

        {answerIsSettled ? (
          <button
            type="button"
            onClick={onNextQuestion}
            className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-xl bg-[#4f6df5] px-6 py-3.5 text-base font-black text-white shadow-[0_4px_0_#2f48b9] transition hover:-translate-y-0.5 hover:bg-[#455fdc] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#dfff38] active:translate-y-1 active:shadow-none"
          >
            {isLastQuestion ? "See My Results" : "Next Question"}
            <span aria-hidden="true">{"\u2192"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onCheckAnswer}
            className="mt-6 inline-flex min-h-13 w-full items-center justify-center rounded-xl bg-[#ff7657] px-6 py-3.5 text-base font-black text-white shadow-[0_4px_0_#b6422a] transition hover:-translate-y-0.5 hover:bg-[#ed684b] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#4f6df5] active:translate-y-1 active:shadow-none"
          >
            {feedback === "try-again" ? "Check Again" : "Check My Fraction"}
          </button>
        )}
      </div>
    </section>
  );
}
