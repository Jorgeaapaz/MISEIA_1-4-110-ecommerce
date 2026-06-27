@~/.claude/prompts/new_functionality_prompt_spec.md

# Create .env.example Template

## Role
Act as a Software Developer and DevSecOps Engineer with expertise in Next.js and secure secret management.

## Context
Project: `1-4-110-ecommerce` — Next.js 16 ecommerce app at `D:\Master-IA-Dev\04-Bloque4\1-4-110-ecommerce\ecommerce`.

The project has a `.env.local` file (gitignored) with real values but NO `.env.example` template. This violates:
- `dc_env_example` — `.env.example` with all required vars listed, without real values
- `cq_sin_secretos_en_repo` — secrets via env vars + `.env.example` template

The required environment variables (from `.env.local`) are:
```
MONGODB_URI
MONGODB_DB
AUTH_SECRET
NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

## Task
1. Create `.env.example` at the project root with placeholder values (never real values).
2. Verify `.env.local` and `.env*.local` are listed in `.gitignore`.
3. Update `README.md` to reference `.env.example` in the "Configure environment variables" section.
4. Run `git log -p | grep -iE "secret|password|api_key|sk_test|pk_test"` to audit for leaked secrets.

### .env.example Guidelines
- Use descriptive placeholder values: `your-32-char-secret-here`, `mongodb://localhost:27017`, `pk_test_your_key`, etc.
- Add a comment above each group of related variables.
- Do NOT include real tokens, passwords, or API keys.

## Output format
Two files modified:
1. `/.env.example` — created
2. `/README.md` — "Configure environment variables" section updated to say `cp .env.example .env.local` and fill in values

## Examples and Steps to follow
```env
# .env.example
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ecommerce

# Auth (generate with: openssl rand -base64 32)
AUTH_SECRET=replace-with-32-char-random-string

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Output checklist and Guardrails
- [ ] `.env.example` exists at project root
- [ ] No real secrets in `.env.example`
- [ ] All 8 variables from `.env.local` are represented
- [ ] `.gitignore` covers `.env.local` and `.env*.local`
- [ ] README updated with `cp .env.example .env.local` instruction
- [ ] Secret audit command returns no leaks
- [ ] Commit with message: `docs: add .env.example template`
