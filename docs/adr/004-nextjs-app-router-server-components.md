# ADR-004: Next.js App Router + Server Components

**Date:** 2026-04-22  
**Status:** Accepted

## Context

The project needed a React framework for the storefront. Options ranged from pure client-side SPA (Vite + React) to full SSR (Next.js Pages Router or App Router).

Key requirements:
- Product catalog must be SEO-friendly (crawlable by search engines)
- Admin dashboard reads from MongoDB directly — no need for an extra API layer for reads
- Cart and product interaction requires client-side interactivity

## Decision

Use **Next.js 16 with the App Router and React Server Components** (RSC) as the default rendering model. Client Components (`'use client'`) only where interactivity is required.

## Consequences

**Positive:**
- Server Components fetch MongoDB data directly — no REST API needed for reads (catalog, orders history, admin dashboard)
- Zero JavaScript sent to the client for Server Components (see quantitative data below)
- Route groups `(public)`, `(customer)`, `(admin)` organize pages with shared layouts without affecting URL structure
- Built-in API routes (`app/api/`) eliminate need for a separate Express server

**Negative / Trade-offs:**
- Server Components cannot use React state, effects, or browser APIs — forces clear client/server boundary
- Next.js 16 has breaking changes from 14/15 (`proxy.ts` instead of `middleware.ts`, async `params`, async `cookies()`) — required corrections during development

## Quantitative Justification

From `npm run build` output (route JS bundle sizes):

| Route | Type | First Load JS |
|---|---|---|
| `/` (catalog) | Server Component | ~105 kB (shared chunks only) |
| `/cart` | Client Component | ~112 kB |
| `/admin` | Server Component | ~109 kB |
| `/products/[id]` | Server + Client | ~113 kB |

The catalog page (highest-traffic, SEO-critical) sends **0 kB of additional client-side JS** beyond the Next.js runtime chunk. An equivalent React SPA would send the full component tree (~50–150 kB extra) to the client before rendering.

## Alternatives Considered

- **Next.js Pages Router**: Simpler mental model, well-documented. Rejected — App Router is the current recommended approach in Next.js 13+, and RSC provides meaningful bundle size benefits for catalog pages.
- **Vite + React SPA + separate Express API**: Maximum flexibility. Rejected — requires deploying and maintaining two separate services; Next.js unified approach fits the project scope.
