# Aplicación Ecommerce — MISEIA 1-4-110

Aplicación web de comercio electrónico completa construida con **Next.js 16 / React 19**, respaldada por **MongoDB**, pagos con **Stripe** y autenticación basada en JWT. Incluye panel de administración, catálogo de productos, carrito de compras y flujo completo de checkout.

**URL de producción:** [https://ecommerce.deviaaps.com](https://ecommerce.deviaaps.com)

---

## Funcionalidades Implementadas

### 1. Autenticación y Autorización
Sesiones basadas en cookies con JWT firmado (vía `jose`) y hash de contraseñas con `bcrypt`. Dos roles: `admin` y `customer`. El middleware (`proxy.ts`) protege todas las rutas `/admin/*`, `/cart` y `/orders`, redirigiendo a usuarios no autenticados hacia `/login`.

### 2. Catálogo de Productos y Carrito de Compras
Catálogo público con navegación por categorías y páginas de detalle por producto. Los clientes autenticados pueden agregar artículos a un carrito persistente respaldado en MongoDB, actualizar cantidades y eliminar artículos mediante llamadas a la API REST desde Client Components.

### 3. Stripe Checkout y Webhooks
Al hacer checkout, se crea una orden `pending` en MongoDB y se abre una Stripe Checkout Session (página alojada por Stripe). El endpoint de webhook (`/api/stripe/webhook`) maneja el evento `checkout.session.completed` para marcar las órdenes como `paid` y decrementar el stock de productos de forma atómica.

### 4. Panel de Administración
CRUD completo sobre productos y gestión del estado de órdenes. El dashboard muestra estadísticas clave (ingresos totales, órdenes, productos, clientes) obtenidas directamente de MongoDB en Server Components.

---

## Estructura del Proyecto

```
ecommerce/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                        ← Inicio / catálogo de productos
│   │   ├── login/page.tsx                  ← Formulario de inicio de sesión
│   │   ├── register/page.tsx               ← Formulario de registro
│   │   └── products/[id]/
│   │       ├── page.tsx                    ← Detalle de producto
│   │       └── AddToCartButton.tsx         ← Client Component para carrito
│   ├── (customer)/
│   │   ├── cart/page.tsx                   ← Carrito de compras
│   │   ├── orders/page.tsx                 ← Historial de órdenes del cliente
│   │   └── checkout/
│   │       ├── success/page.tsx            ← Pago exitoso
│   │       └── cancel/page.tsx             ← Pago cancelado
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx                  ← Layout con sidebar oscuro
│   │       ├── page.tsx                    ← Dashboard con estadísticas
│   │       ├── products/page.tsx           ← Lista de productos + CRUD
│   │       ├── products/new/page.tsx       ← Crear producto
│   │       ├── products/[id]/edit/page.tsx ← Editar producto
│   │       ├── orders/page.tsx             ← Todas las órdenes + estado
│   │       └── customers/page.tsx          ← Lista de clientes
│   ├── api/
│   │   ├── auth/login/route.ts             ← POST login → cookie JWT
│   │   ├── auth/logout/route.ts            ← POST logout → borrar cookie
│   │   ├── auth/register/route.ts          ← POST registro
│   │   ├── cart/route.ts                   ← GET / POST / DELETE carrito
│   │   ├── checkout/route.ts               ← POST → crear sesión Stripe
│   │   ├── stripe/webhook/route.ts         ← Manejador de webhooks Stripe
│   │   ├── admin/products/route.ts         ← GET lista / POST crear
│   │   ├── admin/products/[id]/route.ts    ← GET / PUT / DELETE por ID
│   │   ├── admin/orders/route.ts           ← GET todas las órdenes
│   │   └── admin/orders/[id]/route.ts      ← GET / PUT orden por ID
│   ├── components/Header.tsx               ← Navegación con estado de auth
│   ├── layout.tsx                          ← Layout raíz (fuentes, globals)
│   └── page.tsx                            ← Catálogo / landing
├── lib/
│   ├── db.ts                               ← Singleton de MongoDB
│   ├── auth.ts                             ← Helpers JWT crear / verificar
│   └── types.ts                            ← Interfaces TypeScript del dominio
├── __tests__/
│   └── unit/
│       ├── auth.test.ts                    ← 9 tests JWT y cookies
│       ├── money.test.ts                   ← 6 tests modelo cents-first
│       └── api-validation.test.ts          ← 12 tests validación de rutas API
├── docs/
│   ├── adr/                                ← 6 Architecture Decision Records
│   ├── compliance/                         ← Reporte de cumplimiento + PERT + 11 prompts
│   ├── AI-USAGE.md                         ← Registro de uso de IA
│   └── RETROSPECTIVE-2026-06-27.md        ← Retrospectiva de sesión (inglés)
├── scripts/
│   └── seed.ts                             ← Seed de BD (usuarios, productos, órdenes)
├── proxy.ts                                ← Middleware de protección de rutas
├── Dockerfile                              ← Build multi-stage para producción
├── .dockerignore
├── vitest.config.ts                        ← Configuración de Vitest
├── vitest.setup.ts                         ← Variables de entorno para tests
├── .github/workflows/ci-cd.yml            ← Pipeline GitHub Actions (test→build→deploy)
├── .gitlab-ci.yml                          ← Pipeline GitLab CI (test→build→deploy)
├── next.config.ts                          ← Next.js config (output: standalone)
├── tsconfig.json
├── postcss.config.mjs
├── package.json                            ← Dependencias y scripts npm
├── package-lock.json                       ← Lockfile npm — reproducibilidad exacta
├── .env.example                            ← Plantilla de variables de entorno
└── .env.local                              ← Variables de entorno (no versionado)
```

---

## Arquitectura del Sistema

```mermaid
graph TD
    Browser["Navegador"]
    Traefik["Traefik (reverse proxy + TLS)"]
    App["Next.js App (Docker :30001)"]
    Proxy["proxy.ts (middleware)"]
    Pages["Server Components"]
    API["API Routes"]
    Auth["lib/auth.ts (JWT)"]
    CheckoutAPI["POST /api/checkout"]
    WebhookAPI["POST /api/stripe/webhook"]
    Stripe["Stripe"]
    DB["lib/db.ts (singleton)"]
    MongoDB[("MongoDB")]

    Browser -->|HTTPS| Traefik
    Traefik -->|forward| App
    App --> Proxy
    Proxy -->|admin/customer| Pages
    Proxy -->|public| Pages
    Proxy -->|no autenticado| Browser

    Pages -->|lectura directa\nServer Components| DB
    Browser -->|fetch| API
    API --> DB
    API --> Auth
    CheckoutAPI -->|crear sesion| Stripe
    Stripe -->|checkout.session.completed| WebhookAPI
    WebhookAPI -->|actualizar orden + stock| DB
    DB <--> MongoDB
```

---

## Patrones de Diseño y Arquitectura

| Patrón | Implementación |
|---|---|
| **Singleton DB** | `lib/db.ts` mantiene una única instancia de `MongoClient` entre requests |
| **Repositorio vía Route Handlers** | Todas las mutaciones pasan por API routes; los Server Components leen directo de MongoDB |
| **Control de Acceso por Roles** | `proxy.ts` inspecciona el JWT antes de cada página — separación admin/customer en el middleware |
| **Modelo cents-first** | Precios almacenados como enteros (centavos); formato `$XX.XX` solo en render |
| **Stripe Checkout + Webhook** | Estado de orden gestionado por eventos de Stripe, no por redirección del cliente |
| **Lazy initialization** | Clientes SDK (Stripe) inicializados solo en tiempo de request, nunca a nivel de módulo |

---

## Primeros Pasos

### Prerequisitos

| Herramienta | Versión |
|---|---|
| Node.js | 20+ |
| MongoDB | 7+ (local o Atlas) |
| Cuenta Stripe | Cualquiera (modo test) |

### Clonar e instalar

```bash
git clone https://github.com/Jorgeaapaz/MISEIA_1-4-110-ecommerce.git
cd MISEIA_1-4-110-ecommerce
npm install
```

> El proyecto incluye `package-lock.json` en el repositorio para garantizar instalaciones completamente reproducibles. En entornos de CI/CD se usa siempre `npm ci` — respeta las versiones exactas del lockfile e instala más rápido que `npm install`.

### Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores reales:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ecommerce
AUTH_SECRET=reemplaza-con-string-aleatorio-32-chars
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publicable
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publicable
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_WEBHOOK_SECRET=whsec_tu_secreto_de_webhook
```

### Sembrar la base de datos

```bash
npx tsx scripts/seed.ts
```

Crea:
- 1 admin: `admin@shop.com` / `admin123`
- 5 clientes: `customer1@shop.com` ... `customer5@shop.com` / `pass1234`
- 15 productos en categorías Electronics, Books y Home
- 5 órdenes de ejemplo en distintos estados

### Ejecutar en desarrollo

```bash
npm run dev
# Abrir http://localhost:3000
```

Para webhooks de Stripe en local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Build de producción (standalone) |
| `npm start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm test` | 27 tests con Vitest |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Reporte de cobertura |
| `npm run seed` | Seed de la base de datos |

---

## Flujos de Ejemplo

### Compra exitosa

1. Registrarse o iniciar sesión como cliente
2. Catálogo → producto → **Agregar al Carrito**
3. **Carrito** → **Checkout** → página Stripe
4. Tarjeta de prueba: `4242 4242 4242 4242` (fecha futura, cualquier CVC)
5. `/checkout/success` — orden marcada como `paid` por webhook

### Administración de productos

1. Iniciar sesión como `admin@shop.com` / `admin123`
2. `/admin/products` → **Nuevo Producto**
3. Completar campos (precio en dólares → almacenado en centavos)
4. Producto disponible en catálogo inmediatamente

### Checkout cancelado

1. Iniciar checkout → clic en **Volver** en Stripe
2. Redirigido a `/checkout/cancel`
3. Orden permanece `pending`; carrito conservado

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Base de Datos | MongoDB 7 (driver nativo, sin ORM) |
| Autenticación | JWT vía `jose` + `bcrypt` |
| Pagos | Stripe Checkout + Webhooks |
| Estilos | Tailwind CSS 4 |
| Lenguaje | TypeScript 5 |
| Testing | Vitest + @vitest/coverage-v8 |
| Contenedores | Docker multi-stage (standalone output) |
| CI/CD | GitHub Actions + GitLab CI |
| Proxy Inverso | Traefik v3 (TLS wildcard `*.deviaaps.com`) |

---

## Cobertura de Tests

```bash
npm test              # 27 tests
npm run test:coverage # reporte de cobertura
```

| Archivo | Sentencias | Funciones | Líneas |
|---|---|---|---|
| `lib/auth.ts` | 67% | 75% | 71% |
| `app/api/auth/login` | 57% | 100% | 57% |
| `app/api/cart` | 39% | 80% | 40% |
| `app/api/auth/register` | 31% | 100% | 31% |

Cobertura parcial intencional: rutas con dependencia de MongoDB real usan mock en tests unitarios; tests de integración son iteración futura.

---

## Decisiones de Arquitectura (ADRs)

Ver [`docs/adr/`](docs/adr/):

| ADR | Decisión |
|---|---|
| [001](docs/adr/001-mongodb-over-postgresql.md) | MongoDB sobre PostgreSQL |
| [002](docs/adr/002-jwt-cookies-over-session-store.md) | JWT en cookies sobre Session Store *(benchmarks de latencia)* |
| [003](docs/adr/003-native-mongodb-driver-over-mongoose.md) | Driver nativo sobre Mongoose |
| [004](docs/adr/004-nextjs-app-router-server-components.md) | Next.js App Router + Server Components *(bundle size)* |
| [005](docs/adr/005-stripe-checkout-over-elements.md) | Stripe Checkout sobre Elements |
| [006](docs/adr/006-cents-first-money-model.md) | Modelo cents-first *(prueba de precision flotante)* |

---

## Evaluación de Cumplimiento

Ver [`docs/compliance/`](docs/compliance/):
- `compliance-report.md` — análisis completo (21/30 inicial → cumplimiento total tras PERT)
- `pert-compliance-plan.md` — plan de ejecución con 11 tareas
- 11 archivos de prompts disciplinados `[001]` ... `[011]`

---

## Uso de Inteligencia Artificial

Ver [`docs/AI-USAGE.md`](docs/AI-USAGE.md) — registro detallado del código generado por IA y las correcciones críticas aplicadas (Claude Code / claude-sonnet-4-6).

Ver [`docs/RETROSPECTIVE-2026-06-27.md`](docs/RETROSPECTIVE-2026-06-27.md) — retrospectiva completa de la sesión en inglés.

---

## Despliegue

### URL en Producción

**[https://ecommerce.deviaaps.com](https://ecommerce.deviaaps.com)**

Desplegado en VM GCI (`34.174.56.186`) vía Docker + Traefik.

### Build Local con Docker

```bash
docker build -t ecommerce:latest .
docker run -p 30001:30001 --env-file .env.local ecommerce:latest
# http://localhost:30001
```

### Despliegue Manual en VM GCI

```bash
# 1. Conectarse a la VM
ssh -i ~/.ssh/vboxuser gcvmuser@34.174.56.186

# 2. Clonar (solo primera vez)
git clone https://github.com/Jorgeaapaz/MISEIA_1-4-110-ecommerce.git ~/MISEIA110_ecommerce
cd ~/MISEIA110_ecommerce

# 3. Crear env de producción
cp .env.example .env.production
nano .env.production

# 4. Build y arranque
docker build -t ecommerce:latest .

# IMPORTANTE: comillas simples protegen los backticks del Host()
# de la interpretacion del shell
TRAEFIK_RULE='traefik.http.routers.ecommerce.rule=Host(`ecommerce.deviaaps.com`)'
docker run -d \
  --name ecommerce \
  --network miseia-net \
  --restart unless-stopped \
  --env-file .env.production \
  --label traefik.enable=true \
  --label "$TRAEFIK_RULE" \
  --label traefik.http.routers.ecommerce.entrypoints=websecure \
  --label traefik.http.routers.ecommerce.tls=true \
  --label traefik.http.routers.ecommerce.tls.certresolver=cloudflare \
  --label traefik.http.services.ecommerce.loadbalancer.server.port=30001 \
  ecommerce:latest

# 5. Seed (solo primer despliegue)
docker exec ecommerce npx tsx scripts/seed.ts

# 6. Verificar
curl -I https://ecommerce.deviaaps.com
```

### Despliegue Continuo (CD)

Los pushes a `main` disparan automáticamente:

**GitHub Actions** (`.github/workflows/ci-cd.yml`): test → build → deploy

Secrets requeridos en GitHub:

| Secret | Descripción |
|---|---|
| `SSH_PRIVATE_KEY` | Clave privada SSH a la VM |
| `MONGODB_URI` | URI de conexión MongoDB |
| `MONGODB_DB` | Nombre de la base de datos |
| `AUTH_SECRET` | Secreto JWT (32 chars) |
| `NEXT_PUBLIC_BASE_URL` | URL pública de la app |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave publicable Stripe |
| `STRIPE_PUBLISHABLE_KEY` | Clave publicable Stripe |
| `STRIPE_SECRET_KEY` | Clave secreta Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook Stripe |

**GitLab CI** (`.gitlab-ci.yml`): mismas variables en `Settings → CI/CD → Variables`.

> `NODE_ENV=production` se define SOLO en el comando `npm run build`, nunca como variable de trabajo — evita que `npm ci` omita las devDependencies.

### Webhook de Stripe (Producción)

[Dashboard Stripe → Webhooks](https://dashboard.stripe.com/webhooks):
- **Endpoint:** `https://ecommerce.deviaaps.com/api/stripe/webhook`
- **Eventos:** `checkout.session.completed`
- Copiar secreto de firma → `STRIPE_WEBHOOK_SECRET` en `.env.production`

---

## Colecciones de MongoDB

| Colección | Campos principales |
|---|---|
| `users` | `_id`, `email`, `passwordHash`, `role` (`admin`\|`customer`), `name`, `createdAt` |
| `products` | `_id`, `name`, `description`, `price` (centavos), `stock`, `category`, `active` |
| `orders` | `_id`, `customerId`, `items [{productId, name, qty, unitPrice}]`, `total`, `status`, `stripeSessionId`, `createdAt` |
| `carts` | `_id`, `customerId`, `items [{productId, name, qty, unitPrice}]`, `updatedAt` |
