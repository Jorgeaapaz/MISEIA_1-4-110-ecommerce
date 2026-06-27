@~/.claude/prompts/new_functionality_prompt_spec.md

# Create GitLab CI/CD Pipeline for Ecommerce App

## Role
Act as a Software Architect and DevOps Engineer, you are an expert in GitLab CI/CD and Google Cloud Services.

## Context
- **Project:** `1-4-110-ecommerce` — Next.js 16 ecommerce app
- **GitLab repo:** `https://gitlab.codecrypto.academy/Jorgeaapaz/MISEIA_1-4-110-ecommerce` (or equivalent)
- **Remote VM:** `gcvmuser@34.174.56.186` (GCI Ubuntu VM)
- **SSH key:** `C:\ubuntuiso\.ssh\vboxuser`
- **App directory on VM:** `~/MISEIA110_ecommerce`
- **Domain:** `ecommerce.deviaaps.com`
- **MongoDB connection (production):** `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`

Use /glab for all GitLab CLI operations.

**Prerequisite:** Tests from `[002]_tests_minimos_fn_prompt.md` must be implemented first.

## Task
Create a `.gitlab-ci.yml` pipeline with three stages: `test`, `build`, `deploy`. The pipeline must pass tests and linter on every push, build the Docker image only on `main`, and deploy to the GCI VM on `main`.

### .gitlab-ci.yml Guidelines
- **IMPORTANT:** Set `NODE_ENV=production` only as a variable inside the `build` job's `script` block (`export NODE_ENV=production && npm run build`), NOT as a job-level or global `variables:` entry. Other jobs (test, deploy) must not inherit it.
- Use `node:20-alpine` as the base image for test and build jobs.
- Use GitLab CI/CD variables (masked) for all secrets — never hardcode.
- Deploy job uses SSH to connect to the VM and run docker commands.
- Only `test` stage runs on merge requests; `build` and `deploy` only run on `main`.

### Pipeline Structure
```yaml
stages:
  - test
  - build
  - deploy

lint-and-test:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npm run lint
    - npm test
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'

build:
  stage: build
  image: node:20-alpine
  script:
    - npm ci
    - export NODE_ENV=production && npm run build
  artifacts:
    paths:
      - .next/
    expire_in: 1 hour
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - ssh-keyscan 34.174.56.186 >> ~/.ssh/known_hosts
  script:
    - ssh gcvmuser@34.174.56.186 "cd ~/MISEIA110_ecommerce && git pull origin main && docker build -t ecommerce:latest . && docker stop ecommerce || true && docker rm ecommerce || true && docker run -d --name ecommerce --network miseia-net --restart unless-stopped -p 30001:30001 -e MONGODB_URI='$MONGODB_URI' -e MONGODB_DB='$MONGODB_DB' -e AUTH_SECRET='$AUTH_SECRET' -e NEXT_PUBLIC_BASE_URL='$NEXT_PUBLIC_BASE_URL' -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' -e STRIPE_SECRET_KEY='$STRIPE_SECRET_KEY' -e STRIPE_WEBHOOK_SECRET='$STRIPE_WEBHOOK_SECRET' -l 'traefik.enable=true' -l 'traefik.http.routers.ecommerce.rule=Host(\`ecommerce.deviaaps.com\`)' -l 'traefik.http.routers.ecommerce.entrypoints=websecure' -l 'traefik.http.routers.ecommerce.tls=true' -l 'traefik.http.routers.ecommerce.tls.certresolver=cloudflare' -l 'traefik.http.services.ecommerce.loadbalancer.server.port=30001' ecommerce:latest"
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

### Set GitLab CI/CD Variables via glab CLI
```bash
glab variable set SSH_PRIVATE_KEY --value "$(cat C:\ubuntuiso\.ssh\vboxuser)" --masked --protected
glab variable set MONGODB_URI --value "mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin" --masked --protected
glab variable set MONGODB_DB --value "ecommerce" --masked
glab variable set AUTH_SECRET --value "<32-char-secret>" --masked --protected
glab variable set NEXT_PUBLIC_BASE_URL --value "https://ecommerce.deviaaps.com" --masked
glab variable set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "<from .env.local>" --masked
glab variable set STRIPE_SECRET_KEY --value "<from .env.local>" --masked --protected
glab variable set STRIPE_WEBHOOK_SECRET --value "<from .env.local>" --masked --protected
```

## Output checklist and Guardrails
- [ ] `.gitlab-ci.yml` at project root
- [ ] `NODE_ENV=production` only in the `build` job's script, NOT as a job-level variable
- [ ] All three stages defined: test, build, deploy
- [ ] Pipeline passes lint + tests on MR
- [ ] Pipeline builds and deploys on push to `main`
- [ ] All secrets set as masked GitLab CI/CD variables via glab
- [ ] SSH key variable set as protected and masked
- [ ] App accessible at `https://ecommerce.deviaaps.com` after deploy
- [ ] Commit: `ci: add GitLab CI/CD pipeline with GCI VM deploy`
