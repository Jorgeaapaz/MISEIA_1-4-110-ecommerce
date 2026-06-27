@~/.claude/prompts/new_functionality_prompt_spec.md

# Document AI Usage and Critical Review

## Role
Act as a Software Developer and Technical Writer with expertise in documenting AI-assisted development.

## Context
Project: `1-4-110-ecommerce` — Next.js 16 ecommerce app at `D:\Master-IA-Dev\04-Bloque4\1-4-110-ecommerce\ecommerce`.

This resolves `dc_cambios_ia_documentados` — if AI was used to generate drafts, document what was changed vs. the draft (explicit critical review, not just acceptance).

The project was developed with Claude Code (claude-sonnet-4-6) assistance. Session retrospectives are in `RETROSPECTIVA-2026-04-22.md`.

## Task
1. Read `RETROSPECTIVA-2026-04-22.md` to identify AI-generated code and what was fixed/changed.
2. Create `docs/AI-USAGE.md` documenting:
   - Which components were AI-generated
   - What critical problems were found in AI drafts
   - What manual fixes were applied
   - What the student learned from the review
3. Add a link to `docs/AI-USAGE.md` from `README.md` under a new "AI Assistance" section.

### AI-USAGE.md Guidelines
- Be honest and specific — generic statements like "AI helped with everything" do not satisfy the requirement.
- For each AI-generated section: describe what was generated, what was wrong/missing, what was changed.
- Minimum 3 concrete examples of changes made to AI drafts.
- Include code snippets comparing the AI draft vs. the final implementation where relevant.
- Reference the retrospective file for context.

## Output format
```
docs/AI-USAGE.md   — new file
README.md          — "## AI Assistance" section added with link to docs/AI-USAGE.md
```

### AI-USAGE.md Template
```markdown
# AI Assistance Documentation

This project was developed using Claude Code (claude-sonnet-4-6) as an AI pair programmer.
This document records what was AI-generated and what critical changes were applied.

## Components Generated with AI Assistance

### [Component/Feature Name]
**AI Draft:** [Brief description of what was generated]
**Issue Found:** [What was wrong, incomplete, or incorrect in the AI draft]
**Change Applied:** [What was manually changed and why]

## Key Corrections to AI Drafts

### 1. [Fix Title]
...

## Lessons Learned
...
```

## Output checklist and Guardrails
- [ ] `docs/AI-USAGE.md` created
- [ ] Minimum 3 concrete examples of AI draft corrections
- [ ] At least one code comparison (draft vs. final)
- [ ] README links to `docs/AI-USAGE.md`
- [ ] Content is honest and specific, not generic
- [ ] Commit: `docs: add AI usage documentation with critical review`
