import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LEARNING_PROGRESS_APPLIED_EVENT,
  LEGACY_PROGRESS_CHANGED_EVENT,
} from "../progress/events";
import type {
  EnglishRegion,
  LessonProgress,
  LessonStep,
  StoryAdventureState,
} from "./types";

export const STORY_PROGRESS_STORAGE_KEY =
  "smartlearna29.story-adventures.progress.v1";

export const STORY_STEPS: LessonStep[] = [
  "home",
  "reading",
  "vocabulary-bank",
  "comprehension",
  "vocabulary-practice",
  "paragraph-writing",
  "text-features",
  "complete",
];

export function createLessonProgress(lessonId: string): LessonProgress {
  return {
    lessonId,
    status: "not-started",
    currentStep: "home",
    readingComplete: false,
    vocabularyMatches: {},
    comprehensionAnswers: {},
    comprehensionClassifications: {},
    vocabularyPractice: {},
    paragraphDraft: {
      topicSentence: "",
      selectedDetailIds: [],
      missingDetail: "",
      conclusion: "",
      revisedParagraph: "",
    },
    textFeatureAnswers: {},
    assessment: {
      vocabularyCorrect: 0,
      spellingCorrect: 0,
      comprehensionAttempted: 0,
      paragraphChecks: 0,
    },
    lastUpdatedAt: new Date(0).toISOString(),
  };
}

export function createInitialStoryState(): StoryAdventureState {
  return {
    schemaVersion: 1,
    region: "US",
    textScale: "standard",
    progressByLesson: {},
  };
}

function isStoryState(value: unknown): value is StoryAdventureState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<StoryAdventureState>;
  return (
    state.schemaVersion === 1 &&
    (state.region === "US" || state.region === "CA") &&
    (state.textScale === "standard" || state.textScale === "large") &&
    Boolean(state.progressByLesson) &&
    typeof state.progressByLesson === "object"
  );
}

export function loadStoryState(): StoryAdventureState {
  if (typeof window === "undefined") return createInitialStoryState();

  try {
    const saved = window.localStorage.getItem(STORY_PROGRESS_STORAGE_KEY);
    if (!saved) return createInitialStoryState();
    const parsed: unknown = JSON.parse(saved);
    return isStoryState(parsed) ? parsed : createInitialStoryState();
  } catch {
    return createInitialStoryState();
  }
}

export function saveStoryState(state: StoryAdventureState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORY_PROGRESS_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(LEGACY_PROGRESS_CHANGED_EVENT));
}

export function useStoryProgress() {
  const [state, setState] = useState<StoryAdventureState>(loadStoryState);

  useEffect(() => {
    saveStoryState(state);
  }, [state]);

  useEffect(() => {
    const refreshFromAccount = () => setState(loadStoryState());
    window.addEventListener(
      LEARNING_PROGRESS_APPLIED_EVENT,
      refreshFromAccount,
    );
    return () =>
      window.removeEventListener(
        LEARNING_PROGRESS_APPLIED_EVENT,
        refreshFromAccount,
      );
  }, []);

  const updateLesson = useCallback(
    (
      lessonId: string,
      update:
        | Partial<LessonProgress>
        | ((current: LessonProgress) => Partial<LessonProgress>),
    ) => {
      setState((currentState) => {
        const current =
          currentState.progressByLesson[lessonId] ??
          createLessonProgress(lessonId);
        const patch =
          typeof update === "function" ? update(current) : update;

        return {
          ...currentState,
          progressByLesson: {
            ...currentState.progressByLesson,
            [lessonId]: {
              ...current,
              ...patch,
              lastUpdatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [],
  );

  const startLesson = useCallback(
    (lessonId: string) => {
      updateLesson(lessonId, (current) => ({
        status: current.status === "completed" ? "completed" : "in-progress",
        currentStep:
          current.currentStep === "home" ? "reading" : current.currentStep,
      }));
    },
    [updateLesson],
  );

  const setRegion = useCallback((region: EnglishRegion) => {
    setState((current) => ({ ...current, region }));
  }, []);

  const setTextScale = useCallback(
    (textScale: StoryAdventureState["textScale"]) => {
      setState((current) => ({ ...current, textScale }));
    },
    [],
  );

  const completedLessonIds = useMemo(
    () =>
      new Set(
        Object.values(state.progressByLesson)
          .filter((progress) => progress.status === "completed")
          .map((progress) => progress.lessonId),
      ),
    [state.progressByLesson],
  );

  return {
    state,
    setState,
    updateLesson,
    startLesson,
    setRegion,
    setTextScale,
    completedLessonIds,
  };
}
