export class ReactionCard extends HTMLElement {
  static observedAttributes = ["title", "count"];

  #titleEl: HTMLElement | null = null;
  #countEl: HTMLElement | null = null;
  #highlighted = false;

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          :host { display: inline-block; border: 1px solid #e5e7eb; border-radius: 6px; padding: 2px 7px; font: 12px var(--lab-font-sans); }
          :host(.hl) { background: #fef3c7; }
        </style>
        <span data-role="title"></span> <b data-role="count"></b>
      `;
      this.#titleEl = shadow.querySelector("[data-role=title]");
      this.#countEl = shadow.querySelector("[data-role=count]");
    }
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get highlighted(): boolean {
    return this.#highlighted;
  }
  set highlighted(v: boolean) {
    this.#highlighted = v;
    this.classList.toggle("hl", v);
  }

  #sync() {
    if (this.#titleEl) this.#titleEl.textContent = this.getAttribute("title");
    if (this.#countEl) this.#countEl.textContent = this.getAttribute("count");
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("reaction-card")
) {
  customElements.define("reaction-card", ReactionCard);
}
