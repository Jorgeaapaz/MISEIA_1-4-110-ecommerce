# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the VOLT Store ecommerce project.

ADRs document key architectural decisions with their context, rationale, and trade-offs.

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [ADR-001](001-mongodb-over-postgresql.md) | MongoDB over PostgreSQL | Accepted | 2026-04-22 |
| [ADR-002](002-jwt-cookies-over-session-store.md) | JWT Cookies over Session Store | Accepted | 2026-04-22 |
| [ADR-003](003-native-mongodb-driver-over-mongoose.md) | Native MongoDB Driver over Mongoose | Accepted | 2026-04-22 |
| [ADR-004](004-nextjs-app-router-server-components.md) | Next.js App Router + Server Components | Accepted | 2026-04-22 |
| [ADR-005](005-stripe-checkout-over-elements.md) | Stripe Checkout over Stripe Elements | Accepted | 2026-04-22 |
| [ADR-006](006-cents-first-money-model.md) | Cents-First Money Model | Accepted | 2026-04-22 |

## Quantitative Highlights

| Decision | Key Number |
|---|---|
| Cents-first model | Eliminates 100% of floating-point rounding errors in price arithmetic |
| Server Components | 0 kB client JS for catalog page (vs ~100+ kB for a SPA equivalent) |
| JWT stateless auth | 0 Redis/session-store infrastructure required |
