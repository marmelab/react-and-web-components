import type { ReactNode } from "react";
import { experimentAt } from "../experiments";

// An experiment page's title block. `children` sits next to the title: pages
// put their RenderBadge there. A <div>, not a <header>: the app shell owns
// the page's only <header>.
export function PageHeader({
  path,
  lede,
  children,
}: {
  path: string;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  const { n, title } = experimentAt(path);
  return (
    <div>
      <div className="lab-eyebrow">Experiment {n}</div>
      <div className="lab-title">
        <h1>{title}</h1>
        {children}
      </div>
      {lede && <p className="lab-lede">{lede}</p>}
    </div>
  );
}
