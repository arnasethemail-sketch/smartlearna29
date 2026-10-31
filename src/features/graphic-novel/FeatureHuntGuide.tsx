import { useState } from "react";
import "./featureHuntGuide.css";

export function FeatureHuntGuide() {
  const [choice, setChoice] = useState<"clue" | "shape" | null>(null);
  return <details className="gnx-hunt-guide" open>
    <summary>See a sample question and answer</summary>
    <div className="gnx-hunt-guide-body">
      <p className="gnx-hunt-guide-note">A tiny practice story. Use it to learn how, then find your own clues in the chapter.</p>
      <div className="gnx-hunt-guide-layout">
        <figure className="gnx-hunt-mini-comic">
          <figcaption>The missing mooncake</figcaption>
          <div className="gnx-hunt-mini-scene">
            <p className="gnx-hunt-mini-narrator">Pip opened the tin. It was empty.</p>
            <blockquote className="gnx-hunt-mini-bubble"><cite>Pip</cite><p>My mooncake is gone!</p></blockquote>
            <div className="gnx-hunt-mini-tin" aria-hidden="true"><span>MOONCAKES</span><i /></div>
          </div>
        </figure>
        <ol className="gnx-hunt-sample-answers">
          <li><strong>What feature can you spot?</strong><p>A speech bubble: “My mooncake is gone!”</p></li>
          <li><strong>What is its job?</strong><p>It shows Pip’s exact words.</p></li>
          <li><strong>What does it help you learn?</strong><p>Pip has just noticed that the snack is missing.</p></li>
        </ol>
      </div>
      <div className="gnx-hunt-job-clue"><p><strong>The feature’s job:</strong> how it tells the story.</p><p><strong>What I learn:</strong> a clue about this scene.</p></div>
      <details className="gnx-hunt-quick-try">
        <summary>Try one quick clue</summary>
        <p>Which answer explains what the speech bubble helps you learn?</p>
        <div className="gnx-hunt-quick-choices" role="group" aria-label="Practice finding a story clue">
          <button type="button" aria-pressed={choice === "clue"} onClick={() => setChoice("clue")}>I learn that Pip has noticed the missing mooncake.</button>
          <button type="button" aria-pressed={choice === "shape"} onClick={() => setChoice("shape")}>The speech bubble has a nice shape.</button>
        </div>
        {choice && <p className={`gnx-hunt-quick-feedback ${choice === "clue" ? "gnx-hunt-quick-success" : ""}`} role="status">{choice === "clue" ? "Exactly! You explained what you learned about this scene. Now try a clue in your chapter." : "Shapes can catch your eye. For this question, choose the answer that tells you something about Pip or the missing snack. Have another go!"}</p>}
      </details>
    </div>
  </details>;
}
