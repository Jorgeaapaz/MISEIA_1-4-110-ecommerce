@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Test Coverage Reporting (>60% Domain Coverage)

## Role
Act as a QA Engineer with expertise in Vitest coverage, Istanbul/V8, and code quality metrics.

## Context
Project: `1-4-110-ecommerce` — Next.js 16 ecommerce app at `D:\Master-IA-Dev\04-Bloque4\1-4-110-ecommerce\ecommerce`.

**Prerequisite:** Tests from `[002]_tests_minimos_fn_prompt.md` must be implemented first.

This task resolves `cq_cobertura_alta` — coverage >60% on domain code (`lib/`), >40% global; report attached to README.

## Task
1. Install `@vitest/coverage-v8` as devDependency.
2. Configure coverage in `vitest.config.ts` to include `lib/` and `app/api/` directories.
3. Set thresholds: lines >60% for `lib/`, >40% global.
4. Run `npm run test:coverage` and generate an HTML + JSON report.
5. Add a coverage badge or summary table to `README.md`.
6. Add `coverage/` to `.gitignore`.

### Coverage Guidelines
- Coverage provider: `v8` (built into Node.js, no extra instrumentation overhead).
- Include: `lib/**`, `app/api/**`.
- Exclude: `node_modules`, `.next`, `scripts/`, `app/**/page.tsx` (UI components), `app/**/layout.tsx`.
- Report formats: `text` (CI), `html` (local), `json-summary` (badge generation).

## Output format
```
vitest.config.ts  — updated with coverage config
README.md         — updated with coverage results table
.gitignore        — coverage/ added
```

Coverage config example:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['lib/**', 'app/api/**'],
      exclude: ['node_modules', '.next', 'scripts'],
      thresholds: { lines: 40, functions: 40 },
      reporter: ['text', 'html', 'json-summary'],
    },
  },
})
```

## Examples and Steps to follow
1. `npm install -D @vitest/coverage-v8`
2. Update `vitest.config.ts` with coverage block
3. Run `npm run test:coverage`
4. Copy summary output into README under a "Test Coverage" section
5. Add coverage badge: `![Coverage](./coverage/badge.svg)` if badge tool available

## Output checklist and Guardrails
- [ ] `@vitest/coverage-v8` installed
- [ ] Coverage config in `vitest.config.ts`
- [ ] `npm run test:coverage` produces report without crashing
- [ ] `lib/` coverage ≥ 60% lines
- [ ] Global coverage ≥ 40% lines
- [ ] `coverage/` in `.gitignore`
- [ ] README has coverage summary section
- [ ] Commit: `test: add coverage reporting with v8 provider`
