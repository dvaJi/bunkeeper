# bunkeeper/no-process-env

Flags `process.env` reads.

Use `Bun.env` instead — the same variables, typed by `bun-types`, and honest about which runtime the code targets.

## Wrong

```ts
const port = process.env.PORT;
```

## Right

```ts
const port = Bun.env.PORT;
```
