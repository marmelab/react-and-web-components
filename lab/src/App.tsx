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
