import { renderToString } from "react-dom/server";
import { App } from "./App";
import { setSsrPath } from "./router";

export function render(url: string): { html: string; ssrLog: string[] } {
  setSsrPath(url);
  const ssrLog: string[] = [
    `render(${url}) at ${new Date().toISOString()}`,
    `typeof customElements on server: ${typeof customElements}`,
    `typeof HTMLElement on server: ${typeof HTMLElement}`,
  ];
  let html = "";
  try {
    html = renderToString(<App />);
    ssrLog.push("renderToString: OK");
  } catch (e) {
    ssrLog.push(`renderToString THREW: ${String(e)}`);
  }
  return { html, ssrLog };
}
