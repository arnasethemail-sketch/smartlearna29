# Free answer checking

Every graphic-novel chapter has 14 written checking targets: five comprehension
answers, three vocabulary cards, one paragraph, four text-feature discoveries,
and a vocabulary-bank explanation. The app checks them individually or together
from App feedback. Submission saves the chapter and starts its writing checks.

## Cost and data flow

Checks run on the learner's device. There is no paid inference endpoint, no
OpenAI call, no model API key, and no additional subscription for this feature.
The existing GitHub Pages publication and progress account configuration remain
in place; no provider plan or billing setting was changed.

The model, tokenizer, CPU WebAssembly runtime, spelling dictionaries and word
analysis code are served by this same static website. The initial model/runtime
download is 37,753,398 bytes, roughly 38 MB, and is cached where browser storage
allows. Download progress is visible. A Web Worker keeps inference off the main
UI thread; it uses a single CPU thread and needs no WebGPU support. The checker
does not send an answer to an inference service. Signed-in answer/feedback
storage continues to use the existing Supabase progress synchronization.

## What is checked

The 120 comprehension questions have authored semantic anchors and revision
prompts. Factual wording is compared with relevant lesson ideas using local
natural-language inference. Strong matches can receive positive feedback;
ambiguous paraphrases receive uncertainty rather than an invented rejection.
Anchors are illustrative, not a requirement to repeat every proposition.

Opinion and personal/hypothetical questions impose no preferred stance. The app
can check the explanation's structure and offer support feedback, but explicitly
does not verify a personal experience or settle a value judgement. It does not
force the learner to disclose a real experience.

Vocabulary checks distinguish definitions, synonyms and contextual use from
spelling alone. Paragraph checks cover the lesson focus, supporting details,
irrelevant-detail replacement, the supplied grammar repair, the conclusion,
required practice words, and learner-selected adjectives/adverbs. Text-feature
checks use features actually available in the reader, accept different valid
visual discoveries cautiously, and detect repeated discoveries. Vocabulary-bank
matches and all five spelling attempts retain their exact deterministic checks.

US and British spelling dictionaries accept standard US/Canadian variants;
story names are recognised. Dictionary suggestions and part-of-speech tags are
limited checks, not proof of every spelling or grammatical judgement.

## Honest limits and continuity

Feedback separates meaning, support, clarity and conventions. A language-model
score is not a calibrated probability of student correctness. Creative,
implicit, unusually worded or very long responses may remain uncertain. The
full answer is always saved. A model loading/runtime failure keeps the writing
checks and clearly marks unavailable meaning checks; it never fabricates an AI
approval. No parent confirmation is required, and imperfect or uncertain
feedback does not prevent continuation after a complete attempt.

Feedback includes a versioned input fingerprint. Relevant edits make earlier
feedback stale. Cross-field criteria, such as four different text features,
include those dependent inputs. Late results cannot overwrite newer drafts,
another chapter or another account's mounted collection. A reviewed draft
returns to In progress after a relevant edit while its prior completion and
unlocked chapters remain intact. Older manual notes and historical submissions
are preserved as legacy data, not an active grading requirement.

## Provenance and verification

The model is the MIT-licensed
[MoritzLaurer xtremedistil zero-shot model](https://huggingface.co/MoritzLaurer/xtremedistil-l6-h256-zeroshot-v1.1-all-33),
at a pinned revision. CPU inference uses
[Transformers.js](https://huggingface.co/docs/transformers.js/v3.8.1/en/index)
and ONNX Runtime Web. Local dictionaries use nspell, with contextual language
analysis from compromise. Required license notices are included in the static
assets. The production manifest records file sizes and SHA-256 checksums, which
the worker verifies before loading.

The initial 8-bit model export did not preserve adequate inference quality in
the authored diagnostic cases, so it is not shipped. The supplied FP32 weights
were already exactly representable as FP16. The final artifact stores those
weights compactly and casts them back to FP32 before the original CPU compute
operations. The storage transformation has zero weight error; its diagnostic
outputs match the source within ordinary runtime numerical tolerance. This does
not constitute a certified educational assessment benchmark.

Automated tests cover all targets, feedback validation and persistence, stale
results, chapter-wide checks, earlier progress, spelling/POS rules, uncertainty,
errors, input limits, worker lifecycle and asset integrity. Model diagnostics
include good paraphrases, unrelated facts and negated meanings. Browser QA is
recorded separately; automated checks do not replace reviewing the user-facing
experience.
