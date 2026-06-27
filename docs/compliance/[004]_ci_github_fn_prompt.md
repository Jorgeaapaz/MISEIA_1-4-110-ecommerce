@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a Github CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in Github and Google Cloud Services

## Task
Create Github actions that allows to compile and deploy the app to `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186` in the directory `~/MISEIA110_ecommerce`. Test and build must be done in a GitHub Actions. The service must be created in the remote ubuntu VM in Docker.

The app must be accessible through Traefik using the domain `ecommerce.deviaaps.com`, port 30001, use the traefik wildcard `*.deviaaps.com`.

Use /gh-cli and gcloud for all secrets required.

## Context
- **Project:** `1-4-110-ecommerce` — Next.js 16 ecommerce app
- **GitHub repo:** `https://github.com/Jorgeaapaz/MISEIA_1-4-110-ecommerce`
- **Remote VM:** `gcvmuser@34.174.56.186` (GCI Ubuntu VM)
- **SSH key:** `C:\ubuntuiso\.ssh\vboxuser` (private), `C:\ubuntuiso\.ssh\vboxuser.pub` (public)
- **App directory on VM:** `~/MISEIA110_ecommerce`
- **Traefik network:** `miseia-net` (already running on VM)
- **Domain:** `ecommerce.deviaaps.com` via wildcard `*.deviaaps.com`
- **App port:** `30001`
- **MongoDB connection string (production):** `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`
- **MongoDB DB name:** `ecommerce`

## Prerequisite
Tests from `[002]_tests_minimos_fn_prompt.md` must be implemented before this pipeline can run them.

## Task Details

### 1. Create Dockerfile for the Next.js app
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 30001
ENV PORT=30001
CMD ["node", "server.js"]
```

Add `output: 'standalone'` to `next.config.ts`.

### 2. Create `.dockerignore`
```
node_modules
.next
.env.local
.env*.local
coverage
docs
```

### 3. Create GitHub Actions workflow `.github/workflows/ci-cd.yml`
The workflow must:
- **Trigger:** push to `main` branch + pull requests to `main`
- **Jobs:**
  - `test`: Install deps, run `npm run lint`, run `npm test`
  - `build`: Run `npm run build` (only on push to main, after test passes). Use `NODE_ENV=production` only for the build step.
  - `deploy`: SSH into VM, pull code, build Docker image, restart container with Traefik labels (only on push to main, after build passes)

### 4. Set GitHub Secrets via gh CLI
```bash
# SSH private key
gh secret set SSH_PRIVATE_KEY < C:\ubuntuiso\.ssh\vboxuser

# App environment variables for production
gh secret set MONGODB_URI --body "mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin"
gh secret set MONGODB_DB --body "ecommerce"
gh secret set AUTH_SECRET --body "<generate-32-char-random>"
gh secret set NEXT_PUBLIC_BASE_URL --body "https://ecommerce.deviaaps.com"
gh secret set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY --body "<from .env.local>"
gh secret set STRIPE_PUBLISHABLE_KEY --body "<from .env.local>"
gh secret set STRIPE_SECRET_KEY --body "<from .env.local>"
gh secret set STRIPE_WEBHOOK_SECRET --body "<from .env.local>"
```

### 5. Docker service on VM with Traefik labels
The deploy job must SSH into the VM and run:
```bash
cd ~/MISEIA110_ecommerce
docker build -t ecommerce:latest .
docker stop ecommerce || true
docker rm ecommerce || true
docker run -d \
  --name ecommerce \
  --network miseia-net \
  --restart unless-stopped \
  -p 30001:30001 \
  -e MONGODB_URI="$MONGODB_URI" \
  -e MONGODB_DB="$MONGODB_DB" \
  -e AUTH_SECRET="$AUTH_SECRET" \
  -e NEXT_PUBLIC_BASE_URL="$NEXT_PUBLIC_BASE_URL" \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" \
  -e STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \
  -e STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  -e STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" \
  -l "traefik.enable=true" \
  -l "traefik.http.routers.ecommerce.rule=Host(\`ecommerce.deviaaps.com\`)" \
  -l "traefik.http.routers.ecommerce.entrypoints=websecure" \
  -l "traefik.http.routers.ecommerce.tls=true" \
  -l "traefik.http.routers.ecommerce.tls.certresolver=cloudflare" \
  -l "traefik.http.services.ecommerce.loadbalancer.server.port=30001" \
  ecommerce:latest
```

## Output checklist and Guardrails
- [ ] `Dockerfile` present at project root with multi-stage build
- [ ] `.dockerignore` present
- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] `.github/workflows/ci-cd.yml` present with test + build + deploy jobs
- [ ] All GitHub secrets set via `gh secret set`
- [ ] `NODE_ENV=production` only on the build step, not as a job-level variable
- [ ] Workflow passes all jobs on push to main
- [ ] App accessible at `https://ecommerce.deviaaps.com` after deploy
- [ ] Stripe webhook URL updated to `https://ecommerce.deviaaps.com/api/stripe/webhook`
- [ ] Commit: `ci: add GitHub Actions CI/CD pipeline with GCI VM deploy`
