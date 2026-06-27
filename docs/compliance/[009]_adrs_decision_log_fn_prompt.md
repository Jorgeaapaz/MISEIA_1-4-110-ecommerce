@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Architecture Decision Records (ADRs)

## Role
Act as a Software Architect with expertise in architectural decision documentation (ADR format).

## Context
Project: `1-4-110-ecommerce` — Next.js 16 ecommerce app at `D:\Master-IA-Dev\04-Bloque4\1-4-110-ecommerce\ecommerce`.

This resolves `dc_adrs_o_decision_log` — structured ADRs with context/decision/consequences for each key decision.

Key architectural decisions already made in this project:
1. **MongoDB over PostgreSQL** — document model for flexible product catalog and cart items
2. **JWT cookies over session store** — stateless auth without Redis dependency
3. **Native MongoDB driver over Mongoose** — avoid ORM abstraction overhead
4. **Next.js App Router Server Components over SPA** — SEO, reduced client bundle, direct DB access
5. **Stripe Checkout (hosted) over Stripe Elements** — PCI compliance without custom payment form
6. **Cents-first money model** — integer storage to avoid floating-point drift

## Task
1. Create `docs/adr/` directory.
2. Create individual ADR files using the MADR (Markdown Any Decision Record) format.
3. Create `docs/adr/README.md` as an index of all ADRs.
4. Link to `docs/adr/` from the main `README.md`.

### ADR Format (MADR)
```markdown
# ADR-NNN: [Short Title]

**Date:** YYYY-MM-DD  
**Status:** Accepted

## Context
[Why was this decision needed? What constraints existed?]

## Decision
[What was decided?]

## Consequences
**Positive:**
- [Benefit 1]

**Negative / Trade-offs:**
- [Drawback 1]

## Alternatives Considered
- [Alternative 1]: [Why rejected]
```

### ADRs to Create
- `docs/adr/001-mongodb-over-postgresql.md`
- `docs/adr/002-jwt-cookies-over-session-store.md`
- `docs/adr/003-native-mongodb-driver-over-mongoose.md`
- `docs/adr/004-nextjs-app-router-server-components.md`
- `docs/adr/005-stripe-checkout-over-elements.md`
- `docs/adr/006-cents-first-money-model.md`

## Output format
```
docs/adr/
  README.md              ← index
  001-mongodb-over-postgresql.md
  002-jwt-cookies-over-session-store.md
  003-native-mongodb-driver-over-mongoose.md
  004-nextjs-app-router-server-components.md
  005-stripe-checkout-over-elements.md
  006-cents-first-money-model.md
README.md                ← "## Architecture Decisions" section added
```

## Output checklist and Guardrails
- [ ] 6 ADR files created in `docs/adr/`
- [ ] Each ADR has: Context, Decision, Consequences (positive + negative), Alternatives
- [ ] `docs/adr/README.md` indexes all ADRs
- [ ] Main README links to `docs/adr/`
- [ ] Decisions are specific to THIS project, not generic
- [ ] Commit: `docs: add Architecture Decision Records (ADRs)`
