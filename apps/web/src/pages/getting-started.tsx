import { DocsPage, CodeBlock, Table, Callout, Code } from "../ui";

export function GettingStarted() {
  return (
    <DocsPage
      title="Getting started"
      description="bunkeeper init wires the preset into any project with a package.json. Re-run it any time — it is idempotent."
    >
      <h2>Requirements</h2>
      <Table
        head={["Tool", "Needed for"]}
        rows={[
          [<Code>Bun ≥ 1.4.4</Code>, "bun fmt, bun check"],
          [<Code>Bun ≥ 1.4.6 canary</Code>, "bun lint (the full preset)"],
        ]}
      />
      <Callout>
        <Code>bun lint</Code> was reverted from the stable channel and is back on main. Until the
        next stable ships it, run <Code>bun upgrade --canary</Code> — and{" "}
        <Code>bun upgrade --stable</Code> to go back. On stable, init still wires everything and{" "}
        <Code>doctor</Code> tells you what is missing.
      </Callout>

      <h2>Initialize</h2>
      <CodeBlock title="terminal">{`bunx bunkeeper init

# non-interactive, CI-friendly
bunx bunkeeper init --yes --strict --type-aware`}</CodeBlock>

      <p>Flags:</p>
      <Table
        head={["Flag", "What it does"]}
        rows={[
          [<Code>--yes</Code>, "defaults, no prompts"],
          [<Code>--strict</Code>, "extend configs/strict.json instead of recommended"],
          [<Code>--type-aware</Code>, "enable bun lint type-aware rules"],
          [<Code>--skip-install</Code>, "configure without running bun add"],
        ]}
      />

      <h2>What it writes</h2>

      <h3>.oxlintrc.json</h3>
      <CodeBlock>{`{
  "extends": ["./node_modules/bunkeeper/configs/recommended.json"]
}`}</CodeBlock>
      <p>
        Existing config? It merges — your <Code>extends</Code> and <Code>rules</Code> win.
      </p>

      <h3>bunfig.toml</h3>
      <CodeBlock>{`# bunkeeper:start
[fmt]
printWidth = 100

[lint]
plugins = ["./node_modules/bunkeeper/plugin/index.js"]

[lint.rules]
"bunkeeper/no-dotenv" = "error"
"bunkeeper/no-process-env" = "warn"
"bunkeeper/prefer-bun-file" = "warn"
"bunkeeper/prefer-bun-write" = "warn"
"bunkeeper/no-node-fetch" = "warn"
"bunkeeper/prefer-bun-sleep" = "warn"
# bunkeeper:end`}</CodeBlock>
      <p>Everything between the markers is bunkeeper's — re-runs replace it, never duplicate it.</p>

      <h3>package.json scripts</h3>
      <CodeBlock>{`{
  "lint": "bun lint --no-script",
  "lint:fix": "bun lint --fix --no-script",
  "fmt": "bun fmt",
  "fmt:check": "bun fmt --check",
  "check": "bun fmt --check && bun lint --no-script"
}`}</CodeBlock>
      <Callout>
        <Code>--no-script</Code> matters: a plain <Code>lint: bun lint</Code> script infinitely
        recurses on bun builds that have no linter (stable 1.4.4 / 1.4.5). This form fails fast and
        clearly instead.
      </Callout>

      <h3>.github/workflows/check.yml</h3>
      <CodeBlock title=".github/workflows/check.yml">{`- uses: oven-sh/setup-bun@v2
  with:
    bun-version: canary
- run: bun install --frozen-lockfile
- run: bun fmt --check
- run: bun lint --no-script --max-warnings 0
- run: bun test`}</CodeBlock>

      <h3>AGENTS.md</h3>
      <p>
        A marked section that teaches AI agents the house rules: format and lint commands,
        bun-native API requirements, and the no-second-formatter rule. Models read it in the same
        loop that generates code, so the fix lands where the violation happened.
      </p>

      <h2>Verify</h2>
      <CodeBlock title="terminal">{`bunx bunkeeper doctor

✓ bun 1.4.6-canary.20261120.1 — canary channel
✓ bun lint
✓ bun fmt
✓ bun check
✓ .oxlintrc.json extends bunkeeper preset
✓ bunfig.toml loads the bunkeeper plugin
✓ bunkeeper installed in this project
✓ package.json scripts wired (lint, check)
✓ preset loads

9 ok, 0 warnings, 0 failures`}</CodeBlock>
    </DocsPage>
  );
}
