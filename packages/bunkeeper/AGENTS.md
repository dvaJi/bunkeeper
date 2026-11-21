# bunkeeper — repo conventions

- Single npm package (`bunkeeper`): preset configs, custom-rule plugin, and CLI in one.
- Runtime is Bun only. Use `Bun.file`, `Bun.write`, `Bun.spawnSync` — the CLI dogfoods the plugin rules.
- No runtime dependencies. Ever. The preset's value is that bun itself is the toolchain.
- CLI output: plain ANSI (`src/cli/util.ts` helpers), no chalk/color libs.
- Tests: `bun test` (test/). Lint-behavior tests spawn `bun lint`; they self-skip when the running bun has no linter (stable 1.4.4/1.4.5). Set `BUNKEEPER_BUN` to a canary binary path to force them.
- Configs: `configs/recommended.json` is the oxlint-format preset users extend; `configs/strict.json` extends it. Custom rules live in `plugin/index.js` (ESLint plugin API, no deps) and load through `bunfig.toml` `[lint] plugins`.
- Rule docs: `docs/rules/<rule>.md`, one page per custom rule, always written when a rule changes.
- `bunkeeper:start` / `bunkeeper:end` markers in generated `bunfig.toml` and `AGENTS.md` blocks are load-bearing for re-runs of `bunkeeper init` — never drop them from templates.
