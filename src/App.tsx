import { useState } from "react";
import { AnnouncementBar, Brand } from "./components/AppChrome";
import { TopicCard } from "./components/TopicCard";
import { AdditionPractice } from "./features/addition/AdditionPractice";
import { FractionPractice } from "./features/fractions/FractionPractice";
import { SubtractionPractice } from "./features/subtraction/SubtractionPractice";
import { UcmasPractice } from "./features/ucmas/UcmasPractice";

type TopicName =
  | "Addition"
  | "Subtraction"
  | "UCMAS Mental Maths"
  | "Fractions";

const topics: Array<{
  name: TopicName;
  icon: string;
  description: string;
  accent: "purple" | "mint" | "sky" | "coral";
  number: string;
  buttonLabel?: string;
  statusLabel?: string;
}> = [
  {
    name: "Addition",
    icon: "+",
    description: "Build confidence adding bigger numbers, one step at a time.",
    accent: "purple",
    number: "01",
  },
  {
    name: "Subtraction",
    icon: "\u2212",
    description: "Practice finding the difference with clear, simple steps.",
    accent: "mint",
    number: "02",
  },
  {
    name: "UCMAS Mental Maths",
    icon: "\ud83c\udfa7",
    description: "Listen to the numbers and calculate the answer in your head.",
    accent: "sky",
    number: "03",
    buttonLabel: "Start Mental Maths",
  },
  {
    name: "Fractions",
    icon: "\u00bd",
    description: "Explore equal parts and learn how fractions fit together.",
    accent: "coral",
    number: "04",
    statusLabel: "New",
  },
];

const practiceDays = [
  { label: "M", complete: true },
  { label: "T", complete: false },
  { label: "W", complete: false },
  { label: "T", complete: false },
  { label: "F", complete: false },
];

