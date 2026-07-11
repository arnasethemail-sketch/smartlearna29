import {
  Fragment,
  useEffect,
  useRef,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ADDITION_LEVEL_LABELS,
  ADDITION_PLACE_LABELS,
  formatAdditionNumber,
  type AdditionAnswerDigits,
  type AdditionLevel,
  type AdditionQuestion,
} from "./additionEngine";

export type AdditionFeedback = {
  isCorrect: boolean;
  nextLevel: AdditionLevel;
};

type AdditionQuestionCardProps = {
  question: AdditionQuestion;
  answerDigits: AdditionAnswerDigits;
  inputError: string | null;
  feedback: AdditionFeedback | null;
  isLastQuestion: boolean;
  onAnswerDigitsChange: (digits: AdditionAnswerDigits) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
};

const SHORT_PLACE_LABELS = ["10k", "1k", "100s", "10s", "1s"];

function getPlaceValueDigits(value: number) {
  return String(value).padStart(5, " ").split("");
}

export function AdditionQuestionCard({
  question,
  answerDigits,
  inputError,
  feedback,
  isLastQuestion,
  onAnswerDigitsChange,
  onCheckAnswer,
  onNextQuestion,
}: AdditionQuestionCardProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!feedback) {
      inputRefs.current[4]?.focus();
    }
  }, [question, feedback]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCheckAnswer();
  };

  const updateDigit = (index: number, value: string) => {
    const validDigits = value.replace(/[\s,]/g, "").replace(/\D/g, "");
    const nextDigit = validDigits.slice(-1);
    const updatedDigits = [...answerDigits] as AdditionAnswerDigits;
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
    if (event.key === "Backspace" && !answerDigits[index] && index < 4) {
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
    const updatedDigits = [...answerDigits] as AdditionAnswerDigits;

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
  const questionLabel = question.numbers.join(" + ");
  const nextLevelLabel = feedback
    ? ADDITION_LEVEL_LABELS[feedback.nextLevel]
    : "";
  const correctAnswerDigits = getPlaceValueDigits(question.correctAnswer).map(
    (digit) => digit.trim(),
  );
  const hasAnswer = answerDigits.some(Boolean);

  return (
    <section
      className="rounded-[2rem] bg-white p-5 shadow-[0_20px_60px_rgba(37,25,108,0.20)] sm:p-8"
      aria-labelledby="addition-question"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-[#f0ebff] px-4 py-2 text-sm font-black text-[#5c42d3]">
          {ADDITION_LEVEL_LABELS[question.level]}
        </span>
        <span className="rounded-full bg-[#fff4ce] px-4 py-2 text-sm font-black text-[#8c6900]">
          Start with the ones box
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-[1.75rem] bg-[#f8f6ff] px-2 py-7 text-center sm:px-8 sm:py-10">
          <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-[#7765c9]">
            Solve this
          </p>
          <h2
            id="addition-question"
            aria-label={questionLabel}
            className="sr-only"
          >
            {questionLabel}
          </h2>

          <div className="mx-auto grid w-fit grid-cols-[1.5rem_repeat(5,minmax(2.6rem,4.25rem))] items-center gap-x-1 font-mono tabular-nums sm:grid-cols-[2rem_repeat(5,4.5rem)] sm:gap-x-2">
            {numberDigitRows.map((digits, rowIndex) => (
              <Fragment key={`number-${rowIndex}`}>
                <span
                  className="text-left text-4xl font-black text-[#ff6633] sm:text-6xl"
                  aria-hidden="true"
                >
                  {rowIndex === numberDigitRows.length - 1 ? "+" : ""}
                </span>
                {digits.map((digit, digitIndex) => (
                  <span
                    key={`number-${rowIndex}-digit-${digitIndex}`}
                    className="text-right text-4xl font-black leading-tight text-[#17213b] sm:text-6xl"
                    aria-hidden="true"
                  >
                    {digit}
                  </span>
                ))}
              </Fragment>
            ))}

            <span
              className="col-span-6 my-3 border-b-[5px] border-[#17213b]"
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
                  : "border-3 border-[#d8d0fb] bg-white focus:border-[#ff6633] focus:bg-[#fff4ef] focus:ring-[#ff6633]/20";

              return (
                <input
                  key={ADDITION_PLACE_LABELS[index]}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={1}
                  value={digit}
                  disabled={feedback !== null}
                  aria-label={ADDITION_PLACE_LABELS[index]}
                  aria-invalid={isIncorrectDigit ? "true" : "false"}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={(event) => handlePaste(index, event)}
                  onFocus={(event) => event.currentTarget.select()}
                  className={`h-14 min-w-0 rounded-xl text-center font-mono text-3xl font-black text-[#17213b] outline-none transition focus:ring-4 sm:h-17 sm:rounded-2xl sm:text-4xl ${digitStyle}`}
                />
              );
            })}

            <span aria-hidden="true" />
            {SHORT_PLACE_LABELS.map((label, index) => (
              <span
                key={label}
                className={`mt-2 text-center text-[10px] font-black uppercase tracking-wide sm:text-xs ${
                  index === 4 ? "text-[#c54820]" : "text-[#776f98]"
                }`}
                aria-hidden="true"
              >
                {label}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm font-bold text-[#7765c9]">
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
                  The correct answer is {formatAdditionNumber(question.correctAnswer)}.
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
              className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-[#5d43dc] px-7 py-3.5 text-lg font-black text-white shadow-[0_6px_0_#3d29a6] transition hover:-translate-y-0.5 hover:bg-[#5138ce] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] active:translate-y-1 active:shadow-none"
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
