import { logEvent } from "../instruments/log";

export class MediaPlayer extends HTMLElement {
  static observedAttributes = ["src", "video-title"];

  #video: HTMLVideoElement;
  #titleEl: HTMLElement;
  #timeEl: HTMLElement;
  #statsEl: HTMLElement;
  #toggleBtn: HTMLButtonElement;
  #seek: HTMLInputElement;
  #resets = 0;
  #lastTime = 0;
  #appliedSrc: string | null = null;

  constructor() {
    super();
    logEvent("media-player", "constructor()");
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { display: block; border: 2px solid #06a; border-radius: 6px; padding: 8px; max-width: 480px; }
        video { width: 100%; background: #000; }
        .row { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
        input[type=range] { flex: 1; }
        .stats { font: 11px monospace; color: #a00; }
      </style>
      <strong data-role="title"></strong>
      <video></video>
      <div class="row">
        <button data-role="toggle">▶</button>
        <input data-role="seek" type="range" min="0" max="100" step="0.1" value="0" />
        <span data-role="time">0.0s</span>
        <input data-role="volume" type="range" min="0" max="1" step="0.01" value="1" title="volume" />
      </div>
      <div class="stats" data-role="stats">resets: 0</div>
    `;
    this.#video = shadow.querySelector("video")!;
    this.#titleEl = shadow.querySelector("[data-role=title]")!;
    this.#timeEl = shadow.querySelector("[data-role=time]")!;
    this.#statsEl = shadow.querySelector("[data-role=stats]")!;
    this.#toggleBtn = shadow.querySelector("[data-role=toggle]")!;
    this.#seek = shadow.querySelector("[data-role=seek]")!;
    const volume =
      shadow.querySelector<HTMLInputElement>("[data-role=volume]")!;

    this.#toggleBtn.addEventListener("click", () =>
      this.playing ? this.pause() : this.play(),
    );
    this.#seek.addEventListener("input", () => {
      this.#video.currentTime =
        (Number(this.#seek.value) / 100) * (this.#video.duration || 0);
    });
    volume.addEventListener(
      "input",
      () => (this.#video.volume = Number(volume.value)),
    );

    this.#video.addEventListener("play", () => this.#emitPlayState(true));
    this.#video.addEventListener("pause", () => this.#emitPlayState(false));
    this.#video.addEventListener("emptied", () => {
      this.#countReset("emptied (src reset)");
      this.#lastTime = 0;
    });
    this.#video.addEventListener("timeupdate", () => {
      const t = this.#video.currentTime;
      if (t < this.#lastTime - 0.5)
        this.#countReset(
          `time jumped back ${this.#lastTime.toFixed(1)} → ${t.toFixed(1)}`,
        );
      this.#lastTime = t;
      this.#timeEl.textContent = `${t.toFixed(1)}s`;
      if (this.#video.duration)
        this.#seek.value = String((t / this.#video.duration) * 100);
      const q = this.#video.getVideoPlaybackQuality?.();
      this.#statsEl.textContent = `resets: ${this.#resets} | dropped frames: ${q ? q.droppedVideoFrames : "n/a"}`;
    });
  }

  connectedCallback() {
    logEvent("media-player", "connectedCallback");
  }

  disconnectedCallback() {
    logEvent("media-player", `disconnectedCallback (playing=${this.playing})`);
  }

  attributeChangedCallback(
    name: string,
    oldV: string | null,
    newV: string | null,
  ) {
    logEvent(
      "media-player",
      `attributeChangedCallback ${name}: ${JSON.stringify(oldV)} → ${JSON.stringify(newV)}`,
    );
    if (name === "src" && newV && newV !== this.#appliedSrc) {
      this.#appliedSrc = newV;
      this.#video.src = newV;
    }
    if (name === "video-title") this.#titleEl.textContent = newV ?? "";
  }

  play() {
    void this.#video.play();
  }
  pause() {
    this.#video.pause();
  }
  get playing(): boolean {
    return !this.#video.paused;
  }
  get resets(): number {
    return this.#resets;
  }
  get currentTime(): number {
    return this.#video.currentTime;
  }
  set currentTime(t: number) {
    this.#video.currentTime = t;
  }
  get volume(): number {
    return this.#video.volume;
  }
  set volume(v: number) {
    logEvent("media-player", `PROPERTY volume = ${v}`);
    this.#video.volume = v;
  }

  #emitPlayState(playing: boolean) {
    this.#toggleBtn.textContent = playing ? "⏸" : "▶";
    this.dispatchEvent(
      new CustomEvent("play-state-change", {
        bubbles: true,
        composed: true,
        detail: { playing },
      }),
    );
  }

  #countReset(why: string) {
    this.#resets += 1;
    this.#statsEl.textContent = `resets: ${this.#resets}`;
    logEvent("media-player", `PLAYBACK RESET #${this.#resets}: ${why}`);
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("media-player")
) {
  customElements.define("media-player", MediaPlayer);
}
