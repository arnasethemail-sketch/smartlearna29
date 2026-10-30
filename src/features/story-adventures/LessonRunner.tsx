import { useMemo, useState } from "react";
import { Brand } from "../../components/AppChrome";
import { regionalizeText } from "./regionalize";
import { createLessonProgress, STORY_STEPS } from "./progress";
import type {
  EnglishRegion,
  LessonProgress,
  LessonStep,
  QuestionClassification,
  StoryLesson,
  TextFeatureAnswer,
  VocabularyPracticeAnswer,
} from "./types";

type UpdateLesson = (
  lessonId: string,
  update:
    | Partial<LessonProgress>
    | ((current: LessonProgress) => Partial<LessonProgress>),
) => void;

type LessonRunnerProps = {
  lesson: StoryLesson;
  lessons: StoryLesson[];
  progress?: LessonProgress;
  region: EnglishRegion;
  textScale: "standard" | "large";
  updateLesson: UpdateLesson;
  onExit: () => void;
  onOpenLesson: (sequence: number) => void;
};

const lessonStepOrder: LessonStep[] = STORY_STEPS.filter(
  (step) => step !== "home",
);

const stepLabels: Record<LessonStep, string> = {
  home: "Lesson Home",
  reading: "Reading",
  "vocabulary-bank": "Vocabulary Bank",
  comprehension: "Comprehension",
  "vocabulary-practice": "Vocabulary Practice",
  "paragraph-writing": "Paragraph Writing",
  "text-features": "Text Features",
  complete: "Lesson Complete",
};

export type RapcPrompt = {
  letter: "R" | "A" | "P" | "C";
  prompt: string;
};

