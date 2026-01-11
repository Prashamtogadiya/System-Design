# System Design - High-Performance Backend Patterns

This repository contains multiple system design patterns implemented in Node.js + TypeScript using a monorepo structure (TurboRepo).

## Structure

- **apps/** - runnable applications
- **packages/** - reusable libraries
- **docs/** - documentation, Postman collections, diagrams

## Current apps

1. **bloom-filter-backed-user-service**
   - Implements a username availability service
   - Uses Bloom Filter to reduce database reads
   - Demonstrates false positives handling

## Future plans

- Rate limiter service
- Snowflake ID generator
- Consistent hashing / distributed cache
- Redis-backed Bloom Filter for distributed systems
- and much more...
