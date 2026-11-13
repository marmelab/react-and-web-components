import {
  Suspense,
  lazy,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { usePath, Link } from "./router";
import { experiments } from "./experiments";
import { HomePage } from "./experiments/home/HomePage";
import SsrPage from "./experiments/ssr/SsrPage";

type Page = ComponentType | LazyExoticComponent<ComponentType>;

export const routes: Record<string, Page> = {
  "/": HomePage,
  "/lifecycle": lazy(() => import("./experiments/lifecycle/LifecyclePage")),
  "/stability": lazy(() => import("./experiments/stability/StabilityPage")),
  "/nesting": lazy(() => import("./experiments/nesting/NestingPage")),
  "/perf": lazy(() => import("./experiments/perf/PerfPage")),
  "/media-chrome": lazy(
    () => import("./experiments/media-chrome/MediaChromePage"),
  ),
  "/ssr": SsrPage,
  "/identity": lazy(() => import("./experiments/identity/IdentityPage")),
};

export function App() {
  const path = usePath();
  const Component = routes[path] ?? routes["/"];
  return (
    <div className="lab">
      <header className="lab-header">
        <div className="lab-header-inner">
          <Link to="/" className="lab-brand">
            <span className="lab-logo" aria-hidden="true">
              wc
            </span>
            React 19 × Web Components
            <span className="lab-tag">LAB</span>
          </Link>
          <nav className="lab-nav">
            <Link to="/">Home</Link>
            {experiments.map((e) => (
              <Link key={e.path} to={e.path}>
                <span className="lab-nav-n">{e.n}</span>
                {e.title}
              </Link>
            ))}
          </nav>
          <span className="lab-compiler" data-on={__COMPILER_ON__}>
            React Compiler {__COMPILER_ON__ ? "on" : "off"}
          </span>
        </div>
      </header>
      <div className="lab-page">
        <Suspense fallback={<p className="lab-loading">loading experiment…</p>}>
          <Component />
        </Suspense>
      </div>
    </div>
  );
}
