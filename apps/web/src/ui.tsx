import { useState, type ReactNode } from "react";
import { Check, Copy, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { highlight, inferLanguage, lineDecorations, type LineSelection } from "./highlight";
import { Button } from "./components/forme/button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/forme/tooltip/tooltip";

export function Code({ children }: { children: ReactNode }) {
  return <code className="inline-code">{children}</code>;
}

function CopiedIcon({ className }: { className?: string }) {
  return <Check className={`text-success ${className ?? ""}`} />;
}
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            iconOnly
            leadingIcon={copied ? CopiedIcon : Copy}
            aria-label={copied ? "Copied" : "Copy code"}
            onClick={async () => {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          />
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied to clipboard" : "Copy to clipboard"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type Annotation = { range: [number, number]; message?: string };

export function CodeBlock({
  title,
  lang: langProp,
  children,
  highlightLines,
  ins,
  del,
  focus,
  error,
  lineNumbers,
  ranges,
}: {
  title?: string;
  /** Language when there is no title to infer it from: "json", "toml", "yaml", "shell", "tsx" */
  lang?: string;
  children: string;
  highlightLines?: LineSelection[];
  ins?: LineSelection[];
  del?: LineSelection[];
  focus?: LineSelection[];
  error?: LineSelection[];
  lineNumbers?: boolean;
  ranges?: Annotation[];
}) {
  const lang = langProp ?? inferLanguage(title);
  const code = children.trim();
  const decorations = [
    ...lineDecorations(highlightLines ?? [], "th-line--highlighted"),
    ...lineDecorations(ins ?? [], "th-line--inserted"),
    ...lineDecorations(del ?? [], "th-line--deleted"),
    ...lineDecorations(focus ?? [], "th-line--focused"),
    ...lineDecorations(error ?? [], "th-line--error"),
    ...(ranges ?? []).map((annotation) => ({
      range: annotation.range,
      className: "th-decoration is-error",
      data: annotation.message ? { message: annotation.message } : undefined,
    })),
  ];
  return (
    <div className="code-block">
      <div className="code-bar">
        {title ? <div className="code-title">{title}</div> : <span />}
        <span className="code-copy">
          <CopyButton text={code} />
        </span>
      </div>
      <div
        className="code-body"
        dangerouslySetInnerHTML={{
          __html: highlight(
            code,
            lang,
            decorations.length > 0 ? decorations : undefined,
            lineNumbers,
          ),
        }}
      />
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
        <span className="terminal-copy">
          <CopyButton text={children.trim()} />
        </span>
      </div>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: highlight(children.trim(), "shell") }} />
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
  { to: "/docs/agents", label: "Agent rules" },
  { to: "/docs/cli", label: "CLI" },
];

export function DocNav() {
  return (
    <nav className="doc-nav">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="doc-nav-link"
          activeOptions={{ exact: true }}
          activeProps={{ className: "doc-nav-link active", "aria-current": "page" }}
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
      <Info className="callout-icon" size={16} strokeWidth={1.5} aria-hidden />
      <div>{children}</div>
    </div>
  );
}
