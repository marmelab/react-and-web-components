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
    }
  }
}
