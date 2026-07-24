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
        onPlayStateChange?: (e: Event) => void;
      }>;
    }
  }
}

export {};
