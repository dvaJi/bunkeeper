# Security Policy

## Supported versions

bunkeeper is a young package — only the latest release receives security fixes. Update via:

```sh
bun update bunkeeper
```

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub's
[Security Advisories](https://github.com/dvaJi/bunkeeper/security/advisories/new)
("Report a vulnerability"). Do **not** open a public issue.

Include:

- A description of the issue and its impact
- Reproduction steps or a proof of concept
- Affected versions (run `bunx bunkeeper --version`... or check your `node_modules/bunkeeper/package.json`)

## Scope

- The `bunkeeper` npm package: CLI (`init`, `doctor`), preset configs, lint plugin.
- Out of scope: the docs site (`apps/web`) — report anything affecting _users' projects_ through bunkeeper itself.

## What to expect

- Acknowledgement within a few days.
- A fix and disclosure coordinated with you once the issue is understood.
