import { useState } from "react";
import { AnnouncementBar, Brand } from "./components/AppChrome";
import { TopicCard } from "./components/TopicCard";
import { AdditionPractice } from "./features/addition/AdditionPractice";

type TopicName = "Addition" | "Subtraction";

const topics: Array<{
  name: TopicName;
  icon: string;
  description: string;
  accent: "purple" | "mint";
  number: string;
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
];

export default function App() {
  const [selectedTopic, setSelectedTopic] = useState<TopicName | null>(null);

  if (selectedTopic === "Addition") {
    return <AdditionPractice onBackToTopics={() => setSelectedTopic(null)} />;
  }

  if (selectedTopic === "Subtraction") {
    return (
      <main className="min-h-screen bg-[#5d43dc] text-[#17213b]">
        <AnnouncementBar />
        <section className="relative min-h-[calc(100vh-42px)] overflow-hidden">
          <img
            src="/hero-no-child.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-[#4e34c9]/75" />

          <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
            <Brand />
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-extrabold text-white backdrop-blur-sm">
              Grade 4
            </span>
          </nav>

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-145px)] w-full max-w-6xl items-center justify-center px-5 pb-16 sm:px-8">
            <section
              className="w-full max-w-2xl rounded-[2.25rem] bg-white px-6 py-10 text-center shadow-[0_20px_60px_rgba(31,20,96,0.35)] sm:px-12 sm:py-14"
              aria-labelledby="selected-topic-heading"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 -rotate-3 items-center justify-center rounded-[1.75rem] bg-[#ff6633] text-5xl font-black text-white shadow-[0_7px_0_#c93d17]">
                {"\u2212"}
              </div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-[#6b4ce6]">
                Great choice!
              </p>
              <h1
                id="selected-topic-heading"
                className="text-3xl font-black tracking-[-0.035em] text-[#17213b] sm:text-5xl"
              >
                You selected {selectedTopic}
              </h1>
              <p className="mx-auto mt-5 max-w-md text-lg font-semibold leading-8 text-[#69728a]">
                This topic is ready for practice questions in the next feature.
              </p>
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                className="mt-9 inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#ff6633] px-7 py-3.5 text-base font-black text-white shadow-[0_6px_0_#c93d17] transition hover:-translate-y-0.5 hover:bg-[#f25526] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] active:translate-y-1 active:shadow-none"
              >
                <span aria-hidden="true">{"\u2190"}</span>
                Back to Topics
              </button>
            </section>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#faf9ff] text-[#17213b]">
      <AnnouncementBar />

      <section className="relative min-h-[590px] overflow-hidden bg-[#6045df]">
        <img
          src="/hero-no-child.png"
          alt="Colorful school books, a large pencil, and playful math symbols"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] md:object-contain md:object-right"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(72,47,193,0.98)_0%,rgba(83,57,207,0.92)_38%,rgba(90,63,216,0.28)_68%,rgba(90,63,216,0.04)_100%)]" />

        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
          <Brand />
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-extrabold text-white backdrop-blur-sm sm:inline-flex">
              2 fun topics
            </span>
            <span className="rounded-full bg-[#ffd84d] px-4 py-2 text-sm font-black text-[#33286e] shadow-[0_4px_0_#d6aa00]">
              Grade 4
            </span>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex min-h-[470px] w-full max-w-6xl items-center px-5 pb-24 sm:px-8">
          <div className="max-w-xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#2f236f]/55 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#fff3b0] backdrop-blur-sm sm:text-sm">
              <span aria-hidden="true">{"\u2605"}</span>
              Fun math starts here
            </div>
            <h1
              id="page-title"
              aria-label="Grade 4 Math Practice"
              className="max-w-lg text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl"
            >
              Grade 4
              <span className="block text-[#ffd84d]">Math Practice</span>
            </h1>
            <p className="mt-6 max-w-md text-lg font-semibold leading-8 text-[#eeeaff] sm:text-xl">
              Choose a topic to start practicing
            </p>
            <a
              href="#topics"
              className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-full bg-[#ff6633] px-7 py-3.5 text-base font-black text-white shadow-[0_6px_0_#c93d17] transition hover:-translate-y-0.5 hover:bg-[#f25526] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#ffd84d] active:translate-y-1 active:shadow-none"
            >
              Pick a topic
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#ff6633]" aria-hidden="true">
                {"\u2193"}
              </span>
            </a>
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-1 left-[-5%] z-10 h-24 w-[110%] rounded-[50%_50%_0_0/100%_100%_0_0] bg-[#faf9ff]" />
      </section>

      <section id="topics" className="relative z-20 -mt-2 px-5 pb-16 sm:px-8 sm:pb-24" aria-labelledby="topics-heading">
        <div className="mx-auto w-full max-w-5xl">
          <header className="mx-auto mb-9 max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#6b4ce6]">
              Your math mission
            </p>
            <h2 id="topics-heading" className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#17213b] sm:text-5xl">
              Pick a topic and jump in!
            </h2>
            <p className="mt-4 text-base font-semibold text-[#69728a] sm:text-lg">
              Two simple ways to grow your number skills.
            </p>
          </header>

          <div className="grid gap-7 md:grid-cols-2">
            {topics.map((topic) => (
              <TopicCard
                key={topic.name}
                {...topic}
                onSelect={() => setSelectedTopic(topic.name)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
