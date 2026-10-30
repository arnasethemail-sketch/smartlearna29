// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { GUEST_PROGRESS_STORAGE_KEY, LearningProgressProvider } from "../src/features/progress";
import type { LearningProgressSnapshot } from "../src/features/progress";
import { StoryLab } from "../src/features/story-lab/StoryLab";
import { hotelExperience } from "../src/features/story-lab/hotelExperience";
import { observatoryExperience } from "../src/features/story-lab/observatoryExperience";
import { readLabSession, STORY_LAB_PREFERENCE_ID } from "../src/features/story-lab/labProgress";
import type { StoryExperience } from "../src/features/story-lab/types";

const note = "We found the missing light behind moths and used nectar to guide them gently outside.";

function renderLab() {
  return render(
    <LearningProgressProvider>
      <StoryLab onBackToEnglish={vi.fn()} />
    </LearningProgressProvider>,
  );
}

function savedSnapshot(): LearningProgressSnapshot {
  return JSON.parse(window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY) ?? "{}");
}

function answerScene(experience: StoryExperience, sceneIndex: number) {
  const scene = experience.scenes[sceneIndex];
  expect(screen.getByRole("heading", { name: scene.title })).toBeTruthy();
  const next = screen.getByRole("button", { name: "Continue story" }) as HTMLButtonElement;
  expect(next.disabled).toBe(true);
  const interaction = scene.interaction;
  const option = interaction.kind === "question"
    ? interaction.options.find((candidate) => candidate.id !== interaction.correctOptionId)!
    : interaction.options[1];
  fireEvent.click(screen.getByRole("button", { name: option.text }));
  expect(next.disabled).toBe(false);
  if (interaction.kind === "question") {
    expect(screen.getByText(interaction.explanation)).toBeTruthy();
  } else {
    const chosen = interaction.options.find((candidate) => candidate.id === option.id)!;
    expect(screen.getByText(chosen.response)).toBeTruthy();
  }
  return option;
}

describe("Story Lab experience testing", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });
  afterEach(cleanup);

  it("resumes the chosen route and question feedback after reopening", async () => {
    const view = renderLab();
    fireEvent.click(screen.getByRole("button", { name: "Start experience A" }));
    answerScene(hotelExperience, 0);
    fireEvent.click(screen.getByRole("button", { name: "Continue story" }));
    const wrongAnswer = answerScene(hotelExperience, 1);
    await waitFor(() => {
      const attempt = Object.values(savedSnapshot().activeAttempts)[0];
      expect(readLabSession(attempt, hotelExperience)).toMatchObject({
        stageIndex: 1,
        choices: { [hotelExperience.scenes[1].id]: wrongAnswer.id },
      });
    });

    view.unmount();
    renderLab();
    fireEvent.click(screen.getByRole("button", { name: "Continue experience A" }));
    expect(screen.getByRole("heading", { name: hotelExperience.scenes[1].title })).toBeTruthy();
    expect((screen.getByRole("button", { name: wrongAnswer.text }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Continue story" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Continue story" }));
    expect(screen.getByRole("heading", { name: hotelExperience.scenes[2].title })).toBeTruthy();
  });

  it("finishes either story despite wrong answers, saves writing and feedback, and unlocks a fair comparison", async () => {
    const view = renderLab();
    expect(screen.getByRole("button", { name: "Choose experience A" }).matches(":disabled")).toBe(true);

    for (const experience of [hotelExperience, observatoryExperience]) {
      fireEvent.click(screen.getByRole("button", { name: `Start experience ${experience.label}` }));
      for (let index = 0; index < experience.scenes.length; index += 1) {
        answerScene(experience, index);
        fireEvent.click(screen.getByRole("button", { name: "Continue story" }));
      }

      const writing = screen.getByLabelText("Your message");
      const reveal = screen.getByRole("button", { name: "Reveal the ending" }) as HTMLButtonElement;
      fireEvent.change(writing, { target: { value: note.split(" ").slice(0, 14).join(" ") } });
      expect(reveal.disabled).toBe(true);
      fireEvent.change(writing, { target: { value: note } });
      expect(reveal.disabled).toBe(false);
      fireEvent.click(reveal);
      expect(screen.getByRole("heading", { name: experience.ending.title })).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Fun: 4 out of 5" }));
      fireEvent.click(screen.getByRole("button", { name: "Curiosity: 5 out of 5" }));
      fireEvent.click(screen.getByRole("button", { name: "Just right" }));

      await waitFor(() => {
        const attempt = savedSnapshot().completedAttempts.find((candidate) => candidate.metadata?.experienceId === experience.id);
        expect(attempt).toMatchObject({ status: "completed", score: 0, answered: 5, total: 5 });
        expect(readLabSession(attempt!, experience)).toMatchObject({
          writing: note,
          ratings: { fun: 4, curiosity: 5, challenge: "just-right" },
        });
      });
      fireEvent.click(screen.getByRole("button", { name: "Back to both stories" }));
      expect(screen.getByRole("button", { name: "Choose experience A" }).matches(":disabled")).toBe(experience.label === "A");
    }

    fireEvent.click(screen.getByRole("button", { name: "Choose experience B" }));
    fireEvent.change(screen.getByLabelText(/What made you choose\?/), { target: { value: "I loved exploring above the clouds with Nia." } });
    fireEvent.click(screen.getByRole("button", { name: "Save my choice" }));
    await waitFor(() => {
      const preference = savedSnapshot().completedAttempts.find((attempt) => attempt.attemptId === STORY_LAB_PREFERENCE_ID);
      expect(preference?.metadata).toMatchObject({
        preference: "observatory",
        reason: "I loved exploring above the clouds with Nia.",
      });
    });
    view.unmount();
    renderLab();
    expect(screen.getByRole("button", { name: "Choose experience B" }).getAttribute("aria-pressed")).toBe("true");
    expect((screen.getByLabelText(/What made you choose\?/) as HTMLTextAreaElement).value).toBe("I loved exploring above the clouds with Nia.");
    fireEvent.click(screen.getByRole("button", { name: "Review experience B" }));
    expect(screen.getByRole("heading", { name: observatoryExperience.ending.title })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fun: 4 out of 5" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Curiosity: 5 out of 5" }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Back to both stories" }));
    fireEvent.click(screen.getByRole("button", { name: "Play experience A again" }));
    expect(screen.getByRole("heading", { name: hotelExperience.scenes[0].title })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back to both stories" }));
    expect(screen.getByRole("button", { name: "Choose experience A" }).matches(":disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "Choose experience B" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Continue experience A" })).toBeTruthy();
  });

  it("opens a shared Story Lab link and returns through English to the sample banner", async () => {
    window.history.replaceState(null, "", "/#story-lab");
    render(<App />);

    expect(await screen.findByRole("heading", { name: /Which story will/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back to English" }));
    expect(screen.getByRole("heading", { name: "Grade 4 English Practice" })).toBeTruthy();
    expect(window.location.hash).toBe("#topics");
    fireEvent.click(screen.getByRole("link", { name: /A strange hotel or a secret in the stars\?/ }));
    expect(await screen.findByRole("heading", { name: /Which story will/ })).toBeTruthy();
    expect(await screen.findByRole("button", { name: "Start experience A" })).toBeTruthy();
    expect(await screen.findByRole("button", { name: "Start experience B" })).toBeTruthy();
  });
});
