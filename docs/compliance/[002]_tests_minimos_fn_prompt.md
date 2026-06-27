@~/.claude/prompts/new_functionality_prompt_spec.md

# Implement Automated Tests (Unit + Integration)

## Role
Act as a Software Developer and QA Engineer with expertise in Next.js, Vitest, and API integration testing.

## Context
Project: `1-4-110-ecommerce` — Next.js 16 / React 19 ecommerce app at `D:\Master-IA-Dev\04-Bloque4\1-4-110-ecommerce\ecommerce`.

There are currently **zero test files** and no test framework configured. This violates:
- `cq_tests_minimos` — at least one set of automated tests covering critical flows, runnable with a README command

Tech stack: Next.js 16, TypeScript 5, MongoDB (native driver), Stripe, JWT via `jose`, bcrypt.

Critical flows to test:
1. Auth: login (valid credentials), login (invalid credentials), JWT creation/verification
2. Cart: add item, get cart, remove item
3. Products: list, create (admin), update (admin), delete (admin)
4. Orders: create order flow, status update
5. Checkout: Stripe session creation logic

## Task
1. Install Vitest + testing utilities as devDependencies.
2. Configure Vitest for Next.js (use `@vitejs/plugin-react` or Next.js adapter).
3. Write unit tests for `lib/auth.ts` (JWT create/verify).
4. Write unit tests for API route handlers mocking MongoDB and Stripe.
5. Write at least one integration test for the auth flow (POST `/api/auth/login`).
6. Add `"test": "vitest run"` and `"test:coverage": "vitest run --coverage"` to `package.json` scripts.
7. Update README with `npm test` command.

### Testing Guidelines
- Use `vitest` as the test runner (compatible with Next.js App Router without ejecting).
- Mock MongoDB client using `vi.mock('../../lib/db')`.
- Mock Stripe client using `vi.mock('stripe')`.
- Test files go in `__tests__/` directory at project root.
- Use `.env.test` for test environment variables (MONGODB_URI can point to real DB for integration tests).
- For unit tests: mock all external dependencies.
- For integration tests: use the test MongoDB database `ecommerce_test`.

## Output format
```
__tests__/
  unit/
    auth.test.ts        ← JWT create/verify, cookie helpers
    cart.test.ts        ← cart add/remove/get logic
    products.test.ts    ← product CRUD validation
  integration/
    login.test.ts       ← POST /api/auth/login end-to-end
vitest.config.ts
.env.test
```

## Examples and Steps to follow
```typescript
// __tests__/unit/auth.test.ts
import { describe, it, expect } from 'vitest'
import { createToken, verifyToken } from '../../lib/auth'

describe('auth', () => {
  it('creates and verifies a JWT', async () => {
    const payload = { userId: '123', email: 'test@test.com', role: 'customer' as const, name: 'Test' }
    const token = await createToken(payload)
    const verified = await verifyToken(token)
    expect(verified.userId).toBe('123')
    expect(verified.role).toBe('customer')
  })

  it('throws on invalid token', async () => {
    await expect(verifyToken('invalid.token.here')).rejects.toThrow()
  })
})
```

## Output checklist and Guardrails
- [ ] `vitest` installed as devDependency
- [ ] `vitest.config.ts` present at root
- [ ] At least 10 test cases covering critical flows
- [ ] `npm test` runs all tests with exit code 0
- [ ] Tests do NOT use real Stripe API calls (mocked)
- [ ] README updated with `npm test` command
- [ ] No hardcoded secrets in test files (use `.env.test`)
- [ ] Commit: `test: add unit and integration tests for auth, cart, and products`
