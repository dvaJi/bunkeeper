import { DocsPage, CodeBlock, Table, Code } from "../ui";

export function CliPage() {
  return (
    <DocsPage
      title="CLI"
      description="Two commands. init wires the preset in, doctor verifies it. Both are safe to re-run and CI-friendly."
    >
      <h2>bunkeeper init</h2>
      <CodeBlock title="terminal">{`bunx bunkeeper init [options]`}</CodeBlock>
      <Table
        head={["Flag", "Description"]}
        rows={[
          [<Code>--yes</Code>, "take the defaults, no prompts"],
          [<Code>--strict</Code>, "extend configs/strict.json instead of recommended"],
          [<Code>--type-aware</Code>, "enable bun lint type-aware rules (slower, catches more)"],
          [<Code>--skip-install</Code>, "configure without running bun add"],
          [<Code>-h</Code>, "help"],
          [<Code>-v</Code>, "version"],
        ]}
      />
      <p>
        What init touches, and what it never touches: it merges <Code>.oxlintrc.json</Code> (your
        rules win), writes a marked block in <Code>bunfig.toml</Code>, fills only missing{" "}
        <Code>package.json</Code> scripts, creates <Code>.github/workflows/check.yml</Code> only if
        absent, and appends a marked section to <Code>AGENTS.md</Code>.
      </p>

      <h2>bunkeeper doctor</h2>
      <CodeBlock title="terminal">{`bunx bunkeeper doctor`}</CodeBlock>
      <p>Checks, in order:</p>
      <Table
        head={["Check", "Passes when"]}
        rows={[
          [<Code>bun version</Code>, "parseable, prints the channel"],
          [<Code>bun lint</Code>, "this build has the linter (canary or next stable)"],
          [<Code>bun fmt</Code>, "formatter available"],
          [<Code>bun check</Code>, "type checker available (bun ≥ 1.4.3)"],
          [<Code>preset extends</Code>, ".oxlintrc.json extends a bunkeeper config"],
          [<Code>plugin loads</Code>, "bunfig.toml points at the bunkeeper plugin"],
          [<Code>installed</Code>, "bunkeeper is in node_modules"],
          [<Code>scripts wired</Code>, "lint and check scripts call bun lint"],
          [<Code>preset loads</Code>, "bun lint resolves the extended config"],
        ]}
      />
      <p>
        Exit code is <Code>1</Code> only on failures (red). Warnings (yellow) mean "works, but
        degraded" — for example fmt configured on a stable bun that has no linter yet.
      </p>

      <h2>Using the presets without the CLI</h2>
      <CodeBlock title=".oxlintrc.json">{`{
  "extends": ["./node_modules/bunkeeper/configs/recommended.json"]
}`}</CodeBlock>
      <CodeBlock title="bunfig.toml">{`[lint]
plugins = ["./node_modules/bunkeeper/plugin/index.js"]

[fmt]
printWidth = 100`}</CodeBlock>
    </DocsPage>
  );
}
