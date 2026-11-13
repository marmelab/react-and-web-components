// The experiments, in nav order: what the header nav, the home page cards and
// each page's title read. The numbers have gaps on purpose: experiments 6
// and 8 were dropped, and the others kept their numbers.
export type Experiment = {
  path: string;
  n: string;
  title: string;
  summary: string;
};

export const experiments: Experiment[] = [
  {
    path: "/lifecycle",
    n: "01",
    title: "Lifecycle",
    summary:
      "Which custom-element callbacks fire while React drives the element, and whether React 19 sets a property, an attribute or listens for an event.",
  },
  {
    path: "/stability",
    n: "02",
    title: "Stability",
    summary:
      "Whether video playback survives an aggressive React parent: a web-component player and a pure-React one under the same stress harness.",
  },
  {
    path: "/nesting",
    n: "03",
    title: "Nesting",
    summary:
      "A web component that boots its own React root in its shadow DOM, used from an outer React app: context, events and teardown.",
  },
  {
    path: "/perf",
    n: "04",
    title: "Perf",
    summary:
      "Mount, update and unmount cost of N identical widgets: pure React against a web component wrapped in React.",
  },
  {
    path: "/media-chrome",
    n: "05",
    title: "media-chrome",
    summary:
      "Whether the stability findings hold for a production web-component player, under the same stress harness.",
  },
  {
    path: "/ssr",
    n: "07",
    title: "SSR",
    summary:
      "What React 19's server renderer does with custom elements, and whether Declarative Shadow DOM survives hydration.",
  },
  {
    path: "/identity",
    n: "09",
    title: "Identity",
    summary:
      "Where state lives when the same web component appears many times, and whether React re-asserts props on an active one.",
  },
];

export function experimentAt(path: string): Experiment {
  const found = experiments.find((e) => e.path === path);
  if (!found) throw new Error(`no experiment at ${path}`);
  return found;
}
