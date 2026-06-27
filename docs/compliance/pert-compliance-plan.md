# PERT Compliance Plan — Ecommerce App
**Project:** `1-4-110-ecommerce`  
**Generated:** 2026-06-27

---

## PERT Compliance Plan

The following is a logically ordered list of tasks to resolve all non-compliant issues. Dependencies are noted to establish critical paths.

### Task Nodes

```
[T1] Create .env.example
      → No dependencies
      → Resolves: dc_env_example, cq_sin_secretos_en_repo (partial)
      → Prompt: [001]_env_example_fn_prompt.md

[T2] Implement automated tests (unit + integration)
      → Depends on: T1 (env vars needed for test config)
      → Resolves: cq_tests_minimos
      → Prompt: [002]_tests_minimos_fn_prompt.md

[T3] Add test coverage reporting
      → Depends on: T2 (tests must exist first)
      → Resolves: cq_cobertura_alta
      → Prompt: [003]_cobertura_alta_fn_prompt.md

[T4] Create GitHub CI/CD pipeline + deploy to GCI VM
      → Depends on: T2, T3 (CI runs tests; deploy is primary path)
      → Resolves: cq_ci_funcional, fn_deploy_publico_accesible (via GitHub Actions deploy)
      → Prompt: [004]_ci_github_fn_prompt.md

[T5] Create GitLab CI/CD pipeline
      → Depends on: T2, T3 (CI runs tests)
      → Can run in parallel with T4
      → Resolves: cq_ci_funcional (secondary)
      → Prompt: [005]_ci_gitlab_fn_prompt.md

[T6] Public production deploy to GCI VM
      → Depends on: T4 (GitHub Actions handle deploy; or manual if T4 not done)
      → Resolves: fn_deploy_publico_accesible, dc_instrucciones_deploy
      → Prompt: [006]_deploy_publico_fn_prompt.md

[T7] Add architecture diagram to README
      → No dependencies
      → Resolves: dc_diagrama_arquitectura
      → Prompt: [007]_diagrama_arquitectura_fn_prompt.md

[T8] Document AI usage and changes
      → No dependencies
      → Resolves: dc_cambios_ia_documentados
      → Prompt: [008]_cambios_ia_fn_prompt.md

[T9] Add ADRs (Architecture Decision Records)
      → Depends on: T8 (AI changes doc informs decisions to record)
      → Resolves: dc_adrs_o_decision_log
      → Prompt: [009]_adrs_decision_log_fn_prompt.md

[T10] Add quantitative justification
       → Depends on: T9 (ADRs provide context for quantitative decisions)
       → Resolves: dc_justificacion_cuantitativa
       → Prompt: [010]_justificacion_cuantitativa_fn_prompt.md

[T11] Add deploy instructions to README
       → Depends on: T6 (must have real deploy to document)
       → Resolves: dc_instrucciones_deploy
       → Prompt: [011]_instrucciones_deploy_fn_prompt.md
```

### Critical Path

```
T1 → T2 → T3 → T4 → T6 → T11
                  ↘
                   T5 (parallel with T4)

T7 (independent)
T8 → T9 → T10 (independent chain)
```

---

## Execution PERT

| # | Task | Prompt File | Depends On | Parallelizable With | Estimated Effort | Priority |
|---|---|---|---|---|---|---|
| 1 | Create `.env.example` template | `[001]_env_example_fn_prompt.md` | — | T7, T8 | 15 min | High |
| 2 | Implement unit + integration tests | `[002]_tests_minimos_fn_prompt.md` | T1 | — | 3–4 h | High |
| 3 | Add test coverage reporting | `[003]_cobertura_alta_fn_prompt.md` | T2 | — | 30 min | Medium |
| 4 | GitHub CI/CD pipeline + GCI deploy | `[004]_ci_github_fn_prompt.md` | T2, T3 | T5 | 2 h | High |
| 5 | GitLab CI/CD pipeline | `[005]_ci_gitlab_fn_prompt.md` | T2, T3 | T4 | 1 h | Medium |
| 6 | Production deploy to GCI VM via Docker/Traefik | `[006]_deploy_publico_fn_prompt.md` | T4 | — | 1 h | High |
| 7 | Architecture diagram (Mermaid in README) | `[007]_diagrama_arquitectura_fn_prompt.md` | — | T1, T8 | 30 min | Low |
| 8 | Document AI usage and critical review | `[008]_cambios_ia_fn_prompt.md` | — | T1, T7 | 30 min | Low |
| 9 | Add ADRs to `docs/` | `[009]_adrs_decision_log_fn_prompt.md` | T8 | — | 1 h | Low |
| 10 | Add quantitative justification to ADRs | `[010]_justificacion_cuantitativa_fn_prompt.md` | T9 | — | 45 min | Low |
| 11 | Add deploy instructions to README | `[011]_instrucciones_deploy_fn_prompt.md` | T6 | — | 30 min | Medium |
