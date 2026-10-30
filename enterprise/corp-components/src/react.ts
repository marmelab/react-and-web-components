import type * as React from "react";

type WC<T = object> = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  T;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "media-player": WC<{
        src?: string;
        "video-title"?: string;
        volume?: number;
        // No onPlayStateChange prop: React 19 would listen for an event literally named "PlayStateChange", which the player never dispatches. Listen via ref: el.addEventListener("play-state-change", ...).
      }>;
    }
  }
}

export {};
