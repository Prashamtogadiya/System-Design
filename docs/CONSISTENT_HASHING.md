# Consistent Hashing: Distributed Data Distribution & Cluster Management

## Purpose
This service implements **Consistent Hashing** with **Virtual Nodes** to solve the "rebalancing problem." By mapping both nodes and data to a logical ring, I ensure that when a node joins or leaves the cluster, only a small fraction of keys need to be moved, preventing "cache storms" and massive data migrations.

---

## The Core Problem: Why Not `hash(key) % n`?
In traditional modulo hashing, if the number of nodes (**n**) changes, the mapping for nearly every key changes.
* **Example:** If **n** goes from 9 to 10, the result of **H(k) mod 9** vs **H(k) mod 10** will be different for **~90%** of keys.
* **Result:** Massive data movement, cache misses, and service downtime.

---

## Mathematical Mechanics

### 1. The Hash Ring
I map the output of our hash function (MD5 truncated to 32-bit) onto a virtual circle ranging from **0** to **2^32 - 1**.

### 2. Node Placement (Virtual Nodes)
To prevent "hotspots" where one physical node owns too much of the ring, I use **Virtual Nodes (vnodes)**. Each physical node is hashed **V** times.


**Total Points = n × V**

Where **V** is the number of tokens/vnodes per server (Current implementation: **V = 5**).

### 3. Key Lookup (Clockwise Rule)
For any key **K**, the owner is the first node **N** encountered moving clockwise. If the key's hash is greater than the highest node hash, it wraps around to the first node at the start of the ring.

---

## 📡 Cluster Membership & Service Discovery

### Service Discovery: "How do nodes find each other?"
In a distributed system, instances are ephemeral. Service Discovery is the "phonebook" of the cluster.
* **My Implementation:** The `Cluster` class maintains the **Registry**. When a node starts, it "registers" its metadata so the `HashRing` can include it in routing logic.

### Cluster Membership: "Who is currently in the ring?"
Membership management ensures all nodes have a consistent view of who else is in the cluster.
1. **Strongly Consistent Membership:** Uses a coordinator like **Zookeeper** or **Etcd** to maintain a linearizable list of members.
2. **Eventual Membership (Gossip):** Nodes tell their neighbors about new joins/leaves until everyone knows.
3. **My Implementation:** I support **Dynamic Membership**. You can add/remove nodes via API at runtime, and the `HashRing` will instantly recalculate the segment ownership.

---

## 🛰️ Gossip Protocol & Failure Detection

### Purpose
In a decentralized cluster, there is no "leader" to tell nodes if a peer is down. The **Gossip Protocol** allows nodes to periodically exchange state (heartbeats) with a set of random peers, ensuring information about node failures propagates like a "rumor."


### How it Works (Heartbeat Mechanism)
1. **Periodic Pulse:** Each node increments its own `lastHeartbeat` timestamp every **T** seconds.
2. **State Exchange:** A node randomly selects a set of peers and sends its local "Node Health Table."
3. **Merge State:** The receiving node compares timestamps. If a peer has a newer heartbeat, the local table is updated.
4. **Failure Detection:** If a node’s heartbeat has not been updated for a threshold (e.g., **T × 5**), it is marked as **Dead**.

---

## System Architecture

### Code Map
| Component | Path | Responsibility |
| :--- | :--- | :--- |
| **Hash Ring** | `packages/consistent-hashing/hash-ring.ts` | Ring geometry, Binary Search lookup. |
| **Cluster** | `packages/consistent-hashing/cluster.ts` | Orchestrates Nodes, Membership, and Rebalancing. |
| **Node** | `packages/consistent-hashing/node.ts` | Local KV storage and Liveness state. |
| **Gossip** | `packages/consistent-hashing/gossip.ts` | Peer-to-peer failure detection. |

### Replication & Fault Tolerance
To ensure high availability, I store data on **R** distinct physical nodes.
* **Primary:** First clockwise node.
* **Replicas:** Next **R-1** distinct physical nodes on the ring.
* **Current Config:** **R = 2**.

---

## Implementation Details

### Request Flow
1. **Route Request:** Client hits `/get/:key`.
2. **Ring Lookup:** `HashRing` performs a binary search to find the successor node.
3. **Health Check:** `Cluster` checks `Node.isAlive` (determined by Gossip state).
4. **Failover:** If the Primary is down, the request is automatically routed to the next available Replica.

---

## Current Capabilities vs. Roadmap

| Feature | Status | Description |
| :--- | :--- | :--- |
| **Virtual Nodes** |  Implemented | 5 vnodes per physical node for balance. |
| **Binary Search** |  Implemented | Efficient O(log vnodes) lookup. |
| **Replication** |  Implemented | Metadata-aware distinct physical mapping. |
| **Gossip / Liveness**|  Implemented | Heartbeat-based failure detection. |
| **Dynamic Membership**|  Implemented | API-driven Join/Leave operations. |
| **Quorum (W+R > N)**|  Planned | Strong consistency for writes/reads. |

---

## Operational API

| Method | Endpoint | Action |
| :--- | :--- | :--- |
| **GET** | `/route/:key` | Shows the Primary and Replica nodes for a key. |
| **GET** | `/ring` | Returns a snapshot of the current Hash Ring (vnode positions). |
| **GET** | `/get/:key` | **Read:** Retrieves value from the first available live replica. |
| **POST** | `/put` | **Write:** Stores a key-value pair across all assigned replicas. |
| **POST** | `/node` | **Join:** Adds a new node and generates its virtual nodes. |
| **DELETE** | `/node` | **Leave:** Gracefully removes a node from the ring. |
| **POST** | `/fail` | **Simulate Failure:** Manually marks a node as dead. |
| **POST** | `/recover` | **Simulate Recovery:** Marks a failed node as alive. |
| **POST** | `/rebalance`| **Redistribute:** Forces a full scan and redistribution of data. |

---

## Tech Stack
* **Language:** TypeScript
* **Hash Algorithm:** MD5 (32-bit truncation)
* **Search Algo:** Binary Search (Successor finding)
* **Internal Lib:** `packages/consistent-hashing`