# System Design - High-Performance Backend Patterns

This repository contains **practical system design patterns** focused on building
**scalable, low-latency, and high-throughput backend systems**.

All implementations use **Node.js + TypeScript** in a **TurboRepo monorepo** structure.

---

## Quick Navigation

- [Apps](../apps/)
- [Packages](../packages)
- [Docs](../docs/)
- [Cache Design Reference](../docs/CACHE.md)
- [Bloom Filter Design](../docs/BLOOM_FILTER.md)
- [Consistent Hashing Design](../docs/CONSISTENT_HASHING.md)

---

## Repository Structure

- **[apps/](../apps)** - runnable system design services
- **[packages/](../packages)** - reusable libraries and shared logic
- **[docs/](../docs)** - design documents, references, diagrams, and notes

---

## System Design References

- **[Cache Design for Low-Latency Reads and Reduced Backend Load](../docs/CACHE.md)**
  - Covers cache placement, eviction, TTL, consistency, failure modes, and ops best practices.
- **[Bloom Filter Design for Username Availability](../docs/BLOOM_FILTER.md)**
  - Detailed math and logic for space-efficient probabilistic data structures.
- **[Consistent Hashing & Cluster Management](../docs/CONSISTENT_HASHING.md)**
  - Guide on distributed data distribution, virtual nodes, and gossip protocols.

---

## Implemented Services

### 1. Bloom Filter–Backed Username Service

**App:** [`apps/bloom-filter-backed-user-service`](../apps/bloom-filter-backed-user-service)  
**Library:** [`packages/bloom-filter`](../packages/bloom-filter)  
**Docs:** [`docs/BLOOM_FILTER.md`](../docs/BLOOM_FILTER.md)

**What it demonstrates**
- Space-efficient probabilistic data structures.
- Reducing unnecessary database reads by handling false positives with DB verification.
- Mathematical tuning of parameters ($m$, $k$, $p$).

---

### 2. Cache-Backed User Service (FIFO & LRU)

**App:** [`apps/cache-backed-user-service`](../apps/cache-backed-user-service)  
**Library:** [`packages/cache`](../packages/cache)  
**Docs:** [`docs/CACHE.md`](../docs/CACHE.md)

**What it demonstrates**
- Cache-aside pattern and eviction strategies (FIFO vs LRU).
- Measured latency improvement (Cold: ~700ms vs Cached: ~4-7ms).
- Real-time cache metrics & observability.

---

### 3. Distributed KV Store with Consistent Hashing

**App:** [`apps/consistent-hashing-service`](../apps/consistent-hashing-service)  
**Library:** [`packages/consistent-hashing`](../packages/consistent-hashing)  
**Docs:** [`docs/CONSISTENT_HASHING.md`](../docs/CONSISTENT_HASHING.md)

**What I implemented**
- **Hash Ring with Virtual Nodes:** I used 5 vnodes per physical node to ensure uniform data distribution and prevent hotspots.
- **Replication:** I implemented a strategy to store data on $R=2$ distinct physical nodes for high availability.
- **Gossip Protocol:** I built a heartbeat-based failure detection system to manage node liveness.
- **Dynamic Membership:** I enabled adding or removing nodes at runtime with automatic ring recalculation.

**Key concepts**
- Minimizing data movement during cluster rebalancing.
- Deterministic request routing using Binary Search.
- Fault tolerance through replica failover.

---

## Design Goals

- Keep read paths fast and predictable under load.
- Protect databases and downstream services from unnecessary traffic.
- Use simple designs first, then optimize based on measurements.
- Be explicit about consistency, memory, and latency trade-offs.

---

## Planned Additions

- Rate limiting (Token Bucket / Leaky Bucket)
- Distributed ID generation (Snowflake / UUIDv7)
- Multi-node Bloom Filters
- Cache stampede handling (Singleflight / Promises)