import { useEffect, useRef, useState } from "react";
import { AnnouncementBar, Brand } from "../../components/AppChrome";
import { createPracticeAttemptId } from "../practiceAttemptId";
import { useLearningProgress } from "../progress";
import { LEARNING_PROGRESS_APPLIED_EVENT } from "../progress/events";
import {
  FractionQuestionCard,
  type FractionFeedback,
} from "./FractionQuestionCard";
import { FractionResults } from "./FractionResults";
import {
  generateFractionQuestion,
  isFractionSelectionCorrect,
  TOTAL_FRACTION_QUESTIONS,
} from "./fractionsEngine";
import {
  formatFractionTime,
  loadFractionBestTime,
  resolveFractionBestTime,
  saveFractionBestTime,
} from "./fractionRecords";

type FractionPracticeProps = {
  onBackToTopics: () => void;
};

export function FractionPractice({
  onBackToTopics,
}: FractionPracticeProps) {
  const roundStartedAtRef = useRef(Date.now());
  const attemptIdRef = useRef(createPracticeAttemptId("fractions"));
  const { updatePracticeProgress, refreshLegacyProgress } =
    useLearningProgress();
  const [questionNumber, setQuestionNumber] = useState(1);
  const [question, setQuestion] = useState(() =>
    generateFractionQuestion(1),
  );
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [feedback, setFeedback] = useState<FractionFeedback>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bestTimeSeconds, setBestTimeSeconds] = useState<number | null>(
    loadFractionBestTime,
  );
  const [isNewBestTime, setIsNewBestTime] = useState(false);

  useEffect(() => {
    const refreshBestTime = () => setBestTimeSeconds(loadFractionBestTime());
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

  const togglePart = (partIndex: number) => {
    if (feedback === "correct" || feedback === "incorrect") {
      return;
    }

    setSelectedParts((currentParts) =>
      currentParts.includes(partIndex)
        ? currentParts.filter((index) => index !== partIndex)
        : [...currentParts, partIndex],
    );
  };

  const checkAnswer = () => {
    if (feedback === "correct" || feedback === "incorrect") {
      return;
    }

    if (isFractionSelectionCorrect(selectedParts.length, question)) {
      const nextScore = score + 1;
      setScore(nextScore);
      updatePracticeProgress({
        attemptId: attemptIdRef.current,
        subject: "Math",
        topic: "Fractions",
        answered: questionNumber,
        total: TOTAL_FRACTION_QUESTIONS,
        score: nextScore,
        status: "in-progress",
        durationSeconds: Math.max(
          0,
          Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
        ),
      });
      setFeedback("correct");
      return;
    }

    if (incorrectAttempts === 0) {
      setIncorrectAttempts(1);
      updatePracticeProgress({
        attemptId: attemptIdRef.current,
        subject: "Math",
        topic: "Fractions",
        answered: questionNumber - 1,
        total: TOTAL_FRACTION_QUESTIONS,
        score,
        status: "in-progress",
        durationSeconds: Math.max(
          0,
          Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
        ),
        metadata: { currentQuestionAttempts: 1 },
      });
      setFeedback("try-again");
      return;
    }

    setIncorrectAttempts(2);
    updatePracticeProgress({
      attemptId: attemptIdRef.current,
      subject: "Math",
      topic: "Fractions",
      answered: questionNumber,
      total: TOTAL_FRACTION_QUESTIONS,
      score,
      status: "in-progress",
      durationSeconds: Math.max(
        0,
        Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
      ),
      metadata: { currentQuestionAttempts: 2 },
    });
    setFeedback("incorrect");
  };

  const nextQuestion = () => {
    if (feedback !== "correct" && feedback !== "incorrect") {
      return;
    }

    if (questionNumber === TOTAL_FRACTION_QUESTIONS) {
      const completedTime = Math.max(
        0,
        Math.floor((Date.now() - roundStartedAtRef.current) / 1000),
      );
      const updatedTimeRecord = resolveFractionBestTime(
        completedTime,
        bestTimeSeconds,
      );

      setElapsedSeconds(completedTime);
      setBestTimeSeconds(updatedTimeRecord.bestTime);
      setIsNewBestTime(updatedTimeRecord.isNewBestTime);

      if (updatedTimeRecord.isNewBestTime) {
        saveFractionBestTime(completedTime);
        refreshLegacyProgress();
      }
      updatePracticeProgress({
        attemptId: attemptIdRef.current,
        subject: "Math",
        topic: "Fractions",
        answered: TOTAL_FRACTION_QUESTIONS,
        total: TOTAL_FRACTION_QUESTIONS,
        score,
        status: "completed",
        durationSeconds: completedTime,
        metadata: { bestTimeSeconds: updatedTimeRecord.bestTime },
      });
      setIsComplete(true);
      return;
    }

    const nextQuestionNumber = questionNumber + 1;
    setQuestionNumber(nextQuestionNumber);
    setQuestion(generateFractionQuestion(nextQuestionNumber));
    setSelectedParts([]);
    setIncorrectAttempts(0);
    setFeedback(null);
  };

  const restartRound = () => {
    roundStartedAtRef.current = Date.now();
    attemptIdRef.current = createPracticeAttemptId("fractions");
    setQuestionNumber(1);
    setQuestion(generateFractionQuestion(1));
    setSelectedParts([]);
    setIncorrectAttempts(0);
    setFeedback(null);
    setScore(0);
    setElapsedSeconds(0);
    setIsNewBestTime(false);
    setIsComplete(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#17181a]">
      <AnnouncementBar />
      <section className="min-h-[calc(100vh-42px)] px-5 pb-14 sm:px-8">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between py-6">
          <Brand />
          <button
            type="button"
            onClick={onBackToTopics}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#d7d8dc] bg-white px-4 py-2 text-sm font-black text-[#34363b] transition hover:-translate-y-0.5 hover:border-[#bfc1c7] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#dfff38]"
          >
            <span aria-hidden="true">{"\u2190"}</span>
            Exit to Topics
          </button>
        </nav>

        <div className="mx-auto w-full max-w-4xl">
          {isComplete ? (
            <FractionResults
              score={score}
              elapsedSeconds={elapsedSeconds}
              bestTimeSeconds={bestTimeSeconds}
              isNewBestTime={isNewBestTime}
              onRestart={restartRound}
              onBackToTopics={onBackToTopics}
            />
          ) : (
            <>
              <header className="mb-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#b34d35]">
                      Fractions round
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                      Question {questionNumber} of {TOTAL_FRACTION_QUESTIONS}
                    </h1>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-28 rounded-2xl border-2 border-[#a7bf21] bg-[#dfff38] px-4 py-2.5 text-[#293200] shadow-[0_4px_0_#a7bf21]">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                        Time
                      </p>
                      <time
                        aria-label="Elapsed time"
                        className="mt-0.5 block font-mono text-xl font-black tabular-nums"
                      >
                        {formatFractionTime(elapsedSeconds)}
                      </time>
                    </div>
                    <div className="min-w-28 rounded-2xl border-2 border-[#dedfe2] bg-white px-4 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#72747a]">
                        Best Time
                      </p>
                      <p
                        aria-label="Best time"
                        className="mt-0.5 font-mono text-xl font-black tabular-nums"
                      >
                        {bestTimeSeconds === null
                          ? "--"
                          : formatFractionTime(bestTimeSeconds)}
                      </p>
                    </div>
                    <div className="col-span-2 min-w-28 rounded-2xl border-2 border-[#df6449] bg-[#fff0e9] px-4 py-2.5 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a6422d]">
                        Stars
                      </p>
                      <p
                        aria-label="Stars"
                        className="mt-0.5 text-lg font-black tracking-wider text-[#e3a500]"
                      >
                        ☆☆☆☆☆
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e1e3e8]">
                  <div
                    className="h-full rounded-full bg-[#ff7657] transition-[width] duration-300"
                    style={{
                      width: `${(questionNumber / TOTAL_FRACTION_QUESTIONS) * 100}%`,
                    }}
                  />
                </div>
              </header>

              <FractionQuestionCard
                question={question}
                selectedParts={selectedParts}
                feedback={feedback}
                isLastQuestion={
                  questionNumber === TOTAL_FRACTION_QUESTIONS
                }
                onTogglePart={togglePart}
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