export const DEFAULT_RAPC_PROMPTS: readonly RapcPrompt[] = [
  { letter: "R", prompt: "Restate the question." },
  { letter: "A", prompt: "Answer clearly." },
  { letter: "P", prompt: "Prove or support the answer." },
  { letter: "C", prompt: "Check for completeness and clarity." },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function acceptedVocabularySpellings(
  item: StoryLesson["vocabulary"][number],
) {
  return Array.from(
    new Set(
      [
        item.word,
        regionalizeText(item.word, "US"),
        regionalizeText(item.word, "CA"),
        ...(item.acceptedSpellings ?? []),
      ]
        .map((word) => word.trim().toLocaleLowerCase())
        .filter(Boolean),
    ),
  );
}

function isVocabularySpellingCorrect(
  item: StoryLesson["vocabulary"][number],
  attempt: string,
) {
  return acceptedVocabularySpellings(item).includes(
    attempt.trim().toLocaleLowerCase(),
  );
}

function sentenceContainsVocabularyWord(
  sentence: string,
  item: StoryLesson["vocabulary"][number],
) {
  return acceptedVocabularySpellings(item).some((word) =>
    new RegExp(
      `(^|[^\\p{L}\\p{N}])${escapeRegExp(word)}(?=$|[^\\p{L}\\p{N}])`,
      "iu",
    ).test(sentence),
  );
}

function countVocabularyMatches(
  lesson: StoryLesson,
  matches: LessonProgress["vocabularyMatches"],
) {
  return lesson.vocabulary.reduce((total, item) => {
    const answer = matches[item.word];
    return (
      total +
      Number(answer?.definition === item.definition) +
      Number(
        Boolean(
          answer?.synonym &&
            (item.synonyms as readonly string[]).includes(answer.synonym),
        ),
      )
    );
  }, 0);
}

function countCorrectSpellings(
  lesson: StoryLesson,
  practice: LessonProgress["vocabularyPractice"],
) {
  return lesson.vocabulary.filter((item) =>
    isVocabularySpellingCorrect(
      item,
      practice[item.word]?.spellingAttempt ?? "",
    ),
  ).length;
}

function countComprehensionAttempts(
  lesson: StoryLesson,
  answers: LessonProgress["comprehensionAnswers"],
) {
  return lesson.comprehension.filter(
    (item) => (answers[item.id] ?? "").trim().length >= 12,
  ).length;
}

function hasValidParagraphDetails(
  lesson: StoryLesson,
  draft: LessonProgress["paragraphDraft"],
) {
  const selectedIds = new Set(draft.selectedDetailIds);
  const optionsById = new Map(
    lesson.paragraphTask.sentenceOptions.map((item) => [item.id, item]),
  );
  const relevantSelected = draft.selectedDetailIds.filter(
    (id) => optionsById.get(id)?.relevant === true,
  ).length;
  const containsUnknownOrIrrelevant = draft.selectedDetailIds.some(
    (id) => optionsById.get(id)?.relevant !== true,
  );

  return (
    selectedIds.size === draft.selectedDetailIds.length &&
    relevantSelected >= 3 &&
    !containsUnknownOrIrrelevant
  );
}

function countParagraphChecks(
  lesson: StoryLesson,
  draft: LessonProgress["paragraphDraft"],
) {
  return (
    Number(draft.topicSentence.trim().length >= 12) +
    Number(hasValidParagraphDetails(lesson, draft)) +
    Number(draft.conclusion.trim().length >= 12) +
    Number(draft.revisedParagraph.trim().length >= 20)
  );
}

function deriveAssessment(lesson: StoryLesson, progress: LessonProgress) {
  return {
    vocabularyCorrect: countVocabularyMatches(
      lesson,
      progress.vocabularyMatches,
    ),
    spellingCorrect: countCorrectSpellings(
      lesson,
      progress.vocabularyPractice,
    ),
    comprehensionAttempted: countComprehensionAttempts(
      lesson,
      progress.comprehensionAnswers,
    ),
    paragraphChecks: countParagraphChecks(lesson, progress.paragraphDraft),
  };
}

function resolveAssetPath(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

function StoryReference({
  lesson,
  region,
}: {
  lesson: StoryLesson;
  region: EnglishRegion;
}) {
  return (
    <details className="mb-6 rounded-2xl border-2 border-[#dce2fb] bg-[#f6f8ff] p-4">
      <summary className="cursor-pointer font-black text-[#3047a5] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#dfff38]">
        Reread the story
      </summary>
      <div className="mt-4 space-y-5 text-sm font-medium leading-7 text-[#40465a]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#4f6df5]">
            Lesson {lesson.sequence}
          </p>
          <h3 className="mt-1 text-xl font-black text-[#17213b]">
            {regionalizeText(lesson.title, region)}
          </h3>
        </div>
        <figure className="overflow-hidden rounded-2xl border-2 border-[#ced8ff] bg-white">
          <img
            src={resolveAssetPath(lesson.illustration.src)}
            alt={regionalizeText(lesson.illustration.alt, region)}
            className="aspect-[5/3] w-full object-cover"
          />
          <figcaption className="border-t border-[#d8def5] px-4 py-3 text-xs font-bold leading-5 text-[#5f6474]">
            {regionalizeText(lesson.illustration.caption, region)}
          </figcaption>
        </figure>
        {lesson.pages.map((page) => (
          <section key={page.pageNumber} className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#73798b]">
                Page {page.pageNumber} of 2
              </p>
              <h4 className="mt-1 text-lg font-black text-[#273d9b]">
                {regionalizeText(page.subheading, region)}
              </h4>
            </div>
            {page.paragraphs.map((paragraph, index) => (
              <p key={`${page.pageNumber}-${index}`}>
                {regionalizeText(paragraph, region)}
              </p>
            ))}
            <aside className="rounded-xl border-l-4 border-[#36c998] bg-[#eafaf4] p-3 text-[#1c5d49]">
              <strong className="block text-xs uppercase tracking-[0.12em]">
                {regionalizeText(page.callout.label, region)}
              </strong>
              <span className="mt-1 block">
                {regionalizeText(page.callout.text, region)}
              </span>
            </aside>
          </section>
        ))}
      </div>
    </details>
  );
}

function ReadingStep({
  lesson,
  region,
  textScale,
}: Pick<LessonRunnerProps, "lesson" | "region" | "textScale">) {
  const bodySize = textScale === "large" ? "text-[1.12rem] leading-9" : "text-[0.98rem] leading-8";

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
            Step 1 · Reading Story
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
            Read the complete adventure
          </h2>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border-2 border-[#d7dbe7] bg-white px-4 py-2 text-sm font-black"
        >
          Print two-page story
        </button>
      </div>

      <div className="story-print-spread grid gap-6 xl:grid-cols-2">
        {lesson.pages.map((page) => (
          <article
            key={page.pageNumber}
            className="story-print-page flex min-h-[720px] flex-col rounded-[1.7rem] border-2 border-[#dde0e7] bg-white p-6 shadow-[0_16px_42px_rgba(33,35,44,0.08)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b-2 border-[#e9ebf1] pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
                  Lesson {lesson.sequence} · Page {page.pageNumber}
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.035em]">
                  {page.pageNumber === 1
                    ? regionalizeText(lesson.title, region)
                    : regionalizeText(page.subheading, region)}
                </h3>
              </div>
              <span className="rounded-full bg-[#dfff38] px-3 py-1 text-xs font-black text-[#263000]">
                {lesson.informational
                  ? "Informational"
                  : regionalizeText(lesson.genre, region)}
              </span>
            </div>

            {page.pageNumber === 1 ? (
              <figure className="my-5 overflow-hidden rounded-2xl border-2 border-[#ced8ff] bg-[#eef2ff]">
                <img
                  src={resolveAssetPath(lesson.illustration.src)}
                  alt={regionalizeText(lesson.illustration.alt, region)}
                  className="aspect-[5/3] w-full object-cover"
                />
                <figcaption className="border-t border-[#d8def5] bg-white px-4 py-3 text-xs font-bold leading-5 text-[#5f6474]">
                  {regionalizeText(lesson.illustration.caption, region)}
                </figcaption>
              </figure>
            ) : (
              <div className="my-5 rounded-2xl border-l-8 border-[#36c998] bg-[#eafaf4] p-4 text-sm font-bold leading-6 text-[#1c5d49]">
                <span className="block text-xs font-black uppercase tracking-[0.14em]">
                  {regionalizeText(page.callout.label, region)}
                </span>
                <span className="mt-1 block">
                  {regionalizeText(page.callout.text, region)}
                </span>
              </div>
            )}

            <div className={`space-y-4 font-medium text-[#303544] ${bodySize}`}>
              {page.paragraphs.map((paragraph, index) => (
                <p key={index}>{regionalizeText(paragraph, region)}</p>
              ))}
            </div>

            {page.pageNumber === 1 ? (
              <div className="mt-auto pt-5">
                <div className="rounded-2xl border-l-8 border-[#ffd84d] bg-[#fff9d9] p-4 text-sm font-bold leading-6 text-[#67520a]">
                  <span className="block text-xs font-black uppercase tracking-[0.14em]">
                    {regionalizeText(page.callout.label, region)}
                  </span>
                  <span className="mt-1 block">
                    {regionalizeText(page.callout.text, region)}
                  </span>
                </div>
              </div>
            ) : null}
            <p className="mt-5 text-right text-xs font-black text-[#8a8d96]">
              Page {page.pageNumber} of 2
            </p>
          </article>
        ))}
      </div>

      {lesson.informational && lesson.sourceReferences.length ? (
        <details className="mt-6 rounded-2xl border-2 border-[#d8e5fb] bg-[#eef6ff] p-4 print:hidden">
          <summary className="cursor-pointer font-black text-[#304d78]">
            Trusted sources used for this informational lesson
          </summary>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-[#53627a]">
            {lesson.sourceReferences.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-2 underline-offset-2"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

function VocabularyBankStep({
  lesson,
  progress,
  updateLesson,
  region,
}: {
  lesson: StoryLesson;
  progress: LessonProgress;
  updateLesson: UpdateLesson;
  region: EnglishRegion;
}) {
  const [checked, setChecked] = useState(false);
  const definitions = useMemo(
    () => [...lesson.vocabulary].map((item) => item.definition).reverse(),
    [lesson],
  );
  const synonyms = useMemo(
    () => lesson.vocabulary.map((item, index) => item.synonyms[index % 2]).sort(),
    [lesson],
  );
  const correctCount = countVocabularyMatches(
    lesson,
    progress.vocabularyMatches,
  );

  const updateMatch = (
    word: string,
    key: "definition" | "synonym",
    value: string,
  ) => {
    updateLesson(lesson.id, (current) => {
      const vocabularyMatches = {
        ...current.vocabularyMatches,
        [word]: {
          ...current.vocabularyMatches[word],
          [key]: value,
        },
      };
      return {
        vocabularyMatches,
        assessment: {
          ...current.assessment,
          vocabularyCorrect: countVocabularyMatches(
            lesson,
            vocabularyMatches,
          ),
        },
      };
    });
    setChecked(false);
  };

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
        Step 2 · Vocabulary Bank
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
        Match three words
      </h2>
      <p className="mt-3 font-semibold leading-7 text-[#676b78]">
        Match each story word to its meaning and a useful synonym. You may fix
        any answer after checking.
      </p>
      <StoryReference lesson={lesson} region={region} />

      <div className="grid gap-4">
        {lesson.vocabulary.map((item) => {
          const answer = progress.vocabularyMatches[item.word] ?? {};
          return (
            <article
              key={item.word}
              className="rounded-2xl border-2 border-[#dfe2ea] bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl font-black text-[#273d9b]">
                  {regionalizeText(item.word, region)}
                </h3>
                <details className="text-sm font-bold text-[#5d6478]">
                  <summary className="cursor-pointer">Need a hint?</summary>
                  <p className="mt-2 max-w-md rounded-xl bg-[#fff8d6] p-3">
                    {regionalizeText(item.hint, region)}
                  </p>
                </details>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-black text-[#505461]">
                  Definition Bank
                  <select
                    aria-label={`Definition for ${regionalizeText(
                      item.word,
                      region,
                    )}`}
                    value={answer.definition ?? ""}
                    onChange={(event) =>
                      updateMatch(item.word, "definition", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] bg-white px-3 py-3 font-semibold"
                  >
                    <option value="">Choose a definition</option>
                    {definitions.map((definition) => (
                      <option key={definition} value={definition}>
                        {regionalizeText(definition, region)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-black text-[#505461]">
                  Synonym Bank
                  <select
                    aria-label={`Synonym for ${regionalizeText(
                      item.word,
                      region,
                    )}`}
                    value={answer.synonym ?? ""}
                    onChange={(event) =>
                      updateMatch(item.word, "synonym", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] bg-white px-3 py-3 font-semibold"
                  >
                    <option value="">Choose a synonym</option>
                    {synonyms.map((synonym) => (
                      <option key={synonym} value={synonym}>
                        {regionalizeText(synonym, region)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {checked ? (
                <p
                  className={`mt-4 rounded-xl p-3 text-sm font-black ${
                    answer.definition === item.definition &&
                    answer.synonym &&
                    (item.synonyms as readonly string[]).includes(answer.synonym)
                      ? "bg-[#e9f8cc] text-[#3e5700]"
                      : "bg-[#fff0e9] text-[#8a3b28]"
                  }`}
                >
                  {answer.definition === item.definition &&
                  answer.synonym &&
                  (item.synonyms as readonly string[]).includes(answer.synonym)
                    ? "Both matches are correct!"
                    : "One or both matches need another look. Use the hint and try again."}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          setChecked(true);
          updateLesson(lesson.id, (current) => ({
            assessment: {
              ...current.assessment,
              vocabularyCorrect: countVocabularyMatches(
                lesson,
                current.vocabularyMatches,
              ),
            },
          }));
        }}
        className="mt-5 rounded-xl bg-[#4f6df5] px-5 py-3 font-black text-white"
      >
        Check my matches
      </button>
      {checked ? (
        <span className="ml-3 text-sm font-black text-[#4d5260]">
          {correctCount} of 6 matches correct
        </span>
      ) : null}
    </section>
  );
}

function RapcChecklist({
  prompts = DEFAULT_RAPC_PROMPTS,
}: {
  prompts?: readonly RapcPrompt[];
}) {
  return (
    <div className="grid gap-2 rounded-2xl bg-[#eef2ff] p-4 sm:grid-cols-2">
      {prompts.map(({ letter, prompt }) => (
        <label key={letter} className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" className="h-4 w-4 accent-[#4f6df5]" />
          <span className="font-black text-[#3047a5]">{letter}</span>
          {prompt}
        </label>
      ))}
    </div>
  );
}

function ComprehensionStep({
  lesson,
  progress,
  updateLesson,
  region,
}: {
  lesson: StoryLesson;
  progress: LessonProgress;
  updateLesson: UpdateLesson;
  region: EnglishRegion;
}) {
  const [openFeedback, setOpenFeedback] = useState<Record<string, boolean>>({});
  const classifications: QuestionClassification[] = [
    "Right There",
    "Think and Search",
    "Author and You",
    "On My Own",
  ];

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
        Step 3 · Reading Comprehension
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
        Write on Q
      </h2>
      <p className="mt-3 font-semibold leading-7 text-[#676b78]">
        Choose the question type, then write a complete response. Model answers
        stay hidden until you make an attempt.
      </p>
      <StoryReference lesson={lesson} region={region} />
      <RapcChecklist />

      <div className="mt-6 space-y-5">
        {lesson.comprehension.map((question, index) => {
          const answer = progress.comprehensionAnswers[question.id] ?? "";
          const classification =
            progress.comprehensionClassifications[question.id] ?? "";
          const attempted = answer.trim().length >= 12;
          const points =
            Number(attempted) +
            Number(classification === question.classification) +
            Number(answer.trim().split(/\s+/).length >= 18) +
            Number(/[.!?]$/.test(answer.trim()));
          const suggestions = [
            !attempted
              ? "Write a complete answer that directly addresses the question."
              : null,
            classification !== question.classification
              ? "Reconsider the question type using the four definitions above."
              : null,
            answer.trim().split(/\s+/).length < 18
              ? "Add a specific reason or story detail to develop your response."
              : null,
            !/[.!?]$/.test(answer.trim())
              ? "Check the final sentence for ending punctuation."
              : null,
          ].filter((item): item is string => Boolean(item));
          return (
            <article
              key={question.id}
              className="rounded-2xl border-2 border-[#dfe2ea] bg-white p-5 sm:p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a7e89]">
                Question {index + 1} of 5
              </p>
              <h3 className="mt-2 text-xl font-black leading-7">
                {regionalizeText(question.prompt, region)}
              </h3>
              <label className="mt-4 block text-sm font-black">
                What type of question is this?
                <select
                  value={classification}
                  onChange={(event) =>
                    updateLesson(lesson.id, (current) => ({
                      comprehensionClassifications: {
                        ...current.comprehensionClassifications,
                        [question.id]: event.target.value as QuestionClassification,
                      },
                    }))
                  }
                  className="mt-2 block w-full rounded-xl border-2 border-[#d8dce5] bg-white px-3 py-3 md:max-w-sm"
                >
                  <option value="">Choose a type</option>
                  {classifications.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block text-sm font-black">
                Your answer
                <textarea
                  value={answer}
                  onChange={(event) => {
                    const value = event.target.value;
                    updateLesson(lesson.id, (current) => {
                      const comprehensionAnswers = {
                        ...current.comprehensionAnswers,
                        [question.id]: value,
                      };
                      return {
                        comprehensionAnswers,
                        assessment: {
                          ...current.assessment,
                          comprehensionAttempted:
                            countComprehensionAttempts(
                              lesson,
                              comprehensionAnswers,
                            ),
                        },
                      };
                    });
                  }}
                  rows={5}
                  className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] p-4 font-medium leading-7"
                  placeholder="Restate, answer, support, and check your response."
                />
              </label>
              <button
                type="button"
                disabled={!attempted}
                onClick={() => {
                  setOpenFeedback((current) => ({
                    ...current,
                    [question.id]: true,
                  }));
                }}
                className="mt-4 rounded-xl bg-[#4f6df5] px-4 py-2.5 text-sm font-black text-white disabled:bg-[#bbc2df]"
              >
                Open self-check guide
              </button>
              {openFeedback[question.id] ? (
                <div className="mt-4 rounded-2xl bg-[#eef8f4] p-4 text-sm leading-6 text-[#285446]">
                  <p className="font-black">
                    Self-check: {points} of 4 response features present
                  </p>
                  <p className="mt-1 font-semibold">
                    This is a writing guide, not automatic grading. Compare your
                    idea with the reference, then revise if needed.
                  </p>
                  <p className="mt-2 font-semibold">
                    {suggestions.length
                      ? `Next step: ${suggestions.slice(0, 2).join(" ")}`
                      : "Next step: compare your facts with the reference, then polish any wording you want to improve."}
                  </p>
                  <p className="mt-3 font-black">Reference answer</p>
                  <p>{regionalizeText(question.modelAnswer, region)}</p>
                  {!question.isOpinion ? (
                    <p className="mt-2">
                      <strong>Useful evidence:</strong>{" "}
                      {regionalizeText(question.evidence, region)}
                    </p>
                  ) : (
                    <p className="mt-2">
                      For this opinion question, a different answer is welcome
                      when it includes a thoughtful reason.
                    </p>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

const blankVocabularyPractice: VocabularyPracticeAnswer = {
  ownDefinition: "",
  synonyms: "",
  sentence: "",
  spellingAttempt: "",
};

function VocabularyPracticeStep({
  lesson,
  progress,
  updateLesson,
  region,
}: {
  lesson: StoryLesson;
  progress: LessonProgress;
  updateLesson: UpdateLesson;
  region: EnglishRegion;
}) {
  const [hiddenWords, setHiddenWords] = useState<Record<string, boolean>>({});
  const [checkedWords, setCheckedWords] = useState<Record<string, boolean>>({});

  const updateAnswer = (
    word: string,
    key: keyof VocabularyPracticeAnswer,
    value: string,
  ) => {
    updateLesson(lesson.id, (current) => {
      const vocabularyPractice = {
        ...current.vocabularyPractice,
        [word]: {
          ...(current.vocabularyPractice[word] ?? blankVocabularyPractice),
          [key]: value,
        },
      };
      return {
        vocabularyPractice,
        assessment: {
          ...current.assessment,
          spellingCorrect: countCorrectSpellings(
            lesson,
            vocabularyPractice,
          ),
        },
      };
    });
    setCheckedWords((current) => ({ ...current, [word]: false }));
  };

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
        Step 4 · Detailed Vocabulary and Spelling
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
        Own the words
      </h2>
      <StoryReference lesson={lesson} region={region} />
      <div className="space-y-6">
        {lesson.vocabulary.map((item) => {
          const answer =
            progress.vocabularyPractice[item.word] ?? blankVocabularyPractice;
          const spellingCorrect = isVocabularySpellingCorrect(
            item,
            answer.spellingAttempt,
          );
          const sentenceUsesWord = sentenceContainsVocabularyWord(
            answer.sentence,
            item,
          );
          const sentenceMeetsMinimumLength =
            answer.sentence.trim().split(/\s+/).filter(Boolean).length >= 7;
          return (
            <article
              key={item.word}
              className="rounded-[1.4rem] border-2 border-[#dfe2ea] bg-white p-5 sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl font-black text-[#3047a5]">
                  Word: {hiddenWords[item.word] ? "••••••" : regionalizeText(item.word, region)}
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setHiddenWords((current) => ({
                      ...current,
                      [item.word]: !current[item.word],
                    }))
                  }
                  className="rounded-full border-2 border-[#d8dce5] px-3 py-1.5 text-xs font-black"
                >
                  {hiddenWords[item.word]
                    ? "Show word"
                    : "Hide for spelling practice"}
                </button>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-black">
                  Definition in your own words
                  <textarea
                    rows={3}
                    value={answer.ownDefinition}
                    onChange={(event) =>
                      updateAnswer(item.word, "ownDefinition", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] p-3 font-medium"
                  />
                </label>
                <label className="text-sm font-black">
                  One or two synonyms
                  <textarea
                    rows={3}
                    value={answer.synonyms}
                    onChange={(event) =>
                      updateAnswer(item.word, "synonyms", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] p-3 font-medium"
                  />
                </label>
              </div>
              <label className="mt-4 block text-sm font-black">
                Use the word meaningfully in a new sentence
                <textarea
                  rows={3}
                  value={answer.sentence}
                  onChange={(event) =>
                    updateAnswer(item.word, "sentence", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] p-3 font-medium"
                />
              </label>
              <label className="mt-4 block text-sm font-black">
                Spelling attempt
                <input
                  value={answer.spellingAttempt}
                  onChange={(event) =>
                    updateAnswer(item.word, "spellingAttempt", event.target.value)
                  }
                  autoComplete="off"
                  className="mt-2 block w-full rounded-xl border-2 border-[#d8dce5] px-3 py-3 font-medium md:max-w-sm"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setCheckedWords((current) => ({ ...current, [item.word]: true }));
                  updateLesson(lesson.id, (current) => ({
                    assessment: {
                      ...current.assessment,
                      spellingCorrect: countCorrectSpellings(
                        lesson,
                        current.vocabularyPractice,
                      ),
                    },
                  }));
                }}
                className="mt-4 rounded-xl bg-[#4f6df5] px-4 py-2.5 text-sm font-black text-white"
              >
                Check and reflect
              </button>
              {checkedWords[item.word] ? (
                <div className="mt-4 rounded-xl bg-[#f0f7ff] p-4 text-sm font-semibold leading-6 text-[#34455f]">
                  <p>
                    <strong>Spelling:</strong>{" "}
                    {spellingCorrect
                      ? "Correct."
                      : `Check the spelling and try again: ${regionalizeText(item.word, region)}.`}
                  </p>
                  <p className="mt-1">
                    <strong>Deterministic sentence check:</strong>{" "}
                    {!sentenceUsesWord
                      ? "The target word was not found as a whole word. Add the target word (a listed US or Canadian spelling is accepted)."
                      : !sentenceMeetsMinimumLength
                        ? "The target word was found, but expand the sentence to at least seven words."
                        : "The target word was found as a whole word and the sentence meets the minimum length."}
                  </p>
                  <p className="mt-2">
                    <strong>Reference meaning:</strong>{" "}
                    {regionalizeText(item.definition, region)}
                  </p>
                  <p>
                    <strong>Reference synonyms:</strong>{" "}
                    {item.synonyms.map((value) => regionalizeText(value, region)).join(", ")}
                  </p>
                  <p className="mt-2 rounded-lg bg-white/70 p-2 text-xs font-bold">
                    Meaning and context are a self-check: finding the word does not
                    prove that it was used correctly. Compare your idea with the
                    reference meaning, then revise if the context does not fit.
                  </p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function highlightVocabulary(text: string, words: string[]) {
  if (!text) return null;
  const pattern = new RegExp(`(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(pattern).map((part, index) =>
    words.some((word) => word.toLowerCase() === part.toLowerCase()) ? (
      <mark key={`${part}-${index}`} className="rounded bg-[#fff2a6] px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function ParagraphWritingStep({
  lesson,
  progress,
  updateLesson,
  region,
}: {
  lesson: StoryLesson;
  progress: LessonProgress;
  updateLesson: UpdateLesson;
  region: EnglishRegion;
}) {
  const [showGuide, setShowGuide] = useState(false);
  const draft = progress.paragraphDraft;
  const selectedOptions = lesson.paragraphTask.sentenceOptions.filter((item) =>
    draft.selectedDetailIds.includes(item.id),
  );
  const regionalRequiredVocabulary =
    lesson.paragraphTask.requiredVocabulary.map((word) =>
      regionalizeText(word, region),
    );
  const preview = [
    draft.topicSentence,
    ...selectedOptions.map((item) => item.text),
    draft.missingDetail,
    draft.conclusion,
    draft.revisedParagraph,
  ]
    .filter(Boolean)
    .join(" ");

  const updateDraft = (key: keyof LessonProgress["paragraphDraft"], value: string | string[]) => {
    updateLesson(lesson.id, (current) => {
      const paragraphDraft: LessonProgress["paragraphDraft"] = {
        ...current.paragraphDraft,
        [key]: value,
      };
      return {
        paragraphDraft,
        assessment: {
          ...current.assessment,
          paragraphChecks: countParagraphChecks(lesson, paragraphDraft),
        },
      };
    });
  };

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
        Step 5 · Paragraph Writing and Editing
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
        Build a hamburger paragraph
      </h2>
      <p className="mt-3 rounded-2xl bg-[#fff8d9] p-4 font-bold leading-7 text-[#65500b]">
        {regionalizeText(lesson.paragraphTask.prompt, region)}
      </p>
      <StoryReference lesson={lesson} region={region} />

      <div className="space-y-5">
        <label className="block rounded-2xl border-2 border-[#e0b93d] bg-[#fffdf0] p-5 text-sm font-black">
          🍞 Topic sentence
          <span className="mt-1 block text-xs font-semibold text-[#77705b]">
            Starter: {regionalizeText(lesson.paragraphTask.topicSentenceStarter, region)}
          </span>
          <textarea
            rows={3}
            value={draft.topicSentence}
            onChange={(event) => updateDraft("topicSentence", event.target.value)}
            className="mt-3 w-full rounded-xl border-2 border-[#ddd7bf] bg-white p-3 font-medium"
          />
        </label>

        <fieldset className="rounded-2xl border-2 border-[#64b98f] bg-[#f0fbf6] p-5">
          <legend className="px-2 font-black">🥬 Choose three relevant supporting details</legend>
          <p className="mb-3 text-sm font-semibold text-[#4d6a5c]">
            Remove the details that do not support the central idea.
          </p>
          <div className="space-y-3">
            {lesson.paragraphTask.sentenceOptions.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer gap-3 rounded-xl border border-[#cee7da] bg-white p-3 text-sm font-semibold leading-6"
              >
                <input
                  type="checkbox"
                  checked={draft.selectedDetailIds.includes(option.id)}
                  onChange={(event) =>
                    updateDraft(
                      "selectedDetailIds",
                      event.target.checked
                        ? [...draft.selectedDetailIds, option.id]
                        : draft.selectedDetailIds.filter((id) => id !== option.id),
                    )
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-[#27956b]"
                />
                {regionalizeText(option.text, region)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block rounded-2xl border-2 border-[#64b98f] bg-[#f0fbf6] p-5 text-sm font-black">
          🥬 Supply a missing detail
          <span className="mt-1 block text-xs font-semibold text-[#4d6a5c]">
            {regionalizeText(lesson.paragraphTask.missingDetailPrompt, region)}
          </span>
          <textarea
            rows={3}
            value={draft.missingDetail}
            onChange={(event) => updateDraft("missingDetail", event.target.value)}
            className="mt-3 w-full rounded-xl border-2 border-[#cfe1d7] bg-white p-3 font-medium"
          />
        </label>

        <label className="block rounded-2xl border-2 border-[#e0b93d] bg-[#fffdf0] p-5 text-sm font-black">
          🍞 Concluding sentence
          <span className="mt-1 block text-xs font-semibold text-[#77705b]">
            {regionalizeText(lesson.paragraphTask.conclusionPrompt, region)}
          </span>
          <textarea
            rows={3}
            value={draft.conclusion}
            onChange={(event) => updateDraft("conclusion", event.target.value)}
            className="mt-3 w-full rounded-xl border-2 border-[#ddd7bf] bg-white p-3 font-medium"
          />
        </label>

        <label className="block rounded-2xl border-2 border-[#cdd4ef] bg-[#f5f7ff] p-5 text-sm font-black">
          Revision workshop
          <span className="mt-1 block text-xs font-semibold text-[#626b8b]">
            {regionalizeText(lesson.paragraphTask.revisionPrompt, region)} Use at
            least one lesson word: {regionalRequiredVocabulary.join(", ")}.
          </span>
          <textarea
            rows={5}
            value={draft.revisedParagraph}
            onChange={(event) => updateDraft("revisedParagraph", event.target.value)}
            className="mt-3 w-full rounded-xl border-2 border-[#d8ddeb] bg-white p-3 font-medium leading-7"
          />
        </label>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-[#dfe2ea] bg-white p-5">
        <h3 className="font-black">Final paragraph preview</h3>
        <p className="mt-3 min-h-20 font-medium leading-8 text-[#3c414e]">
          {preview
            ? highlightVocabulary(
                regionalizeText(preview, region),
                regionalRequiredVocabulary,
              )
            : "Your paragraph will appear here as you build it."}
        </p>
        <button
          type="button"
          disabled={preview.trim().split(/\s+/).length < 20}
          onClick={() => {
            setShowGuide(true);
            updateLesson(lesson.id, (current) => ({
              assessment: {
                ...current.assessment,
                paragraphChecks: countParagraphChecks(
                  lesson,
                  current.paragraphDraft,
                ),
              },
            }));
          }}
          className="mt-4 rounded-xl bg-[#4f6df5] px-4 py-2.5 text-sm font-black text-white disabled:bg-[#bbc2df]"
        >
          Check my paragraph
        </button>
        {showGuide ? (
          <div className="mt-4 rounded-xl bg-[#eef8f4] p-4 text-sm leading-6 text-[#285446]">
            <p className="font-black">Revision guide</p>
            <p>
              Relevant details selected: {selectedOptions.filter((item) => item.relevant).length}. Irrelevant details selected: {selectedOptions.filter((item) => !item.relevant).length}.
            </p>
            <p className="mt-2 font-semibold">
              Compare organization and clarity with this teacher reference, then
              revise in your own voice:
            </p>
            <p className="mt-1">{regionalizeText(lesson.paragraphTask.modelParagraph, region)}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const blankTextFeature: TextFeatureAnswer = {
  feature: "",
  purpose: "",
  help: "",
};

function TextFeaturesStep({
  lesson,
  progress,
  updateLesson,
  region,
  onComplete,
}: {
  lesson: StoryLesson;
  progress: LessonProgress;
  updateLesson: UpdateLesson;
  region: EnglishRegion;
  onComplete: () => void;
}) {
  const [showReferences, setShowReferences] = useState(false);
  const updateFeature = (
    id: string,
    key: keyof TextFeatureAnswer,
    value: string,
  ) => {
    updateLesson(lesson.id, (current) => ({
      textFeatureAnswers: {
        ...current.textFeatureAnswers,
        [id]: {
          ...(current.textFeatureAnswers[id] ?? blankTextFeature),
          [key]: value,
        },
      },
    }));
    setShowReferences(false);
  };
  const allAttempted = lesson.textFeatures.every((feature) => {
    const answer = progress.textFeatureAnswers[feature.id];
    return (
      (answer?.feature ?? "").trim() &&
      (answer?.purpose ?? "").trim().length >= 8 &&
      (answer?.help ?? "").trim().length >= 8
    );
  });

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
        Step 6 · Text Features Hunt
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
        Find four helpful features
      </h2>
      <p className="mt-3 font-semibold leading-7 text-[#676b78]">
        Look back at the reading. Name each feature and explain why the author
        included it and how it helped you.
      </p>
      <StoryReference lesson={lesson} region={region} />

      <div className="grid gap-5 lg:grid-cols-2">
        {lesson.textFeatures.map((feature, index) => {
          const answer =
            progress.textFeatureAnswers[feature.id] ?? blankTextFeature;
          return (
            <article
              key={feature.id}
              className="rounded-2xl border-2 border-[#dfe2ea] bg-white p-5"
            >
              <h3 className="text-lg font-black">Feature box {index + 1}</h3>
              <label className="mt-4 block text-sm font-black">
                What text feature did you find?
                <input
                  value={answer.feature}
                  onChange={(event) =>
                    updateFeature(feature.id, "feature", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] px-3 py-3 font-medium"
                />
              </label>
              <label className="mt-4 block text-sm font-black">
                Why did the author include it?
                <textarea
                  rows={3}
                  value={answer.purpose}
                  onChange={(event) =>
                    updateFeature(feature.id, "purpose", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] p-3 font-medium"
                />
              </label>
              <label className="mt-4 block text-sm font-black">
                How did it help you understand the text?
                <textarea
                  rows={3}
                  value={answer.help}
                  onChange={(event) =>
                    updateFeature(feature.id, "help", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border-2 border-[#d8dce5] p-3 font-medium"
                />
              </label>
              {showReferences ? (
                <div className="mt-4 rounded-xl bg-[#eef8f4] p-3 text-sm leading-6 text-[#285446]">
                  <p>
                    <strong>Feature:</strong>{" "}
                    {regionalizeText(feature.feature, region)}
                  </p>
                  <p><strong>Location:</strong> {regionalizeText(feature.location, region)}</p>
                  <p><strong>Purpose:</strong> {regionalizeText(feature.purpose, region)}</p>
                  <p><strong>How it helps:</strong> {regionalizeText(feature.helpsBecause, region)}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!allAttempted}
          onClick={() => setShowReferences(true)}
          className="rounded-xl border-2 border-[#4f6df5] bg-white px-5 py-3 font-black text-[#3047a5] disabled:border-[#c9ccd6] disabled:text-[#9a9da7]"
        >
          Compare with reference
        </button>
        <button
          type="button"
          disabled={!allAttempted}
          onClick={onComplete}
          className="rounded-xl bg-[#4f6df5] px-5 py-3 font-black text-white disabled:bg-[#bbc2df]"
        >
          Complete Lesson {lesson.sequence}
        </button>
      </div>
    </section>
  );
}

function CompleteStep({
  lesson,
  lessons,
  progress,
  region,
  onExit,
  onOpenLesson,
}: {
  lesson: StoryLesson;
  lessons: StoryLesson[];
  progress: LessonProgress;
  region: EnglishRegion;
  onExit: () => void;
  onOpenLesson: (sequence: number) => void;
}) {
  const reviewLessons =
    lesson.sequence % 3 === 0
      ? lessons.slice(Math.max(0, lesson.sequence - 3), lesson.sequence)
      : [];
  const reviewWords = reviewLessons.flatMap((item) => item.vocabulary);
  const milestones = [10, 20, 40, 60, 80, 100];
  const earnedMilestone = milestones.includes(lesson.sequence);
  const assessment = deriveAssessment(lesson, progress);
  const needsPractice = [
    assessment.vocabularyCorrect < 5 ? "vocabulary matching" : null,
    assessment.spellingCorrect < 2 ? "spelling" : null,
    assessment.comprehensionAttempted < 5 ? "comprehension responses" : null,
    assessment.paragraphChecks < 3 ? "paragraph revision" : null,
  ].filter(Boolean);

  return (
    <section className="text-center">
      <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#dfff38] text-5xl shadow-[7px_8px_0_#9eb500]">
        ★
      </span>
      <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
        Lesson {lesson.sequence} complete
      </p>
      <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">
        {lesson.sequence === 100
          ? "You completed the Grade 5 Story Adventures!"
          : "Adventure solved—strong work!"}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl font-semibold leading-7 text-[#666b78]">
        You read {regionalizeText(lesson.title, region)}, {regionalizeText(
          "practised",
          region,
        )} three words, wrote thoughtful responses, revised a paragraph, and
        investigated text features. Your real work has been saved on this
        device.
      </p>

      {earnedMilestone ? (
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border-2 border-[#e3bd36] bg-[#fff8d9] p-5">
          <p className="text-2xl font-black">Milestone badge: {lesson.sequence} adventures</p>
          <p className="mt-1 font-semibold text-[#6b5711]">Earned by completing real lesson work.</p>
        </div>
      ) : null}

      <div className="mx-auto mt-7 grid max-w-3xl gap-3 text-left sm:grid-cols-4">
        {[
          ["Vocabulary", `${assessment.vocabularyCorrect}/6 matches`],
          ["Spelling", `${assessment.spellingCorrect}/3 correct`],
          ["Responses", `${assessment.comprehensionAttempted}/5 attempted`],
          ["Paragraph", `${assessment.paragraphChecks}/4 checks`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border-2 border-[#e1e3e9] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c7f88]">{label}</p>
            <p className="mt-1 font-black">{value}</p>
          </div>
        ))}
      </div>

      {needsPractice.length ? (
        <p className="mx-auto mt-5 max-w-2xl rounded-xl bg-[#eef2ff] p-4 text-sm font-semibold text-[#35467d]">
          A useful next review is {needsPractice.join(", ")}. You can reopen this
          lesson without losing its completion history.
        </p>
      ) : null}

      {reviewWords.length ? (
        <div className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] border-2 border-[#cfe8df] bg-[#effbf6] p-6 text-left">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#167052]">
            Three-lesson cumulative vocabulary review
          </p>
          <h3 className="mt-2 text-2xl font-black">Review nine words you genuinely studied</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {reviewWords.map((word) => (
              <details key={`${word.word}-${word.definition}`} className="rounded-xl bg-white p-3">
                <summary className="cursor-pointer font-black text-[#24644f]">
                  {regionalizeText(word.word, region)}
                </summary>
                <p className="mt-2 text-sm leading-6">{regionalizeText(word.definition, region)}</p>
              </details>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {lesson.sequence < 100 ? (
          <button
            type="button"
            onClick={() => onOpenLesson(lesson.sequence + 1)}
            className="rounded-xl bg-[#4f6df5] px-6 py-3 font-black text-white shadow-[0_4px_0_#2f48b9]"
          >
            Start Next Lesson
          </button>
        ) : null}
        <button
          type="button"
          onClick={onExit}
          className="rounded-xl border-2 border-[#d7dbe3] bg-white px-6 py-3 font-black"
        >
          My Lessons
        </button>
      </div>
    </section>
  );
}

export function LessonRunner({
  lesson,
  lessons,
  progress: suppliedProgress,
  region,
  textScale,
  updateLesson,
  onExit,
  onOpenLesson,
}: LessonRunnerProps) {
  const progress = suppliedProgress ?? createLessonProgress(lesson.id);
  const step =
    progress.currentStep === "home" ? "reading" : progress.currentStep;
  const stepIndex = lessonStepOrder.indexOf(step);
  const canContinue = (() => {
    if (step === "reading") return true;
    if (step === "vocabulary-bank") {
      return lesson.vocabulary.every((item) => {
        const answer = progress.vocabularyMatches[item.word];
        return Boolean(answer?.definition && answer?.synonym);
      });
    }
    if (step === "comprehension") {
      return lesson.comprehension.every(
        (item) =>
          (progress.comprehensionAnswers[item.id] ?? "").trim().length >= 12 &&
          Boolean(progress.comprehensionClassifications[item.id]),
      );
    }
    if (step === "vocabulary-practice") {
      return lesson.vocabulary.every((item) => {
        const answer = progress.vocabularyPractice[item.word];
        return Boolean(
          answer &&
            answer.ownDefinition.trim().length >= 8 &&
            answer.synonyms.trim().length >= 3 &&
            answer.sentence.trim().length >= 12 &&
            answer.spellingAttempt.trim(),
        );
      });
    }
    if (step === "paragraph-writing") {
      const draft = progress.paragraphDraft;
      return (
        draft.topicSentence.trim().length >= 12 &&
        hasValidParagraphDetails(lesson, draft) &&
        draft.missingDetail.trim().length >= 12 &&
        draft.conclusion.trim().length >= 12 &&
        draft.revisedParagraph.trim().length >= 20
      );
    }
    return false;
  })();
  const setStep = (nextStep: LessonStep) => {
    updateLesson(lesson.id, (current) => ({
      status: current.status === "completed" ? "completed" : "in-progress",
      currentStep: nextStep,
      readingComplete:
        current.readingComplete || nextStep !== "reading",
      assessment: deriveAssessment(lesson, current),
    }));
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  const completeLesson = () => {
    updateLesson(lesson.id, (current) => ({
      status: "completed",
      currentStep: "complete",
      readingComplete: true,
      completedAt: current.completedAt ?? new Date().toISOString(),
      assessment: deriveAssessment(lesson, current),
    }));
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#17213b]">
      <header className="border-b border-[#dfe2ea] bg-white">
        <div className="mx-auto flex min-h-[74px] w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Brand label="StoryAdventures" />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-black text-[#3047a5] sm:inline-flex">
              Lesson {lesson.sequence} of 100
            </span>
            <button
              type="button"
              onClick={onExit}
              className="rounded-full border-2 border-[#d7dbe3] bg-white px-4 py-2 text-sm font-black"
            >
              Save & My Lessons
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-[#dbe0ef] bg-white px-4 py-3">
        <nav
          aria-label="Lesson steps"
          className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1"
        >
          {lessonStepOrder.map((item, index) => (
            <button
              key={item}
              type="button"
              disabled={index > stepIndex || item === "complete"}
              onClick={() => setStep(item)}
              aria-current={item === step ? "step" : undefined}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${
                item === step
                  ? "bg-[#4f6df5] text-white"
                  : index < stepIndex
                    ? "bg-[#eaf8f2] text-[#17624c]"
                    : "bg-[#f1f2f5] text-[#8a8d96]"
              }`}
            >
              {index + 1}. {stepLabels[item]}
            </button>
          ))}
        </nav>
      </div>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f6df5]">
              {lesson.band} · Grade 5
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              {regionalizeText(lesson.title, region)}
            </h1>
          </div>
          <div className="min-w-52">
            <div className="flex justify-between text-xs font-black text-[#666b78]">
              <span>{stepLabels[step]}</span>
              <span>{Math.max(1, stepIndex + 1)} / 7</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e4e7ef]">
              <div
                className="h-full rounded-full bg-[#4f6df5] transition-all"
                style={{ width: `${((Math.max(0, stepIndex) + 1) / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {step === "reading" ? (
          <ReadingStep lesson={lesson} region={region} textScale={textScale} />
        ) : null}
        {step === "vocabulary-bank" ? (
          <VocabularyBankStep
            lesson={lesson}
            progress={progress}
            updateLesson={updateLesson}
            region={region}
          />
        ) : null}
        {step === "comprehension" ? (
          <ComprehensionStep
            lesson={lesson}
            progress={progress}
            updateLesson={updateLesson}
            region={region}
          />
        ) : null}
        {step === "vocabulary-practice" ? (
          <VocabularyPracticeStep
            lesson={lesson}
            progress={progress}
            updateLesson={updateLesson}
            region={region}
          />
        ) : null}
        {step === "paragraph-writing" ? (
          <ParagraphWritingStep
            lesson={lesson}
            progress={progress}
            updateLesson={updateLesson}
            region={region}
          />
        ) : null}
        {step === "text-features" ? (
          <TextFeaturesStep
            lesson={lesson}
            progress={progress}
            updateLesson={updateLesson}
            region={region}
            onComplete={completeLesson}
          />
        ) : null}
        {step === "complete" ? (
          <CompleteStep
            lesson={lesson}
            lessons={lessons}
            progress={progress}
            region={region}
            onExit={onExit}
            onOpenLesson={onOpenLesson}
          />
        ) : null}

        {step !== "complete" ? (
          <div className="mt-9 flex flex-wrap justify-between gap-3 border-t-2 border-[#e0e3eb] pt-6">
            <button
              type="button"
              disabled={stepIndex <= 0}
              onClick={() => setStep(lessonStepOrder[stepIndex - 1])}
              className="rounded-xl border-2 border-[#d7dbe3] bg-white px-5 py-3 font-black disabled:opacity-40"
            >
              ← Previous
            </button>
            {step !== "text-features" ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep(lessonStepOrder[stepIndex + 1])}
                className="rounded-xl bg-[#4f6df5] px-5 py-3 font-black text-white shadow-[0_4px_0_#2f48b9] disabled:cursor-not-allowed disabled:bg-[#bbc2df] disabled:shadow-none"
              >
                Save &amp; Continue →
              </button>
            ) : (
              <p className="self-center text-sm font-bold text-[#626775]">
                Finish the four text-feature boxes above to complete the lesson.
              </p>
            )}
            {step !== "reading" && step !== "text-features" && !canContinue ? (
              <p className="w-full text-right text-sm font-bold text-[#7a6070]">
                {step === "paragraph-writing" &&
                !hasValidParagraphDetails(lesson, progress.paragraphDraft)
                  ? "Choose at least three relevant supporting details and remove every irrelevant detail before continuing."
                  : "Complete every response in this step before continuing."}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
