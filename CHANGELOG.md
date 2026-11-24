# Changelog

All notable changes to `bunkeeper` are documented here. Releases are cut by pushing a `v*` tag (see [CONTRIBUTING.md](CONTRIBUTING.md)); npm versions and GitHub releases are generated from tags.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — initial public release

- `bunkeeper init` — wire the preset into a project: `.oxlintrc.json` extending the bunkeeper preset, `bunfig.toml` fmt + lint block, package scripts, `.github/workflows/check.yml`, `AGENTS.md` section. Idempotent and merge-safe.
- `bunkeeper doctor` — verify the bun toolchain (fmt / check / lint support) and the bunkeeper wiring.
- Preset configs: `configs/recommended.json` and `configs/strict.json` (oxlint-format, extended by your own `.oxlintrc.json`).
- Custom-rule plugin with six bun-native API rules: `no-dotenv`, `no-process-env`, `prefer-bun-file`, `prefer-bun-write`, `no-node-fetch`, `prefer-bun-sleep` (autofix), each with a doc page in `docs/rules/`.
- CI template on canary bun (`fmt`, `lint --max-warnings 0`, `test`).
