import { useEffect, useState } from "react";

type CodeLine = { text: string; kind?: "bad" | "good" };

type Example = {
  id: string;
  chip: string;
  file: string;
  before: CodeLine[];
  after: CodeLine[];
  diagnostic: { level: "error" | "warn"; line: number; col: number; message: string };
};

const EXAMPLES: Example[] = [
  {
    id: "prefer-bun-file",
    chip: "Bun.file()",
    file: "src/config.ts",
    before: [
      { text: 'import { readFileSync } from "node:fs";', kind: "bad" },
      { text: "" },
      { text: "export function loadConfig() {" },
      { text: '  const raw = readFileSync("config.toml", "utf8");', kind: "bad" },
      { text: "  return parse(raw);" },
      { text: "}" },
    ],
    after: [
      { text: "export async function loadConfig() {" },
      { text: '  const raw = await Bun.file("config.toml").text();', kind: "good" },
      { text: "  return parse(raw);" },
      { text: "}" },
    ],
    diagnostic: {
      level: "warn",
      line: 4,
      col: 14,
      message: "Use Bun.file() instead of fs.readFileSync()",
    },
  },
  {
    id: "no-process-env",
    chip: "Bun.env",
    file: "src/env.ts",
    before: [
      { text: "const PORT = process.env.PORT;", kind: "bad" },
      { text: "const KEY = process.env.API_KEY;", kind: "bad" },
      { text: "" },
      { text: "export const config = { port: Number(PORT), key: KEY };" },
    ],
    after: [
      { text: "const PORT = Bun.env.PORT;", kind: "good" },
      { text: "const KEY = Bun.env.API_KEY;", kind: "good" },
      { text: "" },
      { text: "export const config = { port: Number(PORT), key: KEY };" },
    ],
    diagnostic: {
      level: "warn",
      line: 1,
      col: 13,
      message: "Use Bun.env instead of process.env in Bun projects",
    },
  },
  {
    id: "no-dotenv",
    chip: "no dotenv",
    file: "src/secrets.ts",
    before: [
      { text: 'import "dotenv/config";', kind: "bad" },
      { text: "" },
      { text: "export const apiKey = process.env.API_KEY;" },
    ],
    after: [{ text: "export const apiKey = Bun.env.API_KEY;", kind: "good" }],
    diagnostic: {
      level: "error",
      line: 1,
      col: 1,
      message: "Bun loads .env files automatically. Delete dotenv.",
    },
  },
  {
    id: "no-node-fetch",
    chip: "global fetch",
    file: "src/github.ts",
    before: [
      { text: 'import fetch from "node-fetch";', kind: "bad" },
      { text: "" },
      { text: "export async function getRepos(user: string) {" },
      { text: '  const res = await fetch(apiUrl + "/users/" + user);' },
      { text: "  return res.json();" },
      { text: "}" },
    ],
    after: [
      { text: "export async function getRepos(user: string) {" },
      { text: '  const res = await fetch(apiUrl + "/users/" + user);', kind: "good" },
      { text: "  return res.json();" },
      { text: "}" },
    ],
    diagnostic: {
      level: "warn",
      line: 1,
      col: 8,
      message: "fetch is a global in Bun. Delete node-fetch.",
    },
  },
  {
    id: "prefer-bun-sleep",
    chip: "Bun.sleep()",
    file: "src/retry.ts",
    before: [
      { text: "export async function retry(fn: () => Promise<unknown>) {" },
      { text: "  for (let attempt = 0; attempt < 3; attempt++) {" },
      { text: "    try {" },
      { text: "      return await fn();" },
      { text: "    } catch {" },
      { text: "      await new Promise((r) => setTimeout(r, 250));", kind: "bad" },
      { text: "    }" },
      { text: "  }" },
      { text: "}" },
    ],
    after: [
      { text: "export async function retry(fn: () => Promise<unknown>) {" },
      { text: "  for (let attempt = 0; attempt < 3; attempt++) {" },
      { text: "    try {" },
      { text: "      return await fn();" },
      { text: "    } catch {" },
      { text: "      await Bun.sleep(250);", kind: "good" },
      { text: "    }" },
      { text: "  }" },
      { text: "}" },
    ],
    diagnostic: {
      level: "warn",
      line: 6,
      col: 13,
      message: "Use Bun.sleep(250) instead of wrapping setTimeout",
    },
  },
];

