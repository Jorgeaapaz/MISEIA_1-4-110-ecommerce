@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Quantitative Justification to Architecture Decisions

## Role
Act as a Software Architect and Performance Engineer with expertise in benchmarking and cost analysis.

## Context
Project: `1-4-110-ecommerce` — Next.js 16 ecommerce app at `D:\Master-IA-Dev\04-Bloque4\1-4-110-ecommerce\ecommerce`.

This resolves `dc_justificacion_cuantitativa` — at least one technical decision justified with numbers (benchmark, latency, cost estimate, or comparison with alternative).

**Prerequisite:** ADRs from `[009]_adrs_decision_log_fn_prompt.md` must exist.

Good candidates for quantitative justification in this project:
1. **MongoDB singleton connection** — measured connection overhead (ms) with vs without pool reuse
2. **Server Components vs. Client Components** — bundle size difference (KB) or TTFB difference (ms)
3. **Cents-first money model** — floating-point precision errors demonstrated with real numbers
4. **JWT over session store** — memory usage comparison (Redis instance cost vs. stateless)
5. **MongoDB over PostgreSQL** — query latency for the catalog query (ms for document vs. relational join)

## Task
1. Pick 2 decisions from the list above and add a quantitative section to their ADR files.
2. For the **cents-first money model**, demonstrate the floating-point problem with real numbers and code.
3. For the **Server Components** decision, measure the JS bundle size with `next build` output (`npm run build` reports route sizes) and document the difference.
4. Add a "## Quantitative Justification" section to `docs/adr/README.md` summarizing findings.

### Quantitative Evidence Guidelines
- Use real measurements from the running project — not theoretical estimates alone.
- Include the measurement methodology (how was it measured, what tool, how many runs).
- For bundle size: use `npm run build` output — Next.js reports First Load JS per route.
- For floating-point: show actual JavaScript REPL output demonstrating the precision issue.
- Numbers must be specific: "32ms vs 180ms (5.6x faster)" not "much faster".

## Output format
Update existing ADR files + `docs/adr/README.md`:

```markdown
## Quantitative Justification

### Floating-Point Precision (cents-first model)
```javascript
// In JavaScript (Node.js REPL):
0.1 + 0.2           // → 0.30000000000000004 ❌
(10 + 20) / 100     // → 0.3 ✅ (cents: 10¢ + 20¢ = 30¢, then /100 for display)
```
An order of $29.99 + $9.99 = $39.98 would become $39.980000000000004 with floats.
Stored as integers (2999 + 999 = 3998 cents) → $39.98 exactly.

### Bundle Size (Server Components)
From `npm run build` output:
| Route | Type | JS Bundle |
|---|---|---|
| `/` (catalog) | Server | 0 kB client |
| `/cart` | Client | 24.3 kB |
...
```

## Output checklist and Guardrails
- [ ] At least 2 ADR files updated with quantitative section
- [ ] Floating-point example shows actual REPL output with the precision error
- [ ] Bundle sizes from real `npm run build` output (not estimated)
- [ ] Numbers include units (ms, kB, %)
- [ ] Measurement methodology described
- [ ] Commit: `docs: add quantitative justification to ADRs`
