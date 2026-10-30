import { validateSemanticInput } from "./localSemanticCore";

export const LOCAL_CHECKER_MODEL_ID = "MoritzLaurer/xtremedistil-l6-h256-zeroshot-v1.1-all-33";
export const LOCAL_CHECKER_MODEL_REVISION = "c07f66d9cbf781191bee66edfe8ad7856f045781";
export const LOCAL_CHECKER_TIMEOUT_MS = 180_000;

type Pending = { resolve: (scores: number[]) => void; reject: (error: Error) => void; onProgress?: (message: string) => void; timer: ReturnType<typeof setTimeout>; expected: number };
type WorkerReply = { id: number; type: "progress"; message: string } | { id: number; type: "result"; scores: number[] } | { id: number; type: "error"; message: string };
let checkerWorker: Worker | null = null;
let nextRequest = 0;
const pending = new Map<number, Pending>();

function stopWorker(message: string) {
  checkerWorker?.terminate();
  checkerWorker = null;
  for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error(message)); }
  pending.clear();
}

function getWorker() {
  if (checkerWorker) return checkerWorker;
  if (typeof Worker === "undefined") throw new Error("Automatic checking needs a browser with Web Workers and WebAssembly support.");
  checkerWorker = new Worker(new URL("./localSemanticWorker.ts", import.meta.url), { type: "module" });
  checkerWorker.onmessage = (event: MessageEvent<WorkerReply>) => {
    const reply = event.data;
    const request = pending.get(reply.id);
    if (!request) return;
    if (reply.type === "progress") { request.onProgress?.(reply.message); return; }
    clearTimeout(request.timer); pending.delete(reply.id);
    if (reply.type === "error") { request.reject(new Error(reply.message)); return; }
    if (!Array.isArray(reply.scores) || reply.scores.length !== request.expected || reply.scores.some((score) => !Number.isFinite(score) || score < 0 || score > 1)) {
      request.reject(new Error("The local checker returned an invalid result. Please try again.")); return;
    }
    request.resolve(reply.scores);
  };
  checkerWorker.onerror = () => stopWorker("The local checker could not start on this device. Your answer is saved; please try again.");
  checkerWorker.onmessageerror = () => stopWorker("The local checker could not read its result. Your answer is saved; please try again.");
  return checkerWorker;
}

/** Runs entirely on this device; returns independent entailment scores in input order. */
export async function assessIdeas(premise: string, hypotheses: string[], onProgress?: (message: string) => void): Promise<number[]> {
  validateSemanticInput(premise, hypotheses);
  if (!hypotheses.length) return [];
  if (!premise.trim()) return hypotheses.map(() => 0);
  if (pending.size >= 16) throw new Error("The app is checking several answers. Please let those finish, then try again.");
  const worker = getWorker();
  const id = ++nextRequest;
  return new Promise<number[]>((resolve, reject) => {
    const timer = setTimeout(() => stopWorker("The local checker took too long. Your answer is saved; please try again when the download has finished."), LOCAL_CHECKER_TIMEOUT_MS);
    pending.set(id, { resolve, reject, onProgress, timer, expected: hypotheses.length });
    try { worker.postMessage({ id, premise, hypotheses }); }
    catch { clearTimeout(timer); pending.delete(id); reject(new Error("The local checker could not read this answer. Please try again.")); }
  });
}
