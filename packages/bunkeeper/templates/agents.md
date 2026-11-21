<!-- bunkeeper:start -->

## Code style — bunkeeper

- Format with `bun fmt`, check with `bun fmt --check`. Never add Prettier, ESLint, oxlint or Biome.
- Lint with `bun lint --no-script`, auto-fix with `bun lint --fix --no-script`. CI runs `bun lint --no-script --max-warnings 0`, so warnings fail.
- Use Bun-native APIs: `Bun.file()` / `Bun.write()` instead of `node:fs`, `Bun.env` instead of `process.env`, no dotenv (Bun loads .env files), global `fetch` (no node-fetch/undici), `Bun.sleep(ms)` instead of promise-wrapped `setTimeout`.
- Types are checked with `bun check` (no `typescript` package needed).

<!-- bunkeeper:end -->
