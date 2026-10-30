export type CheckTarget = {
  kind: "comprehension" | "vocabulary" | "paragraph" | "feature" | "bank-reflection";
  id: string;
};

export type CheckRating = "ready" | "developing" | "revise" | "uncertain";
export type CheckDimension = { rating: CheckRating; feedback: string };
export type AutomaticCheck = {
  schemaVersion: 1;
  targetKey: string;
  inputFingerprint: string;
  checkedAt: string;
  method: "local-semantic-v1" | "local-rules-v1";
  overall: CheckRating;
  summary: string;
  dimensions: {
    meaning: CheckDimension;
    support: CheckDimension;
    clarity: CheckDimension;
    conventions: CheckDimension;
  };
  strengths: string[];
  nextSteps: string[];
  evidencePanelIds: string[];
};

export function checkTargetKey(target: CheckTarget) {
  return `${target.kind}:${target.id}`;
}
