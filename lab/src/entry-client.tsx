import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";

declare global {
  interface Window {
    __WAS_SSR__?: boolean;
    __SSR_LOG__?: string[];
  }
}

const container = document.getElementById("root")!;
// firstElementChild, NOT hasChildNodes(): in SPA mode the <!--ssr-outlet-->
// comment is a child node, and hydrating a comment-only container would break.
window.__WAS_SSR__ = container.firstElementChild !== null;

if (window.__WAS_SSR__) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
