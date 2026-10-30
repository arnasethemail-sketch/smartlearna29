let fallbackSequence = 0;

export function createPracticeAttemptId(topic: string) {
  const normalizedTopic = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const uuid = globalThis.crypto?.randomUUID?.();

  if (uuid) return `${normalizedTopic}:${uuid}`;

  fallbackSequence += 1;
  return `${normalizedTopic}:${Date.now()}:${fallbackSequence}`;
}
