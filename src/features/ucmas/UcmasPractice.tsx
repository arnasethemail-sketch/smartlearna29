import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnnouncementBar, Brand } from "../../components/AppChrome";
import { createPracticeAttemptId } from "../practiceAttemptId";
import { useLearningProgress } from "../progress";
import {
  formatUcmasSpeed,
  generateUcmasQuestion,
  getUcmasSpeedLabel,
  parseUcmasAnswer,
  TOTAL_UCMAS_QUESTIONS,
  UCMAS_ANSWER_SECONDS,
  UCMAS_DEFAULT_SPEED_MS,
  UCMAS_MAX_SPEED_MS,
  UCMAS_MIN_SPEED_MS,
  type UcmasQuestion,
} from "./ucmasEngine";
import { speakUcmasValues } from "./ucmasSpeech";

type UcmasPracticeProps = {
  onBackToTopics: () => void;
};

type UcmasPhase =
  | "setup"
  | "speaking"
  | "answering"
  | "feedback"
  | "results";

type UcmasFeedback = {
  isCorrect: boolean;
  timedOut: boolean;
};

export function UcmasPractice({ onBackToTopics }: UcmasPracticeProps) {
  const answerInputRef = useRef<HTMLInputElement | null>(null);
  const cancelSpeechRef = useRef<() => void>(() => undefined);
  const roundStartedAtRef = useRef(Date.now());
  const attemptIdRef = useRef(createPracticeAttemptId("ucmas-mental-maths"));
  const { updatePracticeProgress } = useLearningProgress();
  const [phase, setPhase] = useState<UcmasPhase>("setup");
  const [selectedSpeedMs, setSelectedSpeedMs] = useState(
    UCMAS_DEFAULT_SPEED_MS,
  );
  const [roundSpeedMs, setRoundSpeedMs] = useState(UCMAS_DEFAULT_SPEED_MS);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [question, setQuestion] = useState<UcmasQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [countdown, setCountdown] = useState(UCMAS_ANSWER_SECONDS);
  const [feedback, setFeedback] = useState<UcmasFeedback | null>(null);
  const [score, setScore] = useState(0);
  const [inputError, setInputError] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const cancelSpeech = useCallback(() => {
    cancelSpeechRef.current();
    cancelSpeechRef.current = () => undefined;
  }, []);

  const startSpeaking = useCallback(
    (nextQuestion: UcmasQuestion, speedMs: number) => {
      cancelSpeech();
      setQuestion(nextQuestion);
      setAnswer("");
      setFeedback(null);
      setInputError(null);
      setSpeechError(null);
      setCountdown(UCMAS_ANSWER_SECONDS);
      setPhase("speaking");

      cancelSpeechRef.current = speakUcmasValues({
        values: nextQuestion.values,
        delayMs: speedMs,
        onComplete: () => {
          cancelSpeechRef.current = () => undefined;
          setCountdown(UCMAS_ANSWER_SECONDS);
          setPhase("answering");
        },
        onUnsupported: () => {
          cancelSpeechRef.current = () => undefined;
          setQuestion(null);
          setSpeechError(
            "Speech is not available in this browser. Please use a current version of Chrome, Edge, or Safari.",
          );
          setPhase("setup");
        },
      });
    },
    [cancelSpeech],
  );

  const advanceQuestion = useCallback(() => {
    if (questionNumber >= TOTAL_UCMAS_QUESTIONS) {
      cancelSpeech();
      setQuestion(null);
      setPhase("results");
      return;
    }

    setQuestionNumber((currentNumber) => currentNumber + 1);
    startSpeaking(generateUcmasQuestion(), roundSpeedMs);
  }, [cancelSpeech, questionNumber, roundSpeedMs, startSpeaking]);

  useEffect(() => {
    return () => cancelSpeech();
  }, [cancelSpeech]);

  useEffect(() => {
    if (phase === "answering") {
      answerInputRef.current?.focus();
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "answering") {
      return;
    }

    if (countdown <= 0) {
      updatePracticeProgress({
        attemptId: attemptIdRef.current,
        subject: "Math",
        topic: "UCMAS Mental Maths",
        answered: questionNumber,
        total: TOTAL_UCMAS_QUESTIONS,
        score,
        status:
          questionNumber === TOTAL_UCMAS_QUESTIONS
            ? "completed"
            : "in-progress",
        durationSeconds: Math.max(
          0,
          Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
        ),
        metadata: { speedMs: roundSpeedMs, timedOut: true },
      });
      setFeedback({ isCorrect: false, timedOut: true });
      setPhase("feedback");
      return;
    }

    const countdownTimer = window.setTimeout(() => {
      setCountdown((currentCountdown) => currentCountdown - 1);
    }, 1000);

    return () => window.clearTimeout(countdownTimer);
  }, [countdown, phase, questionNumber, roundSpeedMs, score, updatePracticeProgress]);

  useEffect(() => {
    if (phase !== "feedback" || !feedback?.timedOut) {
      return;
    }

    const continueTimer = window.setTimeout(advanceQuestion, 2000);
    return () => window.clearTimeout(continueTimer);
  }, [advanceQuestion, feedback, phase]);

  const startRound = () => {
    const lockedSpeed = selectedSpeedMs;
    roundStartedAtRef.current = Date.now();
    attemptIdRef.current = createPracticeAttemptId("ucmas-mental-maths");
    setRoundSpeedMs(lockedSpeed);
    setQuestionNumber(1);
    setScore(0);
    startSpeaking(generateUcmasQuestion(), lockedSpeed);
  };

  const submitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (phase !== "answering" || !question) {
      return;
    }

    const submittedAnswer = parseUcmasAnswer(answer);
    if (submittedAnswer === null) {
      setInputError("Enter one whole-number answer.");
      return;
    }

    const isCorrect = submittedAnswer === question.correctAnswer;
    const nextScore = score + (isCorrect ? 1 : 0);
    if (isCorrect) {
      setScore(nextScore);
    }

    updatePracticeProgress({
      attemptId: attemptIdRef.current,
      subject: "Math",
      topic: "UCMAS Mental Maths",
      answered: questionNumber,
      total: TOTAL_UCMAS_QUESTIONS,
      score: nextScore,
      status:
        questionNumber === TOTAL_UCMAS_QUESTIONS
          ? "completed"
          : "in-progress",
      durationSeconds: Math.max(
        0,
        Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
      ),
      metadata: { speedMs: roundSpeedMs, timedOut: false },
    });

    setInputError(null);
    setFeedback({ isCorrect, timedOut: false });
    setPhase("feedback");
  };

  const restartRound = () => {
    cancelSpeech();
    roundStartedAtRef.current = Date.now();
    attemptIdRef.current = createPracticeAttemptId("ucmas-mental-maths");
    setQuestion(null);
    setQuestionNumber(1);
    setScore(0);
    setAnswer("");
    setFeedback(null);
    setInputError(null);
    setSpeechError(null);
    setCountdown(UCMAS_ANSWER_SECONDS);
    setPhase("setup");
  };

  const handleBackToTopics = () => {
    cancelSpeech();
    onBackToTopics();
  };

  if (phase === "speaking") {
    return (
      <main className="min-h-screen bg-[#22155f] text-white">
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
          <button
            type="button"
            onClick={handleBackToTopics}
            className="absolute left-5 top-5 z-10 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-white/45 bg-white/15 px-5 py-3 text-sm font-black text-white shadow-lg backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/25 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] sm:left-8 sm:top-8 sm:text-base"
          >
            <span aria-hidden="true">{"←"}</span>
            Cancel and Back to Topics
          </button>
          <div
            className="pointer-events-none absolute h-96 w-96 rounded-full bg-[#6b4ce6]/45 blur-3xl"
            aria-hidden="true"
          />
          <p className="relative text-sm font-black uppercase tracking-[0.2em] text-[#fff3b0]">
            Question {questionNumber} of {TOTAL_UCMAS_QUESTIONS}
          </p>
          <h1 className="relative mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            Listen carefully
          </h1>

          <div
            className="relative my-12 flex h-40 w-40 items-center justify-center"
            role="img"
            aria-label="Listening animation"
          >
            <span className="absolute h-32 w-32 animate-ping rounded-full border-4 border-[#ffd84d]/35" />
            <span className="absolute h-24 w-24 animate-pulse rounded-full bg-[#ffd84d]/20" />
            <span className="relative text-7xl" aria-hidden="true">
              {"\ud83d\udd0a"}
            </span>
          </div>

          <p className="relative rounded-full border border-white/20 bg-white/10 px-5 py-3 text-base font-black backdrop-blur-sm">
            Speed: {formatUcmasSpeed(roundSpeedMs)}
          </p>
        </section>
      </main>
    );
  }

  const accuracy = Math.round((score / TOTAL_UCMAS_QUESTIONS) * 100);
  const selectedSpeedLabel = getUcmasSpeedLabel(selectedSpeedMs);

  return (
    <main className="min-h-screen bg-[#f7f5ff] text-[#17213b]">
      <AnnouncementBar />
      <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#5d43dc_0%,#6d4ce8_48%,#4530bd_100%)] px-5 pb-10 sm:px-8">
        <div
          className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full border-[20px] border-[#ffd84d]/25"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-16 h-60 w-60 rounded-full bg-[#2dd4bf]/25 blur-sm"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute left-[8%] top-36 rotate-[-12deg] text-5xl font-black text-white/10"
          aria-hidden="true"
        >
          +
        </span>
        <span
          className="pointer-events-none absolute right-[9%] top-[52%] rotate-12 text-6xl font-black text-[#ffd84d]/20"
          aria-hidden="true"
        >
          =
        </span>
        <span
          className="pointer-events-none absolute bottom-10 left-[42%] text-4xl text-white/15"
          aria-hidden="true"
        >
          ★
        </span>

        <nav className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between py-4 sm:py-5">
          <Brand tone="light" />
          <button
            type="button"
            onClick={handleBackToTopics}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-white/35 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d]"
          >
            <span aria-hidden="true">{"\u2190"}</span>
            Exit to Topics
          </button>
        </nav>

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {phase === "setup" ? (
            <section className="relative grid gap-x-8 gap-y-4 overflow-hidden rounded-[2rem] border-2 border-[#27214e] bg-white px-6 py-7 text-center shadow-[0_10px_0_#2d227f,0_24px_60px_rgba(31,20,96,0.28)] sm:grid-cols-[0.92fr_1.08fr] sm:px-8 sm:py-8">
              <div
                className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#dfff38]/45"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-16 -right-12 h-44 w-44 rounded-full border-[18px] border-[#4f6df5]/10"
                aria-hidden="true"
              />
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[1.45rem] border-2 border-[#25272b] bg-[#18a8e7] text-4xl shadow-[5px_5px_0_#0873a6] sm:col-start-1 sm:row-start-1">
                <span aria-hidden="true">{"\ud83c\udfa7"}</span>
                <span
                  className="absolute -right-7 -top-3 rotate-12 text-2xl text-[#ff6633]"
                  aria-hidden="true"
                >
                  ♪
                </span>
                <span
                  className="absolute -left-7 bottom-0 -rotate-12 text-xl text-[#6b4ce6]"
                  aria-hidden="true"
                >
                  ★
                </span>
              </div>
              <p className="relative mx-auto inline-flex rounded-full border-2 border-[#25272b] bg-[#dfff38] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-[#25272b] shadow-[2px_2px_0_#25272b] sm:col-start-1 sm:row-start-2">
                One Digit — 10 Rows
              </p>
              <h1 className="relative text-3xl font-black leading-[1.03] tracking-[-0.045em] text-[#17181a] sm:col-start-1 sm:row-start-3 sm:text-[2.4rem]">
                UCMAS Mental Maths
              </h1>
              <p className="relative mx-auto max-w-sm text-sm font-bold leading-6 text-[#606675] sm:col-start-1 sm:row-start-4">
                Listen, keep the total in your head, then enter your answer.
              </p>

              <div
                className="relative grid grid-cols-3 gap-2 sm:col-start-1 sm:row-start-5"
                aria-label="How to play"
              >
                <div className="rounded-2xl border-2 border-[#b9c6ff] bg-[#f5f7ff] px-2 py-3">
                  <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#4f6df5] text-xs font-black text-white">
                    1
                  </span>
                  <p className="mt-2 text-xs font-black text-[#34363a]">Listen</p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#737783]">10 numbers</p>
                </div>
                <div className="rounded-2xl border-2 border-[#e7b7dc] bg-[#fff5fc] px-2 py-3">
                  <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#d34fa2] text-xs font-black text-white">
                    2
                  </span>
                  <p className="mt-2 text-xs font-black text-[#34363a]">Think</p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#737783]">Mental total</p>
                </div>
                <div className="rounded-2xl border-2 border-[#f1c55e] bg-[#fff9e9] px-2 py-3">
                  <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff9f1c] text-xs font-black text-white">
                    3
                  </span>
                  <p className="mt-2 text-xs font-black text-[#34363a]">Answer</p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#737783]">15 seconds</p>
                </div>
              </div>

              <div className="relative mx-auto w-full rounded-[1.6rem] border-2 border-[#ded8fa] bg-[linear-gradient(145deg,#f5f2ff,#eef5ff)] p-5 text-left sm:col-start-2 sm:row-span-4 sm:row-start-1 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#4f6df5]">
                      Ready when you are
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#17181a]">
                      Choose your pace
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf9d0] px-3 py-1.5 text-xs font-black text-[#4b6500]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#7da900]" />
                    Sound on
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#69707d]">
                  Pick a comfortable voice speed for your full round.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label htmlFor="ucmas-speed" className="text-base font-black">
                    Speaking speed
                  </label>
                  <output
                    htmlFor="ucmas-speed"
                    className="w-fit rounded-full border-2 border-[#cfc5ff] bg-white px-3 py-1.5 text-xs font-black text-[#5d43dc]"
                  >
                    {formatUcmasSpeed(selectedSpeedMs)}
                  </output>
                </div>
                <input
                  id="ucmas-speed"
                  type="range"
                  min={UCMAS_MIN_SPEED_MS}
                  max={UCMAS_MAX_SPEED_MS}
                  step={100}
                  value={selectedSpeedMs}
                  onChange={(event) =>
                    setSelectedSpeedMs(Number(event.target.value))
                  }
                  style={{ direction: "rtl" }}
                  className="mt-5 h-4 w-full cursor-pointer accent-[#4f6df5] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#dfff38]"
                  aria-valuetext={formatUcmasSpeed(selectedSpeedMs)}
                  aria-describedby="ucmas-speed-help"
                />
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black">
                  {(["Slow", "Medium", "Fast"] as const).map((speedLabel) => (
                    <span
                      key={speedLabel}
                      className={`rounded-full px-2 py-1.5 ${
                        selectedSpeedLabel === speedLabel
                          ? "bg-[#4f6df5] text-white shadow-[0_3px_0_#2f48b9]"
                          : "bg-white text-[#77718f]"
                      }`}
                    >
                      {speedLabel}
                    </span>
                  ))}
                </div>
                <p
                  id="ucmas-speed-help"
                  className="mt-4 flex items-start gap-2 rounded-2xl bg-[#fff7d9] px-3 py-2.5 text-xs font-bold leading-5 text-[#765b00]"
                >
                  <span className="text-base" aria-hidden="true">{"\ud83d\udd12"}</span>
                  Your speed stays the same for all 20 questions.
                </p>
              </div>

              {speechError ? (
                <p
                  role="alert"
                  className="relative mx-auto w-full rounded-2xl bg-[#fff0ed] px-4 py-3 text-sm font-bold text-[#8d2f25] sm:col-start-2"
                >
                  {speechError}
                </p>
              ) : null}

              <button
                type="button"
                onClick={startRound}
                className="relative inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#25272b] bg-[#ff6633] px-6 py-3 text-base font-black text-white shadow-[0_6px_0_#a93416] transition hover:-translate-y-0.5 hover:bg-[#f25526] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#dfff38] active:translate-y-1 active:shadow-none sm:col-start-2"
              >
                Start Mental Maths
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#d9471e]"
                  aria-hidden="true"
                >
                  {"\u2192"}
                </span>
              </button>
            </section>
          ) : null}

          {phase === "answering" ? (
            <section className="rounded-[2.25rem] bg-white px-5 py-9 text-center shadow-[0_22px_70px_rgba(31,20,96,0.30)] sm:px-10 sm:py-12">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#6b4ce6]">
                Question {questionNumber} of {TOTAL_UCMAS_QUESTIONS}
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                What is the answer?
              </h1>
              <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#fff4ce] text-4xl font-black text-[#8c6900] ring-8 ring-[#ffd84d]/20">
                <time aria-label="Answer time remaining">{countdown}</time>
              </div>
              <p className="mt-3 text-sm font-bold text-[#8c6900]">
                seconds remaining
              </p>

              <form onSubmit={submitAnswer} className="mx-auto mt-8 max-w-xl">
                <label htmlFor="ucmas-answer" className="text-lg font-black">
                  Your final answer
                </label>
                <input
                  ref={answerInputRef}
                  id="ucmas-answer"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={7}
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value.replace(/\D/g, ""));
                    setInputError(null);
                  }}
                  className="mt-3 h-20 w-full rounded-2xl border-4 border-[#d8d0fb] bg-[#faf9ff] px-5 text-center font-mono text-4xl font-black outline-none transition focus:border-[#ff6633] focus:ring-4 focus:ring-[#ff6633]/20"
                />
                {inputError ? (
                  <p role="alert" className="mt-3 font-bold text-[#b32d22]">
                    {inputError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={!answer}
                  className="mt-5 inline-flex min-h-13 w-full items-center justify-center rounded-full bg-[#ff6633] px-7 py-3.5 text-lg font-black text-white shadow-[0_6px_0_#c93d17] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                >
                  Submit Answer
                </button>
              </form>
            </section>
          ) : null}

          {phase === "feedback" && feedback && question ? (
            <section
              className="rounded-[2.25rem] bg-white px-5 py-10 text-center shadow-[0_22px_70px_rgba(31,20,96,0.30)] sm:px-10 sm:py-12"
              aria-live="polite"
            >
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#6b4ce6]">
                Question {questionNumber} of {TOTAL_UCMAS_QUESTIONS}
              </p>
              <div
                className={`mx-auto mt-7 flex h-24 w-24 items-center justify-center rounded-full text-5xl ${
                  feedback.isCorrect
                    ? "bg-[#e8faef] text-[#16805c]"
                    : "bg-[#fff0ed] text-[#c54820]"
                }`}
                aria-hidden="true"
              >
                {feedback.isCorrect ? "\u2713" : "\u2715"}
              </div>
              <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                {feedback.isCorrect
                  ? "Correct! Great listening!"
                  : feedback.timedOut
                    ? "Time is up!"
                    : "Good try!"}
              </h1>
              {!feedback.isCorrect ? (
                <p className="mt-4 text-xl font-bold text-[#69728a]">
                  The correct answer is {question.correctAnswer}.
                </p>
              ) : null}

              {feedback.timedOut ? (
                <p className="mt-6 font-bold text-[#6b4ce6]">
                  The next question will begin shortly.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={advanceQuestion}
                  className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-[#5d43dc] px-7 py-3.5 text-lg font-black text-white shadow-[0_6px_0_#3d29a6] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] active:translate-y-1 active:shadow-none"
                >
                  {questionNumber === TOTAL_UCMAS_QUESTIONS
                    ? "See Results"
                    : "Next Question"}
                  <span aria-hidden="true">{"\u2192"}</span>
                </button>
              )}
            </section>
          ) : null}

          {phase === "results" ? (
            <section className="rounded-[2.25rem] bg-white px-5 py-10 text-center shadow-[0_22px_70px_rgba(31,20,96,0.30)] sm:px-10 sm:py-12">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#6b4ce6]">
                Round complete
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                Mental Maths finished!
              </h1>
              <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f0ebff] p-6">
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-[#6b4ce6]">
                    Final score
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {score} out of {TOTAL_UCMAS_QUESTIONS}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#eafaf4] p-6">
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-[#16805c]">
                    Accuracy
                  </p>
                  <p className="mt-2 text-3xl font-black">{accuracy}%</p>
                </div>
              </div>
              <p className="mx-auto mt-7 max-w-xl text-lg font-semibold leading-8 text-[#69728a]">
                {score >= 8
                  ? "Amazing focus! Your listening and mental maths are getting stronger."
                  : "Nice effort! Practice again and keep building your listening speed."}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={restartRound}
                  className="inline-flex min-h-13 items-center justify-center rounded-full bg-[#ff6633] px-7 py-3.5 text-base font-black text-white shadow-[0_6px_0_#c93d17] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] active:translate-y-1 active:shadow-none"
                >
                  Practice Mental Maths Again
                </button>
                <button
                  type="button"
                  onClick={handleBackToTopics}
                  className="inline-flex min-h-13 items-center justify-center rounded-full border-3 border-[#6b4ce6] bg-white px-7 py-3.5 text-base font-black text-[#5d43dc] transition hover:bg-[#f0ebff] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d]"
                >
                  Choose Another Topic
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
