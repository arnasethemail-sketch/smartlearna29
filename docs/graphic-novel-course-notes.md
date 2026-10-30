# Hotel Transylvania graphic-novel English collection

The collection uses the supplied `Hotel_Transylvania_Codex_Full_Pack` as its authored course. The reading is a Grade 5 adaptation, with narration and speech that are not verbatim film dialogue. All 24 chapters retain their authored order. The final chapter's retrospective panels are labelled LOOKING BACK; they do not add a sequel or new future events.

## Content and learner flow

Each chapter contains two reading pages with eight individually illustrated panels, five written comprehension questions, three vocabulary-writing cards with five spelling attempts each, a five-part paragraph revision, four Text Features Hunt boxes with three responses each, and separate definition and synonym banks.

The six four-chapter units follow the supplied cadence: three chapters introduce three words each, followed by a nine-word unit review. Only words already introduced in the current unit appear in its bank. Matching uses stable word and choice IDs, with separately shuffled orders saved in each learner's attempt.

Learners may revisit all their own chapter work. The next chronological chapter opens after a complete attempt or explicit parent review. Completion does not claim mastery. A prior completed submission continues to count when the learner begins a revision.

## Feedback and revisions

Spelling and vocabulary matches receive deterministic feedback. The spelling checker accepts the implemented standard US/Canadian variants and ignores ordinary surrounding punctuation and case; it does not excuse arbitrary typos.

There is no new semantic AI marking service. Open writing uses clearly labelled self/parent review of meaning, support or reasoning, clarity, and conventions. Different justified opinions remain acceptable. Teacher guidance appears only after Help or an explicit review action. The review view brings responses and possible answers together; examples are not mandatory sentences to copy.

The paragraph editor preserves the original draft, supports crossing out a supporting detail, revisions of all five parts, and learner-selected adjective/adverb words or phrases. Highlights show the learner's choices; they do not certify part of speech automatically. The teacher-configured banned-word list begins empty. R/A/P/C helper wording is editable and labelled provisional; PN/HL/QP are optional and unscored.

Current answers save immediately. Earlier drafts, spelling revisions, bank attempts, and submitted chapter versions remain available for review. A full submission is preserved before subsequent edits.

## Storage and existing work

The new feature uses existing account identity and progress storage through `graphic-novel-chapter-v1` metadata-backed attempts. It adds no database migration and does not replace the existing progress schema or lesson data. Guest work stays on the device; signed-in progress uses the existing Supabase synchronization. The main Save progress control reports the actual state.

Account hydration blocks editing until initial load/save finishes. Feature edits use functional updates and monotonic timestamps to prevent fast consecutive changes or an earlier save result from replacing later text. Different accounts have isolated feature caches.

## Artwork and privacy

The supplied earlier preview pages are quality references, not finished canonical pages. Production panels are generated separately with the built-in image-generation capability, using the shared character bible and the user's attached quality benchmark. Individual narration, speech, names, time cues, and reading controls are native accessible HTML. Phone layouts stack panels; larger text and one-panel reading are available.

Original generated PNGs and production checkpoints remain outside public learner assets. Reviewed WebP images preserve the native generated resolution up to 1536 pixels wide at quality 90. The real asset inventory and alternative text are in `src/features/graphic-novel/artwork-manifest.json`; the exact production prompt set is in `docs/graphic-novel-art-prompts.json`. The manifest preparation script requires 192 distinct, reviewed, existing WebP files for a complete production inventory. The upstream package's initial artwork count describes the package as supplied, rather than the generated inventory.

Raw transcript sections, source preambles, private worksheet photographs and source-location metadata are omitted from the learner course import. The supplied package remains a local reference. No private reference image is copied to the public website.

## Validation

The supplied content audit passed 1,154 checks covering all 24 chapters, 192 panel scripts, 120 comprehension questions and 54 new words. It counts 8,157 adapted reading words, with 309–374 per chapter. On Windows the supplied audit must run with UTF-8 mode (`py -3 -X utf8`); its default locale-dependent text read otherwise reports a false transcript comparison failure. The supplied audit file was not modified.

Repository tests exercise the complete data structure, word-bank availability, ID-based matching, spelling, blank writing fields, controlled guidance, paragraph revisions, feature boxes, full-field persistence, long answers, fast updates, account loading/identity boundaries, damaged-history recovery, saved submissions, chronological continuation, old progress preservation, and app navigation. The full suite passed 177 tests across 34 files. Artwork tests verify all 192 distinct 1536×1024 WebP files, descriptive alternative text, matching reviewed prompt records and absence of private image metadata. Chapter 14's table and destination number labels are native HTML so the feature taught in its worksheet is visible and accessible. Browser checks cover phone, tablet and desktop layouts, actual image loading, native text, keyboard controls, and restoration after reload. Automated integrity checks do not establish a certified reading level or replace a person's review of written answers.

The existing GitHub Pages workflow remains the publication mechanism. The collection route is `#graphic-novel` in the existing application.
