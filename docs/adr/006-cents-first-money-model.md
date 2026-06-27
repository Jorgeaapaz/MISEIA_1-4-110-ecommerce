# ADR-006: Cents-First Money Model

**Date:** 2026-04-22  
**Status:** Accepted

## Context

The application stores and calculates prices and totals. The choice is between storing monetary values as:
1. **Floats** (e.g., `29.99` stored as a JavaScript number / MongoDB double)
2. **Integers in the smallest unit** (e.g., `2999` cents)

## Decision

Store all monetary values as **integers in cents**. Convert to display format (`$29.99`) only at the render layer.

## Consequences

**Positive:**
- Integer arithmetic is exact — no floating-point rounding errors
- Stripe's API natively uses cents (integer `unit_amount`) — no conversion needed when creating Checkout Sessions
- Consistent across the entire stack: MongoDB stores integers, API routes compute in integers, display layer formats on output

**Negative / Trade-offs:**
- Every developer must remember the convention (price is in cents, not dollars)
- Display formatting must happen explicitly at the render layer: `(price / 100).toFixed(2)`

## Quantitative Justification

JavaScript (and MongoDB's BSON double) uses IEEE 754 64-bit floating point. This causes well-known precision errors:

```javascript
// Demonstrated in Node.js REPL:
0.1 + 0.2
// → 0.30000000000000004  ❌ (not 0.3)

(29.99 + 9.99).toFixed(2)
// → "39.98"  ✅ (toFixed masks the error)

(29.99 + 9.99) === 39.98
// → false  ❌ (actual value: 39.980000000000004)
```

With the cents model:
```javascript
// Prices: $29.99 = 2999 cents, $9.99 = 999 cents
2999 + 999
// → 3998  ✅ (exact integer)

3998 / 100
// → 39.98  ✅ (exact, because 3998 is exactly representable)
```

For an order of 100 line items at $9.99 each:
- **Float model**: `100 × 9.99 = 998.9999999999999` → display as `$999.00` would require rounding hacks
- **Cents model**: `100 × 999 = 99900` → `$999.00` exactly

The float error compounds with order size. The cents model eliminates this class of bug entirely at zero performance cost (integer multiplication is the same speed as float on modern CPUs).

## Alternatives Considered

- **`Decimal.js` / `big.js` library**: Arbitrary-precision decimal arithmetic. Rejected — adds a dependency and complexity for a problem that integer cents solves completely without any library.
- **Store as string (e.g., `"29.99"`)**: Safe but requires parsing before arithmetic. Rejected — defeats the purpose of numeric storage and complicates queries.
