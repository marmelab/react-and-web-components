import type * as React from "react";

type WC<T = object> = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  T;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "lifecycle-probe": WC<{
        label?: string;
        value?: string;
        objectProp?: unknown;
        onProbeEvent?: (e: Event) => void;
        "onprobe-event"?: (e: Event) => void;
      }>;
      "media-player": WC<{
        src?: string;
        "video-title"?: string;
        volume?: number;
        onPlayStateChange?: (e: Event) => void;
      }>;
      "inner-app": WC<{ greeting?: string }>;
      "reaction-card": WC<{ title?: string; count?: number; highlighted?: boolean }>;
      "stateful-card": WC<{ label?: string }>;
      "media-controller": WC;
      "media-control-bar": WC;
      "media-play-button": WC;
      "media-time-range": WC;
      "media-time-display": WC;
      "media-mute-button": WC;
      "media-volume-range": WC;
    }
  }
}
