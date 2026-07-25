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
          :host { display: inline-block; border: 2px solid #666; border-radius: 6px; padding: 6px 10px; cursor: pointer; font: 13px system-ui; user-select: none; }
          b { color: #a00; }
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
