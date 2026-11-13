import { useRef, useState } from "react";
import "../../wc/stateful-card";
import "../../wc/media-player";
import { LogPanel } from "../../instruments/LogPanel";
import { RenderBadge } from "../../instruments/RenderBadge";
import { Explainer } from "../../instruments/Explainer";
import { PageHeader } from "../../instruments/PageHeader";
import { VIDEO_SRC } from "../../videoSrc";

type Card = { id: number; label: string };
const initialCards: Card[] = ["A", "B", "C", "D", "E"].map((l, i) => ({ id: i + 1, label: `card ${l}` }));

export default function IdentityPage() {
  const [cards, setCards] = useState(initialCards);
  const [tick, setTick] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const nextId = useRef(initialCards.length + 1);

  const insertFront = () => {
    const id = nextId.current++;
    setCards([{ id, label: `card N${id}` }, ...cards]);
  };

  return (
    <main>
      <PageHeader
        path="/identity"
        lede="Identity and props vs state: where a web component's state lives, and what React re-asserts."
      >
        <RenderBadge name="page" />
      </PageHeader>
      <Explainer>
        <p>
          <strong>Tests:</strong> where state actually lives when the same WC
          appears many times — and whether React re-asserts props on an
          active component.
        </p>
        <ul>
          <li>
            Click cards to build internal counters React knows nothing about,
            THEN move things around.
          </li>
          <li>
            Stable-key row: counters travel with their labels (React moves
            the DOM nodes). Index-key row: labels move, counters stay put —
            a silent state/props mismatch.
          </li>
          <li>
            Part B: React re-applies the volume prop only when ITS value
            changes — drag the player's internal slider, re-render with same
            props, and nothing is re-asserted ("props are events, not
            constraints").
          </li>
        </ul>
      </Explainer>
      <p className="lab-hint">
        <strong>1)</strong> Click cards to build INTERNAL state (click counters React knows nothing about).{" "}
        <strong>2)</strong> Move them around. Same data drives both rows — only the key strategy differs.
      </p>
      {/* Screen-recording scripts drive this page by its structure: keep the
          buttons direct children of this row, and the row, the fieldsets,
          the volume <label> and <media-player> direct children of <main>. */}
      <div className="lab-panel lab-toolbar">
        <span className="lab-toolbar-label">List</span>
        <button onClick={() => setCards([...cards].sort(() => Math.random() - 0.5))}>shuffle</button>
        <button onClick={() => setCards([...cards].reverse())}>reverse</button>
        <button onClick={insertFront}>insert at front</button>
        <button onClick={() => setCards(cards.filter((_, i) => i !== Math.floor(cards.length / 2)))}>remove middle</button>
        <button onClick={() => setCards(initialCards)}>reset list</button>
        <span className="lab-toolbar-sep" />
        <span className="lab-toolbar-label">Parent</span>
        <button onClick={() => setTick(tick + 1)}>re-render parent, same props <span className="lab-count">{tick}</span></button>
      </div>
      <fieldset>
        <legend>key = stable id — state should TRAVEL with the label</legend>
        {cards.map((c) => <stateful-card key={c.id} label={c.label} />)}
      </fieldset>
      <fieldset>
        <legend>key = index — React relabels IN PLACE; watch counters stay put</legend>
        {cards.map((c, i) => <stateful-card key={i} label={c.label} />)}
      </fieldset>

      <h3>Passing new props to an ACTIVE component</h3>
      <p className="lab-hint">
        Steps: set the parent volume prop below → drag the player's INTERNAL volume slider to a different value →
        "re-render parent, same props" → does React re-assert its prop (watch for <code>PROPERTY volume =</code> in the log)?
        Then move the parent slider → who wins now?
      </p>
      <label className="lab-field-card">
        parent volume prop:{" "}
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />{" "}
        ({volume})
      </label>
      <media-player src={VIDEO_SRC} video-title="props-vs-state probe" volume={volume} />
      <LogPanel />
    </main>
  );
}
