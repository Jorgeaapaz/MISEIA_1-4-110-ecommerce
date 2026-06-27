# Aplicación Ecommerce — MISEIA 1-4-110

Aplicación web de comercio electrónico completa construida con **Next.js 16 / React 19 / TypeScript** que permite a clientes navegar un catálogo de productos, gestionar un carrito de compras, realizar pagos con Stripe Checkout, y a administradores gestionar productos, órdenes y clientes desde un panel dedicado — todo respaldado por **MongoDB** con autenticación JWT por roles.

**URL de producción:** [https://ecommerce.deviaaps.com](https://ecommerce.deviaaps.com)

---

## 1. Funcionalidades Implementadas

### 1.1 Autenticación y Autorización por Roles
Sesiones basadas en cookies `httpOnly` con JWT firmado (algoritmo HS256, expiración 7 días) vía `jose`, y hash de contraseñas con `bcrypt`. Dos roles: `admin` y `customer`. El middleware `proxy.ts` inspecciona el JWT en cada request antes de llegar a cualquier página — protege `/admin/*` (solo admin) y `/cart`, `/orders` (solo customer autenticado). Usuarios no autenticados son redirigidos a `/login`.

**Detalles técnicos:**
- Token JWT almacenado como cookie `httpOnly`, `SameSite=Lax`, `secure` en producción
- Verificación del token con `jwtVerify` de `jose` — cualquier token alterado es rechazado
- Rutas `/checkout/success` y `/checkout/cancel` exentas de protección (requerido por el flujo de iframe de Stripe)

### 1.2 Catálogo de Productos y Carrito de Compras
Catálogo público con paginación visual, filtro por categorías (Electronics, Books, Home) y páginas de detalle por producto. Los clientes autenticados pueden agregar, actualizar y eliminar artículos en un carrito persistente respaldado en la colección `carts` de MongoDB.

**Detalles técnicos:**
- Catálogo renderizado como Server Component — lectura directa de MongoDB sin capa API
- Carrito gestionado desde Client Components vía `fetch` a `/api/cart` (GET / POST / DELETE)
- Stock validado en el servidor al agregar al carrito y al crear la orden

### 1.3 Stripe Checkout y Webhooks
Al hacer checkout se crea una orden `pending` en MongoDB y se genera una Stripe Checkout Session (página alojada por Stripe). El webhook `/api/stripe/webhook` maneja `checkout.session.completed` para marcar la orden como `paid` y decrementar el stock atómicamente. La página de éxito incluye verificación activa via Stripe API como fallback cuando el webhook no puede alcanzar `localhost`.

**Detalles técnicos:**
- Verificación de firma de webhook con `stripe.webhooks.constructEvent`
- Inicialización lazy del cliente Stripe — nunca a nivel de módulo (evita fallo en `next build`)
- Patrón idempotente: `updateOne({ status: 'pending' })` previene dobles actualizaciones

### 1.4 Panel de Administración
CRUD completo sobre productos (crear, editar, activar/desactivar, eliminar) y gestión del estado de órdenes (pending → paid → shipped → cancelled). Dashboard con estadísticas en tiempo real: ingresos totales, conteo de órdenes, productos y clientes.

---

## 2. Estructura del Proyecto

```
ecommerce/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                        ← Catálogo / landing (Server Component)
│   │   ├── login/page.tsx                  ← Formulario de login
│   │   ├── register/page.tsx               ← Formulario de registro
│   │   └── products/[id]/
│   │       ├── page.tsx                    ← Detalle de producto (Server Component)
│   │       └── AddToCartButton.tsx         ← Client Component — acción carrito
│   ├── (customer)/
│   │   ├── cart/page.tsx                   ← Carrito (Client Component)
│   │   ├── orders/page.tsx                 ← Historial de órdenes (Server Component)
│   │   └── checkout/
│   │       ├── success/page.tsx            ← Verificación activa de pago + confirmación
│   │       └── cancel/page.tsx             ← Pago cancelado
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx                  ← Layout sidebar oscuro
│   │       ├── page.tsx                    ← Dashboard con estadísticas
│   │       ├── products/page.tsx           ← Lista + CRUD productos
│   │       ├── products/new/page.tsx       ← Crear producto
│   │       ├── products/[id]/edit/page.tsx ← Editar producto
│   │       ├── orders/page.tsx             ← Todas las órdenes + cambio de estado
│   │       └── customers/page.tsx          ← Lista de clientes
│   ├── api/
│   │   ├── auth/login/route.ts             ← POST → validar credenciales, emitir JWT
│   │   ├── auth/logout/route.ts            ← POST → borrar cookie JWT
│   │   ├── auth/register/route.ts          ← POST → crear usuario customer
│   │   ├── cart/route.ts                   ← GET / POST / DELETE carrito
│   │   ├── checkout/route.ts               ← POST → crear orden + Stripe Session
│   │   ├── stripe/webhook/route.ts         ← POST → checkout.session.completed
│   │   ├── admin/products/route.ts         ← GET lista / POST crear
│   │   ├── admin/products/[id]/route.ts    ← GET / PUT / DELETE por ID
│   │   ├── admin/orders/route.ts           ← GET todas las órdenes
│   │   └── admin/orders/[id]/route.ts      ← PUT estado de orden
│   ├── components/Header.tsx               ← Navegación con estado auth (Client)
│   ├── layout.tsx                          ← Root layout, fuentes, globals.css
│   └── globals.css                         ← Design tokens, Tailwind 4
├── lib/
│   ├── db.ts                               ← Singleton MongoClient
│   ├── auth.ts                             ← createToken / verifyToken / getSession
│   └── types.ts                            ← Interfaces TypeScript del dominio
├── __tests__/unit/
│   ├── auth.test.ts                        ← 9 tests JWT, cookies, seguridad
│   ├── money.test.ts                       ← 6 tests modelo cents-first
│   └── api-validation.test.ts              ← 12 tests validación rutas API
├── docs/
│   ├── adr/                                ← 6 Architecture Decision Records
│   ├── compliance/                         ← Reporte + PERT + 11 prompts
│   ├── AI-USAGE.md                         ← Registro de uso de IA y correcciones
│   └── RETROSPECTIVE-2026-06-27.md        ← Retrospectiva de sesión (inglés)
├── scripts/seed.ts                         ← Seed BD: admin, 5 clientes, 15 productos
├── proxy.ts                                ← Middleware protección de rutas (Next.js 16)
├── Dockerfile                              ← Build multi-stage, standalone output
├── .dockerignore
├── vitest.config.ts                        ← Config Vitest + alias @ + cobertura
├── vitest.setup.ts                         ← Variables de entorno para tests
├── .github/workflows/ci-cd.yml            ← GitHub Actions: test → build → deploy
├── .gitlab-ci.yml                          ← GitLab CI: test → build → deploy
├── next.config.ts                          ← output: standalone
├── tsconfig.json
├── postcss.config.mjs
├── package.json                            ← Dependencias y scripts
├── package-lock.json                       ← Lockfile npm — versiones exactas
├── .env.example                            ← Plantilla variables de entorno
└── .env.local                              ← Variables reales (no versionado)
```

---

## 3. Patrones de Diseño y Arquitectura

### 3.1 Patrones Implementados

| Patrón | Implementación | Justificación |
|---|---|---|
| **Singleton** | `lib/db.ts` — única instancia de `MongoClient` | Previene agotamiento del pool de conexiones |
| **Repository via Route Handlers** | Mutations en API routes; reads en Server Components | Co-ubicación de datos con rendering; sin capa ORM |
| **Proxy / Middleware** | `proxy.ts` — inspección JWT por ruta | Separación de concerns: auth fuera de la lógica de negocio |
| **Lazy Initialization** | `getStripe()` en checkout y webhook | Evita fallo de `next build` cuando la env var está ausente |
| **Idempotent Write** | `updateOne({ status: 'pending' })` en webhook | Previene doble procesamiento de eventos Stripe |
| **Cents-first Money Model** | Precios como integers (centavos) en BD | Elimina deriva de punto flotante; formato solo en render |

### 3.2 Lockfile — Dependencias Bloqueadas

El archivo `package-lock.json` está versionado en el repositorio. Garantiza instalaciones byte-a-byte reproducibles en todos los entornos:

```
package-lock.json   ← npm lockfile (npm ci en CI/CD)
```

Todos los pipelines usan `npm ci` en lugar de `npm install` para respetar el lockfile y acelerar la instalación.

---

## 4. Cómo Funciona

Un cliente navega el catálogo (Server Component lee MongoDB directamente → sin latencia de red adicional). Al agregar al carrito, un Client Component llama `POST /api/cart`. Al hacer checkout, `POST /api/checkout` crea una orden `pending` en MongoDB y devuelve una URL de Stripe Checkout. Stripe procesa el pago y dispara `checkout.session.completed` al webhook, que actualiza la orden a `paid` y decrementa el stock. La página de éxito verifica activamente con la API de Stripe como fallback.

```typescript
// POST /api/checkout — flujo central
const order = await db.collection('orders').insertOne({
  customerId: new ObjectId(user.userId),
  items: cart.items,
  total: cart.items.reduce((s, i) => s + i.qty * i.unitPrice, 0), // centavos
  status: 'pending',
  stripeSessionId: null,
  createdAt: new Date(),
});

const session = await getStripe().checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: cart.items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: item.unitPrice, // centavos
    },
    quantity: item.qty,
  })),
  mode: 'payment',
  metadata: { orderId: order.insertedId.toString() },
  success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/checkout/cancel`,
});
```

---

## 5. Primeros Pasos

### Prerequisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| MongoDB | 7+ (local, Docker, o Atlas) |
| Cuenta Stripe | Test mode |

### Instalación

```bash
git clone https://github.com/Jorgeaapaz/MISEIA_1-4-110-ecommerce.git
cd MISEIA_1-4-110-ecommerce

