# Cache Design for Low-Latency Reads and Reduced Backend Load

In one line: Use cache to cut latency, reduce upstream load, and make system behavior predictable under bursts.


## When to cache
- Read-heavy endpoints, expensive computations, or remote API results.
- Data that can tolerate bounded staleness (minutes to hours).
- To smooth traffic spikes and reduce DB cost.

## Core patterns (and when to pick them)
- Cache-aside — Simple, explicit control; good default for reads.
- Read-through / Write-through — Let cache be the access path; use when you need tight coupling and simpler app logic.
- Write-back — High write throughput; use only when replication/flush guarantees are in place, otherwise risk of data loss.
- Two-level (L1 local + L2 distributed) — L1 for ultra-low latency, L2 for shared state; implement coherence strategy to avoid stale reads.

## Placement & topology
- L1: local in-process LRU for micro-latency.
- L2: Redis/Memcached for shared working set.
- CDN/edge: static content and cacheable HTTP responses.

## Eviction & entry management
- Prefer LRU with TTL. TTL bounds staleness; LRU controls memory.
- For predictable data, use TTL-only. For frequency-skewed workloads, consider LFU.
- Protect hot keys with sharding, rate-limiters, or request coalescing.

## Consistency & invalidation
- Prefer explicit invalidation on writes or use short TTLs.
- For multi-instance updates, use a pub/sub invalidation channel or versioned keys.
- Avoid synchronous strong consistency unless required—it's costly.

## Sizing & capacity planning
- Estimate working set size = unique hot keys × entry size.
- Set headroom (20–40%) to handle growth and traffic spikes.
- Tune connection pool sizes for Redis clients to avoid exhaustion.

## Track metrics
- Hit rate, local vs remote hit ratio, miss latency, eviction count, memory usage, p50/p95 latency.
- Alert on sustained low hit rate or rising evictions.

## Ensure operational readiness
- Backup/replication for stateful caches if persistence is required.
- Secure network access (ACLs, TLS).
- Chaos-test TTL expiries, failovers, and cache outages.
- Deploy rolling restarts and monitor cold-start effects.

## Common failure modes & mitigations
- Stampede: use locks, singleflight, or negative caching.
- Stale reads: implement invalidation or version keys.
- Memory bloat: enforce max-entry-size, TTLs, and eviction policies.

## Example knobs (practical defaults)
- max_memory: 4GB   # Max memory for cache, evict keys when exceeded
- eviction_policy: allkeys-lru   # Evict least recently used keys globally
- ttl_seconds: 600   # Default time-to-live for cache entries
- connection_pool_size: 50   # Redis client connections per instance
- replication_factor: 2   # Number of replicas for high availability

## Example minimal config (Redis)
```yaml
# redis-cache.yml
maxmemory: 4gb           # Max memory for cache
maxmemory-policy: allkeys-lru   # Evict least recently used keys when full
timeout: 0               # Disable client connection timeout
save: ""                 # Disable RDB persistence for pure cache usage

```

Keep rules simple: measure, pick defaults that prevent disasters, and iterate.

