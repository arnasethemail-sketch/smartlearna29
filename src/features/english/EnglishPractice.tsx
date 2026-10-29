import { useState } from "react";
import { Brand } from "../../components/AppChrome";
import {
  englishQuestionBanks,
  type EnglishQuestion,
  type EnglishTopicName,
} from "./englishContent";

type EnglishPracticeProps = {
  topic: EnglishTopicName;
  onBackToTopics: () => void;
};

type MultipleChoicePracticeProps = {
  subject: string;
  topic: string;
  questions: EnglishQuestion[];
  onBackToTopics: () => void;
};

export function EnglishPractice({
  topic,
  onBackToTopics,
}: EnglishPracticeProps) {
  return (
    <MultipleChoicePractice
      subject="English"
      topic={topic}
      questions={englishQuestionBanks[topic]}
      onBackToTopics={onBackToTopics}
    />
  );
}

export function MultipleChoicePractice({
  subject,
  topic,
  questions,
  onBackToTopics,
}: MultipleChoicePracticeProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);

  const question = questions[questionIndex];
  const isCorrect = selectedChoice === question.answer;

  const continuePractice = () => {
    if (!selectedChoice) return;

    const nextScore = score + (isCorrect ? 1 : 0);
    setScore(nextScore);

    if (questionIndex === questions.length - 1) {
      setComplete(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedChoice(null);
  };

  const retry = () => {
    setQuestionIndex(0);
    setSelectedChoice(null);
    setScore(0);
    setComplete(false);
  };

  if (complete) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-[#17181a]">
        <header className="border-b border-[#dedfe2] bg-white">
          <div className="mx-auto flex h-[74px] w-full max-w-5xl items-center justify-between px-5 sm:px-8">
            <Brand label={`${subject.replaceAll(" ", "")}Practice`} />
            <button
              type="button"
              onClick={onBackToTopics}
              className="rounded-full border-2 border-[#d7d8dc] bg-white px-4 py-2 text-sm font-black"
            >
              Back to subjects
            </button>
          </div>
        </header>

        <section className="mx-auto flex min-h-[calc(100vh-74px)] max-w-3xl items-center px-5 py-12 sm:px-8">
          <article className="w-full rounded-[2rem] border-2 border-[#dedfe2] bg-white p-8 text-center shadow-[0_18px_50px_rgba(33,35,44,0.08)] sm:p-12">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[#dfff38] text-4xl shadow-[5px_6px_0_#9eb500]">
              {score === questions.length ? "★" : "✓"}
            </span>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
              {topic} complete
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">
              You scored {score} / {questions.length}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base font-semibold leading-7 text-[#66686e]">
              {score === questions.length
                ? "Perfect work! You answered every question correctly."
                : "Nice practice! Try again to make your English skills even stronger."}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={retry}
                className="rounded-xl bg-[#4f6df5] px-6 py-3 font-black text-white shadow-[0_4px_0_#2f48b9]"
              >
                Practice again
              </button>
              <button
                type="button"
                onClick={onBackToTopics}
                className="rounded-xl border-2 border-[#d7d8dc] bg-white px-6 py-3 font-black"
              >
                Back to {subject} topics
              </button>
            </div>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#17181a]">
      <header className="border-b border-[#dedfe2] bg-white">
        <div className="mx-auto flex h-[74px] w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Brand label={`${subject.replaceAll(" ", "")}Practice`} />
          <button
            type="button"
            onClick={onBackToTopics}
            className="rounded-full border-2 border-[#d7d8dc] bg-white px-4 py-2 text-sm font-black"
          >
            Exit to topics
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
              Grade 4 {subject}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.045em]">
              {topic} Practice
            </h1>
          </div>
          <span className="rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-black text-[#3f57c8]">
            {questionIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#e6e8ed]">
          <div
            className="h-full rounded-full bg-[#4f6df5] transition-all"
            style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <article className="mt-7 rounded-[1.7rem] border-2 border-[#dedfe2] bg-white p-6 shadow-[0_14px_36px_rgba(33,35,44,0.07)] sm:p-9">
          {question.passage ? (
            <div className="mb-7 rounded-2xl border-2 border-[#dce2fb] bg-[#f0f3ff] p-5 text-base font-semibold leading-8 text-[#34394c]">
              {question.passage}
            </div>
          ) : null}

          <h2 className="text-2xl font-black leading-tight tracking-[-0.03em]">
            {question.prompt}
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {question.choices.map((choice) => {
              const isSelected = selectedChoice === choice;
              const showCorrect = selectedChoice && choice === question.answer;
              const showIncorrect = isSelected && !isCorrect;

              return (
                <button
                  key={choice}
                  type="button"
                  disabled={selectedChoice !== null}
                  onClick={() => setSelectedChoice(choice)}
                  className={`min-h-16 rounded-2xl border-2 px-5 py-4 text-left font-black transition ${
                    showCorrect
                      ? "border-[#78a000] bg-[#eff8c7] text-[#354700]"
                      : showIncorrect
                        ? "border-[#c8513a] bg-[#fff0eb] text-[#7b2d1d]"
                        : "border-[#e0e2e7] bg-white hover:border-[#4f6df5] hover:bg-[#f4f6ff] disabled:hover:border-[#e0e2e7]"
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {selectedChoice ? (
            <div
              className={`mt-6 rounded-2xl p-5 ${
                isCorrect ? "bg-[#eff8c7] text-[#354700]" : "bg-[#fff0eb] text-[#7b2d1d]"
              }`}
              role="status"
            >
              <p className="font-black">{isCorrect ? "Correct!" : `Answer: ${question.answer}`}</p>
              <p className="mt-1 text-sm font-semibold leading-6">{question.explanation}</p>
            </div>
          ) : null}

          <button
            type="button"
            disabled={!selectedChoice}
            onClick={continuePractice}
            className="mt-7 w-full rounded-xl bg-[#4f6df5] px-6 py-4 font-black text-white shadow-[0_4px_0_#2f48b9] transition disabled:cursor-not-allowed disabled:bg-[#bdc4e1] disabled:shadow-none"
          >
            {questionIndex === questions.length - 1 ? "See my score" : "Next question"}
          </button>
        </article>
      </section>
    </main>
  );
}
