# Cache Design for Low-Latency Reads and Reduced Backend Load

One line: Cache frequently used data to reduce latency, protect backends, and keep systems stable under heavy load.

## When to use caching
- When most requests are reads.
- When computations or API calls are slow or expensive.
- When slightly stale data is acceptable (seconds to hours).
- When you want to handle traffic spikes without overloading the database.

## Core caching patterns - choose based on need
- Cache-aside: App controls the cache; simplest and most common choice.
- Read-through / Write-through: Cache sits between app and database; cleaner app code.
- Write-back: Writes go to cache first; very fast but risky without strong replication.
- Two-level cache (L1 + L2): Local cache for speed, distributed cache for shared data.

## Where to place cache
- L1 (in-process): Fastest access, but data is per-instance only.
- L2 (Redis/Memcached): Shared across services, slightly higher latency.
- CDN / edge: Best for static files and cacheable HTTP responses.

## Eviction & TTL (how data leaves cache)
- TTL limits how long data can stay stale.
- LRU removes least recently used items when memory is full.
- Use TTL-only for predictable data.
- Use LFU when a small set of keys is accessed very frequently.
- Protect “hot keys” using sharding, rate limits, or request coalescing.

## Consistency & invalidation
- Remove or update cache entries when data changes.
- Use short TTLs when strict accuracy is not required.
- Use pub/sub or versioned keys when multiple services update the same data.
- Avoid strong consistency unless absolutely necessary-it increases latency.

## Capacity planning
- Working set = number of hot keys × size per entry.
- Keep 20–40% free memory for growth and spikes.
- Tune Redis connection pools to prevent client overload.

## Metrics to monitor
- Cache hit rate (local vs distributed).
- Cache miss latency.
- Eviction rate and memory usage.
- p50 / p95 request latency.
- Alert when hit rate drops or evictions increase suddenly.

## Common failure modes & fixes
- Cache stampede: Use locks, singleflight, request coalescing, or TTL jitter.
- Stale data: Invalidate cache on writes or use versioned keys.
- Memory bloat: Set max entry size, TTLs, and eviction policies.

## Operational checklist
- Decide if cache data must survive restarts.
- Use ACLs and TLS to secure access.
- Test failures: cache restarts, TTL expiry, and node loss.
- Restart instances gradually to avoid cold-cache storms.

## Practical defaults (good starting point)
- max_memory: 4GB
- eviction_policy: allkeys-lru
- ttl_seconds: 600
- connection_pool_size: 50
- replication_factor: 2

## Minimal Redis config
```yaml
# redis-cache.yml
maxmemory: 4gb
maxmemory-policy: allkeys-lru
timeout: 0
save: ""
