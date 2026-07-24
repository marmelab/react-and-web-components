import {
  Suspense,
  lazy,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { usePath, Link } from "./router";
import { HomePage } from "./experiments/home/HomePage";

type Route = {
  title: string;
  Component: ComponentType | LazyExoticComponent<ComponentType>;
};

export const routes: Record<string, Route> = {
  "/": { title: "Home", Component: HomePage },
  "/lifecycle": {
    title: "1. Lifecycle",
    Component: lazy(() => import("./experiments/lifecycle/LifecyclePage")),
  },
  "/stability": {
    title: "2. Stability",
    Component: lazy(() => import("./experiments/stability/StabilityPage")),
  },
  "/nesting": {
    title: "3. Nesting",
    Component: lazy(() => import("./experiments/nesting/NestingPage")),
  },
  "/perf": {
    title: "4. Perf",
    Component: lazy(() => import("./experiments/perf/PerfPage")),
  },
  "/media-chrome": {
    title: "5. media-chrome",
    Component: lazy(() => import("./experiments/media-chrome/MediaChromePage")),
  },
  // Experiment tasks append entries here, e.g.:
};

export function App() {
  const path = usePath();
  const route = routes[path] ?? routes["/"];
  const { Component } = route;
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        margin: "0 auto",
        maxWidth: 1100,
        padding: 16,
      }}
    >
      <header
        style={{
          display: "flex",
          gap: 12,
          alignItems: "baseline",
          borderBottom: "1px solid #ddd",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 18 }}>React 19 × Web Components Lab</h1>
        <span
          style={{
            fontSize: 12,
            padding: "2px 8px",
            borderRadius: 10,
            background: __COMPILER_ON__ ? "#cfc" : "#eee",
          }}
        >
          React Compiler: {__COMPILER_ON__ ? "ON" : "OFF"}
        </span>
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(routes).map(([p, r]) => (
            <Link key={p} to={p}>
              {r.title}
            </Link>
          ))}
        </nav>
      </header>
      <Suspense fallback={<p>loading experiment…</p>}>
        <Component />
      </Suspense>
    </div>
  );
}
