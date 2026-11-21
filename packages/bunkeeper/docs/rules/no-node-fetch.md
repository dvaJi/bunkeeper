# bunkeeper/no-node-fetch

Flags `node-fetch` imports/requires, and `undici` imports whose specifiers are all fetch globals (`fetch`, `Headers`, `Request`, `Response`, `FormData`).

Bun ships all of them as globals, spec-compliant and fast. The imports are dead weight and the dependencies are dead weight.

## Wrong

```ts
import fetch from "node-fetch";
import { fetch, Headers } from "undici";
```

## Right

```ts
const res = await fetch("https://example.com");
```
