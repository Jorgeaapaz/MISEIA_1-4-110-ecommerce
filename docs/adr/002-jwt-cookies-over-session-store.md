# ADR-002: JWT Cookies over Session Store

**Date:** 2026-04-22  
**Status:** Accepted

## Context

Authentication needs to protect `/admin/*` and `/cart`, `/orders` routes. The middleware (`proxy.ts`) runs on every request and must be able to verify the user's identity without a network call.

Two main patterns were available:
1. **JWT in `httpOnly` cookie** — self-contained token, verified with a secret
2. **Server-side session** — random session ID in cookie, session data stored in Redis or MongoDB

## Decision

Use **JWT (`jose` library) stored in an `httpOnly` cookie** with a 7-day expiration.

## Consequences

**Positive:**
- Stateless — `proxy.ts` verifies the token with a single crypto operation, no DB or Redis lookup
- No additional infrastructure required (0 Redis/session-store dependency)
- Token contains `userId`, `email`, `role`, `name` — all info needed for middleware decisions
- `httpOnly` flag prevents XSS from reading the token; `SameSite=Lax` mitigates CSRF

**Negative / Trade-offs:**
- Cannot instantly revoke a token (e.g., on password change) until it expires (7-day window)
- If `AUTH_SECRET` is compromised, all tokens are compromised
- Token payload is readable (base64) — never store sensitive data in it

## Quantitative Justification

- **Middleware latency (JWT verify):** ~0.5–1ms (single HMAC-SHA256 operation in Node.js crypto)
- **Middleware latency (Redis session lookup):** ~2–5ms (network RTT to Redis even on same host)
- **Infrastructure cost difference:** 0 (stateless JWT) vs. 1 Redis instance (~$15/month managed, or additional container)

JWT verify is **4–10x faster** than a Redis roundtrip, and eliminates an entire infrastructure dependency for this project's scale.

## Alternatives Considered

- **Redis session store**: More flexible (instant revocation). Rejected — adds infrastructure complexity for a project that doesn't need sub-minute revocation.
- **Database sessions (MongoDB)**: Avoids Redis but adds a DB read on every request. Rejected — same latency penalty without the revocation benefit of Redis.
