import type { ReactNode } from "react";

export function Link({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={`#${to}`} className={className}>
      {children}
    </a>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="inline-code">{children}</code>;
}

export function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <div className="code-block">
      {title ? <div className="code-title">{title}</div> : null}
      <pre>
        <code>{children.trim()}</code>
      </pre>
    </div>
  );
}

export function Terminal({ children }: { children: string }) {
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="terminal-label">terminal</span>
      </div>
      <pre>
        <code>{children.trim()}</code>
      </pre>
    </div>
  );
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocsPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="docs-layout">
      <aside className="sidebar">
        <div className="sidebar-title">Documentation</div>
        <DocNav />
      </aside>
      <article className="docs-content">
        <h1>{title}</h1>
        <p className="lede">{description}</p>
        {children}
      </article>
    </div>
  );
}

const NAV = [
  { to: "/docs/getting-started", label: "Getting started" },
  { to: "/docs/presets", label: "Presets" },
  { to: "/docs/rules", label: "Rules" },
  { to: "/docs/cli", label: "CLI" },
];

export function DocNav({ current }: { current?: string }) {
  return (
    <nav className="doc-nav">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`doc-nav-link${current === item.to ? " active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="callout">
      <span className="callout-icon">ℹ</span>
      <div>{children}</div>
    </div>
  );
}
