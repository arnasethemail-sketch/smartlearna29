import { useEffect, useState } from "react";
import { AnnouncementBar, Brand } from "./components/AppChrome";
import { TopicCard } from "./components/TopicCard";
import { AdditionPractice } from "./features/addition/AdditionPractice";
import { EnglishPractice } from "./features/english/EnglishPractice";
import type { EnglishTopicName } from "./features/english/englishContent";
import { FractionPractice } from "./features/fractions/FractionPractice";
import { KnowledgePractice } from "./features/knowledge/KnowledgePractice";
import type {
  KnowledgeSubjectName,
  KnowledgeTopicName,
  ScienceTopicName,
  SocialStudiesTopicName,
} from "./features/knowledge/knowledgeContent";
import { SubtractionPractice } from "./features/subtraction/SubtractionPractice";
import { UcmasPractice } from "./features/ucmas/UcmasPractice";

type MathTopicName =
  | "Addition"
  | "Subtraction"
  | "UCMAS Mental Maths"
  | "Fractions";

type SubjectName = "Math" | "English" | KnowledgeSubjectName;

type SelectedTopic =
  | { subject: "Math"; name: MathTopicName }
  | { subject: "English"; name: EnglishTopicName }
  | { subject: KnowledgeSubjectName; name: KnowledgeTopicName };

type TopicDetails<T extends string> = {
  name: T;
  icon: string;
  description: string;
  accent: "purple" | "mint" | "sky" | "coral";
  number: string;
  buttonLabel?: string;
  statusLabel?: string;
};

