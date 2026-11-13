import { createContext, useContext, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { logEvent } from "../instruments/log";

export const OuterContext = createContext<string>("outer-default");

function InnerApp({ greeting }: { greeting: string }) {
  const ctx = useContext(OuterContext);
  const [count, setCount] = useState(0);
  const emit = (e: React.MouseEvent, type: string, composed: boolean) =>
    e.currentTarget.dispatchEvent(
      new CustomEvent(type, { bubbles: true, composed, detail: { count } }),
    );
  return (
    <>
      {/* The outer page's stylesheet stops at this shadow root, so the inner
          app brings its own; only the inherited --lab-* tokens get in. */}
      <style>{INNER_CSS}</style>
      <div className="inner">
        <div className="tag">inner React root · in the shadow DOM</div>
        <p>
          greeting attr: <code>"{greeting}"</code> · OuterContext seen:{" "}
          <code>"{ctx}"</code>
        </p>
        <div className="row">
          <button onClick={() => setCount((c) => c + 1)}>
            inner count: {count}
          </button>
          <button onClick={(e) => emit(e, "inner-event", true)}>
            emit composed event
          </button>
          <button onClick={(e) => emit(e, "inner-event-scoped", false)}>
            emit non-composed event
          </button>
        </div>
      </div>
    </>
  );
}

const INNER_CSS = `
  .inner {
    padding: 12px 16px 14px;
    background: var(--lab-react-soft, #fff7ed);
    border: 1.5px dashed var(--lab-react, #ea580c);
    border-radius: 12px;
  }
  .tag {
    font: 600 10px var(--lab-font-mono, monospace);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--lab-react-ink, #9a3412);
  }
  p { margin: 6px 0 12px; }
  code {
    font: 500 12.5px var(--lab-font-mono, monospace);
    padding: 1px 6px;
    background: #fff;
    border: 1px solid var(--lab-border, #e5e7eb);
    border-radius: 4px;
  }
  .row { display: flex; flex-wrap: wrap; gap: 8px; }
  button {
    padding: 6px 11px;
    font: 500 13px var(--lab-font-sans, sans-serif);
    color: var(--lab-text, #111827);
    background: #fff;
    border: 1px solid #fdba74;
    border-radius: 7px;
    cursor: pointer;
  }
  button:hover { background: #ffedd5; }
`;

class InnerAppElement extends HTMLElement {
  static observedAttributes = ["greeting"];
  #root: Root | null = null;

  connectedCallback() {
    logEvent("inner-app", "connectedCallback → createRoot(shadowRoot)");
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    if (!this.#root) this.#root = createRoot(shadow);
    this.#render();
  }

  disconnectedCallback() {
    logEvent(
      "inner-app",
      "disconnectedCallback → root.unmount() (deferred via queueMicrotask, isConnected-checked)",
    );
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.#root?.unmount();
        this.#root = null;
      }
    });
  }

  attributeChangedCallback() {
    this.#render();
  }

  #render() {
    this.#root?.render(
      <InnerApp greeting={this.getAttribute("greeting") ?? ""} />,
    );
  }
}

if (typeof customElements !== "undefined" && !customElements.get("inner-app")) {
  customElements.define("inner-app", InnerAppElement);
}
