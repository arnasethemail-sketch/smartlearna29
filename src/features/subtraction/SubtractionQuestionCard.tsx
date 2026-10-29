import {
  Fragment,
  useEffect,
  useRef,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  formatSubtractionNumber,
  SUBTRACTION_LEVEL_LABELS,
  SUBTRACTION_PLACE_LABELS,
  type SubtractionAnswerDigits,
  type SubtractionLevel,
  type SubtractionQuestion,
} from "./subtractionEngine";

export type SubtractionFeedback = {
  isCorrect: boolean;
  nextLevel: SubtractionLevel;
};

type SubtractionQuestionCardProps = {
  question: SubtractionQuestion;
  answerDigits: SubtractionAnswerDigits;
  inputError: string | null;
  feedback: SubtractionFeedback | null;
  isLastQuestion: boolean;
  onAnswerDigitsChange: (digits: SubtractionAnswerDigits) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
};

const SHORT_PLACE_LABELS = ["1m", "100k", "10k", "1k", "100s", "10s", "1s"];

function getPlaceValueDigits(value: number) {
  return String(value).padStart(7, " ").split("");
}

export function SubtractionQuestionCard({
  question,
  answerDigits,
  inputError,
  feedback,
  isLastQuestion,
  onAnswerDigitsChange,
  onCheckAnswer,
  onNextQuestion,
}: SubtractionQuestionCardProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!feedback) {
      inputRefs.current[6]?.focus();
    }
  }, [question, feedback]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCheckAnswer();
  };

  const updateDigit = (index: number, value: string) => {
    const validDigits = value.replace(/[\s,]/g, "").replace(/\D/g, "");
    const nextDigit = validDigits.slice(-1);
    const updatedDigits = [...answerDigits] as SubtractionAnswerDigits;
    updatedDigits[index] = nextDigit;
    onAnswerDigitsChange(updatedDigits);

    if (nextDigit && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !answerDigits[index] && index < 6) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (
      event.key.length === 1 &&
      !/\d/.test(event.key) &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
    }
  };

  const handlePaste = (
    index: number,
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/[\s,]/g, "")
      .replace(/\D/g, "");

    if (!pastedDigits) {
      return;
    }

    event.preventDefault();
    const digitsThatFit = pastedDigits.slice(-(index + 1));
    const startIndex = index - digitsThatFit.length + 1;
    const updatedDigits = [...answerDigits] as SubtractionAnswerDigits;

    digitsThatFit.split("").forEach((digit, digitIndex) => {
      updatedDigits[startIndex + digitIndex] = digit;
    });

    onAnswerDigitsChange(updatedDigits);
    inputRefs.current[Math.max(0, startIndex - 1)]?.focus();
  };

  const isLevelUp = Boolean(
    feedback?.isCorrect && feedback.nextLevel > question.level,
  );
  const isMovingBack = Boolean(
    feedback && !feedback.isCorrect && feedback.nextLevel < question.level,
  );
  const numberDigitRows = question.numbers.map(getPlaceValueDigits);
  const questionLabel = `${question.numbers[0]} − ${question.numbers[1]}`;
  const nextLevelLabel = feedback
    ? SUBTRACTION_LEVEL_LABELS[feedback.nextLevel]
    : "";
  const correctAnswerDigits = getPlaceValueDigits(question.correctAnswer).map(
    (digit) => digit.trim(),
  );
  const hasAnswer = answerDigits.some(Boolean);

  return (
    <section
      className="rounded-[2rem] bg-white p-5 shadow-[0_20px_60px_rgba(37,25,108,0.20)] sm:p-8"
      aria-labelledby="subtraction-question"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-[#e6f8f2] px-4 py-2 text-sm font-black text-[#16805c]">
          {SUBTRACTION_LEVEL_LABELS[question.level]}
        </span>
        <span className="rounded-full bg-[#fff4ce] px-4 py-2 text-sm font-black text-[#8c6900]">
          Start with the ones box
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-[1.75rem] bg-[#f5fbf9] px-1 py-7 text-center sm:px-6 sm:py-10">
          <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-[#16805c]">
            Solve this
          </p>
          <h2
            id="subtraction-question"
            aria-label={questionLabel}
            className="sr-only"
          >
            {questionLabel}
          </h2>

          <div className="mx-auto grid w-fit grid-cols-[1.25rem_repeat(7,minmax(1.9rem,3.2rem))] items-center gap-x-1 font-mono tabular-nums sm:grid-cols-[2rem_repeat(7,3.75rem)] sm:gap-x-2">
            {numberDigitRows.map((digits, rowIndex) => (
              <Fragment key={`number-${rowIndex}`}>
                <span
                  className="text-left text-3xl font-black text-[#ff6633] sm:text-5xl"
                  aria-hidden="true"
                >
                  {rowIndex === numberDigitRows.length - 1 ? "−" : ""}
                </span>
                {digits.map((digit, digitIndex) => (
                  <span
                    key={`number-${rowIndex}-digit-${digitIndex}`}
                    className="text-right text-3xl font-black leading-tight text-[#17213b] sm:text-5xl"
                    aria-hidden="true"
                  >
                    {digit}
                  </span>
                ))}
              </Fragment>
            ))}

            <span
              className="col-span-8 my-3 border-b-[5px] border-[#17213b]"
              aria-hidden="true"
            />

            <span aria-hidden="true" />
            {answerDigits.map((digit, index) => {
              const isIncorrectDigit = Boolean(
                feedback &&
                  !feedback.isCorrect &&
                  digit !== correctAnswerDigits[index],
              );

              const digitStyle = isIncorrectDigit
                ? "border-4 border-[#ff1f1f] bg-[#fff0f0] text-[#b40000] ring-4 ring-[#ff1f1f]/15"
                : feedback
                  ? "border-3 border-[#c7c0df] bg-[#efedf5]"
                  : "border-3 border-[#bfe9da] bg-white focus:border-[#ff6633] focus:bg-[#fff4ef] focus:ring-[#ff6633]/20";

              return (
                <input
                  key={SUBTRACTION_PLACE_LABELS[index]}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={1}
                  value={digit}
                  disabled={feedback !== null}
                  aria-label={SUBTRACTION_PLACE_LABELS[index]}
                  aria-invalid={isIncorrectDigit ? "true" : "false"}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={(event) => handlePaste(index, event)}
                  onFocus={(event) => event.currentTarget.select()}
                  className={`h-12 min-w-0 rounded-lg text-center font-mono text-2xl font-black text-[#17213b] outline-none transition focus:ring-4 sm:h-15 sm:rounded-xl sm:text-3xl ${digitStyle}`}
                />
              );
            })}

            <span aria-hidden="true" />
            {SHORT_PLACE_LABELS.map((label, index) => (
              <span
                key={label}
                className={`mt-2 text-center text-[9px] font-black uppercase tracking-wide sm:text-[10px] ${
                  index === 6 ? "text-[#c54820]" : "text-[#776f98]"
                }`}
                aria-hidden="true"
              >
                {label}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm font-bold text-[#16805c]">
            Begin on the right, then move left one place at a time.
          </p>
        </div>

        {inputError ? (
          <p role="alert" className="mt-3 text-sm font-bold text-[#b32d22]">
            {inputError}
          </p>
        ) : null}

        {!feedback ? (
          <button
            type="submit"
            disabled={!hasAnswer}
            className="mt-5 inline-flex min-h-13 w-full items-center justify-center rounded-full bg-[#ff6633] px-7 py-3.5 text-lg font-black text-white shadow-[0_6px_0_#c93d17] transition hover:-translate-y-0.5 hover:bg-[#f25526] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            Check Answer
          </button>
        ) : (
          <div className="mt-6" aria-live="polite">
            <div
              className={`rounded-2xl px-5 py-5 ${
                feedback.isCorrect
                  ? "bg-[#e8faef] text-[#14643b]"
                  : "bg-[#fff0ed] text-[#8d2f25]"
              }`}
            >
              <p className="text-xl font-black">
                {feedback.isCorrect
                  ? "Correct! Great work!"
                  : "Not quite this time."}
              </p>
              {!feedback.isCorrect ? (
                <p className="mt-2 text-base font-bold">
                  The correct answer is {formatSubtractionNumber(question.correctAnswer)}.
                </p>
              ) : null}
              {isLevelUp ? (
                <p className="mt-2 text-sm font-bold">
                  Level up! Next: {nextLevelLabel}.
                </p>
              ) : null}
              {isMovingBack ? (
                <p className="mt-2 text-sm font-bold">
                  Next question: {nextLevelLabel} for a quick warm-up.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onNextQuestion}
              className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-[#1faf7a] px-7 py-3.5 text-lg font-black text-white shadow-[0_6px_0_#117854] transition hover:-translate-y-0.5 hover:bg-[#159c6c] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] active:translate-y-1 active:shadow-none"
            >
              {isLastQuestion ? "See Results" : "Next Question"}
              <span aria-hidden="true">{"\u2192"}</span>
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
