import { useEffect, useRef, useState } from "react";
import { AnnouncementBar, Brand } from "../../components/AppChrome";
import {
  AdditionQuestionCard,
  type AdditionFeedback,
} from "./AdditionQuestionCard";
import { AdditionResults } from "./AdditionResults";
import {
  ADDITION_LEVEL_LABELS,
  combineAdditionDigits,
  createEmptyAdditionDigits,
  generateAdditionQuestion,
  getNextAdditionLevel,
  LEVEL_UP_STREAK,
  TOTAL_ADDITION_QUESTIONS,
} from "./additionEngine";
import {
  formatAdditionTime,
  loadAdditionBestTime,
  resolveAdditionBestTime,
  saveAdditionBestTime,
} from "./additionTimer";

type AdditionPracticeProps = {
  onBackToTopics: () => void;
};

export function AdditionPractice({ onBackToTopics }: AdditionPracticeProps) {
  const roundStartedAtRef = useRef(Date.now());
  const [questionNumber, setQuestionNumber] = useState(1);
  const [question, setQuestion] = useState(() => generateAdditionQuestion(1));
  const [answerDigits, setAnswerDigits] = useState(createEmptyAdditionDigits);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<AdditionFeedback | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bestTimeSeconds, setBestTimeSeconds] = useState<number | null>(
    loadAdditionBestTime,
  );
  const [isNewBestTime, setIsNewBestTime] = useState(false);

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

    const submittedAnswer = combineAdditionDigits(answerDigits);

    if (submittedAnswer === null) {
      setInputError("Enter a whole number using digits only.");
      return;
    }

    const isCorrect = submittedAnswer === question.correctAnswer;
    const updatedStreak = isCorrect
      ? Math.min(streak + 1, LEVEL_UP_STREAK)
      : 0;
    const nextLevel = getNextAdditionLevel(
      question.level,
      isCorrect,
      updatedStreak,
    );

    if (isCorrect) {
      setScore((currentScore) => currentScore + 1);
    }

    setStreak(updatedStreak);
    setInputError(null);
    setFeedback({ isCorrect, nextLevel });
  };

  const nextQuestion = () => {
    if (!feedback) {
      return;
    }

    if (questionNumber === TOTAL_ADDITION_QUESTIONS) {
      const completedTime = Math.max(
        0,
        Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
      );
      const updatedBestTime = resolveAdditionBestTime(
        completedTime,
        bestTimeSeconds,
      );

      setElapsedSeconds(completedTime);
      setBestTimeSeconds(updatedBestTime.bestTime);
      setIsNewBestTime(updatedBestTime.isNewBestTime);
      if (updatedBestTime.isNewBestTime) {
        saveAdditionBestTime(updatedBestTime.bestTime);
      }
      setIsComplete(true);
      return;
    }

    setQuestionNumber((currentNumber) => currentNumber + 1);
    setQuestion(generateAdditionQuestion(feedback.nextLevel));
    if (feedback.nextLevel !== question.level) {
      setStreak(0);
    }
    setAnswerDigits(createEmptyAdditionDigits());
    setFeedback(null);
    setInputError(null);
  };

  const restartRound = () => {
    roundStartedAtRef.current = Date.now();
    setQuestionNumber(1);
    setQuestion(generateAdditionQuestion(1));
    setAnswerDigits(createEmptyAdditionDigits());
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setInputError(null);
    setElapsedSeconds(0);
    setIsNewBestTime(false);
    setIsComplete(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f5ff] text-[#17213b]">
      <AnnouncementBar />
      <section className="relative min-h-[calc(100vh-42px)] overflow-hidden bg-[#5d43dc] px-5 pb-14 sm:px-8">
        <div className="pointer-events-none absolute -right-28 top-28 h-80 w-80 rounded-full border-[22px] border-[#ffd84d]/20" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 bottom-24 h-64 w-64 rounded-full bg-[#ff6633]/20" aria-hidden="true" />

        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between py-6">
          <Brand />
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
            <AdditionResults
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
                      Addition round
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                      Question {questionNumber} of {TOTAL_ADDITION_QUESTIONS}
                    </h1>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-28 rounded-2xl bg-[#ffd84d] px-4 py-2.5 text-[#33286e] shadow-[0_4px_0_#d6aa00]">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em]">Time</p>
                      <time
                        aria-label="Elapsed time"
                        className="mt-0.5 block font-mono text-xl font-black tabular-nums"
                      >
                        {formatAdditionTime(elapsedSeconds)}
                      </time>
                    </div>
                    <div className="min-w-28 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-white backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d9d2ff]">Best Time</p>
                      <p
                        aria-label="Best time"
                        className="mt-0.5 font-mono text-xl font-black tabular-nums"
                      >
                        {bestTimeSeconds === null
                          ? "--"
                          : formatAdditionTime(bestTimeSeconds)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-[#ffd84d] transition-[width] duration-300"
                    style={{ width: `${(questionNumber / TOTAL_ADDITION_QUESTIONS) * 100}%` }}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d9d2ff]">Score</p>
                    <p className="mt-1 text-lg font-black">{score} / 20</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d9d2ff]">Correct streak</p>
                    <p className="mt-1 text-lg font-black">{streak} / {LEVEL_UP_STREAK}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d9d2ff]">Current level</p>
                    <p className="mt-1 text-sm font-black">{ADDITION_LEVEL_LABELS[question.level]}</p>
                  </div>
                </div>
              </header>

              <AdditionQuestionCard
                question={question}
                answerDigits={answerDigits}
                inputError={inputError}
                feedback={feedback}
                isLastQuestion={questionNumber === TOTAL_ADDITION_QUESTIONS}
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
