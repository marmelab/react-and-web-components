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
        // No onPlayStateChange prop: camelCase event props are inert on custom elements in React 19. Listen via ref: el.addEventListener("play-state-change", ...). See FINDINGS.md §1–2.
      }>;
    }
  }
}

export {};
