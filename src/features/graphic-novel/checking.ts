import type { GraphicChapter } from "./data";
import { wordsById } from "./data";
import type { ChapterWork } from "./types";
import type { AutomaticCheck, CheckDimension, CheckRating, CheckTarget } from "./checking-types";
import { checkTargetKey } from "./checking-types";
import { allCheckTargets, checkInput, checkTargetIsFilled, currentCheckFingerprint } from "./checking-input";
import rubrics from "./checking-rubrics.json";

export { allCheckTargets, checkTargetIsFilled, currentCheckFingerprint, checkTargetKey };
export type { AutomaticCheck, CheckRating, CheckTarget };

const slots = ["topicSentence", "detail1", "detail2", "detail3", "conclusion"] as const;
const dimension = (rating: CheckRating, feedback: string): CheckDimension => ({ rating, feedback });
const normalize = (text: string) => text.toLocaleLowerCase().replace(/[’]/g, "'").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
const contains = (text: string, term: string) => ` ${normalize(text)} `.includes(` ${normalize(term)} `);

// Catch a retained authored grammar construction after small descriptive edits,
// without penalising a new subject or valid forms such as "he can choose".
function retainsGrammarConstruction(original: string, revised: string, incorrect: string) {
  const isAdverb = (word: string) => /ly$/.test(word) || ["very", "really", "often", "always", "sometimes", "never", "just", "still", "also"].includes(word);
  const source = normalize(original).split(" ");
  const wrong = normalize(incorrect);
  const index = source.indexOf(wrong);
  if (index < 1) return false;
  const prefix = source.slice(0, index);
  while (prefix.length && isAdverb(prefix.at(-1)!)) prefix.pop();
  const subjectAnchor = prefix.at(-1);
  if (!subjectAnchor) return false;
  const words = normalize(revised).split(" ");
  return words.some((word, position) => word === wrong && words.slice(Math.max(0, position - 4), position).some((candidate, before, previous) => candidate === subjectAnchor && previous.slice(before + 1).every(isAdverb)));
}

function plainStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(plainStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(plainStrings);
  return [];
}

// A child can explain a feature's job without using the teacher's abstract wording.
// These narrow patterns confirm native date facts; extra or contradictory claims
// do not pass merely because they contain a year or a familiar feature name.
function learningClaim(text: string) {
  return text.trim().replace(/^(?:(?:it|this)(?: feature| text feature)? helps? me (?:understand|know|see|learn)|i (?:learn|learned|understand|know|see))(?: that)?\s+/i, "");
}

function nativeDateExplanation(chapter: GraphicChapter, purpose: string, help: string) {
  const job = normalize(purpose).replace(/^its job is to /, "");
  const saysWhen = /^(?:(?:it|this|the (?:time|date) label) )?(?:tells?|shows?)(?: me| us| the reader| readers)? (?:when (?:the )?(?:story|scene|events?) (?:happened|happens|takes place|took place)|(?:the )?(?:time|date|year)(?: of (?:the )?(?:story|scene|events?))?)$/.test(job);
  if (!saysWhen) return null;
  const claim = normalize(learningClaim(help));
  const fact = claim.match(/^(?:the )?(?:(baby) )?(?:scene|story) (?:happened|happens|takes place|took place|is set|was set|is|was) in (\d{4})(?: (before|after) mavis (?:grew|grows) up)?$/);
  if (!fact) return null;
  const panel = chapter.panels.find((item) => item.narration.match(/^In (\d{4})\b/)?.[1] === fact[2]);
  if (!panel) return null;
  if (fact[1] && !/\bbaby\b/i.test(panel.narration)) return null;
  if (fact[3] && (fact[3] !== "before" || !/\bbaby\b/i.test(panel.narration) || !chapter.panels.some((item) => item.number > panel.number && /\bAs Mavis grew\b/.test(item.narration)))) return null;
  return panel.id;
}

