# ADR-003: Native MongoDB Driver over Mongoose

**Date:** 2026-04-22  
**Status:** Accepted

## Context

The project needed a MongoDB client for Node.js. Two options were evaluated: the official MongoDB Node.js driver (`mongodb` package) and the Mongoose ODM.

The AGENTS.md spec explicitly states: *"MongoDB via native Node.js driver (`mongodb` package) – no Mongoose, no ORM"*.

## Decision

Use the **native `mongodb` driver** with TypeScript interfaces in `lib/types.ts` instead of Mongoose schemas and models.

## Consequences

**Positive:**
- No schema definition duplication — TypeScript interfaces serve as the single source of truth for types
- Full access to MongoDB aggregation pipeline, `bulkWrite`, and driver-specific APIs without Mongoose abstraction leaks
- Smaller dependency footprint: `mongodb@7` is ~2MB; `mongoose@8` is ~8MB with its own validators and query builders
- No `populate()` footgun — relationships are modeled explicitly

**Negative / Trade-offs:**
- No automatic `createdAt`/`updatedAt` (must set manually)
- No schema-level validation at the ODM layer — validation is done in API route handlers
- No virtual fields, middleware hooks, or instance methods

## Alternatives Considered

- **Mongoose**: Adds schema definitions, validation, virtual fields, and query helpers. Rejected because it duplicates type definitions already in TypeScript, and the query layer abstraction was unnecessary for this project's straightforward CRUD patterns.
- **Prisma with MongoDB connector**: Type-safe ORM with migration tooling. Rejected — Prisma's MongoDB connector is in Preview status and doesn't support all query patterns (e.g., nested array `$push`).
