# bunkeeper/prefer-bun-sleep

Flags the promise-wrapped `setTimeout` sleep idiom and fixes it to `Bun.sleep()`.

## Wrong

```ts
await new Promise((resolve) => setTimeout(resolve, 250));
```

## Right

```ts
await Bun.sleep(250);
```

The fixer replaces the whole expression, including non-literal durations like `Bun.sleep(retryMs)`. Both accept a number of milliseconds or a `Date` (`Bun.sleepUntil` also exists).
