import { loadStoryState } from "./progress";

type StoryAdventureCardProps = {
  onSelect: () => void;
};

export function StoryAdventureCard({ onSelect }: StoryAdventureCardProps) {
  const state = loadStoryState();
  const progress = Object.values(state.progressByLesson);
  const completed = progress.filter((item) => item.status === "completed").length;
  const inProgress = progress.find((item) => item.status === "in-progress");
  const buttonLabel = inProgress
    ? "Continue Lesson"
    : completed > 0
      ? completed >= 100
        ? "Review My Lessons"
        : "Start Next Lesson"
      : "Start a New Lesson";

  return (
    <article className="relative col-span-full overflow-hidden rounded-[1.6rem] border-2 border-[#cbd5ff] bg-[linear-gradient(120deg,#edf2ff_0%,#fff9d8_48%,#e2fbf4_100%)] shadow-[0_16px_38px_rgba(42,61,135,0.12)]">
      <div className="grid min-h-[360px] items-stretch lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 flex flex-col justify-center p-7 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#dfff38] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#243000]">
              Topic 05 · Grade 5
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#3753c7]">
              100 lessons
            </span>
          </div>
          <h3 className="mt-5 text-4xl font-black tracking-[-0.055em] text-[#17213b] sm:text-5xl">
            Story Adventures
          </h3>
          <p className="mt-3 text-lg font-black text-[#3047a5]">
            100 exciting Grade 5 reading and writing lessons.
          </p>
          <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-[#5d6171]">
            Read funny stories, solve mysteries, discover new words and improve
            your writing.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-[#52596d]">
            <span className="rounded-xl border border-[#d8def4] bg-white/75 px-3 py-2">
              {completed} lessons completed
            </span>
            <span className="rounded-xl border border-[#d8def4] bg-white/75 px-3 py-2">
              {inProgress
                ? "Your saved lesson is ready"
                : completed > 0 && completed < 100
                  ? "Your next adventure is ready!"
                  : "Meet Bark Bolt and Nia"}
            </span>
          </div>
          <button
            type="button"
            onClick={onSelect}
            className="mt-7 inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-[#4f6df5] px-6 py-4 text-base font-black text-white shadow-[0_5px_0_#2f48b9] transition hover:-translate-y-0.5 hover:bg-[#455fdc] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#dfff38] active:translate-y-1 active:shadow-none"
          >
            {buttonLabel}
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="relative min-h-72 overflow-hidden bg-[#dfe7ff] lg:min-h-full">
          <img
            src={`${import.meta.env.BASE_URL}story-adventures/bark-bolt-nia-hero.webp`}
            alt="Bark Bolt and Nia follow glowing blue paw clues through a sunny school library."
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(237,242,255,0.92)_0%,transparent_28%)] lg:block" />
        </div>
      </div>
    </article>
  );
}
