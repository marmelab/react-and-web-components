import { logEvent } from "../instruments/log";

export class StatefulCard extends HTMLElement {
  static observedAttributes = ["label"];

  #clicks = 0;
  #labelEl: HTMLElement | null = null;
  #clicksEl: HTMLElement | null = null;

  constructor() {
    super();
    logEvent("stateful-card", "constructor()");
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          :host {
            display: inline-block; margin: 3px; padding: 6px 12px;
            font-size: 13px; color: var(--lab-muted, #6b7280);
            background: var(--lab-surface, #fff);
            border: 1.5px solid var(--lab-border-strong, #d1d5db); border-radius: 8px;
            box-shadow: 0 1px 2px rgb(16 24 40 / 0.05);
            cursor: pointer; user-select: none;
            transition: border-color 0.12s;
          }
          :host(:hover) { border-color: var(--lab-wc, #2563eb); }
          [data-role=label] { font-weight: 600; color: var(--lab-text, #111827); }
          b {
            padding: 0 6px; border-radius: 4px;
            font: 600 12.5px var(--lab-font-mono, monospace);
            color: var(--lab-wc-ink, #1e3a8a); background: var(--lab-wc-soft, #eff6ff);
          }
        </style>
        <span data-role="label"></span> — internal clicks: <b data-role="clicks">0</b>
      `;
      this.#labelEl = shadow.querySelector("[data-role=label]");
      this.#clicksEl = shadow.querySelector("[data-role=clicks]");
      this.addEventListener("click", () => {
        this.#clicks += 1;
        if (this.#clicksEl) this.#clicksEl.textContent = String(this.#clicks);
      });
    }
    logEvent("stateful-card", `connectedCallback (label=${this.getAttribute("label")}, clicks=${this.#clicks})`);
    this.#sync();
  }

  disconnectedCallback() {
    logEvent("stateful-card", `disconnectedCallback (label=${this.getAttribute("label")}, clicks=${this.#clicks})`);
  }

  attributeChangedCallback(name: string, oldV: string | null, newV: string | null) {
    logEvent("stateful-card", `attributeChanged ${name}: ${JSON.stringify(oldV)} → ${JSON.stringify(newV)} (internal clicks stay ${this.#clicks})`);
    this.#sync();
  }

  get clicks(): number {
    return this.#clicks;
  }

  #sync() {
    if (this.#labelEl) this.#labelEl.textContent = this.getAttribute("label");
  }
}

if (typeof customElements !== "undefined" && !customElements.get("stateful-card")) {
  customElements.define("stateful-card", StatefulCard);
}
