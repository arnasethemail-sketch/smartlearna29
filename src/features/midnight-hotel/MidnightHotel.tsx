import { useEffect, useRef, useState } from "react";
import { useLearningProgress } from "../progress";
import type { PracticeAttempt } from "../progress";
import { hotelStories } from "./index";
import type { HotelStory } from "./types";
import "./midnightHotel.css";

export const HOTEL_READER_FORMAT = "midnight-hotel-reader-v1";

function imagePath(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

function bookmarkFor(story: HotelStory, attempts: PracticeAttempt[]) {
  return [...attempts]
    .filter((attempt) =>
      attempt.metadata?.format === HOTEL_READER_FORMAT &&
      attempt.metadata?.storyId === story.id &&
      typeof attempt.metadata?.sectionIndex === "number" &&
      Number.isInteger(attempt.metadata.sectionIndex) &&
      attempt.metadata.sectionIndex >= 0 &&
      attempt.metadata.sectionIndex < story.sections.length,
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
}

function wordCount(story: HotelStory) {
  return story.sections.flatMap((section) => section.paragraphs).join(" ").split(/\s+/).length;
}

function Header({ onBack, reading }: { onBack: () => void; reading: boolean }) {
  return (
    <header className="mh-header">
      <button className="mh-brand" onClick={onBack} aria-label={reading ? "Midnight Hotel library" : "Back to English topics"}>
        <span aria-hidden="true">✦</span>
        <span>MIDNIGHT HOTEL<small>EXTRAORDINARY GUESTS. QUESTIONABLE ROOM SERVICE.</small></span>
      </button>
      <button className="mh-button mh-button-outline" onClick={onBack}>{reading ? "All 10 stories" : "Back to English"}</button>
    </header>
  );
}

export function MidnightHotel({ onBackToEnglish }: { onBackToEnglish: () => void }) {
  const { auth } = useLearningProgress();
  useEffect(() => () => { document.title = "Grade 4 English Practice"; }, []);
  return <HotelLibrary key={auth.userId ?? "guest"} onBackToEnglish={onBackToEnglish} />;
}

function HotelLibrary({ onBackToEnglish }: { onBackToEnglish: () => void }) {
  const { snapshot, updatePracticeProgress, auth, syncStatus } = useLearningProgress();
  const [openStory, setOpenStory] = useState<HotelStory | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [largeText, setLargeText] = useState(() => {
    try { return window.localStorage.getItem("midnight-hotel.text-size.v1") === "large"; }
    catch { return false; }
  });
  const heading = useRef<HTMLHeadingElement>(null);
  const attempts = [...Object.values(snapshot.activeAttempts), ...snapshot.completedAttempts];
  const saved = hotelStories.map((story) => ({ story, bookmark: bookmarkFor(story, attempts) }));
  const recent = saved.filter((entry) => entry.bookmark?.status === "in-progress")
    .sort((left, right) => right.bookmark!.updatedAt.localeCompare(left.bookmark!.updatedAt))[0];
  const completedCount = saved.filter((entry) => entry.bookmark?.status === "completed").length;

  useEffect(() => {
    document.title = openStory ? `${openStory.title} · Midnight Hotel` : "Midnight Hotel · Ten illustrated stories";
    heading.current?.focus({ preventScroll: true });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [openStory?.id, sectionIndex, finished]);

  const save = (story: HotelStory, part: number, isFinished = false) => {
    updatePracticeProgress({
      attemptId: `midnight-hotel-reader-v1:${story.id}`,
      subject: "English",
      topic: `Midnight Hotel ${story.number}: ${story.title}`,
      answered: isFinished ? story.sections.length : part + 1,
      total: story.sections.length,
      score: 0,
      status: isFinished ? "completed" : "in-progress",
      metadata: {
        format: HOTEL_READER_FORMAT,
        storyId: story.id,
        sectionIndex: part,
        questionTotal: 0,
      },
    });
  };

  const open = (story: HotelStory, forceStart = false) => {
    const bookmark = bookmarkFor(story, attempts);
    const part = !forceStart && bookmark?.status === "in-progress"
      ? Number(bookmark.metadata?.sectionIndex)
      : 0;
    setOpenStory(story);
    setSectionIndex(part);
    setFinished(false);
    // Reopening a finished story keeps its finished record until another explicit finish.
    if (bookmark?.status !== "completed") save(story, part);
  };

  const changePart = (part: number) => {
    if (!openStory || part < 0 || part >= openStory.sections.length) return;
    setSectionIndex(part);
    const bookmark = bookmarkFor(openStory, attempts);
    save(openStory, part, bookmark?.status === "completed");
  };

  const setTextSize = (large: boolean) => {
    setLargeText(large);
    try { window.localStorage.setItem("midnight-hotel.text-size.v1", large ? "large" : "standard"); }
    catch { /* Reading controls still work when browser storage is unavailable. */ }
  };

  // Initial account hydration replaces the snapshot after loading and saving it.
  // Wait for both phases before allowing bookmarks to change.
  if (auth.status === "loading" || syncStatus === "loading") {
    return (
      <main className="midnight-hotel mh-library">
        <div className="mh-shell">
          <Header reading={false} onBack={onBackToEnglish} />
          <section className="mh-reader-book mh-finished" role="status" aria-live="polite">
            <span aria-hidden="true">☾</span>
            <h1 ref={heading} tabIndex={-1} className="mt-3 font-serif text-3xl">Finding your bookmark…</h1>
            <p>Your saved reading position will be ready in a moment.</p>
          </section>
        </div>
      </main>
    );
  }

  if (openStory) {
    const section = openStory.sections[sectionIndex];
    const nextStory = hotelStories[openStory.number];
    return (
      <main className={`midnight-hotel mh-reader ${largeText ? "mh-text-large" : ""}`}>
        <div className="mh-shell">
          <Header reading onBack={() => { setOpenStory(null); setFinished(false); }} />
          <nav className="mh-reader-bar" aria-label="Story reading controls">
            <span>STORY {String(openStory.number).padStart(2, "0")} OF 10 <i>•</i> {finished ? "Finished" : `Part ${sectionIndex + 1} of ${openStory.sections.length}`}</span>
            <div role="group" aria-label="Reading text size"><button aria-pressed={!largeText} onClick={() => setTextSize(false)}>Standard text</button><button aria-pressed={largeText} onClick={() => setTextSize(true)}>Larger text</button></div>
          </nav>
          <article className="mh-reader-book">
            <header className="mh-story-header"><p className="mh-eyebrow">THE GUEST WHO WASN’T ON THE LIST</p><h1 ref={heading} tabIndex={-1}>{openStory.title}</h1><p>{openStory.subtitle}</p></header>
            {(sectionIndex === 0 || finished) && <figure className="mh-story-illustration"><img src={imagePath(openStory.illustration.src)} alt={openStory.illustration.alt} width="1536" height="1024" fetchPriority="high" /><figcaption>Story {openStory.number} · The Midnight Hotel</figcaption></figure>}
            {finished ? (
              <section className="mh-finished">
                <span aria-hidden="true">☾</span><h2>Tucked in. Story finished.</h2><p>{nextStory ? "Your place is saved. The next adventure is ready whenever you are." : "Ten stories, one extraordinary stay. You’ve reached the end of The Guest Who Wasn’t on the List."}</p>
                {nextStory && <button className="mh-button mh-button-gold" onClick={() => open(nextStory)}>Next story <span aria-hidden="true">→</span></button>}
                <button className="mh-button mh-button-outline" onClick={() => open(openStory, true)}>Read this story again</button>
                <button className="mh-text-link" onClick={() => setOpenStory(null)}>Back to the hotel library</button>
              </section>
            ) : (
              <>
                <div className="mh-prose"><p className="mh-part-label">PART {sectionIndex + 1}</p><h2>{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
                <nav className="mh-page-turn" aria-label="Turn story pages">
                  <button className="mh-button mh-button-outline" disabled={sectionIndex === 0} onClick={() => changePart(sectionIndex - 1)}>Previous part</button>
                  <span aria-hidden="true">{sectionIndex + 1} / {openStory.sections.length}</span>
                  {sectionIndex < openStory.sections.length - 1 ? <button className="mh-button mh-button-plum" onClick={() => changePart(sectionIndex + 1)}>Next part <span aria-hidden="true">→</span></button> : <button className="mh-button mh-button-plum" onClick={() => { save(openStory, sectionIndex, true); setFinished(true); }}>Finish story <span aria-hidden="true">✦</span></button>}
                </nav>
                <p className="mh-bookmark-message">Your bookmark saves as you turn the pages. No questions—just the story.</p>
              </>
            )}
          </article>
          <aside className="mh-other-stories"><h2>Your next check-in</h2><div>{hotelStories.filter((story) => story.id !== openStory.id).map((story) => <button key={story.id} onClick={() => open(story)}><span>{String(story.number).padStart(2,"0")}</span>{story.title}<i aria-hidden="true">↗</i></button>)}</div></aside>
        </div>
      </main>
    );
  }

  return (
    <main className="midnight-hotel mh-library">
      <div className="mh-shell"><Header reading={false} onBack={onBackToEnglish} />
        <section className="mh-welcome" aria-labelledby="hotel-welcome">
          <div className="mh-welcome-copy"><p className="mh-eyebrow">A LITTLE SPOOKY. VERY SILLY. ALL STORY.</p><h1 id="hotel-welcome" ref={heading} tabIndex={-1} aria-label="Welcome to the Midnight Hotel.">Welcome to the<br /><em>Midnight Hotel.</em></h1><p>Breakfast begins at sunset. The luggage has opinions. And someone has booked a room that doesn’t exist.</p><p className="mh-season-name">THE GUEST WHO WASN’T ON THE LIST <span>10 illustrated adventures</span></p><button className="mh-button mh-button-gold" onClick={() => open(recent?.story ?? hotelStories[0])} aria-label={recent ? `Continue story ${recent.story.number}` : "Start story 1"}>{recent ? "Find my bookmark" : "Your room is ready"}<span aria-hidden="true">↗</span></button><p className="mh-welcome-note">Read at your own pace. No exercises, no locked stories.</p></div>
          <figure className="mh-hero-art"><img src={imagePath("/midnight-hotel/hero.webp")} alt="Nia and Bark Bolt enter a glowing monster hotel, where a lilac ghost peeks from the luggage and a friendly dragon waits with pancakes." width="1536" height="1024" fetchPriority="high" /><figcaption>Come for the mystery. Stay for the questionable room service.</figcaption></figure>
        </section>
        <section className="mh-story-shelf" aria-labelledby="shelf-heading">
          <header className="mh-shelf-heading"><div><p className="mh-eyebrow">YOUR FIRST STAY</p><h2 id="shelf-heading">Ten stories. One very strange hotel.</h2></div><p>{completedCount ? `${completedCount} of 10 finished` : "Start with Story 1, or explore any room."}<span>Each story is about 6–9 minutes.</span></p></header>
          <div className="mh-story-grid">{saved.map(({ story, bookmark }) => <article key={story.id} className="mh-story-card"><button className="mh-cover-button" aria-label={`Open story ${story.number}: ${story.title}`} onClick={() => open(story)}><img src={imagePath(story.illustration.src)} alt={story.illustration.alt} width="1200" height="800" loading="lazy" /><span className="mh-story-number">STORY {String(story.number).padStart(2,"0")}</span>{bookmark?.status === "completed" && <span className="mh-read-badge">✓ Finished</span>}</button><div className="mh-card-copy"><p className="mh-card-time">{Math.ceil(wordCount(story) / 140)} MIN READ <span>✦</span> {story.sections.length} SHORT PARTS</p><h3>{story.title}</h3><p>{story.description}</p><button className="mh-read-link" onClick={() => open(story)} aria-label={bookmark?.status === "in-progress" ? `Continue story ${story.number}` : `Read story ${story.number}`}>{bookmark?.status === "in-progress" ? "Return to your bookmark" : bookmark?.status === "completed" ? "Read it again" : "Step into the story"}<span aria-hidden="true">→</span></button></div></article>)}</div>
        </section>
        <section className="mh-cast" aria-label="Meet your hotel companions"><p className="mh-eyebrow">GOOD COMPANY. MOSTLY.</p><h2>You won’t be investigating alone.</h2><div><article><h3>Nia</h3><p>Excellent at noticing tiny things. Occasionally too sure she has the answer.</p></article><article><h3>Bark Bolt</h3><p>Head of security. Loyal friend. Still investigating whether crumbs count as evidence.</p></article><article><h3>The guests</h3><p>A proud vampire, a ghost chef, a singing dragon… and one visitor with nowhere to stay.</p></article></div></section>
        <details className="mh-research"><summary>Behind the stories: how this series was developed</summary><p>We used child-reader surveys and advice from children’s authors to guide the humor, illustrations, welcoming layout, and continuing cast. These sources inform our editorial choices; they do not guarantee that every child will enjoy the same story.</p><ul><li><a href="https://www.scholastic.com/content/dam/KFRR/Downloads/KFRReport_Finding%20Their%20Story.pdf" target="_blank" rel="noreferrer">Scholastic, Kids & Family Reading Report, 7th edition (2019)</a> — historical US evidence about humor and exploring new worlds.</li><li><a href="https://literacytrust.org.uk/research-services/research-reports/children-and-young-peoples-reading-in-2025/" target="_blank" rel="noreferrer">National Literacy Trust, children’s reading (2025)</a> — UK evidence about interests, visual appeal, and choice.</li><li><a href="https://www.booktrust.org.uk/resources/find-resources/bookbuzz-primary-choosing-books-to-get-ks2-children-reading-for-pleasure/" target="_blank" rel="noreferrer">BookTrust, choosing books for ages 7–11</a> — expert guidance about series, safe suspense, and illustrated formats.</li><li><a href="https://www.booktrust.org.uk/resources/find-resources/how-to-train-your-reader-2/" target="_blank" rel="noreferrer">Cressida Cowell on engaging readers</a> and <a href="https://www.scholastic.com/parents/books-and-reading/raise-a-reader-blog/goosebumps-author-r-l-stine-on-inspiration-horror-and-humor.html" target="_blank" rel="noreferrer">R. L. Stine on humor and suspense</a> — first-person craft advice.</li></ul><p>All hotel stories and characters here are original. The illustrations were created with AI image generation and checked for continuity. A fuller source brief and series plan are in the project repository.</p></details>
        <footer className="mh-footer"><span aria-hidden="true">✦</span> THE MIDNIGHT HOTEL <span>Where the next chapter is always welcome.</span></footer>
      </div>
    </main>
  );
}