function LearningPathIllustration() {
  return (
    <div
      className="relative mx-auto h-48 w-56"
      role="img"
      aria-label="Colorful Grade 4 math learning blocks"
    >
      <div className="absolute inset-x-4 bottom-1 h-6 rounded-[50%] bg-[#cfd7f6]/70 blur-sm" />
      <div className="absolute left-3 top-10 h-28 w-28 -rotate-6 rounded-[1.75rem] border-2 border-[#263665] bg-[#4f6df5] shadow-[8px_10px_0_#dbe2ff]">
        <span className="absolute left-5 top-3 text-5xl font-black text-white">
          +
        </span>
        <span className="absolute bottom-4 right-5 text-4xl font-black text-[#dfff38]">
          4
        </span>
      </div>
      <div className="absolute right-2 top-4 h-24 w-24 rotate-6 rounded-[1.5rem] border-2 border-[#624b09] bg-[#ffd84d] shadow-[7px_8px_0_#fff1a8]">
        <span className="absolute left-5 top-4 text-5xl font-black text-[#362f12]">
          {"\u2212"}
        </span>
      </div>
      <div className="absolute bottom-3 right-7 flex h-24 w-24 -rotate-2 items-center justify-center rounded-full border-2 border-[#17624c] bg-[#36d3a0] text-5xl shadow-[7px_8px_0_#c7f7e8]">
        <span aria-hidden="true">{"\ud83c\udfa7"}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedTopic, setSelectedTopic] = useState<TopicName | null>(null);

  const startTopic = (topic: TopicName) => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setSelectedTopic(topic);
  };

  if (selectedTopic === "Addition") {
    return <AdditionPractice onBackToTopics={() => setSelectedTopic(null)} />;
  }

  if (selectedTopic === "Subtraction") {
    return <SubtractionPractice onBackToTopics={() => setSelectedTopic(null)} />;
  }

  if (selectedTopic === "UCMAS Mental Maths") {
    return <UcmasPractice onBackToTopics={() => setSelectedTopic(null)} />;
  }

  if (selectedTopic === "Fractions") {
    return <FractionPractice onBackToTopics={() => setSelectedTopic(null)} />;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#17181a]">
      <header className="border-b border-[#dedfe2] bg-white">
        <nav className="mx-auto flex h-[74px] w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-10">
            <Brand />
            <div className="hidden h-full items-center gap-7 md:flex">
              <a
                href="#home"
                className="flex h-full items-center gap-2 border-b-[3px] border-[#17181a] px-1 text-sm font-extrabold text-[#17181a]"
              >
                <span aria-hidden="true">{"\u2302"}</span>
                Home
              </a>
              <a
                href="#topics"
                className="flex h-full items-center gap-2 px-1 text-sm font-bold text-[#74767b] transition hover:text-[#17181a]"
              >
                <span aria-hidden="true">{"\u25a3"}</span>
                Topics
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden rounded-full border-2 border-[#e1e2e5] bg-white px-4 py-2 text-sm font-extrabold text-[#3f4146] sm:inline-flex">
              4 topics
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#d7d8dc] bg-white px-4 py-2 text-sm font-black">
              Grade 4
              <span className="text-[#a9ca00]" aria-hidden="true">
                {"\u26a1"}
              </span>
            </span>
          </div>
        </nav>
      </header>

      <AnnouncementBar />

      <section
        id="home"
        className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-9 sm:px-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:py-12"
      >
        <aside className="space-y-6">
          <section className="rounded-[1.4rem] border-2 border-[#e1e2e5] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#72747a]">
                  Practice streak
                </p>
                <p className="mt-2 text-4xl font-black tracking-[-0.05em]">
                  1
                  <span className="ml-1 text-2xl text-[#b8dc00]">
                    {"\u26a1"}
                  </span>
                </p>
              </div>
              <span className="rounded-full bg-[#eff7bf] px-3 py-1.5 text-xs font-black text-[#526400]">
                Great start!
              </span>
            </div>

            <div className="mt-6 grid grid-cols-5 gap-3">
              {practiceDays.map((day, index) => (
                <div
                  key={`${day.label}-${index}`}
                  className="text-center"
                >
                  <span
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg font-black ${
                      day.complete
                        ? "border-[#8da700] bg-[#dfff38] text-[#263000]"
                        : "border-[#e7e8ea] bg-[#fafafa] text-[#c7c8cb]"
                    }`}
                  >
                    {day.complete ? "\u2713" : "\u26a1"}
                  </span>
                  <span className="mt-2 block text-xs font-bold text-[#72747a]">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.4rem] border-2 border-[#e1e2e5] bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#72747a]">
                    Today&apos;s goal
                  </p>
                  <h2 className="mt-2 text-xl font-black">Complete one topic</h2>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecefff] text-2xl">
                  {"\ud83c\udfaf"}
                </span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#eceef1]">
                <div className="h-full w-[8%] rounded-full bg-[#4f6df5]" />
              </div>
              <div className="mt-3 flex justify-between text-sm font-bold text-[#72747a]">
                <span>Ready to begin</span>
                <span>0 / 1</span>
              </div>
            </div>
            <div className="border-t border-[#e7e8ea] bg-[#fafafa] px-6 py-4 text-sm font-bold text-[#55575c]">
              Every practice round builds your skills.
            </div>
          </section>
        </aside>

        <section className="relative self-start">
          <div
            className="absolute inset-x-5 bottom-[-14px] top-5 rounded-[1.7rem] border-2 border-[#e4e5e8] bg-white"
            aria-hidden="true"
          />
          <article className="relative overflow-hidden rounded-[1.7rem] border-2 border-[#dedfe2] bg-white">
            <div className="grid items-center gap-6 px-7 py-8 sm:px-10 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
                  Your learning path
                </p>
                <h1
                  aria-label="Grade 4 Math Practice"
                  className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl"
                >
                  Grade 4
                  <span className="block">Math Practice</span>
                </h1>
                <p className="mt-4 max-w-md text-base font-semibold leading-7 text-[#65676d]">
                  Choose a topic to start practicing
                </p>
              </div>
              <LearningPathIllustration />
            </div>

            <div className="border-t-2 border-[#d9e0fb] bg-[#eef2ff] px-7 py-6 sm:px-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#263665]">
                    Four skills are ready for you
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#6a7190]">
                    Start anywhere and practice at your own pace.
                  </p>
                </div>
                <a
                  href="#topics"
                  className="inline-flex items-center gap-2 rounded-full bg-[#4f6df5] px-5 py-3 text-sm font-black text-white shadow-[0_4px_0_#2f48b9] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#dfff38] active:translate-y-1 active:shadow-none"
                >
                  View topics
                  <span aria-hidden="true">{"\u2193"}</span>
                </a>
              </div>
            </div>
          </article>
        </section>
      </section>

      <section
        id="topics"
        className="mx-auto w-full max-w-6xl px-5 pb-20 pt-5 sm:px-8"
        aria-labelledby="topics-heading"
      >
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
              Choose your next lesson
            </p>
            <h2
              id="topics-heading"
              className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl"
            >
              Math topics
            </h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-[#6b6d72]">
            Build number confidence through focused, kid-friendly practice.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic) => (
            <TopicCard
              key={topic.name}
              {...topic}
              onSelect={() => startTopic(topic.name)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