const mathTopics: Array<TopicDetails<MathTopicName>> = [
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

const englishTopics: Array<TopicDetails<EnglishTopicName>> = [
  {
    name: "Reading",
    icon: "📖",
    description: "Read short passages and find the main idea, details, and clues.",
    accent: "purple",
    number: "01",
  },
  {
    name: "Grammar",
    icon: "Aa",
    description: "Build clear sentences with the right words, verbs, and punctuation.",
    accent: "mint",
    number: "02",
  },
  {
    name: "Vocabulary",
    icon: "💬",
    description: "Grow your word power with meanings, synonyms, and context clues.",
    accent: "sky",
    number: "03",
  },
  {
    name: "Spelling",
    icon: "✎",
    description: "Practice tricky Grade 4 words and choose the correct spelling.",
    accent: "coral",
    number: "04",
    statusLabel: "New",
  },
];

const scienceTopics: Array<TopicDetails<ScienceTopicName>> = [
  {
    name: "Plants & Animals",
    icon: "🌱",
    description: "Explore life cycles, habitats, food chains, and adaptations.",
    accent: "purple",
    number: "01",
  },
  {
    name: "Earth & Space",
    icon: "🌎",
    description: "Learn about weather, the water cycle, planets, and Earth's motion.",
    accent: "mint",
    number: "02",
  },
  {
    name: "Matter & Energy",
    icon: "⚛",
    description: "Investigate matter, forces, light, sound, and energy changes.",
    accent: "sky",
    number: "03",
  },
  {
    name: "Science Skills",
    icon: "🔬",
    description: "Practice observations, fair tests, measurements, and conclusions.",
    accent: "coral",
    number: "04",
    statusLabel: "New",
  },
];

const socialStudiesTopics: Array<TopicDetails<SocialStudiesTopicName>> = [
  {
    name: "Geography",
    icon: "🗺",
    description: "Read maps and learn about landforms, regions, and populations.",
    accent: "purple",
    number: "01",
  },
  {
    name: "U.S. History",
    icon: "📜",
    description: "Explore important people, events, documents, and movements.",
    accent: "mint",
    number: "02",
  },
  {
    name: "Government",
    icon: "🏛",
    description: "Understand branches, rights, responsibilities, and elections.",
    accent: "sky",
    number: "03",
  },
  {
    name: "Economics",
    icon: "$",
    description: "Learn about needs, goods, services, saving, and smart choices.",
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

function LearningPathIllustration({ subject }: { subject: SubjectName }) {
  if (subject === "English") {
    return (
      <div
        className="relative mx-auto h-48 w-56"
        role="img"
        aria-label="Colorful Grade 4 English learning blocks"
      >
        <div className="absolute inset-x-4 bottom-1 h-6 rounded-[50%] bg-[#cfd7f6]/70 blur-sm" />
        <div className="absolute left-3 top-10 flex h-28 w-28 -rotate-6 items-center justify-center rounded-[1.75rem] border-2 border-[#263665] bg-[#4f6df5] text-5xl font-black text-white shadow-[8px_10px_0_#dbe2ff]">
          Aa
        </div>
        <div className="absolute right-2 top-4 flex h-24 w-24 rotate-6 items-center justify-center rounded-[1.5rem] border-2 border-[#624b09] bg-[#ffd84d] text-5xl shadow-[7px_8px_0_#fff1a8]">
          <span aria-hidden="true">📖</span>
        </div>
        <div className="absolute bottom-3 right-7 flex h-24 w-24 -rotate-2 items-center justify-center rounded-full border-2 border-[#17624c] bg-[#36d3a0] text-2xl font-black text-[#123d31] shadow-[7px_8px_0_#c7f7e8]">
          ABC
        </div>
      </div>
    );
  }

  if (subject === "Science" || subject === "Social Studies") {
    const isScience = subject === "Science";

    return (
      <div
        className="relative mx-auto h-48 w-56"
        role="img"
        aria-label={`Colorful Grade 4 ${subject} learning blocks`}
      >
        <div className="absolute inset-x-4 bottom-1 h-6 rounded-[50%] bg-[#cfd7f6]/70 blur-sm" />
        <div className="absolute left-3 top-10 flex h-28 w-28 -rotate-6 items-center justify-center rounded-[1.75rem] border-2 border-[#263665] bg-[#4f6df5] text-5xl text-white shadow-[8px_10px_0_#dbe2ff]">
          <span aria-hidden="true">{isScience ? "🔬" : "🗺"}</span>
        </div>
        <div className="absolute right-2 top-4 flex h-24 w-24 rotate-6 items-center justify-center rounded-[1.5rem] border-2 border-[#624b09] bg-[#ffd84d] text-5xl shadow-[7px_8px_0_#fff1a8]">
          <span aria-hidden="true">{isScience ? "🌎" : "🏛"}</span>
        </div>
        <div className="absolute bottom-3 right-7 flex h-24 w-24 -rotate-2 items-center justify-center rounded-full border-2 border-[#17624c] bg-[#36d3a0] text-3xl font-black text-[#123d31] shadow-[7px_8px_0_#c7f7e8]">
          {isScience ? "⚛" : "$"}
        </div>
      </div>
    );
  }

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
  const [subject, setSubject] = useState<SubjectName>("Math");
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);

  useEffect(() => {
    document.title = `Grade 4 ${subject} Practice`;
  }, [subject]);

  const startMathTopic = (topic: MathTopicName) => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setSelectedTopic({ subject: "Math", name: topic });
  };

  const startEnglishTopic = (topic: EnglishTopicName) => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setSelectedTopic({ subject: "English", name: topic });
  };

  const startKnowledgeTopic = (
    nextSubject: KnowledgeSubjectName,
    topic: KnowledgeTopicName,
  ) => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setSelectedTopic({ subject: nextSubject, name: topic });
  };

  const chooseSubject = (nextSubject: SubjectName) => {
    setSubject(nextSubject);
    setSelectedTopic(null);
    setSubjectMenuOpen(false);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  if (selectedTopic?.subject === "Math" && selectedTopic.name === "Addition") {
    return <AdditionPractice onBackToTopics={() => setSelectedTopic(null)} />;
  }

  if (selectedTopic?.subject === "Math" && selectedTopic.name === "Subtraction") {
    return <SubtractionPractice onBackToTopics={() => setSelectedTopic(null)} />;
  }

  if (
    selectedTopic?.subject === "Math" &&
    selectedTopic.name === "UCMAS Mental Maths"
  ) {
    return <UcmasPractice onBackToTopics={() => setSelectedTopic(null)} />;
  }

  if (selectedTopic?.subject === "Math" && selectedTopic.name === "Fractions") {
    return <FractionPractice onBackToTopics={() => setSelectedTopic(null)} />;
  }

  if (selectedTopic?.subject === "English") {
    return (
      <EnglishPractice
        topic={selectedTopic.name}
        onBackToTopics={() => setSelectedTopic(null)}
      />
    );
  }

  if (
    selectedTopic?.subject === "Science" ||
    selectedTopic?.subject === "Social Studies"
  ) {
    return (
      <KnowledgePractice
        topic={selectedTopic.name}
        onBackToTopics={() => setSelectedTopic(null)}
      />
    );
  }

  const subjectSubtitle: Record<SubjectName, string> = {
    Math: "Choose a topic to start practicing",
    English: "Read, write, and build word confidence",
    Science: "Investigate living things, Earth, matter, and scientific thinking",
    "Social Studies": "Explore places, history, government, and economics",
  };
  const subjectDescription: Record<SubjectName, string> = {
    Math: "Build number confidence through focused, kid-friendly practice.",
    English: "Grow reading and writing confidence with focused, kid-friendly practice.",
    Science: "Build curiosity through Grade 4 science questions and explanations.",
    "Social Studies": "Connect geography, history, civics, and economics to everyday life.",
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#17181a]">
      <header className="relative z-30 border-b border-[#dedfe2] bg-white">
        <nav className="mx-auto flex h-[74px] w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-10">
            <Brand label={`${subject.replaceAll(" ", "")}Practice`} />
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
            <div
              className="relative"
              onKeyDown={(event) => {
                if (event.key === "Escape") setSubjectMenuOpen(false);
              }}
            >
              <button
                type="button"
                aria-label="Choose subject"
                aria-haspopup="menu"
                aria-expanded={subjectMenuOpen}
                onClick={() => setSubjectMenuOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#4f6df5] bg-white px-4 py-2 text-sm font-extrabold text-[#303b77] transition hover:bg-[#f1f3ff] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#dfff38]"
              >
                Subjects
                <span
                  aria-hidden="true"
                  className={`text-xs transition ${subjectMenuOpen ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>

              {subjectMenuOpen ? (
                <div
                  role="menu"
                  aria-label="Subjects"
                  className="absolute right-0 top-[calc(100%+0.7rem)] w-64 overflow-hidden rounded-2xl border-2 border-[#dfe1e7] bg-white p-2 shadow-[0_18px_45px_rgba(30,34,48,0.16)]"
                >
                  {(["Math", "English", "Science", "Social Studies"] as const).map((subjectOption) => {
                    const isActive = subjectOption === subject;
                    return (
                      <button
                        key={subjectOption}
                        type="button"
                        role="menuitemradio"
                        aria-checked={isActive}
                        aria-label={`${subjectOption}, 4 practice topics`}
                        onClick={() => chooseSubject(subjectOption)}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                          isActive
                            ? "bg-[#eef1ff] text-[#3047a5]"
                            : "text-[#3f4146] hover:bg-[#f6f6f7]"
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-black">
                            {subjectOption}
                          </span>
                          <span className="mt-0.5 block text-xs font-semibold text-[#777980]">
                            4 practice topics
                          </span>
                        </span>
                        <span className="text-lg" aria-hidden="true">
                          {isActive
                            ? "✓"
                            : subjectOption === "Math"
                              ? "+"
                              : subjectOption === "English"
                                ? "Aa"
                                : subjectOption === "Science"
                                  ? "⚛"
                                  : "⌖"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#d7d8dc] bg-white px-4 py-2 text-sm font-black">
              Grade 4
              <span className="text-[#a9ca00]" aria-hidden="true">
                {"\u26a1"}
              </span>
            </span>
          </div>
        </nav>
      </header>

      <AnnouncementBar subject={subject} />

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
                  aria-label={`Grade 4 ${subject} Practice`}
                  className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl"
                >
                  Grade 4
                  <span className="block">{subject} Practice</span>
                </h1>
                <p className="mt-4 max-w-md text-base font-semibold leading-7 text-[#65676d]">
                  {subjectSubtitle[subject]}
                </p>
              </div>
              <LearningPathIllustration subject={subject} />
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
              {subject} topics
            </h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-[#6b6d72]">
            {subjectDescription[subject]}
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {subject === "Math"
            ? mathTopics.map((topic) => (
                <TopicCard
                  key={topic.name}
                  {...topic}
                  onSelect={() => startMathTopic(topic.name)}
                />
              ))
            : subject === "English"
              ? englishTopics.map((topic) => (
                  <TopicCard
                    key={topic.name}
                    {...topic}
                    onSelect={() => startEnglishTopic(topic.name)}
                  />
                ))
              : subject === "Science"
                ? scienceTopics.map((topic) => (
                    <TopicCard
                      key={topic.name}
                      {...topic}
                      onSelect={() => startKnowledgeTopic("Science", topic.name)}
                    />
                  ))
                : socialStudiesTopics.map((topic) => (
                    <TopicCard
                      key={topic.name}
                      {...topic}
                      onSelect={() =>
                        startKnowledgeTopic("Social Studies", topic.name)
                      }
                    />
                  ))}
        </div>
      </section>
    </main>
  );
}
