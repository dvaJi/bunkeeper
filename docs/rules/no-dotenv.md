# bunkeeper/no-dotenv

Flags `dotenv` imports and `dotenv.config()` calls.

Bun loads `.env`, `.env.local`, `.env.[NODE_ENV]` and `.env.[NODE_ENV].local` automatically at startup. The `dotenv` package, its `dotenv/config` side-effect import, and `dotenv-expand` are all redundant.

## Wrong

```ts
import "dotenv/config";
import { config } from "dotenv";
config();
```

## Right

```ts
console.log(Bun.env.API_KEY);
```

Delete the dependency too: `bun remove dotenv`.
