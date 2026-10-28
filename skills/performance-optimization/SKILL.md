---
name: performance-optimization
description: Profile and optimize measured application performance bottlenecks. Use for slow user flows, excessive rendering, large bundles, latency, throughput, memory growth, or startup costs with before-and-after verification.
---

# Performance Optimization

Optimize an observed bottleneck under a representative workload. Do not replace
measurement with intuition or claim an improvement from code shape alone.

## Define the experiment

Read instructions, architecture, runtime versions, instrumentation, and tests.
Identify the slow user action or workload, relevant metric, target, and constraints.
Specify dataset size, concurrency, device/runtime, build mode, network, cache state,
and measurement method. Use existing telemetry and bounded local profiling; do
not load-test production or export private traces without authorization.

Capture a repeatable baseline with multiple samples when noise matters. Distinguish
startup/warm operation, median/tail behavior, CPU/wall time, allocation/retention,
and client/server/network time. Keep raw measurements and environment details in
the normal task artifact location without secrets or customer data.

## Trace the cost

Use the profiler appropriate to the actual runtime and installed tools. Follow
the critical path: input, rendering/compute, I/O, storage, serialization, and
external calls. Confirm which stage dominates before choosing a change.

Common candidates need evidence:

- Rendering: identify repeated work and actual rerender causes before memoization.
- Bundles/startup: inspect shipped chunks, imports, initialization, and lazy-load
  tradeoffs rather than comparing source file sizes.
- Queries: inspect query shape and execution evidence with representative data;
  indexes have write/storage costs. Executing query plans needs a safe target.
- Caches: specify keys, scope, invalidation, TTL, memory bound, and stale-data
  contract. Never share tenant/private data through an under-scoped key.
- Concurrency: bound queues and in-flight work; measure rate limits, contention,
  backpressure, and cancellation instead of parallelizing everything.
- Memory: distinguish temporary allocation from retained growth using comparable
  lifecycle samples. Verify listeners, timers, subscriptions, and buffer disposal.

## Change one causal factor

Protect affected behavior with existing tests and representative failure cases.
Prefer deletion of proven redundant work, better algorithms, batching, or existing
platform facilities before adding caches or new infrastructure. Check current
official docs for version-sensitive optimizations. Preserve ordering, consistency,
access controls, accessibility, and error behavior.

Run the same workload after each coherent change. Reject or revise changes whose
benefit disappears under comparable conditions or shifts unacceptable cost to
another operation. Avoid fixed timing assertions in ordinary unit tests; use the
project's performance budgets with tolerances and controlled environments.

## Report evidence

Run available tests and relevant type/lint/build checks. Present baseline and
final measurements, sample counts, environment, tradeoffs, and target attainment.
Distinguish measured improvement from expected benefit and untested production
behavior. If a profiler/device/service is unavailable, provide bounded hypotheses
and the next measurement; do not label speculative cleanup an optimization win.
