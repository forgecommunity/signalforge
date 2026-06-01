# SignalForge SEO Launch Guide

This Next.js app is the public SignalForge site and documentation surface. Keep the SEO setup factual, release-aligned, and easy to audit before every launch.

## Canonical URL

The current production URL is:

```text
https://signalforge-fogecommunity.vercel.app
```

If SignalForge moves to a custom domain, update the URL in these files in the same change:

- `app/layout.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `app/demos/metadata.ts`
- root `README.md`
- root `docs/getting-started.md`

Do not split canonical URLs across multiple domains unless there is a deliberate migration plan with redirects.

## Indexed Pages

The sitemap includes the launch-critical routes:

- `/`
- `/docs`
- `/docs/api`
- `/docs/examples`
- `/docs/benchmarks`
- `/docs/migration`
- `/docs/production`
- `/demos/array`
- `/demos/basic`
- `/demos/batch`
- `/demos/benchmark`
- `/demos/bigdata`
- `/demos/cart`
- `/demos/chains`
- `/demos/collaboration`
- `/demos/comparison`
- `/demos/computed`
- `/demos/dashboard`
- `/demos/devtools`
- `/demos/effects`
- `/demos/form`
- `/demos/hooks`
- `/demos/persistent`
- `/demos/plugin`
- `/demos/subscribe`
- `/demos/timetravel`
- `/demos/todo`
- `/demos/untrack`

When a new public route ships, add it to `app/sitemap.ts` and give it route-level metadata when the page targets a distinct search intent.

## Metadata Policy

SignalForge should rank on clear technical value, not unsupported marketing claims.

Use metadata for:

- React state management
- React Native state management
- Next.js state management
- TypeScript signals
- SSR-safe state management
- Fine-grained reactivity
- Store selectors
- DevTools and plugin debugging
- Redux and Zustand migration paths

Avoid metadata for:

- Unsupported ratings or review counts
- Unverified benchmark superiority
- Absolute ranking claims
- Placeholder search verification codes
- Demo-only routes that are not in the sitemap

## Structured Data

`app/layout.tsx` emits JSON-LD for:

- `WebSite`
- `SoftwareApplication`
- `SoftwareSourceCode`

Keep these schemas conservative. Only include fields that are true for the current release and public repository. Do not add review schemas unless there is a real public review source.

## Search Verification

Search engine verification values should come from the deployment environment or be added only after the real ownership tokens are available.

Do not commit sample verification strings for Google, Bing, or Yandex. A missing verification block is better than an invalid one.

## Launch Checks

Run these before publishing a release:

```bash
npm run build --prefix examples/sf-nextjs
npm run lint --prefix examples/sf-nextjs
npm audit --prefix examples/sf-nextjs
```

After deployment, inspect:

- `/sitemap.xml`
- `/robots.txt`
- `/manifest.webmanifest`
- Open Graph preview
- Twitter/X preview
- Google Rich Results output
- PageSpeed Insights output

Then submit the sitemap through Google Search Console and Bing Webmaster Tools.

## Content Quality

The docs site should answer production questions directly:

- How to install and start
- Which APIs are stable
- How React hooks behave under SSR and hydration
- How selectors avoid unnecessary renders
- How plugins are registered and debugged
- How benchmarks are measured
- How to migrate from common alternatives
- What is production-ready now and what is still intentionally out of scope

Keep docs and examples aligned with the package exports. If an example imports an API, that API must be exported, tested, and present in the package smoke test.

## Release Rule

Before launch, search for stale work markers and unsupported claims:

```bash
rg -n "TODO|FIXME|placeholder" README.md docs examples package.json .github -S
```

Review each result manually. Form input placeholders are fine; launch-facing placeholders are not.