const BEFORE_MS = 3800;
const AFTER_MS = 3400;

export function Demo() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"before" | "after">("before");
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const duration = phase === "before" ? BEFORE_MS : AFTER_MS;
    const timer = setTimeout(() => {
      if (phase === "before") {
        setPhase("after");
      } else {
        setPhase("before");
        setIndex((current) => (current + 1) % EXAMPLES.length);
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [auto, index, phase]);

  const example = EXAMPLES[index];
  const duration = phase === "before" ? BEFORE_MS : AFTER_MS;
  const code = phase === "before" ? example.before : example.after;
  const fileName = example.file;

  const pick = (i: number) => {
    setIndex(i);
    setPhase("before");
    setAuto(false);
  };

  const setManualPhase = (next: "before" | "after") => {
    setPhase(next);
    setAuto(false);
  };

  const diagnosticLine = `${fileName}:${example.diagnostic.line}:${example.diagnostic.col}`;
  const lintOut =
    phase === "before"
      ? [
          `${diagnosticLine} ${example.diagnostic.level} bunkeeper(${example.id})`,
          `    ${example.diagnostic.message}`,
          "",
          "1 problem",
        ]
      : ["0 problems — Linted 1 file [2ms]"];

  return (
    <div className="demo">
      <div className="demo-head">
        <div>
          <h2>Without vs with</h2>
          <p className="dim">
            One rule at a time — the lint output first, then the bun-native fix.
          </p>
        </div>
        <div className="demo-controls">
          <div className="seg" role="tablist">
            <button
              type="button"
              className={`seg-btn${phase === "before" ? " active" : ""}`}
              onClick={() => setManualPhase("before")}
            >
              without
            </button>
            <button
              type="button"
              className={`seg-btn${phase === "after" ? " active" : ""}`}
              onClick={() => setManualPhase("after")}
            >
              with bunkeeper
            </button>
          </div>
          <button
            type="button"
            className={`auto-btn${auto ? " on" : ""}`}
            onClick={() => setAuto((current) => !current)}
            title={auto ? "pause the loop" : "resume the loop"}
          >
            {auto ? "⏸ auto" : "▶ auto"}
          </button>
        </div>
      </div>

      <div className="demo-chips">
        {EXAMPLES.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`chip${i === index ? " active" : ""}`}
            onClick={() => pick(i)}
          >
            {item.chip}
          </button>
        ))}
      </div>

      {auto ? (
        <div
          key={`${index}-${phase}-progress`}
          className="demo-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      ) : (
        <div className="demo-progress idle" />
      )}

      <div className="demo-grid">
        <div className="editor">
          <div className="editor-bar">
            <span className="editor-tab">
              <span className="dot" />
              {fileName}
            </span>
            <span className={`state-tag ${phase}`}>
              {phase === "before" ? "✗ unidiomatic" : "✓ the bun way"}
            </span>
          </div>
          <pre key={`${index}-${phase}`} className="demo-code">
            {code.map((line, i) => (
              <div
                key={i}
                className={`line${line.kind ? ` line-${line.kind}` : ""}`}
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <span className="gutter">
                  {line.kind === "bad" ? "−" : line.kind === "good" ? "+" : " "}
                </span>
                <span className="line-text">{line.text || " "}</span>
              </div>
            ))}
          </pre>
        </div>

        <div className="lint">
          <div className="lint-head">
            <span className="lint-prompt">$</span> bun lint --no-script
          </div>
          <pre key={`${index}-${phase}-lint`} className="lint-out">
            {lintOut.map((line, i) => (
              <div
                key={i}
                className={`lint-line${phase === "after" ? " clean" : ""}`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {line || " "}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
