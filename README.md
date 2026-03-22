# System Design - High-Performance Backend Patterns

This repository contains **practical system design patterns** focused on building
**scalable, low-latency, and high-throughput backend systems**.

All implementations use **Node.js + TypeScript** in a **TurboRepo monorepo** structure.

---

## 📌 Quick Navigation

-  [Apps](./apps/)
-  [Packages](./packages)
-  [Docs](./docs/)
-  [Cache Design Reference](./docs/CACHE.md)
-  [Bloom Filter Design](./docs/BLOOM_FILTER.md)
-  [Consistent Hashing Design](./docs/CONSISTENT_HASHING.md)

---

## Repository Structure

-  **[apps/](./apps)** - runnable system design services
- **[packages/](./packages)** - reusable libraries and shared logic
- **[docs/](./docs)** - design documents, references, diagrams, and notes

---

## System Design References

- **[Cache Design for Low-Latency Reads and Reduced Backend Load](./docs/CACHE.md)**
  - Covers cache placement, eviction, TTL, consistency, failure modes, and ops best practices.
- **[Bloom Filter Design for Username Availability](./docs/BLOOM_FILTER.md)**
  - Detailed math and logic for space-efficient probabilistic data structures.
- **[Consistent Hashing & Cluster Management](./docs/CONSISTENT_HASHING.md)**
  - Covers distributed data distribution, virtual nodes, and gossip protocols.

---

## Implemented Services

### 1 Bloom Filter–Backed Username Service

**App:** [`apps/bloom-filter-backed-user-service`](./apps/bloom-filter-backed-user-service)  
**Library:** [`packages/bloom-filter`](./packages/bloom-filter)  
**Docs:** [`docs/BLOOM_FILTER.md`](./docs/BLOOM_FILTER.md)

**What it demonstrates**
- Space-efficient probabilistic data structures
- Reducing unnecessary database reads
- Handling false positives with DB verification
- Mathematical tuning of Bloom Filter parameters (**m, k, p**)

**Key concepts**
- Bloom Filter theory → real implementation
- Cache-before-DB access pattern
- Latency and database load reduction
- Trade-off between memory usage and accuracy

---

### 2 Cache-Backed User Service (FIFO & LRU)

**App:** [`apps/cache-backed-user-service`](./apps/cache-backed-user-service)  
**Library:** [`packages/cache`](./packages/cache)  
**Docs:** [`docs/CACHE.md`](./docs/CACHE.md)

**What it demonstrates**
- Cache-aside pattern
- FIFO vs LRU eviction strategies
- TTL-based expiration (lazy eviction)
- Real-time cache metrics & observability

**Implemented features**
- FIFO cache
- LRU cache
- Configurable capacity and TTL
- Hit / miss / eviction metrics
- Measured latency improvement:
  - **Cold request:** ~700ms
  - **Cached request:** ~4-7ms

**Key concepts**
- Temporal locality
- Eviction policy trade-offs
- Infrastructure vs business logic separation
- Measuring assumptions instead of guessing

---

### 3 Distributed KV Store with Consistent Hashing

**App:** [`apps/consistent-hashing-service`](./apps/consistent-hashing-service)  
**Library:** [`packages/consistent-hashing`](./packages/consistent-hashing)  
**Docs:** [`docs/CONSISTENT_HASHING.md`](./docs/CONSISTENT_HASHING.md)

**What it demonstrates**
- Minimizing data movement during cluster rebalancing
- Deterministic request routing without a central master
- High availability through automated failover and replication
- Decoupling of physical nodes from logical data ownership

**Implemented features**
- **Hash Ring with Virtual Nodes:** I used 5 vnodes per physical node to ensure uniform data distribution
- **Replication Strategy:** Data is stored on **R = 2** distinct physical nodes for fault tolerance
- **Gossip Protocol:** Heartbeat-based failure detection to manage node liveness automatically
- **Dynamic Membership:** Support for adding or removing nodes at runtime with zero downtime

**Key concepts**
- Virtual Nodes (vnodes) to prevent hotspots
- Binary Search (O(log n)) for efficient key lookup
- Heartbeat propagation and failure suspicion
- Clockwise successor rule for ownership

---

## Design Goals

- Keep read paths fast and predictable under load
- Protect databases and downstream services from unnecessary traffic
- Use simple designs first, then optimize based on measurements
- Be explicit about consistency, memory, and latency trade-offs
- Treat metrics as the source of truth, not assumptions

---

## Planned Additions

- Rate limiting
- Distributed ID generation
- Multi-node Bloom Filters
- Cache stampede handling
- and much more...