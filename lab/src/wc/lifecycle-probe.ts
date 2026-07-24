import { logEvent } from "../instruments/log";

export class LifecycleProbe extends HTMLElement {
  static observedAttributes = ["label", "value"];

  #objectProp: unknown = undefined;

  constructor() {
    super();
    logEvent("probe", "constructor()");
  }

  connectedCallback() {
    logEvent(
      "probe",
      `connectedCallback (label=${this.getAttribute("label")})`,
    );
    this.style.cssText =
      "display:inline-block;border:2px solid #0a6;border-radius:4px;padding:4px 8px;cursor:pointer;";
    this.render();
    this.addEventListener("click", this.#onClick);
  }

  disconnectedCallback() {
    logEvent(
      "probe",
      `disconnectedCallback (label=${this.getAttribute("label")})`,
    );
    this.removeEventListener("click", this.#onClick);
  }

  attributeChangedCallback(
    name: string,
    oldV: string | null,
    newV: string | null,
  ) {
    logEvent(
      "probe",
      `attributeChangedCallback ${name}: ${JSON.stringify(oldV)} → ${JSON.stringify(newV)}`,
    );
    this.render();
  }

  get objectProp(): unknown {
    return this.#objectProp;
  }
  set objectProp(v: unknown) {
    this.#objectProp = v;
    logEvent(
      "probe",
      `PROPERTY objectProp = ${typeof v === "function" ? "function" : JSON.stringify(v)}`,
    );
  }

  #onClick = () => {
    this.dispatchEvent(
      new CustomEvent("probe-event", {
        bubbles: true,
        composed: true,
        detail: { at: performance.now() },
      }),
    );
  };

  private render() {
    this.textContent = `probe[${this.getAttribute("label") ?? "?"}] value=${this.getAttribute("value") ?? "-"} (click me)`;
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("lifecycle-probe")
) {
  customElements.define("lifecycle-probe", LifecycleProbe);
}