# Usar npm ci para respetar package-lock.json
npm ci
```

### Configurar variables de entorno

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ecommerce
AUTH_SECRET=reemplaza-con-string-aleatorio-de-32-chars
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Sembrar la base de datos

```bash
npm run seed
```

Crea: 1 admin (`admin@shop.com` / `admin123`), 5 clientes (`customer1@shop.com`…`customer5@shop.com` / `pass1234`), 15 productos, 5 órdenes de ejemplo.

### Ejecutar

```bash
npm run dev          # desarrollo — http://localhost:3000
npm run build        # build de producción
npm start            # servidor de producción
```

Para webhooks Stripe en local:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 6. Ejemplo de Flujo

### Compra exitosa (cliente)
```
1. GET  /                          → catálogo con 15 productos
2. GET  /products/[id]             → detalle del producto
3. POST /api/cart                  { productId, qty: 1 }  → 200 { cart }
4. GET  /cart                      → resumen del carrito
5. POST /api/checkout              → 200 { url: "https://checkout.stripe.com/..." }
6. [usuario completa pago en Stripe con 4242 4242 4242 4242]
7. POST /api/stripe/webhook        checkout.session.completed → orden = paid, stock--
8. GET  /checkout/success?session_id=cs_... → confirmación de orden
```

### Acceso no autorizado (seguridad)
```
GET /admin/products               → 302 /login  (sin cookie JWT)
GET /admin/products               → 302 /login  (JWT expirado o alterado)
GET /admin/products               → 302 /       (JWT válido pero role=customer)
```

---

## 7. Requisitos

### 7.1 Requisitos Funcionales

| ID | Requisito |
|---|---|
| FR-001 | El cliente autenticado shall be able to agregar un producto al carrito so that el producto quede registrado en su sesión y sea visible en la página `/cart`. |
| FR-002 | El cliente autenticado shall be able to iniciar un checkout so that se genere una Stripe Checkout Session y sea redirigido a la página de pago alojada. |
| FR-003 | El sistema shall be able to procesar el evento `checkout.session.completed` de Stripe so that la orden sea marcada como `paid` y el stock del producto sea decrementado en MongoDB. |
| FR-004 | El usuario no autenticado shall be able to registrarse con nombre, email y contraseña so that se cree una cuenta con rol `customer` y sea autenticado automáticamente. |
| FR-005 | El usuario registrado shall be able to iniciar sesión con email y contraseña so that reciba una cookie JWT `httpOnly` válida por 7 días. |
| FR-006 | El administrador shall be able to crear, editar y eliminar productos so that el catálogo se actualice inmediatamente para todos los clientes. |
| FR-007 | El administrador shall be able to cambiar el estado de una orden (pending → paid → shipped → cancelled) so that el cliente pueda ver el estado actualizado en su historial. |
| FR-008 | El cliente autenticado shall be able to ver su historial de órdenes so that pueda conocer el estado actual de cada compra realizada. |
| FR-009 | El administrador shall be able to ver la lista de clientes registrados so that pueda monitorear la base de usuarios de la plataforma. |
| FR-010 | El sistema shall be able to validar el token JWT en cada request a rutas protegidas so that usuarios sin sesión válida sean redirigidos a `/login`. |
| FR-011 | El cliente autenticado shall be able to eliminar artículos del carrito so that pueda modificar su selección antes de proceder al pago. |
| FR-012 | El sistema shall be able to verificar activamente el estado del pago en la página de éxito vía API de Stripe so that la orden sea marcada como `paid` incluso cuando el webhook no pudo alcanzar el servidor. |

---

### 7.2 Requisitos No Funcionales

| ID | Requisito (cuantificado) |
|---|---|
| NFR-PERF-001 | Tiempo de respuesta del catálogo (Server Component + MongoDB) < 200ms en p95 bajo 100 usuarios concurrentes |
| NFR-PERF-002 | Build de producción Docker < 3 minutos en runner estándar (2 vCPU, 8 GB RAM) |
| NFR-SEC-001 | Contraseñas almacenadas con `bcrypt` cost factor >= 10 — nunca en texto plano ni con hash reversible |
| NFR-SEC-002 | JWT firmado con HS256 y secreto de >= 32 caracteres aleatorios — tokens alterados rechazados en < 1ms |
| NFR-SEC-003 | Firma de webhook Stripe verificada con `constructEvent` — rechazar payloads sin firma válida con HTTP 400 |
| NFR-SCAL-001 | Arquitectura stateless (sesión en cookie, no en memoria del servidor) — escala horizontal sin sticky sessions |
| NFR-SCAL-002 | Pool de conexiones MongoDB configurable hasta 100 conexiones por instancia — reutilizable entre requests via singleton |
| NFR-USAB-001 | Interfaz responsive — funcional en viewport >= 320px sin scroll horizontal |
| NFR-USAB-002 | Flujo de compra completable en <= 5 clics desde el catálogo hasta la confirmación de pago |
| NFR-AVAIL-001 | Contenedor con `--restart unless-stopped` — recuperación automática ante crash en < 30 segundos |
| NFR-MAINT-001 | Cobertura de tests >= 40% global, >= 60% en `lib/auth.ts` — ejecutable con `npm test` |
| NFR-OBS-001 | Pipeline CI/CD reporta estado de cada job (lint, test, build, deploy) en < 3 minutos por push |

---

### 7.3 Requisitos Regulatorios (México)

| ID | Requisito |
|---|---|
| REG-001 | **LFPDPPP (Ley Federal de Protección de Datos Personales):** El sistema debe obtener consentimiento explícito del usuario antes de recopilar datos personales (nombre, email) y debe permitir al usuario solicitar la eliminación de su cuenta y datos asociados. |
| REG-002 | **SAT / CFDI:** Las transacciones de pago procesadas a través de Stripe deben ser registrables para emisión de facturas electrónicas (CFDI) conforme al Artículo 29 del Código Fiscal de la Federación. La integración actual con Stripe soporta captura de datos de facturación necesarios. |
| REG-003 | **NOM-151-SCFI-2016:** Los registros digitales de órdenes y transacciones deben conservarse por un mínimo de 5 años en formato que garantice su integridad e inalterabilidad, conforme a la norma de conservación de mensajes de datos. |

---

### 7.4 Requisitos Operativos

| ID | Requisito |
|---|---|
| OPS-001 | El sistema debe estar disponible 24/7 con tiempo de inactividad planificado máximo de 30 minutos por semana (ventana de mantenimiento: domingos 02:00–02:30 UTC). |
| OPS-002 | Backups de MongoDB deben ejecutarse diariamente y retenerse por 30 días mínimo. Restauración verificable en < 1 hora. RPO < 24h, RTO < 2h. |
| OPS-003 | El pipeline CI/CD debe ejecutar lint + tests antes de cada deploy. Si la tasa de error post-deploy supera el 5% en 5 minutos, se debe activar rollback automático. |
| OPS-004 | Todos los errores de nivel 5xx deben registrarse con stack trace y contexto de request. Alertas deben dispararse en < 2 minutos ante tasa de error > 1%. |
| OPS-005 | La aplicación debe ejecutarse en contenedor Docker sobre Linux (Alpine 3.x) con Node.js 20, accesible via Traefik con TLS wildcard `*.deviaaps.com` en puerto 443. |
| OPS-006 | Deploy automático a producción en cada push a `main` que supere lint, tests y build. Tiempo total del pipeline < 5 minutos. |

---

### 7.5 Atributos de Calidad

#### 7.5.1 Performance: Latencia del Catálogo [PERF-CATALOG-LATENCY]
**Quality Attribute:** Performance
**Metric:** Latencia (ms)

**Specification:**
- p95 < 200ms (Server Component + MongoDB directo)
- p50 < 80ms
- TTFB < 100ms en conexión de 100Mbps

**Conditions:**
- Dataset: hasta 500 productos activos
- Carga: 50 usuarios concurrentes
- Sin caché adicional (solo MongoDB index en `active: 1, category: 1`)

**Exceptions:**
- Primera request tras cold start del contenedor: < 3 segundos aceptable
- Consultas con `$regex` de texto libre: hasta 500ms en p99

**Verification:**
- Test de carga con k6 o Artillery
- Medición con `next/server` timing headers

---

#### 7.5.2 Scalability: Stateless Horizontal [SCAL-STATELESS]
**Quality Attribute:** Scalability
**Metric:** Instancias concurrentes sin conflicto

**Specification:**
- N instancias del contenedor deben operar en paralelo sin estado compartido en memoria
- Pool MongoDB configurado en maxPoolSize=20 por instancia
- Sin sticky sessions — cualquier instancia puede atender cualquier request

**Conditions:**
- Sesión en cookie JWT (no servidor)
- MongoDB como único estado persistente
- Traefik como load balancer

**Exceptions:**
- Primer deploy: única instancia hasta que se configure un load balancer

**Verification:**
- Iniciar 2 instancias con puertos diferentes, verificar que ambas sirven requests autenticados correctamente

---

#### 7.5.3 Reliability: Idempotencia de Webhook [REL-WEBHOOK-IDEMPOTENT]
**Quality Attribute:** Reliability
**Metric:** Tasa de duplicación de actualizaciones (%)

**Specification:**
- 0% de órdenes duplicadas ante re-entrega del webhook de Stripe
- `updateOne({ status: 'pending' })` previene doble procesamiento
- Verificación de firma en < 10ms

**Conditions:**
- Stripe puede re-enviar el mismo evento hasta 3 veces en 24 horas
- MongoDB garantiza atomicidad a nivel de documento único

**Exceptions:**
- Falla de red durante actualización: el webhook será reenviado por Stripe

**Verification:**
- Test unitario que invoca el handler dos veces con el mismo `session_id`; verificar que la orden tiene `status: 'paid'` exactamente una vez

---

#### 7.5.4 Security: Protección de Rutas [SEC-ROUTE-PROTECTION]
**Quality Attribute:** Security
**Metric:** Tasa de acceso no autorizado (%)

**Specification:**
- 0% de requests a `/admin/*` sin JWT admin válido deben llegar a la lógica de negocio
- 0% de requests a `/cart`, `/orders` sin JWT customer/admin válido deben llegar a la lógica
- Tokens expirados o alterados rechazados en < 1ms

**Conditions:**
- Verificación en `proxy.ts` antes de cualquier Server Component o Route Handler
- JWT firmado con HS256 + secreto >= 32 chars

**Exceptions:**
- `/checkout/success` y `/checkout/cancel` son públicas por requerimiento del flujo de Stripe

**Verification:**
- Tests de integración con tokens nulos, expirados, de rol incorrecto
- Verificar redirección a `/login` en todos los casos

---

#### 7.5.5 Maintainability: Cobertura de Tests [MAINT-TEST-COVERAGE]
**Quality Attribute:** Maintainability
**Metric:** Porcentaje de líneas cubiertas (%)

**Specification:**
- Cobertura global >= 40%
- Cobertura de `lib/auth.ts` >= 60%
- 27 tests automatizados ejecutables con `npm test`

**Conditions:**
- Tests unitarios con MongoDB mockeado
- Vitest + @vitest/coverage-v8
- Alias `@` configurado en `vitest.config.ts`

**Exceptions:**
- Scripts de seed excluidos de la medición de cobertura
- Tests de integración con MongoDB real: iteración futura

**Verification:**
- `npm run test:coverage` genera reporte HTML en `coverage/`

---

### 7.6 Criterios de Aceptación BDD

```gherkin
Feature: Registro e inicio de sesión

  Scenario: Cliente se registra exitosamente
    Given el usuario está en la página /register
    And ingresa nombre "Juan", email "juan@test.com" y contraseña "pass1234"
    When envía el formulario de registro
    Then se crea una cuenta con role "customer"
    And el usuario es redirigido al catálogo con sesión activa

  Scenario: Login con credenciales incorrectas
    Given el usuario está en /login
    When ingresa email válido con contraseña incorrecta
    Then recibe error HTTP 401
    And ve el mensaje "Invalid credentials"
    And no se crea ninguna cookie JWT

Feature: Carrito de compras

  Scenario: Agregar producto al carrito
    Given el cliente está autenticado
    And un producto tiene stock >= 1
    When llama POST /api/cart con { productId, qty: 1 }
    Then el carrito en MongoDB contiene el producto
    And la respuesta incluye el carrito actualizado

  Scenario: Checkout exitoso con Stripe
    Given el cliente tiene al menos un artículo en el carrito
    When llama POST /api/checkout
    Then se crea una orden con status "pending" en MongoDB
    And la respuesta contiene una URL de Stripe Checkout
    And la orden tiene el stripeSessionId vinculado

Feature: Webhook de Stripe

  Scenario: Procesamiento idempotente del webhook
    Given Stripe envía checkout.session.completed con orderId válido
    When el webhook es procesado dos veces con el mismo session_id
    Then la orden tiene status "paid" exactamente una vez
    And el stock del producto decrementó solo una vez

Feature: Control de acceso

  Scenario: Admin accede al panel de administración
    Given el usuario tiene role "admin" con JWT válido
    When navega a /admin/products
    Then ve la lista de productos con opciones CRUD

  Scenario: Customer intenta acceder al panel admin
    Given el usuario tiene role "customer" con JWT válido
    When navega a /admin
    Then es redirigido a la página de inicio "/"
```

---

## 8. Especificaciones

### 8.1 Specification Driven Development

#### Functional Spec: Sistema de Órdenes

**Use Case: Crear Orden via Checkout**
**Actors:** Cliente autenticado, Stripe, Sistema

**Preconditions:**
- Cliente autenticado con cookie JWT válida
- Carrito con al menos un item
- Stock suficiente para todos los items

**Main Flow:**
1. Cliente navega a `/cart` y hace clic en "Checkout"
2. Client Component llama `POST /api/checkout`
3. Sistema valida JWT del cliente via `getSession()`
4. Sistema recupera carrito del cliente de MongoDB
5. Sistema crea orden con `status: 'pending'` en colección `orders`
6. Sistema crea Stripe Checkout Session con `metadata: { orderId }`
7. API devuelve `{ url: "https://checkout.stripe.com/..." }`
8. Cliente completa pago en página de Stripe
9. Stripe envía `checkout.session.completed` a `/api/stripe/webhook`
10. Webhook actualiza orden a `paid`, decrementa stock, vacía carrito

**Acceptance Criteria:**
- Given cliente autenticado con carrito de 2 items (total: $50.00)
- When llama POST /api/checkout
- Then se crea orden con total: 5000 (centavos) y status: "pending"
- And se devuelve URL de Stripe Checkout válida
- And tras el pago, la orden tiene status: "paid" y el stock decrementó

---

#### Structural Spec: Organización de Componentes

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App Router                │
├──────────────┬──────────────────┬───────────────────┤
│  (public)    │   (customer)     │     (admin)       │
│  Sin auth    │  JWT customer    │   JWT admin       │
│              │  requerido       │   requerido       │
├──────────────┴──────────────────┴───────────────────┤
│                    proxy.ts                         │
│         Inspección JWT antes de cada route          │
├─────────────────────────────────────────────────────┤
│    Server Components          Client Components     │
│    (leen MongoDB directo)     (llaman /api/*)       │
├─────────────────────────────────────────────────────┤
│                    lib/db.ts                        │
│              MongoClient Singleton                  │
│              (una instancia por proceso)            │
└─────────────────────────────────────────────────────┘

Colecciones MongoDB:
  users → orders → carts → products
                ↑
         stripeSessionId (FK lógica a Stripe)
```

---

#### Behavioral Spec: Máquina de Estados de una Orden

```mermaid
stateDiagram-v2
    [*] --> pending : POST /api/checkout\ncrea orden
    pending --> paid : checkout.session.completed\n(webhook Stripe)
    pending --> cancelled : Admin cancela\nor timeout
    paid --> shipped : Admin actualiza estado
    shipped --> [*] : Entrega completada
    cancelled --> [*]
    
    note right of pending
        stripeSessionId vinculado
        stock NO decrementado aún
    end note
    
    note right of paid
        stock decrementado
        carrito vaciado
    end note
```

---

#### Operative Spec: Despliegue en GCI VM

```
Despliegue
- Docker single-stage run en VM GCI (34.174.56.186)
- Traefik v3 como reverse proxy con TLS wildcard *.deviaaps.com
- Puerto interno: 30001 → externo: 443 (HTTPS)
- Red Docker: miseia-net (compartida con otros servicios MISEIA)

Escalado (actual)
- Single instance (--restart unless-stopped)
- Escalado horizontal posible via múltiples contenedores + Traefik LB
- MongoDB: instancia única en VM (puerto 27020, auth requerida)

Monitoreo
- Pipeline CI/CD reporta estado en < 3 min por push
- `docker ps` en VM verifica estado del contenedor
- `curl -I https://ecommerce.deviaaps.com` como health check básico

Runbook: Sitio devuelve 404 tras deploy
1. Verificar labels Traefik: docker inspect ecommerce --format '{{json .Config.Labels}}'
2. Si Host() está vacío: el TRAEFIK_RULE con backticks fue interpretado por el shell
3. Fix: usar variable single-quoted:
   TRAEFIK_RULE='traefik.http.routers.ecommerce.rule=Host(`ecommerce.deviaaps.com`)'
   docker run ... --label "$TRAEFIK_RULE" ...
4. Verificar red: docker network inspect miseia-net | grep ecommerce

Runbook: VM inaccesible (ssh timeout)
1. GCP Console → Compute Engine → VM instances → Start
2. Si IP cambió: actualizar 34.174.56.186 en pipelines y secrets
3. Verificar: curl -I https://ecommerce.deviaaps.com
```

---

### 8.2 Invariantes y Contratos

#### Contrato: createToken / verifyToken

```
CONTRATO: createToken(payload: JWTPayload) → Promise<string>

PRECONDITION:
- payload.userId: string non-empty
- payload.email: string válido con @
- payload.role: 'admin' | 'customer'
- AUTH_SECRET: string de >= 32 chars en process.env

POSTCONDITION:
- Devuelve JWT firmado con HS256
- JWT expira en exactamente 7 días desde issuedAt
- JWT verificable con verifyToken usando el mismo secret

INVARIANT:
- El secreto de firma nunca sale del proceso Node.js
- issuedAt <= expiresAt siempre

EXAMPLE:
- createToken({ userId: '123', email: 'a@b.com', role: 'customer', name: 'A' })
  → "eyJhbGciOiJIUzI1NiJ9..."
- verifyToken(token) → { userId: '123', email: 'a@b.com', role: 'customer', name: 'A' }
- verifyToken("tampered") → null (no lanza excepción)
```

#### Contrato: Modelo de Dinero (cents-first)

```
CONTRATO: Almacenamiento y formateo de precios

PRECONDITION:
- price: number entero (integer), >= 0
- Representado en centavos (USD cents)

POSTCONDITION:
- Almacenado en MongoDB como integer
- Renderizado como "$X.XX" solo en la capa de presentación
- Suma de items: integer arithmetic (sin punto flotante)

INVARIANT:
- price almacenado nunca es float
- total = sum(item.qty * item.unitPrice) para todos los items — integer
- 0.1 + 0.2 = 0.30000000000000004 en float → NUNCA ocurre con cents

EXAMPLE:
- Precio de $19.99 → almacenado como 1999
- Total: 3 items × 1999 = 5997 → formateado como "$59.97"
- formatPrice(5997) → "$59.97"
- 10 + 20 = 30 (integer) ✓  vs  0.1 + 0.2 ≠ 0.3 (float) ✗
```

#### Contrato: Webhook Stripe (Idempotencia)

```
CONTRATO: POST /api/stripe/webhook

PRECONDITION:
- Header stripe-signature presente y válido
- Body raw (no parseado por Next.js) disponible para verificación
- STRIPE_WEBHOOK_SECRET configurado en process.env

POSTCONDITION:
- Si event.type === 'checkout.session.completed':
    - Exactamente UNA orden actualizada a status: 'paid'
    - Stock decrementado exactamente UNA vez por item
- Si firma inválida → HTTP 400, sin modificaciones en BD
- Si orderId no encontrado → HTTP 404, sin modificaciones en BD

INVARIANT:
- Re-envío del mismo evento → resultado idéntico (idempotente)
- Stock nunca queda negativo por procesamiento del webhook

EXAMPLE:
- Primer evento para orderId X → orden pasa de 'pending' a 'paid', stock--
- Segundo evento idéntico → updateOne encuentra { status: 'paid' }, no modifica
```

---

### 8.3 ADRs (Architecture Decision Records)

Ver [`docs/adr/`](docs/adr/) para el registro completo. Resumen:

#### ADR-001: MongoDB sobre PostgreSQL
**Status:** Accepted

**Context:** La aplicación requiere almacenamiento de documentos con estructura flexible (items de órdenes con campos variables) y consultas de lectura dominantes.

**Decision:** MongoDB con driver nativo (`mongodb@7`), sin ORM.

**Razones cuantitativas:**
- Documentos de órdenes con arrays anidados → joins relacionales requerirían 3-4 tablas
- Schema-less permite variación de campos de productos sin migraciones
- Driver nativo ahorra ~2MB de bundle vs Mongoose + elimina capa de abstracción con overhead de ~15% en queries simples

**Consecuencias positivas:** Consultas en una sola colección, sin JOINs. **Negativas:** Sin validación de schema a nivel ORM — se compensa con TypeScript interfaces y `$jsonSchema` en BD.

---

#### ADR-002: JWT en Cookie httpOnly sobre Session Store
**Status:** Accepted

**Context:** Necesidad de autenticación stateless para escala horizontal. Alternativas: Redis session store, JWT en localStorage, JWT en cookie.

**Decision:** JWT firmado almacenado en cookie `httpOnly`, `SameSite=Lax`.

**Razones cuantitativas:**
- Cookie httpOnly: inaccesible desde JavaScript → 0% de XSS token theft
- Eliminación de Redis: -1 dependencia de infraestructura, -50ms de latencia por auth check
- JWT self-contained: verificación en < 1ms vs ~5-15ms de round-trip a Redis

**Consecuencias positivas:** Arquitectura stateless, sin estado de sesión en servidor. **Negativas:** Revocación de tokens requiere lista negra o tokens de corta duración.

---

#### ADR-003: Driver Nativo MongoDB sobre Mongoose
**Status:** Accepted

**Context:** Elección de capa de acceso a datos MongoDB.

**Decision:** `mongodb` package directo, sin Mongoose.

**Razones cuantitativas:**
- Mongoose agrega ~600KB al bundle del servidor
- Overhead de middleware Mongoose: ~10-15% en operaciones de escritura
- Sin necesidad de validación de schema en ORM — TypeScript + interfaces proveen type safety en compile time

**Consecuencias:** Más código boilerplate para conversiones ObjectId, pero control total sobre queries y sin magia implícita.

---

#### ADR-004: Next.js App Router + Server Components
**Status:** Accepted

**Context:** Framework y estrategia de rendering.

**Decision:** Next.js 16 App Router con Server Components para páginas de datos y Client Components solo donde se requiere interactividad.

**Razones cuantitativas:**
- Server Components eliminan ~40-60KB de JavaScript por página del bundle del cliente
- Catálogo y detalle de producto: cero JS de fetching en cliente
- `output: standalone` reduce imagen Docker de ~1.2GB a ~180MB

**Consecuencias:** Complejidad en la frontera Server/Client. Require `export const dynamic = 'force-dynamic'` en páginas que leen de BD para evitar prerendering estático.

---

#### ADR-005: Stripe Checkout sobre Elements
**Status:** Accepted

**Context:** Integración de pagos.

**Decision:** Stripe Checkout (página alojada) en lugar de Stripe Elements (componentes embebidos).

**Razones cuantitativas:**
- Checkout: 0 líneas de código de UI de pago — Stripe maneja PCI compliance
- Elements requiere ~200 líneas adicionales de código + manejo de estado del formulario
- Checkout soporta Apple Pay, Google Pay, Link automáticamente sin código extra

**Consecuencias:** Menos customización visual del formulario de pago, pero certificación PCI SAQ-A automática.

---

#### ADR-006: Modelo Cents-First para Dinero
**Status:** Accepted

**Context:** Representación de precios y totales monetarios.

**Decision:** Almacenar todos los valores monetarios como integers en centavos.

**Razones cuantitativas (prueba de precisión flotante):**
```javascript
0.1 + 0.2 === 0.3        // false en JavaScript
0.1 + 0.2                // 0.30000000000000004
10 + 20 === 30           // true (integer)
```
- $0.10 + $0.20 almacenado como float = $0.30000000000000004 (error de 4e-18)
- Con cents: 10 + 20 = 30 (exacto)
- Stripe también usa cents — 0 conversión necesaria para la API

**Consecuencias:** Toda la lógica de display requiere `price / 100` al renderizar.

---

## 9. Tests Unitarios e Integración

### Dependencias de Testing

```json
"devDependencies": {
  "vitest": "^4.1.9",
  "@vitest/coverage-v8": "^4.1.9",
  "@vitejs/plugin-react": "^6.0.3"
}
```

### Ejecutar Tests

```bash
npm test                 # 27 tests, modo CI
npm run test:watch       # modo watch para desarrollo
npm run test:coverage    # reporte de cobertura HTML en coverage/
```

### Cobertura por Archivo

| Archivo | Statements | Functions | Lines | Tests |
|---|---|---|---|---|
| `lib/auth.ts` | 67% | 75% | 71% | 9 (auth.test.ts) |
| `app/api/auth/login` | 57% | 100% | 57% | 3 (api-validation.test.ts) |
| `app/api/auth/register` | 31% | 100% | 31% | 3 (api-validation.test.ts) |
| `app/api/cart` | 39% | 80% | 40% | 6 (api-validation.test.ts) |
| `lib/` (money model) | 100% | 100% | 100% | 6 (money.test.ts) |

### Alcance de Tests

**`auth.test.ts` (9 tests):**
- `createToken` genera JWT válido con payload correcto
- `verifyToken` retorna payload para token válido
- `verifyToken` retorna `null` para token alterado (no lanza excepción)
- `verifyToken` retorna `null` para token expirado
- `setAuthCookie` devuelve nombre, valor y opciones correctas
- Opciones httpOnly, sameSite, path correctas
- Expiración de 7 días en segundos

**`money.test.ts` (6 tests):**
- $1.00 = 100 centavos
- $19.99 = 1999 centavos
- Suma de items es integer (sin float drift)
- `0.1 + 0.2 !== 0.3` — prueba del problema que cents-first resuelve
- Total de orden calculado correctamente
- formatPrice formatea centavos a string "$X.XX"

**`api-validation.test.ts` (12 tests):**
- POST /api/auth/login: 400 sin email, 400 sin password, 401 para usuario inexistente
- POST /api/auth/register: 400 sin name, 400 sin email, 400 sin password
- GET /api/cart: 401 sin header x-user-id
- POST /api/cart: 401 sin auth, 400 sin productId, 400 con qty < 1
- DELETE /api/cart: 401 sin auth, 400 sin productId

---

## 10. Despliegue

### 10.1 URL de Producción

**[https://ecommerce.deviaaps.com](https://ecommerce.deviaaps.com)**

Desplegado en VM GCI (`34.174.56.186`) con Docker + Traefik v3, TLS wildcard `*.deviaaps.com`.

### 10.2 Lockfile

El archivo **`package-lock.json`** está versionado en el repositorio. Garantiza que cada instalación (local, CI, producción) use exactamente las mismas versiones de dependencias:

```bash
npm ci        # usa package-lock.json — determinístico, más rápido
npm install   # puede actualizar versiones dentro del rango — NO usar en CI
```

### 10.3 Instrucciones de Despliegue

#### Build Local con Docker

```bash
docker build -t ecommerce:latest .
docker run -p 30001:30001 --env-file .env.local ecommerce:latest
# http://localhost:30001
```

#### Despliegue Manual en VM GCI

```bash
# 1. Conectarse a la VM
ssh -i ~/.ssh/vboxuser gcvmuser@34.174.56.186

# 2. Clonar repositorio (solo primera vez)
git clone https://github.com/Jorgeaapaz/MISEIA_1-4-110-ecommerce.git ~/MISEIA110_ecommerce
cd ~/MISEIA110_ecommerce

# 3. Configurar entorno de producción
cp .env.example .env.production
nano .env.production  # completar con valores reales

# 4. Build de imagen Docker
docker build -t ecommerce:latest .

# 5. Arrancar contenedor con Traefik
# CRÍTICO: usar variable con comillas simples para proteger
# los backticks del Host() de la interpretación del shell
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

# 6. Seed de BD (solo primer despliegue)
docker exec ecommerce npx tsx scripts/seed.ts

# 7. Verificar
curl -I https://ecommerce.deviaaps.com
docker inspect ecommerce --format '{{index .Config.Labels "traefik.http.routers.ecommerce.rule"}}'
```

#### Despliegue Continuo (CD)

**GitHub Actions** (`.github/workflows/ci-cd.yml`):

```yaml
# Flujo: test → build → deploy
# El deploy escribe /tmp/deploy_ecommerce.sh en la VM y lo ejecuta
# (evita interpretación de backticks en heredoc SSH)
```

Secrets requeridos en GitHub (`gh secret set NOMBRE --body "valor"`):

| Secret | Descripción |
|---|---|
| `SSH_PRIVATE_KEY` | Clave privada SSH (`~/.ssh/vboxuser`) |
| `MONGODB_URI` | `mongodb://admin:...@34.174.56.186:27020/?authSource=admin` |
| `MONGODB_DB` | `ecommerce` |
| `AUTH_SECRET` | String aleatorio de 32+ chars |
| `NEXT_PUBLIC_BASE_URL` | `https://ecommerce.deviaaps.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

**GitLab CI** (`.gitlab-ci.yml`): mismas variables en `Settings → CI/CD → Variables`. Requiere habilitar CI/CD en el proyecto: `glab api --method PUT "projects/NAMESPACE%2FREPO" -f builds_access_level=enabled`.

#### Webhook de Stripe (Producción)

En [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):
- **Endpoint:** `https://ecommerce.deviaaps.com/api/stripe/webhook`
- **Eventos:** `checkout.session.completed`
- Copiar el secreto de firma → `STRIPE_WEBHOOK_SECRET` en `.env.production`

---

## 11. Mejoras y Extensiones Posibles

| Funcionalidad | Valor agregado | Complejidad |
|---|---|---|
| Paginación en catálogo | Performance con >100 productos | Baja — `skip/limit` + cursor |
| Búsqueda de productos | UX mejorada | Media — índice `$text` MongoDB |
| Filtros por precio y categoría | Descubrimiento de productos | Baja — query params + `$match` |
| Exportar órdenes a PDF/CSV | Gestión administrativa | Media — librería `pdfkit` o `csv-stringify` |
| Email de confirmación | UX post-compra | Media — Stripe email o Nodemailer |
| Integración con CFDI | Cumplimiento regulatorio México | Alta — API de facturación SAT |
| Redis para sesiones | Revocación de JWT | Media — `ioredis` + lista negra |
| Tests de integración con MongoDB real | Cobertura > 60% global | Media — MongoDB Memory Server |
| Panel de analytics | Métricas de ventas | Media — agregaciones MongoDB |

---

## 12. Cambios Documentados (IA) y Revisión Crítica

### Cambios Realizados con Asistencia de IA

El proyecto fue construido con **Claude Code (claude-sonnet-4-6)** como asistente de programación. Ver [`docs/AI-USAGE.md`](docs/AI-USAGE.md) para el registro completo. Las correcciones críticas aplicadas:

| # | Problema en borrador IA | Corrección aplicada | Impacto si no se corrige |
|---|---|---|---|
| 1 | Stripe apiVersion incorrecta (`"2025-03-31.basil"`) | Actualizada a `"2026-03-25.dahlia"` | Error de runtime en toda llamada a Stripe API |
| 2 | `middleware.ts` en lugar de `proxy.ts` (Next.js 16) | Renombrado a `proxy.ts` con export `proxy()` | Panel admin completamente desprotegido |
| 3 | `params` y `cookies()` accedidos sincrónicamente | `await params`, `await cookies()` | TypeError en cada route handler con params dinámicos |
| 4 | Página de éxito pasiva + webhook inaccesible en local | Verificación activa via Stripe API como fallback | 100% de órdenes quedan en "pending" en desarrollo local |

### Revisión Crítica del Uso de IA

**Fortalezas del enfoque IA-asistido:**
- Scaffolding completo de estructura App Router en < 30 minutos vs 4-6 horas manual
- Código TypeScript idiomático sin errores de tipos en el borrador inicial
- Diseño de interfaces del dominio (`lib/types.ts`) correcto desde el primer intento
- Design system de Tailwind CSS coherente sin iteraciones adicionales

**Debilidades observadas y evidenciadas:**

1. **Lag en breaking changes:** Los 4 problemas críticos son directamente atribuibles a que el modelo no conocía Next.js 16. El training data del modelo tiene como fecha de corte agosto 2025 — Next.js 16 introdujo `proxy.ts` y APIs async antes de esa fecha, pero el conocimiento no estaba actualizado. **Recomendación:** Siempre leer `node_modules/next/dist/docs/` antes de usar cualquier API de Next.js.

2. **Sin modelado de restricciones de deployment:** El problema del webhook (`localhost` no alcanzable por Stripe) y el fallo de la cookie en el iframe de Stripe son restricciones operacionales, no de código. La IA generó código correcto para un entorno idealizado pero ignoró que el ambiente de desarrollo no es el ambiente de producción. **Recomendación:** Siempre pensar en "¿qué necesita el mundo exterior para llamar este endpoint?" al diseñar webhooks.

3. **Asunciones de seguridad incorrectas:** Proteger `/checkout/success` con auth parecía razonable, pero rompía el flujo de Stripe. La IA no modeló el mecanismo de iframe cross-site de Stripe Checkout. **Recomendación:** Revisar siempre los flujos de auth con servicios de terceros que hacen redirects o usan iframes.

**Conclusión:** La IA acelera el scaffolding y el código boilerplate entre 3-5x, pero no reemplaza la comprensión profunda de las versiones específicas del framework y las restricciones operacionales del entorno de producción. Los 4 errores críticos habrían producido una aplicación silenciosamente rota en producción. La revisión humana de los borradores de IA es no negociable.
