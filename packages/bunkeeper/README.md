# bunkeeper

**The zero-config lint and format preset for Bun.**

One command wires up `bun lint`, `bun fmt` and a set of bun-native API rules — no ESLint, no Prettier, no oxlint, no Biome, no config to learn. Bun itself is the toolchain; bunkeeper just makes it strict.

**Docs: [bunkeeper.aipurrjects.xyz](https://bunkeeper.aipurrjects.xyz)**

```sh
bunx bunkeeper init
```

```txt
✓ bun 1.4.6-canary has bun lint
✓ installed bunkeeper as a devDependency
✓ created .oxlintrc.json extending the bunkeeper preset
✓ created bunfig.toml with bunkeeper fmt and lint config
✓ added scripts: lint, lint:fix, fmt, fmt:check, check
✓ created .github/workflows/check.yml (bun canary + fmt, lint, test)
✓ created AGENTS.md with the bunkeeper section

Done. Run bun doctor to verify the setup.
```

## Why

Bun ships a Prettier-compatible formatter, an ESLint-compatible linter with 1,000+ built-in rules, and a Rust type checker. They are faster than everything they replace and they read zero config by default. What's missing is the last mile: which of those rules should be on, how strict, wired into your scripts, your CI, and your AI agents — and someone to say "you're in a Bun project, stop importing `node:fs`".

That's what bunkeeper does. It is [Ultracite](https://github.com/haydenbleasel/ultracite) for the Bun toolchain: opinionated defaults, one command, override anything.

## Requirements

| Bun            | fmt | check | lint |
| -------------- | --- | ----- | ---- |
| ≥ 1.4.4 stable | ✓   | ✓     | —    |
| ≥ 1.4.6 canary | ✓   | ✓     | ✓    |

`bun lint` was reverted from the stable channel and is back on `main` (shipped in canary since 1.4.6). Until it reaches stable, bunkeeper works best on canary: `bun upgrade --canary` (switch back any time with `bun upgrade --stable`). `bunkeeper doctor` tells you exactly what your build supports, and `init` degrades gracefully on stable — fmt config, scripts, CI and agent files are wired either way.

## Commands

| Command            | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `bunkeeper init`   | Wire the preset into the current project. Re-run any time. |
| `bunkeeper doctor` | Verify the bun toolchain and the bunkeeper wiring.         |

### init flags

| Flag                     | Description                                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--yes`, `-y`            | Defaults, no prompts                                                                                                                               |
| `--strict`               | Extend `configs/strict.json` (adds pedantic + restriction categories)                                                                              |
| `--type-aware`           | Turn on `bun lint` type-aware rules (slower, catches more)                                                                                         |
| `--js-plugins landmines` | Add [landmines](https://github.com/interfere-inc/landmines) agent-honesty rules — see [Agent rules](https://bunkeeper.aipurrjects.xyz/docs/agents) |
| `--skip-install`         | Configure without running `bun add`                                                                                                                |

## What init sets up

**`.oxlintrc.json`** — extends the preset:

```json
{
  "extends": ["./node_modules/bunkeeper/configs/recommended.json"]
}
```

The preset turns on Bun's built-in categories — `correctness` and `suspicious` as errors, `perf` and `style` as warnings — plus a curated list (`eqeqeq`, `no-alert`, `no-debugger`, `consistent-type-imports`, tuned `no-unused-vars`, ...). Existing config? It merges: your extends and rules win.

**`bunfig.toml`** — a marked block with:

```toml
[fmt]
printWidth = 100

[lint]
plugins = ["./node_modules/bunkeeper/plugin/index.js"]

[lint.rules]
"bunkeeper/no-dotenv" = "error"
"bunkeeper/no-process-env" = "warn"
...
```

**`package.json`** — missing scripts only (`--no-script` keeps a stable bun from re-running the script forever when its build has no linter):

```json
{
  "lint": "bun lint --no-script",
  "lint:fix": "bun lint --fix --no-script",
  "fmt": "bun fmt",
  "fmt:check": "bun fmt --check",
  "check": "bun fmt --check && bun lint --no-script"
}
```

**`.github/workflows/check.yml`** — CI on canary bun: `bun fmt --check`, `bun lint --max-warnings 0` (warnings fail), `bun test`.

**`AGENTS.md`** — a marked section telling AI agents the rules of the house, so the same loop that generates code also fixes it.

## Custom rules

Six rules enforce bun-idiomatic APIs, loaded as a zero-dependency plugin through `bun lint`'s plugin API. Each rule's message links to a doc page under [`docs/rules/`](https://github.com/dvaJi/bunkeeper/blob/HEAD/packages/bunkeeper/docs/rules).

| Rule                                                                                                                           | Fixes                                                  | Default |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------- |
| [`bunkeeper/no-dotenv`](https://github.com/dvaJi/bunkeeper/blob/HEAD/packages/bunkeeper/docs/rules/no-dotenv.md)               | Bun loads `.env` files automatically — delete dotenv   | error   |
| [`bunkeeper/no-process-env`](https://github.com/dvaJi/bunkeeper/blob/HEAD/packages/bunkeeper/docs/rules/no-process-env.md)     | Use `Bun.env`                                          | warn    |
| [`bunkeeper/prefer-bun-file`](https://github.com/dvaJi/bunkeeper/blob/HEAD/packages/bunkeeper/docs/rules/prefer-bun-file.md)   | `fs.readFile`/`readFileSync` → `Bun.file()`            | warn    |
| [`bunkeeper/prefer-bun-write`](https://github.com/dvaJi/bunkeeper/blob/HEAD/packages/bunkeeper/docs/rules/prefer-bun-write.md) | `fs.writeFile`/`writeFileSync` → `Bun.write()`         | warn    |
| [`bunkeeper/no-node-fetch`](https://github.com/dvaJi/bunkeeper/blob/HEAD/packages/bunkeeper/docs/rules/no-node-fetch.md)       | `fetch` is a global — delete node-fetch/undici         | warn    |
| [`bunkeeper/prefer-bun-sleep`](https://github.com/dvaJi/bunkeeper/blob/HEAD/packages/bunkeeper/docs/rules/prefer-bun-sleep.md) | promise-wrapped `setTimeout` → `Bun.sleep()` (autofix) | warn    |

Tracking fs through aliases is supported: `import fs from "node:fs"`, `import * as fs`, `const fs = require("node:fs")`, and named imports like `import { readFileSync } from "node:fs"` all get caught.

## Using the presets directly

No CLI? Point your own config at the files:

```jsonc
// .oxlintrc.json
{
  "extends": ["./node_modules/bunkeeper/configs/recommended.json"],
}
```

```toml
# bunfig.toml
[lint]
plugins = ["./node_modules/bunkeeper/plugin/index.js"]

[fmt]
printWidth = 100
```

Or go strict: `configs/strict.json` extends recommended with `pedantic` and `restriction` categories and `no-console`.

## Philosophy

1. **The toolchain is Bun.** No lint/format dependency ships with bunkeeper. If Bun adds a rule natively, you get it on upgrade — no package bump.
2. **Opinionated, but honest.** Defaults catch real bugs and bun-unidiomatic code; everything is overridable in files you already own.
3. **Agents are first-class users.** Every rule message says what to do instead, CI fails loudly, and `AGENTS.md` keeps models in the loop.
4. **Re-runnable.** `init` is idempotent: marked blocks are replaced, never duplicated; your files are merged, never clobbered.

## Repository layout

```
packages/bunkeeper/   the npm package: preset configs, custom-rule plugin, CLI
apps/web/             docs site (React + Bun.build, deployed to bunkeeper.aipurrjects.xyz via Alchemy)
```

## Contributing

```sh
bun install
bun test            # runs against `bun`; set BUNKEEPER_BUN=/path/to/canary-bun to test bun lint behavior
bun fmt
bun lint
```

Lint-behavior tests self-skip when the running bun build has no linter.

## License

MIT
