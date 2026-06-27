# ADR-001: MongoDB over PostgreSQL

**Date:** 2026-04-22  
**Status:** Accepted

## Context

The ecommerce app stores three main entities: products, carts, and orders. Products have a flexible schema (different categories may have different attributes). Cart items embed product snapshots. Orders embed line items with prices captured at time of purchase — these should not change even if the product is later edited or deleted.

We needed a database that fits the access patterns:
- Catalog page: list all active products (single collection scan)
- Cart: one document per customer with embedded items array
- Order: one document with all items embedded (historical snapshot)

## Decision

Use **MongoDB 7.0** with the native Node.js driver (no ORM).

## Consequences

**Positive:**
- Cart and order items embed naturally as subdocuments — no JOINs needed
- Product schema can evolve per category without migrations
- The `orders` collection preserves item names and prices at purchase time (denormalized intent)
- Single collection scan for the product catalog — no JOIN overhead
- Aligns with the AGENTS.md spec which explicitly lists MongoDB collections

**Negative / Trade-offs:**
- No ACID transactions across collections by default (used only for stock decrement in webhook)
- No native foreign key enforcement — referential integrity is application-level
- Ad-hoc queries (e.g., "total revenue by category") require aggregation pipelines

## Alternatives Considered

- **PostgreSQL**: Excellent for relational data and complex analytics. Rejected because the document model (embedded cart items, order snapshots) maps poorly to normalized tables — would require 3+ JOINs for a single order read.
- **MongoDB Atlas**: Managed service. Rejected for this project in favor of self-hosted on GCI VM to avoid egress costs and stay within the existing Docker infrastructure.
