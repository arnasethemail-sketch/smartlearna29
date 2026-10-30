export type ExperienceId = "hotel" | "observatory";

export type StoryChoice = {
  kind: "choice";
  prompt: string;
  options: Array<{
    id: string;
    text: string;
    response: string;
    clue: string;
  }>;
};

export type StoryQuestion = {
  kind: "question";
  skill: "Vocabulary" | "Reading clues" | "Grammar";
  prompt: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  success: string;
  explanation: string;
  clue: string;
};

export type StoryScene = {
  id: string;
  title: string;
  location: string;
  paragraphs: string[];
  interaction: StoryChoice | StoryQuestion;
};

export type StoryExperience = {
  id: ExperienceId;
  label: "A" | "B";
  title: string;
  subtitle: string;
  tone: string;
  hook: string;
  estimatedMinutes: number;
  scenes: StoryScene[];
  writing: { prompt: string; placeholder: string; minWords: number };
  ending: { title: string; paragraphs: string[]; teaser: string };
};

export type LabSession = {
  version: 1;
  experienceId: ExperienceId;
  attemptId: string;
  stageIndex: number;
  choices: Record<string, string>;
  writing: string;
  ratings: {
    fun: number | null;
    curiosity: number | null;
    challenge: "too-easy" | "just-right" | "too-hard" | null;
  };
};

export type StoryPreference = ExperienceId | "both" | "neither";
