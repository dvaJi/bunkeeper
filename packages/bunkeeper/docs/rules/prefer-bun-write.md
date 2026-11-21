# bunkeeper/prefer-bun-write

Flags writes through `node:fs`: `fs.writeFile`, `fs.writeFileSync`, `fs.promises.writeFile` — including any local alias created by `require` or `import`.

Use `Bun.write()` instead: a single call handles destination paths, `BunFile` handles, blobs, arrays and strings, and resolves to the number of bytes written.

## Wrong

```ts
import { writeFileSync } from "node:fs";
writeFileSync("out.txt", data);

await fs.promises.writeFile(path, buffer);
```

## Right

```ts
await Bun.write("out.txt", data);
await Bun.write(path, buffer);
```
