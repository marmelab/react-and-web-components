export class UnguardedDemo extends HTMLElement {
  connectedCallback() {
    this.textContent = "unguarded demo";
  }
}
customElements.define("unguarded-demo", UnguardedDemo);
