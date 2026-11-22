import { DocsPage, CodeBlock, Table, Callout, Code } from "../ui";

export function Agents() {
  return (
    <DocsPage
      title="Agent rules"
      description="bunkeeper keeps code honest about its runtime. These plugins keep AI-generated code honest about its behavior — real implementations, real signals, no flake masking."
    >
      <Callout>
        Both plugins run inside your existing <Code>bun lint</Code> loop — bunkeeper's preset,
        bunkeeper's API rules and these plugins are one report. Verified with bun 1.4.6-canary.
      </Callout>

      <h2>landmines</h2>
      <p>
        <a href="https://github.com/interfere-inc/landmines" target="_blank" rel="noreferrer">
          @interfere/landmines
        </a>{" "}
        ships oxlint rules that reject the classic agent moves: mocking the thing under test,
        sleeping until a race usually goes your way, retrying the flake, raising the timeout.
      </p>

      <h3>Install</h3>
      <CodeBlock title="terminal">{`bunx bunkeeper init --js-plugins landmines`}</CodeBlock>
      <p>
        init adds <Code>@interfere/landmines</Code> to devDependencies and extends your{" "}
        <Code>.oxlintrc.json</Code> with its recommended config. Manually:
      </p>
      <CodeBlock title=".oxlintrc.json" highlightLines={[4]}>{`{
  "extends": [
    "./node_modules/bunkeeper/configs/recommended.json",
    "./node_modules/@interfere/landmines/configs/recommended.json"
  ]
}`}</CodeBlock>

      <h3>Rules</h3>
      <Table
        head={["Group", "Rule", "What it stops"]}
        rows={[
          [
            "testing",
            <Code>no-test-doubles</Code>,
            "module mocks, vi.fn(impl), stubbed globals — use the real implementation and MSW",
          ],
          [
            "testing",
            <Code>strict-msw</Code>,
            'MSW without onUnhandledRequest: "error", so unmocked requests reach the network',
          ],
          [
            "testing",
            <Code>no-fixed-sleep</Code>,
            "awaiting a fixed delay in a test — await the operation or a signal",
          ],
          [
            "testing",
            <Code>no-unsignaled-poll</Code>,
            "expect.poll / vi.waitFor racing a deadline instead of awaiting an event",
          ],
          [
            "testing",
            <Code>no-flake-masking</Code>,
            "test retries and raised timeouts — a test that passes on rerun is a flake to fix",
          ],
          [
            "style",
            <Code>no-comments</Code>,
            "prose comments (WARNING comments and public-API TSDoc stay allowed)",
          ],
          [
            "structure",
            <Code>colocated-tests</Code>,
            "tests detached from the implementation they import",
          ],
          [
            "structure",
            <Code>test-file-names</Code>,
            ".spec.ts, helpers.ts, mocks.ts — use .test.ts, .fixture.ts, .test-utils.ts",
          ],
          [
            "structure",
            <Code>package-exports</Code>,
            'unrestricted source exports like "./*": "./src/*.ts"',
          ],
          [
            "types",
            <Code>no-explicit-return-types</Code>,
            "annotated return types on implementations — let them be inferred",
          ],
        ]}
      />
      <p className="dim small">
        Strictness per rule and per-file allowlists (for ratcheting down an existing codebase) are
        documented in the{" "}
        <a href="https://github.com/interfere-inc/landmines#rules" target="_blank" rel="noreferrer">
          landmines README
        </a>
        . Requires oxlint 1.81+ semantics — bun lint canary 1.4.6 runs these rules natively.
      </p>

      <h2>anti-slop</h2>
      <p>
        <a href="https://github.com/dmmulroy/anti-slop" target="_blank" rel="noreferrer">
          anti-slop
        </a>{" "}
        rejects low-evidence TypeScript: chained <Code>as</Code> assertions, unsafe dictionaries,{" "}
        <Code>unknown</Code> plumbing, module mocking, reducer accumulator copies. It is
        deliberately <strong>vendored, not installed</strong> — there is no npm package. You copy
        the rules in and own them.
      </p>

      <h3>Install</h3>
      <CodeBlock title="terminal">{`npx skills add dmmulroy/anti-slop --skill install-anti-slop
# then ask your agent to install it in the current repository`}</CodeBlock>
      <p>
        Or vendor by hand: copy its <Code>src/</Code> to <Code>tools/oxlint/anti-slop/</Code>, then
        register it:
      </p>
      <CodeBlock title=".oxlintrc.json">{`{
  "jsPlugins": [{ "name": "anti-slop", "specifier": "./tools/oxlint/anti-slop/index.ts" }],
  "rules": {
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-unsafe-dictionary-type": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error"
  }
}`}</CodeBlock>
      <Callout>
        anti-slop targets the oxlint toolchain. landmines is verified under <Code>bun lint</Code>{" "}
        canary; for anti-slop run <Code>bunx oxlint</Code> alongside <Code>bun lint</Code> until you
        have verified it in your setup. Note the upstream recommendation: if you only want
        broadly-adopted rules,{" "}
        <a href="https://github.com/cloudflare/oxlint-config" target="_blank" rel="noreferrer">
          cloudflare/oxlint-config
        </a>{" "}
        has adopted most of anti-slop and is actively maintained.
      </Callout>

      <h2>How they compose</h2>
      <p>
        Layered, each with a different job, one <Code>bun lint</Code> report:
      </p>
      <Table
        head={["Layer", "Job"]}
        rows={[
          [
            <span>
              <Code>bun lint</Code> built-ins + bunkeeper preset
            </span>,
            "correctness, suspicious code, perf smells",
          ],
          [
            <span>
              <Code>bunkeeper/*</Code> plugin
            </span>,
            "bun-native API honesty: Bun.file, Bun.env, no dotenv, global fetch",
          ],
          [<Code>landmines</Code>, "test honesty: no doubles, no fixed sleeps, no flake masking"],
          [<Code>anti-slop</Code>, "type honesty: no fabricated evidence, no unknown plumbing"],
        ]}
      />
      <p>
        bunkeeper's <Code>AGENTS.md</Code> section (written by init) already tells agents the
        commands; agent-rule violations show up in the same output they already watch, so the fix
        lands in the same loop.
      </p>
    </DocsPage>
  );
}
