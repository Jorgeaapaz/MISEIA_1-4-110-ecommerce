@~/.claude/prompts/new_functionality_prompt_spec.md

# Deploy Ecommerce App to GCI VM (Public Production Deploy)

## Role
Act as a Software Architect and Infrastructure Engineer, expert in Docker, Traefik, and Google Cloud Infrastructure.

## Context
- **Project:** `1-4-110-ecommerce` — Next.js 16 ecommerce app
- **Target VM:** `gcvmuser@34.174.56.186` (SSH key: `C:\ubuntuiso\.ssh\vboxuser`)
- **App directory on VM:** `~/MISEIA110_ecommerce`
- **Domain:** `ecommerce.deviaaps.com` (Traefik wildcard `*.deviaaps.com` already configured)
- **Traefik network:** `miseia-net` (already running)
- **Port:** `30001`
- **MongoDB:** `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin` / DB: `ecommerce`
- **Infrastructure reference:** `D:\Master-IA-Dev\00-GoogleCloud\004_Infra_in_VM\docker-compose.yml`

This resolves `fn_deploy_publico_accesible` — a public URL with the project running, documented in README.

**Prerequisite:** `Dockerfile` must exist (created in `[004]_ci_github_fn_prompt.md`).

## Task
1. SSH into the VM and clone the GitHub repo to `~/MISEIA110_ecommerce`.
2. Create a `.env.production` file on the VM with production values.
3. Build and run the Docker container with Traefik integration labels.
4. Verify the app is accessible at `https://ecommerce.deviaaps.com`.
5. Run the seed script to populate the production database.
6. Update `README.md` with the live URL and note that admin credentials are `admin@shop.com / admin123`.

### Manual Deploy Steps (for initial setup)
```bash
# SSH into VM
ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186

# On VM
git clone https://github.com/Jorgeaapaz/MISEIA_1-4-110-ecommerce.git ~/MISEIA110_ecommerce
cd ~/MISEIA110_ecommerce

# Create production env
cat > .env.production << 'EOF'
MONGODB_URI=mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin
MONGODB_DB=ecommerce
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXT_PUBLIC_BASE_URL=https://ecommerce.deviaaps.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<from local .env.local>
STRIPE_PUBLISHABLE_KEY=<from local .env.local>
STRIPE_SECRET_KEY=<from local .env.local>
STRIPE_WEBHOOK_SECRET=<from local .env.local>
EOF

# Build Docker image
docker build -t ecommerce:latest .

# Run container
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

# Seed the production database
docker exec ecommerce npx tsx scripts/seed.ts
```

### Stripe Webhook Update
After deploy, update the Stripe webhook endpoint in the Stripe Dashboard:
- Old: `http://localhost:3000/api/stripe/webhook`  
- New: `https://ecommerce.deviaaps.com/api/stripe/webhook`

Update `STRIPE_WEBHOOK_SECRET` with the new signing secret from Stripe Dashboard.

## Output checklist and Guardrails
- [ ] App running at `https://ecommerce.deviaaps.com`
- [ ] `curl https://ecommerce.deviaaps.com` returns HTTP 200
- [ ] Login works with `admin@shop.com / admin123`
- [ ] Customer login works with `customer1@shop.com / pass1234`
- [ ] Stripe checkout flow works end-to-end (test mode)
- [ ] Stripe webhook endpoint updated to production URL
- [ ] README updated with live URL: `https://ecommerce.deviaaps.com`
- [ ] Docker container running with `docker ps` showing `ecommerce` up
- [ ] Commit: `docs: add production URL to README`
