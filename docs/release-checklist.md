# Release Checklist

Use this checklist before publishing SignalForge.

## Required Local Checks

```bash
npm ci
npm run build
npm run test:all
npm run test:package
npm run test:package-contents
npm run audit:high
npm run size
npm run build --prefix examples/react-store
npm audit --prefix examples/react-store
```

## Public API

- Review `tests/api-snapshot.test.ts` for intentional API changes.
- Keep root `signalforge` focused on core, store, and React essentials.
- Put utilities, plugins, devtools, profiler, and minimal APIs behind subpath imports.
- Update `README.md`, `docs/API.md`, and `CHANGELOG.md` for every public API change.

## Package Contents

- `npm run test:package-contents` must pass.
- Confirm generated artifacts are built from the latest source.
- Confirm examples, tests, benchmarks, local logs, and CI config are not included in the npm package.

## Publishing

Use the manual GitHub Release workflow. Run with `dry_run=true` first. Publish with `dry_run=false` only after the dry run succeeds and `CHANGELOG.md` is current.
