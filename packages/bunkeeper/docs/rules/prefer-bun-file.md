# bunkeeper/prefer-bun-file

Flags reads through `node:fs`: `fs.readFile`, `fs.readFileSync`, `fs.promises.readFile` — including any local alias created by `require` or `import`.

Use `Bun.file()` instead: it returns a lazy handle whose `.text()`, `.json()`, `.arrayBuffer()` and `.blob()` methods need no encoding arguments, and reads are faster in Bun.

## Wrong

```ts
import { readFileSync } from "node:fs";
const text = readFileSync("config.toml", "utf8");

import fs from "node:fs";
const data = await fs.promises.readFile(path);
```

## Right

```ts
const text = await Bun.file("config.toml").text();
const data = await Bun.file(path).json();
```

Streaming large files? `Bun.file(path).stream()` covers that too.
