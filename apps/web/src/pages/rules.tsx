import { DocsPage, CodeBlock, Callout, Code, Link } from "../ui";

type WrongMark = { find: string; occurrence?: number; message: string };

type Rule = {
  id: string;
  level: "error" | "warn";
  why: string;
  wrong: string;
  right: string;
  doc: string;
  wrongMarks?: WrongMark[];
};

function findRange(code: string, find: string, occurrence = 0): [number, number] | undefined {
  let index = -1;
  for (let attempt = 0; attempt <= occurrence; attempt++) {
    index = code.indexOf(find, index + 1);
    if (index === -1) return undefined;
  }
  return [index, index + find.length];
}

const RULES: Rule[] = [
  {
    id: "bunkeeper/no-dotenv",
    level: "error",
    why: "Bun loads .env, .env.local and .env.<NODE_ENV> automatically. dotenv is redundant weight and a dependency you can delete.",
    wrong: `import "dotenv/config";
import { config } from "dotenv";
config();`,
    right: `console.log(Bun.env.API_KEY);`,
    doc: "https://github.com/dvaJi/bunkeeper/blob/main/packages/bunkeeper/docs/rules/no-dotenv.md",
    wrongMarks: [{ find: "dotenv/config", message: "Bun loads .env files automatically" }],
  },
  {
    id: "bunkeeper/no-process-env",
    level: "warn",
    why: "Bun.env is the same variables, typed by bun-types, and honest about which runtime the code targets.",
    wrong: `const port = process.env.PORT;`,
    right: `const port = Bun.env.PORT;`,
    doc: "https://github.com/dvaJi/bunkeeper/blob/main/packages/bunkeeper/docs/rules/no-process-env.md",
    wrongMarks: [{ find: "process.env", message: "Use Bun.env" }],
  },
  {
    id: "bunkeeper/prefer-bun-file",
    level: "warn",
    why: "Lazy handles, no encoding arguments, faster reads. Tracks aliases too: import fs from node:fs, import * as fs, const fs = require(node:fs).",
    wrong: `import { readFileSync } from "node:fs";
const text = readFileSync("config.toml", "utf8");`,
    right: `const text = await Bun.file("config.toml").text();`,
    doc: "https://github.com/dvaJi/bunkeeper/blob/main/packages/bunkeeper/docs/rules/prefer-bun-file.md",
    wrongMarks: [{ find: "readFileSync", occurrence: 1, message: "await Bun.file(path).text()" }],
  },
  {
    id: "bunkeeper/prefer-bun-write",
    level: "warn",
    why: "One call handles paths, BunFile handles, blobs, arrays and strings, and resolves to the bytes written.",
    wrong: `import { writeFileSync } from "node:fs";
writeFileSync("out.txt", data);`,
    right: `await Bun.write("out.txt", data);`,
    doc: "https://github.com/dvaJi/bunkeeper/blob/main/packages/bunkeeper/docs/rules/prefer-bun-write.md",
    wrongMarks: [{ find: "writeFileSync", message: "await Bun.write(path, data)" }],
  },
  {
    id: "bunkeeper/no-node-fetch",
    level: "warn",
    why: "fetch, Headers, Request, Response and FormData are globals in Bun — spec-compliant and fast. The imports and the dependency are dead weight.",
    wrong: `import fetch from "node-fetch";
import { fetch, Headers } from "undici";`,
    right: `const res = await fetch("https://example.com");`,
    doc: "https://github.com/dvaJi/bunkeeper/blob/main/packages/bunkeeper/docs/rules/no-node-fetch.md",
    wrongMarks: [{ find: "node-fetch", message: "fetch is a global in Bun" }],
  },
  {
    id: "bunkeeper/prefer-bun-sleep",
    level: "warn",
    why: "The promise-wrapped setTimeout idiom collapses to one call. Autofixable, including non-literal durations.",
    wrong: `await new Promise((resolve) => setTimeout(resolve, 250));`,
    right: `await Bun.sleep(250);`,
    doc: "https://github.com/dvaJi/bunkeeper/blob/main/packages/bunkeeper/docs/rules/prefer-bun-sleep.md",
    wrongMarks: [{ find: "setTimeout", message: "Bun.sleep(250)" }],
  },
];

export function Rules() {
  return (
    <DocsPage
      title="Rules"
      description="Bun's 1,000+ built-in rules curated by the preset, plus six bunkeeper rules that keep code honest about being Bun code."
    >
      <h2>Built-in categories</h2>
      <p>
        <Code>bun lint</Code> ships rules ported from ESLint, typescript-eslint, React, import,
        unicorn, jsx-a11y, Jest and Vitest — plus type-aware rules without the typescript package.
        The preset switches whole categories on instead of listing hundreds of rules. See{" "}
        <Link to="/docs/presets">Presets</Link> for the exact levels.
      </p>

      <h2>bunkeeper rules</h2>
      <p>
        Loaded as a zero-dependency plugin through <Code>bunfig.toml</Code>. Every rule message
        tells you what to do instead, and links to a doc page.
      </p>
      {RULES.map((rule) => {
        const ranges = (rule.wrongMarks ?? [])
          .map((mark) => {
            const range = findRange(rule.wrong, mark.find, mark.occurrence ?? 0);
            return range ? { range, message: mark.message } : null;
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
        return (
          <div className="rule-card" key={rule.id}>
            <div className="rule-head">
              <code className="rule-id">{rule.id}</code>
              <span className={`badge ${rule.level}`}>{rule.level}</span>
            </div>
            <p>{rule.why}</p>
            <div className="compare">
              <CodeBlock title="wrong" ranges={ranges}>
                {rule.wrong}
              </CodeBlock>
              <CodeBlock title="right" ins={[1]}>
                {rule.right}
              </CodeBlock>
            </div>
            <a className="dim small" href={rule.doc} target="_blank" rel="noreferrer">
              Full documentation ↗
            </a>
          </div>
        );
      })}

      <Callout>
        Rule ideas welcome — especially ones that catch Node-isms in Bun code. Each rule needs: the
        visitor, the message with the fix, a docs page, and a fixture in the test suite.
      </Callout>
    </DocsPage>
  );
}
