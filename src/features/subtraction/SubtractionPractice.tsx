import { useEffect, useRef, useState } from "react";
import { AnnouncementBar, Brand } from "../../components/AppChrome";
import { createPracticeAttemptId } from "../practiceAttemptId";
import { useLearningProgress } from "../progress";
import { LEARNING_PROGRESS_APPLIED_EVENT } from "../progress/events";
import {
  combineSubtractionDigits,
  createEmptySubtractionDigits,
  generateSubtractionQuestion,
  getNextSubtractionLevel,
  SUBTRACTION_LEVEL_LABELS,
  SUBTRACTION_LEVEL_UP_STREAK,
  TOTAL_SUBTRACTION_QUESTIONS,
} from "./subtractionEngine";
import {
  SubtractionQuestionCard,
  type SubtractionFeedback,
} from "./SubtractionQuestionCard";
import { SubtractionResults } from "./SubtractionResults";
import {
  formatSubtractionTime,
  loadSubtractionBestTime,
  resolveSubtractionBestTime,
  saveSubtractionBestTime,
} from "./subtractionTimer";

type SubtractionPracticeProps = {
  onBackToTopics: () => void;
};

export function SubtractionPractice({
  onBackToTopics,
}: SubtractionPracticeProps) {
  const roundStartedAtRef = useRef(Date.now());
  const attemptIdRef = useRef(createPracticeAttemptId("subtraction"));
  const { updatePracticeProgress, refreshLegacyProgress } =
    useLearningProgress();
  const [questionNumber, setQuestionNumber] = useState(1);
  const [question, setQuestion] = useState(() =>
    generateSubtractionQuestion(1),
  );
  const [answerDigits, setAnswerDigits] = useState(
    createEmptySubtractionDigits,
  );
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<SubtractionFeedback | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bestTimeSeconds, setBestTimeSeconds] = useState<number | null>(
    loadSubtractionBestTime,
  );
  const [isNewBestTime, setIsNewBestTime] = useState(false);

  useEffect(() => {
    const refreshBestTime = () =>
      setBestTimeSeconds(loadSubtractionBestTime());
    window.addEventListener(LEARNING_PROGRESS_APPLIED_EVENT, refreshBestTime);
    return () =>
      window.removeEventListener(
        LEARNING_PROGRESS_APPLIED_EVENT,
        refreshBestTime,
      );
  }, []);

  useEffect(() => {
    if (isComplete) {
      return;
    }

    const updateElapsedTime = () => {
      setElapsedSeconds(
        Math.max(
          0,
          Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
        ),
      );
    };

    updateElapsedTime();
    const timerId = window.setInterval(updateElapsedTime, 250);

    return () => window.clearInterval(timerId);
  }, [isComplete]);

  const checkAnswer = () => {
    if (feedback) {
      return;
    }

    const submittedAnswer = combineSubtractionDigits(answerDigits);

    if (submittedAnswer === null) {
      setInputError("Enter a whole number using digits only.");
      return;
    }

    const isCorrect = submittedAnswer === question.correctAnswer;
    const nextScore = score + (isCorrect ? 1 : 0);
    const updatedStreak = isCorrect
      ? Math.min(streak + 1, SUBTRACTION_LEVEL_UP_STREAK)
      : 0;
    const nextLevel = getNextSubtractionLevel(
      question.level,
      isCorrect,
      updatedStreak,
    );

    if (isCorrect) {
      setScore(nextScore);
    }

    updatePracticeProgress({
      attemptId: attemptIdRef.current,
      subject: "Math",
      topic: "Subtraction",
      answered: questionNumber,
      total: TOTAL_SUBTRACTION_QUESTIONS,
      score: nextScore,
      status: "in-progress",
      durationSeconds: Math.max(
        0,
        Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
      ),
      metadata: { level: question.level },
    });

    setStreak(updatedStreak);
    setInputError(null);
    setFeedback({ isCorrect, nextLevel });
  };

  const nextQuestion = () => {
    if (!feedback) {
      return;
    }

    if (questionNumber === TOTAL_SUBTRACTION_QUESTIONS) {
      const completedTime = Math.max(
        0,
        Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
      );
      const updatedBestTime = resolveSubtractionBestTime(
        completedTime,
        bestTimeSeconds,
      );

      setElapsedSeconds(completedTime);
      setBestTimeSeconds(updatedBestTime.bestTime);
      setIsNewBestTime(updatedBestTime.isNewBestTime);
      if (updatedBestTime.isNewBestTime) {
        saveSubtractionBestTime(updatedBestTime.bestTime);
        refreshLegacyProgress();
      }
      updatePracticeProgress({
        attemptId: attemptIdRef.current,
        subject: "Math",
        topic: "Subtraction",
        answered: TOTAL_SUBTRACTION_QUESTIONS,
        total: TOTAL_SUBTRACTION_QUESTIONS,
        score,
        status: "completed",
        durationSeconds: completedTime,
        metadata: { bestTimeSeconds: updatedBestTime.bestTime },
      });
      setIsComplete(true);
      return;
    }

    setQuestionNumber((currentNumber) => currentNumber + 1);
    setQuestion(generateSubtractionQuestion(feedback.nextLevel));
    if (feedback.nextLevel !== question.level) {
      setStreak(0);
    }
    setAnswerDigits(createEmptySubtractionDigits());
    setFeedback(null);
    setInputError(null);
  };

  const restartRound = () => {
    roundStartedAtRef.current = Date.now();
    attemptIdRef.current = createPracticeAttemptId("subtraction");
    setQuestionNumber(1);
    setQuestion(generateSubtractionQuestion(1));
    setAnswerDigits(createEmptySubtractionDigits());
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setInputError(null);
    setElapsedSeconds(0);
    setIsNewBestTime(false);
    setIsComplete(false);
  };

  return (
    <main className="min-h-screen bg-[#f4fbf8] text-[#17213b]">
      <AnnouncementBar />
      <section className="relative min-h-[calc(100vh-42px)] overflow-hidden bg-[#16805c] px-5 pb-14 sm:px-8">
        <div
          className="pointer-events-none absolute -right-28 top-28 h-80 w-80 rounded-full border-[22px] border-[#ffd84d]/25"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-24 bottom-24 h-64 w-64 rounded-full bg-[#ff6633]/20"
          aria-hidden="true"
        />

        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between py-6">
          <Brand tone="light" />
          <button
            type="button"
            onClick={onBackToTopics}
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d]"
          >
            Exit to Topics
          </button>
        </nav>

        <div className="relative z-10 mx-auto w-full max-w-4xl">
          {isComplete ? (
            <SubtractionResults
              score={score}
              elapsedSeconds={elapsedSeconds}
              bestTimeSeconds={bestTimeSeconds}
              isNewBestTime={isNewBestTime}
              onRestart={restartRound}
              onBackToTopics={onBackToTopics}
            />
          ) : (
            <>
              <header className="mb-6 text-white">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#fff3b0]">
                      Subtraction round
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                      Question {questionNumber} of {TOTAL_SUBTRACTION_QUESTIONS}
                    </h1>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-28 rounded-2xl bg-[#ffd84d] px-4 py-2.5 text-[#33286e] shadow-[0_4px_0_#d6aa00]">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                        Time
                      </p>
                      <time
                        aria-label="Elapsed time"
                        className="mt-0.5 block font-mono text-xl font-black tabular-nums"
                      >
                        {formatSubtractionTime(elapsedSeconds)}
                      </time>
                    </div>
                    <div className="min-w-28 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-white backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#dff9ef]">
                        Best Time
                      </p>
                      <p
                        aria-label="Best time"
                        className="mt-0.5 font-mono text-xl font-black tabular-nums"
                      >
                        {bestTimeSeconds === null
                          ? "--"
                          : formatSubtractionTime(bestTimeSeconds)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-[#ffd84d] transition-[width] duration-300"
                    style={{
                      width: `${(questionNumber / TOTAL_SUBTRACTION_QUESTIONS) * 100}%`,
                    }}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#dff9ef]">
                      Score
                    </p>
                    <p className="mt-1 text-lg font-black">
                      {score} / {TOTAL_SUBTRACTION_QUESTIONS}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#dff9ef]">
                      Correct streak
                    </p>
                    <p className="mt-1 text-lg font-black">
                      {streak} / {SUBTRACTION_LEVEL_UP_STREAK}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#dff9ef]">
                      Current level
                    </p>
                    <p className="mt-1 text-sm font-black">
                      {SUBTRACTION_LEVEL_LABELS[question.level]}
                    </p>
                  </div>
                </div>
              </header>

              <SubtractionQuestionCard
                question={question}
                answerDigits={answerDigits}
                inputError={inputError}
                feedback={feedback}
                isLastQuestion={
                  questionNumber === TOTAL_SUBTRACTION_QUESTIONS
                }
                onAnswerDigitsChange={(updatedDigits) => {
                  setAnswerDigits(updatedDigits);
                  setInputError(null);
                }}
                onCheckAnswer={checkAnswer}
                onNextQuestion={nextQuestion}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
