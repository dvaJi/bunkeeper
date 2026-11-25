# bunkeeper

[![Check](https://github.com/dvaJi/bunkeeper/actions/workflows/check.yml/badge.svg)](https://github.com/dvaJi/bunkeeper/actions/workflows/check.yml)
[![Release](https://github.com/dvaJi/bunkeeper/actions/workflows/release.yml/badge.svg)](https://github.com/dvaJi/bunkeeper/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/bunkeeper)](https://www.npmjs.com/package/bunkeeper)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

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

## Custom rules

Six rules enforce bun-idiomatic APIs, loaded as a zero-dependency plugin through `bun lint`'s plugin API:

| Rule                         | Fixes                                                  | Default |
| ---------------------------- | ------------------------------------------------------ | ------- |
| `bunkeeper/no-dotenv`        | Bun loads `.env` files automatically — delete dotenv   | error   |
| `bunkeeper/no-process-env`   | Use `Bun.env`                                          | warn    |
| `bunkeeper/prefer-bun-file`  | `fs.readFile`/`readFileSync` → `Bun.file()`            | warn    |
| `bunkeeper/prefer-bun-write` | `fs.writeFile`/`writeFileSync` → `Bun.write()`         | warn    |
| `bunkeeper/no-node-fetch`    | `fetch` is a global — delete node-fetch/undici         | warn    |
| `bunkeeper/prefer-bun-sleep` | promise-wrapped `setTimeout` → `Bun.sleep()` (autofix) | warn    |

Full rule docs live in [`packages/bunkeeper/docs/rules/`](packages/bunkeeper/docs/rules/) and ship inside the npm package.

## Repository layout

```
packages/bunkeeper/   the npm package: preset configs, custom-rule plugin, CLI
apps/web/             docs site (React + Bun.build, deployed via Alchemy)
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, conventions, and how releases are cut.

```sh
bun install
bun test            # lint-behavior tests self-skip on stable bun
bun fmt
bun lint
```

## Support & security

- Bug reports and feature requests: [open an issue](https://github.com/dvaJi/bunkeeper/issues/new/choose)
- Security issues: see [SECURITY.md](SECURITY.md) — please don't open public issues for them.

## License

[MIT](LICENSE) — © bunkeeper contributors
