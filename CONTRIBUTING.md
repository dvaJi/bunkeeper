# Contributing to bunkeeper

Thanks for helping make bunkeeper better! This guide covers setup, project conventions, and how releases work.

## Requirements

- [Bun](https://bun.sh) — canary recommended (`bun upgrade --canary`): the linter behavior tests need a build with `bun lint`. On stable they self-skip.
- To force lint-behavior tests locally, point `BUNKEEPER_BUN` at a binary with a linter: `BUNKEEPER_BUN=/path/to/canary-bun bun test`.

## Setup

```sh
bun install
bun test
```

## Scripts

Run them from the repo root (workspaces):

| Script                 | What it does                      |
| ---------------------- | --------------------------------- |
| `bun test`             | Runs `packages/bunkeeper/test/`   |
| `bun fmt`              | Format with bun's formatter       |
| `bun fmt:check`        | CI-style format check             |
| `bun lint --no-script` | Lint with bun lint + the preset   |
| `bun lint:fix`         | Auto-fix lint issues              |
| `bun check`            | `fmt:check` + `lint`              |
| `bun web:dev`          | Docs site dev server (`apps/web`) |

CI (`.github/workflows/check.yml`) runs `bun install --frozen-lockfile`, `bun fmt --check`, `bun lint --no-script --max-warnings 0`, `bun test`, and a `bun publish --dry-run` packaging gate on every push and PR.

## Project conventions

These keep the package honest — please respect them:

- **Single npm package**: `packages/bunkeeper` is the package (preset configs, custom-rule plugin, CLI). `apps/web` is the docs site.
- **Runtime is Bun only.** Use `Bun.file`, `Bun.write`, `Bun.spawnSync` — no `node:fs`, no `process.env`.
- **No runtime dependencies. Ever.** The preset's value is that bun itself is the toolchain.
- **CLI output uses plain ANSI** via `src/cli/util.ts` helpers — no chalk/color libs.
- **Rule docs**: every custom rule has `docs/rules/<rule>.md`. If you add or change a rule, write/update its page.
- **Template markers**: `bunkeeper:start` / `bunkeeper:end` markers in `templates/` are load-bearing for re-runs of `bunkeeper init` — never drop them.
- **Configs**: `configs/recommended.json` is the oxlint-format preset; `configs/strict.json` extends it. Custom rules live in `plugin/index.js` (ESLint plugin API, zero deps).

## Pull requests

1. Fork / create a branch.
2. Make your change. Add or update tests in `packages/bunkeeper/test/` for behavior changes.
3. Run `bun check && bun test` locally.
4. Open a PR — the template asks for a summary and checklist. Keep CI green.

## Reporting bugs & proposing features

Use the [issue templates](https://github.com/dvaJi/bunkeeper/issues/new/choose). For bugs, include your `bun --version`, OS, and whether the issue happens on canary or stable.

Security issues go through [SECURITY.md](SECURITY.md), not public issues.

## Releases (maintainers)

Releases are tag-driven: pushing a `v*` tag triggers `.github/workflows/release.yml`, which verifies the tag matches `packages/bunkeeper/package.json` → `version`, runs the full check suite, publishes to npm with provenance, and creates a GitHub release with generated notes. The publish and release steps are idempotent — re-running a tag never double-publishes or double-releases.

To cut a release:

1. Bump `version` in `packages/bunkeeper/package.json` (one PR, no other pending work).
2. Update `CHANGELOG.md`.
3. Tag and push:
   ```sh
   git tag v0.2.0
   git push origin v0.2.0
   ```

One-time setup (done for 0.1.0, recorded here for reference):

- The very first version was published manually from a maintainer machine (`npm login`, then `npm publish --access public` in `packages/bunkeeper`), because npm trusted publishing requires the package to exist first.
- Configure trusted publishing on npmjs.com: package `bunkeeper` → Settings → Trusted publisher → GitHub, owner `dvaJi`, repository `bunkeeper`, workflow filename `release.yml`, environment empty. After that, tags publish via OIDC — **no `NPM_TOKEN` secret is needed** (provenance is attached automatically).
