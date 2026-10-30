# SmartLearn Grade Practice

SmartLearn is a Vite and React practice site for Grade 4 maths, English,
science, and social studies, plus Grade 5 Story Adventures and graphic-novel
English lessons. It is published as
a static site on GitHub Pages and uses Supabase for parent- or
guardian-managed sign-in and cloud progress storage.

## Graphic-novel English lessons

Open `#graphic-novel` in the existing app for the 24-chapter Hotel Transylvania
adaptation, with 192 individually illustrated panels and six learning activities
per chapter. Reading position, written answers, spelling, revisions and review
notes use the existing account progress store. All 14 written activities per
chapter have free, on-device checking for meaning, support, clarity and writing
conventions. Spelling and vocabulary matches also have automatic checks.
No parent grading, paid AI API, API key or new subscription is required.

The meaning checker downloads approximately 38 MB from this same website on
first use and caches the model in the browser. A low-confidence result is
explicitly uncertain, and a justified opinion need not agree with an example.
Automatic feedback is guidance rather than a guarantee of writing mastery.

Course and validation notes are in `docs/graphic-novel-course-notes.md`. The
reviewed artwork prompt inventory is `docs/graphic-novel-art-prompts.json`.
The free checking architecture and limits are in `docs/free-answer-checker.md`.
Run `npm test` and `npm run build` before deployment. Production artwork tests
verify all 192 panel files, native dimensions, unique checksums and alternative
text without requiring private production references.

## Run locally

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local`, then set the two public browser values for
the Supabase project:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Start Vite:

```bash
npm run dev
```

Open the URL shown by Vite. Because this repository is deployed as a GitHub
Pages project site, its configured base path is `/smartlearna29/`.

## Parent and guardian accounts

Authentication is intended for a parent or guardian who wants a learner's
progress to follow them between devices. The authenticated account owns its
cloud progress row. Do not use a child's name, email address, or other personal
information as lesson content or profile data.

Signing in changes the product's data behaviour: progress is no longer limited
to one browser. Product copy and privacy information must accurately explain
when data is stored locally and when it is synchronized to Supabase.

## Supabase database

The database source of truth is:

```text
supabase/migrations/20261029000000_create_learning_progress.sql
```

The migration creates `public.learning_progress` with one row per Supabase Auth
user:

- `user_id` is the primary key and deletes with the matching `auth.users` row.
- `snapshot` stores the versioned learning-progress JSON document.
- `revision` is checked and advanced on each write so concurrent devices cannot
  silently overwrite one another; conflicting writes reload, merge, and retry.
- `updated_at` records the latest write time.

Row Level Security is enabled. The anonymous database role has no table
privileges. Authenticated users receive only `select`, `insert`, `update`, and
`delete`, and four policies limit every operation to the row where
`auth.uid() = user_id`.

For a new Supabase environment, apply repository migrations with the Supabase
CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

The migration represented here has already been applied to the current hosted
project; keeping the SQL in Git makes new environments reproducible and makes
security policy changes reviewable.

## GitHub Pages deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which installs exact npm
dependencies, builds the Vite app, and publishes `dist` to GitHub Pages.

The workflow already supplies this public project URL:

```text
VITE_SUPABASE_URL=https://pkskxeetlndqunvsdeog.supabase.co
```

Before deploying, create an Actions **repository variable** named
`VITE_SUPABASE_ANON_KEY` under **Settings → Secrets and variables → Actions →
Variables**. Set it to the Supabase project's public legacy anon key. The
workflow passes that value into the Vite build.

Configure Supabase Auth to allow these redirect URLs:

```text
https://arnasethemail-sketch.github.io/smartlearna29/
http://localhost:5173/smartlearna29/
```

GitHub Pages is static hosting. It cannot protect server credentials or execute
trusted backend code. Values prefixed with `VITE_` are compiled into browser
JavaScript and must be treated as public.

Never put any of the following in this repository, `.env.example`, a Vite
variable, a GitHub Pages artifact, or the Pages build environment:

- a Supabase secret or service-role key;
- a database password or connection string;
- any credential that bypasses Row Level Security.

Administrative operations requiring elevated credentials must run in a trusted
server or Supabase Edge Function, not in the GitHub Pages application.

## Build and test

```bash
npm run build
npm test
```
