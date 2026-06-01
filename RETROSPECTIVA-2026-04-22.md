# Retrospectiva de Sesion — 2026-04-22
### Implementacion completa de Ecommerce VOLT Store con Next.js 16, MongoDB y Stripe

## Resumen / Overview
Se implemento desde cero una aplicacion de ecommerce completa llamada **VOLT Store** siguiendo la especificacion definida en `AGENTS.md`. La aplicacion incluye autenticacion con JWT (jose), catalogo de productos, carrito de compras, integracion con Stripe Checkout, panel de administracion con sidebar oscuro, y un script de seed para datos iniciales. El build de Next.js compila exitosamente con 24 rutas (estaticas y dinamicas). **La sesion fue exitosa** — la aplicacion esta lista para ejecutarse contra una instancia de MongoDB.

## Proceso de instalacion / Installation

### 1. Dependencias instaladas
```bash
cd D:/Master-IA-Dev/04-Bloque4/1-4-110-ecommerce/ecommerce
npm install mongodb bcrypt jose stripe
npm install -D @types/bcrypt
```

### 2. Archivo `.env.local` creado con las siguientes variables
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ecommerce
AUTH_SECRET=s3cr3t_k3y_f0r_4uth_s1gn1ng_32ch
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TNml9BSwRKpxNcQ...
STRIPE_PUBLISHABLE_KEY=pk_test_51TNml9BSwRKpxNcQ...
STRIPE_SECRET_KEY=sk_test_51TNml9BSwRKpxNcQ...
STRIPE_WEBHOOK_SECRET=whsec_test_secret
```

## Estructura de archivos creados / Files Created

### Libreria base (`lib/`)
| Archivo | Descripcion |
|---------|-------------|
| `lib/db.ts` | Singleton de MongoClient — unica conexion a MongoDB |
| `lib/types.ts` | Interfaces TypeScript: User, Product, Cart, Order, JWTPayload |
| `lib/auth.ts` | Helpers de autenticacion: createToken, verifyToken, getSession (jose JWT) |

### Proxy (antes middleware) — `proxy.ts`
- Protege rutas `/admin/*` (solo role admin)
- Protege rutas `/cart`, `/orders`, `/checkout` (requiere autenticacion)
- Inyecta headers `x-user-id`, `x-user-role`, `x-user-email`, `x-user-name` para rutas API

### API Routes (10 archivos)
| Ruta | Metodos | Descripcion |
|------|---------|-------------|
| `/api/auth/login` | POST | Login con email/password, devuelve cookie JWT |
| `/api/auth/logout` | POST | Elimina cookie de autenticacion |
| `/api/auth/register` | POST | Registro de clientes, devuelve cookie JWT |
| `/api/cart` | GET, POST, DELETE | Obtener, agregar items, eliminar items del carrito |
| `/api/checkout` | POST | Crea orden pendiente + Stripe Checkout Session |
| `/api/stripe/webhook` | POST | Webhook de Stripe: actualiza orden a "paid", decrementa stock |
| `/api/admin/products` | GET, POST | Listar y crear productos (solo admin) |
| `/api/admin/products/[id]` | GET, PUT, DELETE | CRUD individual de producto (solo admin) |
| `/api/admin/orders` | GET | Listar todas las ordenes (solo admin) |
| `/api/admin/orders/[id]` | PUT | Actualizar status de orden (solo admin) |

### Paginas (16 archivos)
| Pagina | Tipo | Descripcion |
|--------|------|-------------|
| `app/page.tsx` | Server Component | Landing con hero + catalogo de productos |
| `app/(public)/products/[id]/page.tsx` | Server Component | Detalle de producto |
| `app/(public)/products/[id]/AddToCartButton.tsx` | Client Component | Boton agregar al carrito con qty selector |
| `app/(public)/login/page.tsx` | Client Component | Login con credenciales demo visibles |
| `app/(public)/register/page.tsx` | Client Component | Registro de nuevos clientes |
| `app/(customer)/cart/page.tsx` | Client Component | Carrito con resumen y checkout |
| `app/(customer)/checkout/success/page.tsx` | Server Component | Confirmacion de pago exitoso |
| `app/(customer)/checkout/cancel/page.tsx` | Server Component | Pago cancelado |
| `app/(customer)/orders/page.tsx` | Server Component | Historial de ordenes del cliente |
| `app/(admin)/admin/layout.tsx` | Client Component | Layout admin con sidebar oscuro |
| `app/(admin)/admin/page.tsx` | Server Component | Dashboard con stats y ordenes recientes |
| `app/(admin)/admin/products/page.tsx` | Client Component | Lista de productos con toggle active/delete |
| `app/(admin)/admin/products/new/page.tsx` | Client Component | Formulario crear producto |
| `app/(admin)/admin/products/[id]/edit/page.tsx` | Client Component | Formulario editar producto |
| `app/(admin)/admin/customers/page.tsx` | Server Component | Lista de clientes registrados |
| `app/(admin)/admin/orders/page.tsx` | Client Component | Gestion de ordenes con cambio de status |

### Componentes compartidos
| Archivo | Descripcion |
|---------|-------------|
| `app/components/Header.tsx` | Header responsive con nav, auth state, menu mobile |

### Estilos y layout
| Archivo | Descripcion |
|---------|-------------|
| `app/globals.css` | Design system completo: tokens, botones, cards, badges, tablas, animaciones |
| `app/layout.tsx` | Root layout con fuentes Outfit + Sora (Google Fonts) |

### Seed script
| Archivo | Descripcion |
|---------|-------------|
| `scripts/seed.ts` | Crea: 1 admin, 5 clientes, 15 productos (3 categorias), 5 ordenes de ejemplo |

## Comandos ejecutados / Commands Run
```bash
# Instalar dependencias
npm install mongodb bcrypt jose stripe
npm install -D @types/bcrypt

# Build de verificacion
npx next build
```

## Levantar y detener la aplicacion / Running & Stopping

### Pre-requisito: MongoDB debe estar corriendo
```bash
# Si usas Docker:
docker run -d --name mongo -p 27017:27017 mongo:7

# O si tienes MongoDB instalado localmente, asegurate de que el servicio este activo
```

### Seed de datos iniciales
```bash
cd D:/Master-IA-Dev/04-Bloque4/1-4-110-ecommerce/ecommerce
npx tsx scripts/seed.ts
# o alternativamente:
npm run seed
```

### Iniciar la aplicacion
```bash
npm run dev
# La app estara disponible en http://localhost:3000
```

### Detener la aplicacion
```
Ctrl+C en la terminal donde se ejecuta npm run dev
```

### Credenciales de prueba
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@shop.com | admin123 |
| Customer 1 | customer1@shop.com | pass1234 |
| Customer 2 | customer2@shop.com | pass1234 |
| Customer 3 | customer3@shop.com | pass1234 |
| Customer 4 | customer4@shop.com | pass1234 |
| Customer 5 | customer5@shop.com | pass1234 |

## Tarjetas de prueba Stripe / Stripe Test Cards

Estas tarjetas solo funcionan con las API keys de prueba (sandbox). Usar cualquier fecha futura como vencimiento y cualquier valor en los demas campos del formulario.

| Marca | Numero | CVC | Vencimiento |
|-------|--------|-----|-------------|
| Visa | 4242 4242 4242 4242 | Any 3 digits | Any future date |
| Visa (debit) | 4000 0566 5566 5556 | Any 3 digits | Any future date |
| Mastercard | 5555 5555 5555 4444 | Any 3 digits | Any future date |
| Mastercard (2-series) | 2223 0031 2200 3222 | Any 3 digits | Any future date |
| Mastercard (debit) | 5200 8282 8282 8210 | Any 3 digits | Any future date |
| American Express | 3782 822463 10005 | Any 4 digits | Any future date |
| Discover | 6011 1111 1111 1117 | Any 3 digits | Any future date |
| Diners Club | 3056 9300 0902 0004 | Any 3 digits | Any future date |
| JCB | 3566 0020 2036 0505 | Any 3 digits | Any future date |
| UnionPay | 6200 0000 0000 0005 | Any 3 digits | Any future date |

## Configuracion de red / Network Configuration
Esta aplicacion corre en **localhost** directamente en la maquina Windows, no requiere configuracion de red adicional ni NAT port forwarding.

Si se necesitara acceder desde una VM con VirtualBox NAT:

### Ejemplo de configuracion de NAT con port forwarding / Example NAT Configuration with Port Forwarding
> **Aclaracion — VirtualBox NAT:** Debido a que la VM corre con adaptador NAT en VirtualBox, el dominio no resuelve automaticamente desde la maquina fisica Windows. Se debe agregar una entrada manual en el archivo de hosts de Windows para que el trafico llegue al port forwarding configurado en VirtualBox (puerto 3000 -> VM).
>
> Editar (como Administrador) `C:\Windows\System32\drivers\etc\hosts` y agregar:
> ```
> 127.0.0.1   localhost
> ```
> Regla de port forwarding en VirtualBox: Host Port 3000 -> Guest Port 3000 (TCP)

## URLs de prueba / Test URLs
| URL | Descripcion |
|-----|-------------|
| http://localhost:3000 | Landing / Catalogo de productos |
| http://localhost:3000/login | Pagina de login |
| http://localhost:3000/register | Registro de nuevo cliente |
| http://localhost:3000/products/{id} | Detalle de producto |
| http://localhost:3000/cart | Carrito de compras (requiere login como customer) |
| http://localhost:3000/orders | Historial de ordenes (requiere login como customer) |
| http://localhost:3000/admin | Dashboard admin (requiere login como admin) |
| http://localhost:3000/admin/products | CRUD de productos |
| http://localhost:3000/admin/orders | Gestion de ordenes |
| http://localhost:3000/admin/customers | Lista de clientes |

### Endpoints API — Ejemplos con curl
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shop.com","password":"admin123"}'

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test1234"}'

# Logout
curl -X POST http://localhost:3000/api/auth/logout

# Get cart (requiere cookie auth_token)
curl http://localhost:3000/api/cart -b "auth_token=<JWT_TOKEN>"

# Add to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -b "auth_token=<JWT_TOKEN>" \
  -d '{"productId":"<PRODUCT_ID>","qty":1}'
```

## Problemas encontrados / Problems & Solutions
| Problem | Solution |
|---------|----------|
| Stripe API version mismatch: `"2025-03-31.basil"` no es valida | Se actualizo a `"2026-03-25.dahlia"` que es la version esperada por el SDK stripe v22 |
| Next.js 16 renombro `middleware.ts` a `proxy.ts` | Se uso la nueva convencion: archivo `proxy.ts` en la raiz con funcion exportada `proxy()` |
| `params` en route handlers ahora es una Promise en Next.js 16 | Se uso `await params` en todos los route handlers con parametros dinamicos |
| `cookies()` de `next/headers` ahora es async en Next.js 16 | Se uso `await cookies()` en la funcion `getSession()` |

## Resultados y conclusiones / Results & Conclusions

### Que funciono
- **Build exitoso**: 24 rutas compiladas sin errores (estaticas y dinamicas)
- **Arquitectura completa**: Auth con JWT (jose), MongoDB nativo, Stripe Checkout, proxy para proteccion de rutas
- **Diseno consistente**: Design system con Tailwind CSS v4, fuentes Outfit/Sora, palette indigo como acento
- **Separacion de rutas**: Route groups `(public)`, `(customer)`, `(admin)` con layouts independientes
- **Admin panel**: Sidebar oscuro con navegacion, dashboard con stats, CRUD completo de productos, gestion de ordenes

### Que falta para produccion
- **Testing**: No se escribieron tests unitarios ni e2e
- **Stripe webhook real**: El `STRIPE_WEBHOOK_SECRET` es un placeholder — para produccion se necesita configurar con `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- **Validacion**: Se podria agregar Zod para validacion de inputs en API routes
- **Paginacion**: Las listas de productos/ordenes/clientes no tienen paginacion
- **MongoDB**: Se necesita tener MongoDB corriendo antes de ejecutar la app

### Stack tecnologico
| Tecnologia | Version |
|-----------|---------|
| Next.js | 16.2.4 (App Router) |
| React | 19.2.4 |
| MongoDB (driver) | 7.2.0 |
| Stripe | 22.0.2 |
| jose (JWT) | 6.2.2 |
| bcrypt | 6.0.0 |
| Tailwind CSS | 4.x |
| TypeScript | 5.x |
