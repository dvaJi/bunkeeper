import { Link } from "@tanstack/react-router";
import { DocsPage, CodeBlock, Table, Callout, Code } from "../ui";

export function Presets() {
  return (
    <DocsPage
      title="Presets"
      description="Two tiers: recommended keeps signal high out of the box, strict turns on the opinionated categories. Both are plain JSON you extend and override."
    >
      <h2>Tiers</h2>
      <Table
        head={["Preset", "File", "For"]}
        rows={[
          [
            <Code>recommended</Code>,
            <Code>configs/recommended.json</Code>,
            "default — bugs are errors, noise is off",
          ],
          [
            <Code>strict</Code>,
            <Code>configs/strict.json</Code>,
            "extends recommended + style, pedantic, restriction",
          ],
        ]}
      />
      <CodeBlock title="bunx bunkeeper init">{`bunx bunkeeper init --strict`}</CodeBlock>

      <h2>recommended</h2>
      <Table
        head={["Category", "Level", "Covers"]}
        rows={[
          [
            <Code>correctness</Code>,
            <Code>error</Code>,
            "real bugs: for-direction, no-unused-vars, unreachable code",
          ],
          [
            <Code>suspicious</Code>,
            <Code>error</Code>,
            "likely bugs: no-confusing-void-expression, no-self-compare",
          ],
          [
            <Code>perf</Code>,
            <Code>warn</Code>,
            "performance smells: no-accumulating-spread, no-img-element",
          ],
        ]}
      />
      <p>Plus a curated layer:</p>
      <Table
        head={["Rule", "Level", "Why"]}
        rows={[
          [
            <span>
              <Code>eqeqeq</Code> <span className="dim">(smart)</span>
            </span>,
            <Code>error</Code>,
            "== hides coercions; smart still allows == null",
          ],
          [<Code>no-alert</Code>, <Code>error</Code>, "alerts belong in prototypes, not apps"],
          [<Code>no-debugger</Code>, <Code>error</Code>, "never ships"],
          [
            <Code>@typescript-eslint/no-unused-vars</Code>,
            <Code>error</Code>,
            "underscore-prefixed args and vars are allowed",
          ],
          [
            <Code>@typescript-eslint/consistent-type-imports</Code>,
            <Code>warn</Code>,
            "import type stays explicit",
          ],
          [
            <Code>unicorn/prefer-top-level-await</Code>,
            <Code>warn</Code>,
            "top-level await over .then chains",
          ],
        ]}
      />

      <h2>strict</h2>
      <p>
        Everything in recommended, plus the <Code>style</Code>, <Code>pedantic</Code> and{" "}
        <Code>restriction</Code> categories, <Code>no-console</Code> (warn, error allowed),{" "}
        <Code>unicorn/no-null</Code>, <Code>unicorn/prefer-node-protocol</Code> and{" "}
        <Code>unicorn/filename-case</Code>. The style category's loudest rules (<Code>one-var</Code>
        , <Code>sort-imports</Code>, <Code>sort-keys</Code>, <Code>no-magic-numbers</Code>) stay off
        even in strict — formatting is <Code>bun fmt</Code>'s job.
      </p>

      <h2>Overriding</h2>
      <p>Both presets are ordinary oxlint-format configs. Extend one and set any rule after it:</p>
      <CodeBlock title=".oxlintrc.json" highlightLines={[4, 5]}>{`{
  "extends": ["./node_modules/bunkeeper/configs/recommended.json"],
  "rules": {
    "no-console": "off",
    "unicorn/no-null": "error"
  }
}`}</CodeBlock>
      <p>
        Your <Code>extends</Code> and <Code>rules</Code> always win over the preset — init merges
        them and keeps yours last.
      </p>

      <h2>Agent shortcut rules</h2>
      <p>
        bunkeeper ships its own agent-facing rules (<Link to="/docs/rules">see Rules</Link>), writes
        an <Code>AGENTS.md</Code> section on init, and fails CI on warnings — so the agent's loop
        closes on the same signal a human sees.
      </p>
      <p>
        To stack full agent-behaviour rulesets on top —{" "}
        <a href="https://github.com/interfere-inc/landmines" target="_blank" rel="noreferrer">
          landmines
        </a>{" "}
        for test honesty (no test doubles, no fixed sleeps, no flake masking) and{" "}
        <a href="https://github.com/dmmulroy/anti-slop" target="_blank" rel="noreferrer">
          anti-slop
        </a>{" "}
        for type honesty — see <Link to="/docs/agents">Agent rules</Link>. The short version:
        <Code>init --js-plugins landmines</Code> wires landmines into your existing config.
      </p>
      <Callout>
        Plugins are loaded once under a name. Load them either in <Code>.oxlintrc.json</Code> or in{" "}
        <Code>bunfig.toml</Code>, not both. bunkeeper's own plugin already loads through{" "}
        <Code>bunfig.toml</Code> — leave that one alone.
      </Callout>
    </DocsPage>
  );
}
