import { useEffect, useMemo, useState } from "react";
import { Brand } from "../../components/AppChrome";
import { storyLessons } from "./content";
import { LessonRunner } from "./LessonRunner";
import { useStoryProgress } from "./progress";
import { regionalizeText } from "./regionalize";

type StoryAdventuresProps = {
  onBackToEnglish: () => void;
};

const milestoneNumbers = [10, 20, 40, 60, 80, 100];

export function StoryAdventures({ onBackToEnglish }: StoryAdventuresProps) {
  const {
    state,
    updateLesson,
    startLesson,
    setRegion,
    setTextScale,
    completedLessonIds,
  } = useStoryProgress();
  const [view, setView] = useState<"home" | "lessons" | "lesson">("home");
  const [selectedSequence, setSelectedSequence] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Grade 5 Story Adventures";
    return () => {
      document.title = "Grade 4 English Practice";
    };
  }, []);

  const completedCount = completedLessonIds.size;
  const skillTotals = useMemo(
    () =>
      Object.values(state.progressByLesson).reduce(
        (totals, progress) => ({
          vocabulary: totals.vocabulary + progress.assessment.vocabularyCorrect,
          spelling: totals.spelling + progress.assessment.spellingCorrect,
          comprehension:
            totals.comprehension + progress.assessment.comprehensionAttempted,
          paragraph: totals.paragraph + progress.assessment.paragraphChecks,
        }),
        { vocabulary: 0, spelling: 0, comprehension: 0, paragraph: 0 },
      ),
    [state.progressByLesson],
  );
  const nextLesson =
    storyLessons.find((lesson) => !completedLessonIds.has(lesson.id)) ??
    storyLessons.at(-1)!;
  const inProgress = useMemo(
    () =>
      Object.values(state.progressByLesson)
        .filter((progress) => progress.status === "in-progress")
        .sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt))[0],
    [state.progressByLesson],
  );
  const inProgressLesson = inProgress
    ? storyLessons.find((lesson) => lesson.id === inProgress.lessonId)
    : undefined;
  const currentLesson = selectedSequence
    ? storyLessons[selectedSequence - 1]
    : undefined;
  const mainLesson = inProgressLesson ?? nextLesson;
  const mainButton = inProgressLesson
    ? "Continue Lesson"
    : completedCount > 0
      ? completedCount === 100
        ? "Review My Lessons"
        : "Start Next Lesson"
      : "Start a New Lesson";

  const openLesson = (sequence: number) => {
    const lesson = storyLessons[sequence - 1];
    if (!lesson) return;
    startLesson(lesson.id);
    setSelectedSequence(sequence);
    setView("lesson");
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  if (view === "lesson" && currentLesson) {
    return (
      <LessonRunner
        lesson={currentLesson}
        lessons={storyLessons}
        progress={state.progressByLesson[currentLesson.id]}
        region={state.region}
        textScale={state.textScale}
        updateLesson={updateLesson}
        onExit={() => {
          setView("lessons");
          setSelectedSequence(null);
        }}
        onOpenLesson={openLesson}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#17213b]">
      <header className="border-b border-[#dfe2ea] bg-white">
        <div className="mx-auto flex min-h-[74px] w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Brand label="StoryAdventures" />
          <button
            type="button"
            onClick={onBackToEnglish}
            className="rounded-full border-2 border-[#d7dbe3] bg-white px-4 py-2 text-sm font-black"
          >
            Back to English Topics
          </button>
        </div>
      </header>

      <section className="overflow-hidden border-b border-[#dbe0ef] bg-[linear-gradient(120deg,#eaf0ff_0%,#fff9d8_50%,#e6faf4_100%)]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:py-14">
          <div>
            <span className="rounded-full bg-[#dfff38] px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-[#263000]">
              Grade 5 English · 100 lessons
            </span>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] sm:text-6xl">
              Story Adventures
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-[#555d72]">
              Read funny stories, solve mysteries, discover new words, and build
              confident Grade 5 writing with Bark Bolt and Nia.
            </p>
            <div className="mt-7 max-w-xl">
              <div className="flex justify-between text-sm font-black text-[#46506a]">
                <span>{completedCount} lessons completed</span>
                <span>{completedCount} / 100</span>
              </div>
              <div className="mt-2 h-4 overflow-hidden rounded-full bg-white/80 ring-1 ring-[#d2d9ed]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#4f6df5,#36c998)] transition-all"
                  style={{ width: `${completedCount}%` }}
                />
              </div>
              <p className="mt-3 font-black text-[#3047a5]">
                {inProgressLesson
                  ? `Lesson ${inProgressLesson.sequence} is saved and ready to continue.`
                  : completedCount === 100
                    ? "All adventures complete—review any lesson or weaker skill."
                    : "Your next adventure is ready!"}
              </p>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  completedCount === 100 && !inProgressLesson
                    ? setView("lessons")
                    : openLesson(mainLesson.sequence)
                }
                className="rounded-2xl bg-[#4f6df5] px-6 py-4 font-black text-white shadow-[0_5px_0_#2f48b9]"
              >
                {mainButton}
              </button>
              <button
                type="button"
                onClick={() => setView("lessons")}
                className="rounded-2xl border-2 border-[#cbd2e5] bg-white px-6 py-4 font-black text-[#30405f]"
              >
                My Lessons
              </button>
            </div>
          </div>
          <figure className="overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-[0_22px_58px_rgba(38,55,112,0.18)]">
            <img
              src={`${import.meta.env.BASE_URL}story-adventures/bark-bolt-nia-hero.webp`}
              alt="Bark Bolt and Nia follow glowing paw clues through a bright school library."
              className="aspect-[3/2] w-full object-cover"
            />
            <figcaption className="px-5 py-3 text-sm font-bold text-[#5c6272]">
              Bark Bolt and Nia are ready for the next Maple Creek mystery.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-9 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <div className="rounded-2xl border-2 border-[#e0e3ea] bg-white p-5">
            <h2 className="text-lg font-black">Reading settings</h2>
            <label className="mt-4 block text-sm font-black">
              English preference
              <select
                value={state.region}
                onChange={(event) => setRegion(event.target.value as "US" | "CA")}
                className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] bg-white px-3 py-3 font-semibold"
              >
                <option value="US">US English</option>
                <option value="CA">Canadian English</option>
              </select>
            </label>
            <fieldset className="mt-4">
              <legend className="text-sm font-black">Reading text size</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["standard", "large"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={state.textScale === option}
                    onClick={() => setTextScale(option)}
                    className={`rounded-xl border-2 px-3 py-2 text-sm font-black ${
                      state.textScale === option
                        ? "border-[#4f6df5] bg-[#eef2ff] text-[#3047a5]"
                        : "border-[#d8dce5] bg-white"
                    }`}
                  >
                    {option === "standard" ? "Standard" : "Large"}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="rounded-2xl border-2 border-[#e0e3ea] bg-white p-5">
            <h2 className="text-lg font-black">Milestone badges</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {milestoneNumbers.map((number) => (
                <div
                  key={number}
                  className={`rounded-xl p-3 text-center ${
                    completedCount >= number
                      ? "bg-[#fff5bd] text-[#665009]"
                      : "bg-[#f0f1f4] text-[#a0a3ab]"
                  }`}
                >
                  <span className="block text-xl">★</span>
                  <span className="text-xs font-black">{number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#e0e3ea] bg-white p-5">
            <h2 className="text-lg font-black">My real skill work</h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#737784]">
              These totals come only from activities you attempted.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
              {[
                ["Vocabulary", skillTotals.vocabulary],
                ["Spelling", skillTotals.spelling],
                ["Responses", skillTotals.comprehension],
                ["Writing checks", skillTotals.paragraph],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#f4f6fb] p-3">
                  <dt className="text-xs font-bold text-[#687083]">{label}</dt>
                  <dd className="mt-1 text-xl font-black text-[#3047a5]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border-2 border-[#d8e5fb] bg-[#eef6ff] p-5 text-sm font-semibold leading-6 text-[#40516e]">
            <p className="font-black">Saved on this device</p>
            <p className="mt-1">
              Answers and progress save automatically in this browser. No child
              profile or personal information is collected, and progress does not
              sync across devices.
            </p>
          </div>
        </aside>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
                {view === "lessons" ? "My Lessons" : "Today's Adventure"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">
                {view === "lessons"
                  ? "Choose an unlocked lesson"
                  : regionalizeText(mainLesson.title, state.region)}
              </h2>
            </div>
            {view === "lessons" ? (
              <button
                type="button"
                onClick={() => setView("home")}
                className="rounded-full border-2 border-[#d7dbe3] bg-white px-4 py-2 text-sm font-black"
              >
                Adventure Home
              </button>
            ) : null}
          </div>

          {view === "home" ? (
            <article className="mt-6 overflow-hidden rounded-[1.5rem] border-2 border-[#dfe2ea] bg-white">
              <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
                <img
                  src={`${import.meta.env.BASE_URL}${mainLesson.illustration.src.replace(/^\//, "")}`}
                  alt={mainLesson.illustration.alt}
                  className="h-full min-h-64 w-full object-cover"
                />
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-black text-[#3047a5]">
                      Lesson {mainLesson.sequence} of 100
                    </span>
                    <span className="rounded-full bg-[#eaf8f2] px-3 py-1 text-xs font-black text-[#17624c]">
                      {mainLesson.band}
                    </span>
                  </div>
                  <p className="mt-5 text-sm font-semibold leading-7 text-[#626775]">
                    {regionalizeText(mainLesson.objective, state.region)}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {mainLesson.skillTags.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-[#f3f4f7] px-2.5 py-1 text-xs font-bold text-[#5f6470]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-6 rounded-xl bg-[#fff8d9] p-4 text-sm font-bold text-[#66520b]">
                    Daily goal: complete one manageable lesson section. Your work
                    saves after every change.
                  </p>
                </div>
              </div>
            </article>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {storyLessons.map((lesson) => {
                const progress = state.progressByLesson[lesson.id];
                const completed = progress?.status === "completed";
                const active = progress?.status === "in-progress";
                const unlocked =
                  completed || active || lesson.sequence <= completedCount + 1;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => openLesson(lesson.sequence)}
                    className={`rounded-2xl border-2 p-4 text-left transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#dfff38] ${
                      completed
                        ? "border-[#9bcf75] bg-[#f0fae8]"
                        : active
                          ? "border-[#4f6df5] bg-[#eef2ff]"
                          : unlocked
                            ? "border-[#dfe2ea] bg-white hover:-translate-y-0.5 hover:shadow-md"
                            : "cursor-not-allowed border-[#e8e9ed] bg-[#f3f4f6] text-[#9a9da5]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.12em]">
                        Lesson {lesson.sequence}
                      </span>
                      <span aria-hidden="true">
                        {completed ? "✓" : active ? "▶" : unlocked ? "→" : "🔒"}
                      </span>
                    </div>
                    <span className="mt-2 block font-black leading-5">
                      {regionalizeText(lesson.title, state.region)}
                    </span>
                    <span className="mt-2 block text-xs font-semibold capitalize">
                      {completed
                        ? "Completed · review available"
                        : active
                          ? `${stepLabel(progress.currentStep)} · saved`
                          : unlocked
                            ? "Ready to start"
                            : "Complete the previous lesson to unlock"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function stepLabel(step: string) {
  return step
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
