# Benchmark Methodology

Benchmarks in this repository are for regression tracking and workload comparison. They are not universal proof that one library is always faster.

## Principles

- Compare public APIs only.
- Keep scenarios equivalent across libraries.
- Report local machine results, Node.js version, iteration count, and workload shape.
- Prefer repeated runs before making performance claims.
- Treat large variance as a signal to inspect the benchmark before changing code.

## Current Comparison

`npm run benchmark:compare` compares SignalForge, Zustand vanilla, and Redux Toolkit across:

- Primitive updates: read current count and write next count.
- Selector reads: read a derived value without writing.
- Subscribed updates: update state with an active subscriber.

These workloads intentionally separate raw object reads from reactive propagation. Zustand and Redux can be faster at plain selector reads because they read plain objects. SignalForge is optimized for fine-grained reactive updates and precise subscriptions.

## Before Publishing Claims

Run:

```bash
npm run build
npm run benchmark:compare
npm run test:all
```

Then record:

- CPU and operating system.
- Node.js version.
- Library versions.
- Iterations and warmup count.
- The exact benchmark commit.

Do not publish benchmark claims without the methodology and source code next to the numbers.