function speechEvidencePanels(chapter: GraphicChapter, claim: string) {
  const ignored = new Set(["a", "an", "the", "i", "me", "my", "you", "your", "he", "she", "it", "his", "her", "they", "we", "our", "to", "of", "is", "are", "was", "were", "be", "am", "do", "does", "did", "that", "this", "and", "or", "but", "in", "on", "at", "for", "with", "not", "no", "what", "who", "when", "where", "how"]);
  const words = new Set(normalize(claim).split(" ").filter((word) => !ignored.has(word)));
  return chapter.panels.filter((panel) => panel.dialogue.some((line) => contains(claim, line.speaker) && normalize(line.text).split(" ").some((word) => !ignored.has(word) && words.has(word))));
}

function featureDescription(chapter: GraphicChapter, text: string) {
  const description = normalize(text).replace(/^i (?:spotted|found|noticed) /, "").replace(/^(?:a|an|the) /, "");
  const reference = description.match(/\bin panel (\d+)\b/);
  const panel = reference ? chapter.panels.find((item) => item.number === Number(reference[1])) : undefined;
  return { name: description.replace(/ in panel \d+$/, ""), panel, invalidReference: /\bin panel\b/.test(description) && !panel };
}

function nativeNarrationExplanation(chapter: GraphicChapter, purpose: string, help: string, panelId?: string) {
  const job = normalize(purpose).replace(/^its job is to /, "");
  if (!/^(?:(?:it|this|the narration box) )?(?:tells?|shows?|explains?)(?: me| us| the reader| readers)? (?:what (?:is|was) happening|what happens|the events|the scene|what is going on)$/.test(job)) return null;
  const fact = normalize(learningClaim(help)).match(/^dracula (?:is|was) playing (?:a game of )?peekaboo with (?:baby )?mavis(?: in (\d{4}))?$/);
  if (!fact) return null;
  // Confirm the complete simple claim against the written scene, including its
  // named people, action and optional year; keywords alone never establish it.
  const panel = chapter.panels.find((item) => (!panelId || item.id === panelId) && /\bDracula\b.*\bbaby\b.*\bMavis\b.*\bgame of peekaboo\b/.test(item.narration) && (!fact[1] || item.narration.match(/^In (\d{4})\b/)?.[1] === fact[1]));
  return panel?.id ?? null;
}

