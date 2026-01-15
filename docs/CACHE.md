# Caching — System Design Reference

## Purpose
Caching reduces latency and load by storing frequently accessed data closer to the consumer. Use caches to improve read throughput, reduce upstream load, and smooth traffic bursts.

## Cache Types
- In-process (local): per-instance memory cache (e.g., LRU in-app).
- Distributed: external systems shared across instances (e.g., Redis, Memcached).
- CDN / edge caches: for static content or HTTP responses.
- Client-side caches: browser, mobile caches.

## Placement Strategies
- Cache-aside: application checks cache, on miss reads DB and populates cache.
- Read-through / Write-through: cache manages reads and writes to backing store.
- Write-back: write to cache first; flush to backing store asynchronously.

## Eviction Policies
- LRU (least recently used): good general-purpose.
- LFU (least frequently used): when access frequency matters.
- FIFO / TTL: simple time-based eviction for predictable staleness.
- Hybrid (e.g., LRU with TTL) for workload-specific tuning.

## Write Strategies
- Write-through: strong consistency, higher write latency.
- Write-back: lower write latency, risk of data loss on failure.
- Write-around: avoids cache pollution for one-time writes.

## Consistency & Coherence
- Strong consistency: synchronously update cache and store (costly).
- Eventual consistency: use async updates, invalidation, or versioning.
- Invalidation patterns: time-based TTL, explicit invalidation, pub/sub (cache invalidation channel).

## Sizing & Capacity
- Estimate working set, hit-rate targets, and memory per entry.
- Overprovision for headroom and connection limits.
- Set TTLs to bound stale data and memory usage.

## Hotspots & Sharding
- Avoid single-key hotspots via sharding, request coalescing, or rate limiting.
- Use consistent hashing for distributed caches to reduce rebalancing.

## Metrics & Monitoring
- Hit rate, miss rate, eviction rate, latency (p50/p95), memory usage, connection count.
- Alert on high miss rates, excessive evictions, or memory pressure.

## Operational Considerations
- Persistence: enable snapshotting or replication if data must survive restarts.
- Security: network isolation, ACLs, encryption in transit.
- Backpressure: fallback to backing store when cache is unavailable.
- Testing: simulate TTL expiry, eviction, and failover.

## Example config knobs
- max_memory, eviction_policy, ttl_seconds, max_entry_size, replication_factor, read_timeout, write_timeout, connection_pool_size.

## When to Cache
- Read-heavy workloads, expensive computations, remote API responses, or data that tolerates bounded staleness.

## Common Pitfalls
- Stale reads after updates (missing invalidation).
- Cache stampedes (use locks or request coalescing).
- Unbounded memory growth (enforce eviction/TTL).
- Incorrect serialization or incompatible schema between app versions.

## Quick Patterns
- Cache-aside + TTL: simple, commonly used.
- Read-through + strong consistency: when cache is authoritative for reads.
- Two-level cache: local L1 + distributed L2 for very low latency with coherence strategy.

