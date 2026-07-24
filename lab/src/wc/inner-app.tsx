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
    <div style={{ border: "2px dashed #939", borderRadius: 6, padding: 8 }}>
      <p>
        inner React app — greeting attr: "{greeting}" — OuterContext seen:{" "}
        <strong>"{ctx}"</strong>
      </p>
      <button onClick={() => setCount((c) => c + 1)}>
        inner count: {count}
      </button>{" "}
      <button onClick={(e) => emit(e, "inner-event", true)}>
        emit composed event
      </button>{" "}
      <button onClick={(e) => emit(e, "inner-event-scoped", false)}>
        emit non-composed event
      </button>
    </div>
  );
}

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