/** Every operation is on-device. There is deliberately no API endpoint or key. */
export async function checkWrittenResponse(chapter: GraphicChapter, work: ChapterWork, target: CheckTarget, onProgress?: (message: string) => void): Promise<AutomaticCheck> {
  const input = checkInput(chapter, work, target);
  const report: AutomaticCheck = {
    schemaVersion: 1, targetKey: checkTargetKey(target), inputFingerprint: currentCheckFingerprint(chapter, work, target), checkedAt: new Date().toISOString(),
    method: "local-rules-v1", overall: "uncertain", summary: "Here is what the app could check in this draft.",
    dimensions: {
      meaning: dimension("uncertain", "The app has not confirmed the meaning of this answer yet."),
      support: dimension("uncertain", "Add a specific detail or reason that supports your answer."),
      clarity: dimension("uncertain", "Write a complete response before checking."),
      conventions: dimension("uncertain", "Spelling and sentence checks have not run yet."),
    }, strengths: [], nextSteps: [], evidencePanelIds: [],
  };
  if (!checkTargetIsFilled(chapter, work, target)) {
    report.overall = "revise"; report.summary = "A few writing fields still need an answer.";
    report.nextSteps.push("Complete the writing fields for this activity, then check again.");
    return report;
  }
  onProgress?.("Preparing the free writing checks…");
  const language = await import("./language-checks");
  const text = target.kind === "comprehension" ? work.comprehension[target.id].answer
    : target.kind === "paragraph" ? slots.map((slot) => work.paragraph.sentences[slot]).join(" ")
    : target.kind === "bank-reflection" ? work.bank.reflection
    : target.kind === "feature" ? [work.features[target.id].purpose, work.features[target.id].help].join(" ")
    : plainStrings(input).join(" ");
  // This is an explicit assessment limit, never a truncation of saved answers.
  const longDraft = text.length > 9000;
  const writing = language.analyzeWriting(text, { sentences: target.kind !== "vocabulary" });
  report.dimensions.clarity = writing.clarity;
  report.dimensions.conventions = writing.conventions;
  report.nextSteps.push(...writing.issues);

  let modelFailed = false;
  async function compare(premise: string, ideas: string[]) {
    if (!ideas.length) return [];
    if (longDraft) return ideas.map(() => -1);
    try {
      const { assessIdeas } = await import("./localSemanticModel");
      const scores = await assessIdeas(premise, ideas, onProgress);
      if (scores.length !== ideas.length || scores.some((score) => !Number.isFinite(score) || score < 0 || score > 1)) throw new Error("Invalid local language result");
      report.method = "local-semantic-v1";
      return scores;
    } catch {
      modelFailed = true;
      return ideas.map(() => -1);
    }
  }
  async function match(premise: string, ideas: string[]) {
    const scores = await compare(premise, ideas);
    return { scores, strongest: Math.max(-1, ...scores), supported: scores.filter((score) => score >= .8).length };
  }
  const story = chapter.panels.map((panel) => [panel.narration, ...panel.dialogue.map((line) => `${line.speaker}: ${line.text}`)].join(" ")).join(" ");

  if (target.kind === "comprehension") {
    const question = chapter.comprehension.find((item) => item.id === target.id)!;
    const response = work.comprehension[target.id];
    const rubric = rubrics.find((item) => item.questionId === target.id)!;
    report.evidencePanelIds = [...question.evidencePanels];
    if (rubric.kind === "opinion") {
      report.dimensions.meaning = dimension("uncertain", "Your opinion may differ from the example. The app checks your explanation, but cannot prove a personal or imagined experience or settle a judgement for you.");
      report.dimensions.support = writing.hasReason
        ? dimension("ready", "You included a reason or example. Make sure it directly explains your view.")
        : dimension("developing", "Explain why you think this. Add a specific example rather than only stating your opinion.");
      if (question.evidencePanels.length) {
        const evidenceText = chapter.panels.filter((panel) => question.evidencePanels.includes(panel.id)).map((panel) => panel.narration).join(" ");
        const evidence = await match(evidenceText, [response.answer]);
        if (evidence.strongest >= .8) {
          report.dimensions.support = dimension("ready", "Your response connects to information in the chapter. Explain how that detail supports your judgement.");
          report.strengths.push("Your opinion is connected to a chapter detail.");
        } else if (!writing.hasReason) report.nextSteps.push(rubric.revisionPrompt);
      }
      if (writing.hasReason) report.strengths.push("You have started to explain your own reasoning.");
    } else {
      const meaning = await match(response.answer, rubric.expectedIdeas);
      if (meaning.strongest >= .8) {
        report.dimensions.meaning = dimension("ready", "The language check found a strong match with a relevant idea from this lesson. Different wording is welcome.");
        report.strengths.push("Your answer includes a relevant lesson idea in your own response.");
      } else {
        report.dimensions.meaning = dimension("uncertain", "The app could not confidently connect this wording to the expected idea. This does not prove your answer is wrong.");
        report.nextSteps.push(rubric.revisionPrompt);
      }
      const needsTwo = /\btwo\b|different panels/i.test(question.prompt);
      report.dimensions.support = needsTwo
        ? meaning.supported >= 2 ? dimension("ready", "The check found more than one relevant idea. Make their connection clear.") : dimension("developing", "This question asks for two different details. State each one clearly and connect them to your answer.")
        : meaning.supported ? dimension("ready", "Your answer includes a lesson detail that supports its main idea.") : dimension("uncertain", "Reread the supporting panels and make the important detail explicit.");
    }
    if (!response.type) report.nextSteps.push("Choose the question type that best fits your answer.");
    else if (response.type !== question.suggestedType) report.nextSteps.push(`The suggested question type is ${question.suggestedType}. Another type can overlap; think about where you found your answer.`);
  }

  if (target.kind === "vocabulary") {
    const word = chapter.vocabularyPractice.find((item) => item.wordId === target.id)!;
    const response = work.vocabulary[target.id];
    report.evidencePanelIds = [...word.contextPanelIds];
    const definitions = await match(`${word.word} means ${response.definition}`, [`${word.word} means ${word.teacherWord.definition}`, ...word.teacherWord.synonyms.map((synonym) => `${word.word} means ${synonym}`)]);
    const synonyms = await match(`${word.word} means ${response.synonyms}`, word.teacherWord.synonyms.map((synonym) => `${word.word} means ${synonym}`));
    const writtenSynonyms = response.synonyms.split(/[,;/\n]+/).map(normalize);
    const exactSynonym = word.teacherWord.synonyms.some((synonym) => writtenSynonyms.includes(normalize(synonym)));
    report.dimensions.meaning = definitions.strongest >= .8 && (exactSynonym || synonyms.strongest >= .8)
      ? dimension("ready", "Your definition and synonym show a strong connection to this word's meaning in the chapter.")
      : dimension("uncertain", "The app could not fully confirm the definition and synonym in this wording. Compare them with the meaning used in the supporting panel.");
    const usesWord = language.wordAppears(response.sentence, word.word);
    const sentenceWriting = language.analyzeWriting(response.sentence, { sentences: true });
    report.dimensions.clarity = sentenceWriting.clarity;
    report.dimensions.conventions = writing.conventions.rating === "ready" ? sentenceWriting.conventions : writing.conventions;
    report.nextSteps.push(...sentenceWriting.issues);
    if (!usesWord) {
      report.dimensions.support = dimension("revise", `Use “${word.word}” or a natural form of that word in your sentence.`);
      report.nextSteps.push(`Write a sentence using “${word.word}” that makes its meaning clear.`);
    } else {
      const sentence = await match(response.sentence, [`In this sentence, ${word.word} means ${word.teacherWord.definition}.`]);
      report.dimensions.support = sentence.strongest >= .8
        ? dimension("ready", "Your sentence uses the word and the language check found context for its intended meaning.")
        : dimension("uncertain", "You used the word. Add a concrete detail that shows what it means; including the word alone does not prove its meaning.");
      report.strengths.push(`Your sentence includes “${word.word}”.`);
    }
    if (report.dimensions.meaning.rating === "uncertain") report.nextSteps.push("Use Word help to compare the contextual definition, then explain it in your own words.");
  }

  if (target.kind === "paragraph") {
    const response = work.paragraph;
    const draft = chapter.hamburgerParagraph;
    const focus = await match(response.sentences.topicSentence, [draft.topicSentence]);
    report.dimensions.meaning = focus.strongest >= .8
      ? dimension("ready", "Your topic sentence has a strong connection to the paragraph's lesson focus.")
      : dimension("uncertain", "The app could not confirm how your topic sentence connects to this lesson's paragraph focus.");
    report.evidencePanelIds = chapter.panels.map((panel) => panel.id);
    const details = [response.sentences.detail1, response.sentences.detail2, response.sentences.detail3];
    const relevant = await compare(story, details);
    const crossout = response.crossedOut.includes(draft.irrelevantSlot);
    const unchangedIrrelevant = details.some((detail) => normalize(detail) === normalize(draft[draft.irrelevantSlot as "detail1" | "detail2" | "detail3"]));
    report.dimensions.support = unchangedIrrelevant || !crossout
      ? dimension("revise", "Cross out the unrelated original detail and replace it with information that supports the topic.")
      : relevant.every((score) => score >= .8) ? dimension("ready", "Your three supporting details connect strongly to information in the chapter.") : dimension("uncertain", "The app could not confidently confirm every supporting detail. Keep each detail relevant to your topic and the story.");
    if (unchangedIrrelevant || !crossout) report.nextSteps.push(draft.relevanceGuidance);
    const grammarEntries = Object.entries(draft.grammarCorrections);
    if (grammarEntries.some(([from]) => retainsGrammarConstruction(draft.detail1, response.sentences.detail1, from))) {
      report.dimensions.conventions = dimension("developing", `The original grammar issue still needs a revision: ${grammarEntries.map(([from, to]) => `“${from}” → “${to}”`).join("; ")}.`);
      report.nextSteps.push("Revise the grammar issue in the first supporting detail.");
    }
    const missingLanguage: string[] = [];
    for (const slot of slots) {
      for (const [part, selection] of [["adjective", response.adjectives[slot]], ["adverb", response.adverbs[slot]]] as const) {
        const result = language.selectionIsPartOfSpeech(response.sentences[slot], selection, part);
        if (!result.present || !result.likely) missingLanguage.push(`${slot === "topicSentence" ? "topic sentence" : slot === "conclusion" ? "conclusion" : slot.replace("detail", "detail ")}: ${part}`);
      }
    }
    if (missingLanguage.length) {
      report.dimensions.clarity = dimension("developing", "Some selected describing words need another look. The part-of-speech check can be uncertain when a word has several uses.");
      report.nextSteps.push(`Check the selected words for ${missingLanguage.join("; ")}.`);
    } else report.strengths.push("Your selected adjectives and adverbs appear in the sentences and match the language check's likely word classes.");
    if (!chapter.vocabularyPractice.some((word) => language.wordAppears(slots.map((slot) => response.sentences[slot]).join(" "), word.word))) {
      report.nextSteps.push("Use at least one of this chapter's practice words naturally in your paragraph.");
      if (report.dimensions.clarity.rating === "ready") report.dimensions.clarity = dimension("developing", "The paragraph still needs at least one chapter practice word used naturally. Choose a word that fits your idea.");
    }
    const banned = work.teacherBannedWords.filter((word) => word.trim() && contains(text, word));
    if (banned.length) {
      report.dimensions.conventions = dimension("revise", "Your paragraph includes a word on the saved words-to-avoid list.");
      report.nextSteps.push(`Replace these configured words: ${banned.join(", ")}.`);
    }
    const conclusion = await match(response.sentences.conclusion, [response.sentences.topicSentence]);
    if (conclusion.strongest < .8) {
      report.nextSteps.push("Make your concluding sentence return to the same main idea as your topic sentence.");
      if (report.dimensions.support.rating === "ready") report.dimensions.support = dimension("uncertain", "The detail checks passed, but the app could not confirm that your conclusion returns to the same main idea. Check that connection before calling the paragraph finished.");
    }
  }

  if (target.kind === "feature") {
    const response = work.features[target.id];
    const description = featureDescription(chapter, response.feature);
    const named = description.name;
    const examples = chapter.textFeaturesHunt.teacherExamples;
    const aliases: Array<[RegExp, string]> = [
      [/\btitle\b|\bheading\b/, "Chapter title"], [/narrat|\bcaption\b/, "Narration box"], [/\bspeech\b|\bdialogue\b|\bspeaker\b|\bbubbles?\b/, "Speech bubble"],
      [/\btime\b|\bdate\b|\b1895\b/, "Time label"], [/looking back|\bmemory\b|\brecap\b|\bflashback\b/, "Recap labels"],
      [/number.*(?:table|object)|(?:table|object).*number|\btable (?:57|fifty seven)\b|\bposition (?:23|twenty three)\b/, "Number labels on objects"],
      [/^(?:pictures?|illustrations?|images?)$/, "Illustration"],
    ];
    const canonicalName = aliases.find(([pattern]) => pattern.test(named))?.[1];
    const example = examples.find((item) => normalize(item.feature) === named || (canonicalName && normalize(item.feature) === normalize(canonicalName)) || (canonicalName === "Recap labels" && /flashback|framed story|recap/i.test(item.feature)));
    const negated = /\b(?:no|not|without|missing|absent|never|isn t|aren t|doesn t|don t)\b/.test(named);
    const hasDate = chapter.panels.some((panel) => /^In \d{4}/.test(panel.narration));
    const hasRecapLabel = chapter.panels.some((panel) => panel.narration.startsWith("LOOKING BACK:"));
    const referencedFeatureMissing = description.panel && ((canonicalName === "Time label" && !/^In \d{4}\b/.test(description.panel.narration)) || (canonicalName === "Speech bubble" && !description.panel.dialogue.length) || (canonicalName === "Number labels on objects" && description.panel.id !== "ch14-p02") || (canonicalName === "Recap labels" && !description.panel.narration.startsWith("LOOKING BACK:")));
    const knownUnavailable = description.invalidReference || referencedFeatureMissing || (canonicalName === "Time label" && !hasDate) || (canonicalName === "Number labels on objects" && chapter.id !== "ch14") || (/looking back|recap label|memory label/.test(named) && !hasRecapLabel) || /\bitalic/.test(named);
    // These features are guaranteed by the actual reader renderer. Richer visual
    // interpretations remain welcome, but a generic keyword cannot verify them.
    const nativeFeature = /^(?:(?:comic )?panels?|panel (?:borders?|order|numbers?|sequence)|chapter numbers?|borders?|frames?|gutters?|(?:panel )?layout|pictures?|illustrations?|images?|colou?rs?|colou?r contrast|bold (?:text|speaker names)|speaker names)$/.test(named);
    report.dimensions.meaning = !negated && !knownUnavailable && (example || nativeFeature)
      ? dimension("ready", "You identified a text or visual feature that is present in this chapter.")
      : dimension("uncertain", "The app could not confirm that feature here. Describe exactly where you see it; other valid visual features are welcome.");
    report.evidencePanelIds = example ? [...example.panelIds] : [];
    const datedPanelId = canonicalName === "Time label" && report.dimensions.meaning.rating === "ready" ? nativeDateExplanation(chapter, response.purpose, response.help) : null;
    const narratedPanelId = canonicalName === "Narration box" && report.dimensions.meaning.rating === "ready" ? nativeNarrationExplanation(chapter, response.purpose, response.help, description.panel?.id) : null;
    if (datedPanelId) {
      report.dimensions.support = dimension("ready", "You explained the date's job and connected it to the actual dated scene. The app checked the date and panel order directly.");
      report.evidencePanelIds = [datedPanelId];
    } else if (narratedPanelId) {
      report.dimensions.support = dimension("ready", "You explained the narration's job and named the people and action in the actual written scene. The app checked these details directly.");
      report.evidencePanelIds = [narratedPanelId];
    } else if (example) {
      const purpose = await match(response.purpose, [example.purpose]);
      const help = await match(response.help, [example.comprehensionHelp]);
      report.dimensions.support = purpose.strongest >= .8 && help.strongest >= .8
        ? dimension("ready", "Your explanations connect strongly to what this feature does and how it helps a reader.")
        : dimension("uncertain", "The app could not fully confirm these explanations. State what the feature shows, and give one specific way it helped you follow this chapter.");
    } else {
      report.dimensions.support = dimension("uncertain", "Explain the feature's job and a specific effect on your reading. The app cannot confirm every visual interpretation.");
    }
    if (report.dimensions.support.rating === "uncertain" && report.dimensions.meaning.rating === "ready") {
      if (canonicalName === "Speech bubble") {
        const claim = learningClaim(response.help);
        // A generic purpose plus a random story fact is not enough. The explanation
        // must name a speaker and connect to words spoken in a matching panel.
        const panels = speechEvidencePanels(chapter, claim).filter((panel) => !description.panel || panel.id === description.panel.id);
        const negation = /\b(?:not|no|never|cannot|can t|doesn t|don t|didn t|isn t|aren t|wasn t|weren t|won t|without)\b/;
        if (panels.length && !negation.test(normalize(response.purpose)) && !negation.test(normalize(claim))) {
          const purpose = await match(`Speech bubble. ${response.purpose}`, ["A speech bubble shows a character's own words.", "A speech bubble identifies who is speaking.", "A speech bubble shows what a character says."]);
          if (purpose.strongest >= .8) {
            for (const panel of panels) {
              const source = [panel.narration, ...panel.dialogue.map((line) => `${line.speaker}: ${line.text}`)].join(" ");
              const detail = await match(source, [claim]);
              if (detail.strongest >= .8) {
                report.dimensions.support = dimension("ready", "You explained the bubble's job and named a detail supported by this panel. Check that those spoken words are what helped you notice it.");
                report.evidencePanelIds = [panel.id];
                break;
              }
            }
          }
        }
      }
    }
    const identity = (name: string) => { const cleaned = featureDescription(chapter, name).name; return aliases.find(([pattern]) => pattern.test(cleaned))?.[1] ?? cleaned; };
    const otherFeatures = Object.entries(work.features).filter(([id]) => id !== target.id).map(([, feature]) => identity(feature.feature));
    if (named && otherFeatures.includes(identity(named))) {
      report.nextSteps.push("This feature name is repeated in another box. Try four different discoveries.");
      if (report.dimensions.meaning.rating === "ready") report.dimensions.meaning = dimension("developing", "This discovery repeats a feature named in another box. Find a different feature so that your four discoveries cover different things.");
    }
    if (report.dimensions.support.rating !== "ready") report.nextSteps.push("Name a specific panel, word, expression or layout detail, then explain how it helped you.");
  }

  if (target.kind === "bank-reflection") {
    const response = work.bank;
    const word = chapter.cumulativeVocabularyBank.wordIds.map((id) => wordsById[id]).filter(Boolean).find((item) => language.wordAppears(response.reflection, item.word));
    report.dimensions.meaning = dimension("uncertain", "The app can check your saved matches exactly. It can offer writing feedback on your explanation, but cannot confirm every personal account of revising it.");
    report.dimensions.support = writing.hasReason && word
      ? dimension("ready", "You named a practice word and included a reason. Connect that reason to the word's definition or synonym.")
      : dimension("developing", "Name one vocabulary word and explain why you chose or changed its match.");
    if (word) report.evidencePanelIds = word.contextPanelIds.filter((id) => chapter.panels.some((panel) => panel.id === id));
    if (!writing.hasReason || !word) report.nextSteps.push("For example, name the word you checked and explain which part of its meaning helped you decide.");
  }

  if (modelFailed) {
    report.nextSteps.push("The free meaning checker could not finish loading or running. Your writing checks are saved; try the check again for meaning feedback.");
    if (report.dimensions.meaning.rating === "ready" && report.method !== "local-semantic-v1") report.dimensions.meaning = dimension("uncertain", "The meaning check could not run on this device.");
  }
  if (longDraft) {
    report.dimensions.meaning = dimension("uncertain", "Your full draft is saved. This answer is too long for the app to assess its meaning reliably in one check; the writing checks still cover the full text.");
    report.dimensions.support = dimension("uncertain", "The app has not certified the meaning or support of this long draft.");
  }
  report.strengths = [...new Set(report.strengths)];
  report.nextSteps = [...new Set(report.nextSteps)].filter(Boolean);
  const ratings = Object.values(report.dimensions).map((item) => item.rating);
  report.overall = ratings.includes("revise") ? "revise" : ratings.includes("uncertain") ? "uncertain" : ratings.includes("developing") ? "developing" : "ready";
  report.summary = report.overall === "ready" ? "Your draft passed the checks the app could make. Keep the clear details and wording."
    : report.overall === "revise" ? "There is a specific part to revise. Use the next steps below, then check your new draft."
    : report.overall === "developing" ? "You have a useful start. A few writing details need another look."
    : "Some writing checks are complete. The app is not certain about every idea, so use the focused feedback below.";
  return report;
}
