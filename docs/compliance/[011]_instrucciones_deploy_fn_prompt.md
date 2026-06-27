@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Production Deploy Instructions to README

## Role
Act as a DevOps Engineer and Technical Writer with expertise in Docker, Traefik, and deployment documentation.

## Context
Project: `1-4-110-ecommerce` — Next.js 16 ecommerce app at `D:\Master-IA-Dev\04-Bloque4\1-4-110-ecommerce\ecommerce`.

This resolves `dc_instrucciones_deploy` — a section with verified deploy steps (Dockerfile + command, deploy script, cloud instructions).

**Prerequisite:** `Dockerfile` must exist (from `[004]_ci_github_fn_prompt.md`) and public deploy must be live (from `[006]_deploy_publico_fn_prompt.md`).

- **Production URL:** `https://ecommerce.deviaaps.com`
- **VM:** `gcvmuser@34.174.56.186`
- **Docker + Traefik:** already running on VM
- **MongoDB:** `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`

## Task
Add a "## Deployment" section to `README.md` with:
1. Docker local build and run instructions
2. Production deploy to GCI VM (step-by-step, verified commands)
3. Environment variables needed for production
4. Stripe webhook configuration for production
5. Health check command to verify the deploy

### Deployment Section Structure
```markdown
## Deployment

### Local Docker Build

\`\`\`bash
docker build -t ecommerce:latest .
docker run -p 3000:3000 --env-file .env.local ecommerce:latest
\`\`\`

### Production Deploy (GCI VM — ecommerce.deviaaps.com)

**Prerequisites:**
- SSH access to `gcvmuser@34.174.56.186`
- Traefik running on the VM with `miseia-net` network

**Steps:**

1. SSH into the VM:
\`\`\`bash
ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186
\`\`\`

2. Clone and configure:
\`\`\`bash
git clone https://github.com/Jorgeaapaz/MISEIA_1-4-110-ecommerce.git ~/MISEIA110_ecommerce
cd ~/MISEIA110_ecommerce
cp .env.example .env.production
# Edit .env.production with production values
nano .env.production
\`\`\`

3. Build and run:
\`\`\`bash
docker build -t ecommerce:latest .
docker run -d \
  --name ecommerce \
  --network miseia-net \
  --restart unless-stopped \
  --env-file .env.production \
  -l "traefik.enable=true" \
  -l "traefik.http.routers.ecommerce.rule=Host(\`ecommerce.deviaaps.com\`)" \
  -l "traefik.http.routers.ecommerce.entrypoints=websecure" \
  -l "traefik.http.routers.ecommerce.tls=true" \
  -l "traefik.http.routers.ecommerce.tls.certresolver=cloudflare" \
  -l "traefik.http.services.ecommerce.loadbalancer.server.port=30001" \
  ecommerce:latest
\`\`\`

4. Seed production database:
\`\`\`bash
docker exec ecommerce npx tsx scripts/seed.ts
\`\`\`

5. Verify:
\`\`\`bash
curl -I https://ecommerce.deviaaps.com  # expect HTTP/2 200
docker logs ecommerce --tail 20
\`\`\`

### Updating (CD via GitHub Actions)
After the initial setup, pushes to `main` are automatically deployed via GitHub Actions.
See `.github/workflows/ci-cd.yml` for the full pipeline.

### Stripe Webhook (Production)
Update the webhook endpoint in [Stripe Dashboard](https://dashboard.stripe.com/webhooks) to:
`https://ecommerce.deviaaps.com/api/stripe/webhook`

Use the signing secret from the new endpoint as `STRIPE_WEBHOOK_SECRET`.
```

## Output checklist and Guardrails
- [ ] "## Deployment" section added to README
- [ ] Local Docker instructions present and tested
- [ ] GCI VM deploy instructions verified against running deployment
- [ ] Stripe webhook production URL documented
- [ ] Health check command (`curl -I https://ecommerce.deviaaps.com`) included
- [ ] Production URL `https://ecommerce.deviaaps.com` linked in README header/badges
- [ ] Commit: `docs: add verified production deployment instructions to README`
