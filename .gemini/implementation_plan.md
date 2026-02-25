# 🛒 Micro-Commerce-MS — Plan de Implementación

## Descripción General

Plataforma de comercio electrónico basada en arquitectura de microservicios.

**Stack Tecnológico:**

- **Frontend:** Vue.js 3 + Vite + Vue Router + Pinia + Axios
- **Backend:** Node.js + Express.js
- **Base de datos principal:** MongoDB (Mongoose)
- **Base de datos reportes:** MySQL (módulo de reportes)
- **Comunicación:** REST APIs + API Gateway
- **Autenticación:** JWT (JSON Web Tokens)
- **Logging:** Winston + Morgan (centralizado)
- **Contenedores:** Docker + Docker Compose
- **Testing:** Jest + Supertest (Backend) / Vitest (Frontend)

---

## 📐 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Vue.js 3 + Vite)                 │
│                     Puerto :5173                            │
│  - SPA con Vue Router                                       │
│  - Estado global con Pinia                                  │
│  - Consumo de API via Axios                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                              │
│               (Puerto :3000)                                │
│  - Enrutamiento a microservicios                            │
│  - Autenticación centralizada (JWT)                         │
│  - Rate Limiting                                            │
│  - Logging centralizado                                     │
└───┬──────────┬──────────┬──────────┬───────────┬────────────┘
    │          │          │          │           │
    ▼          ▼          ▼          ▼           ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌────────────────┐
│ Users  ││Products││ Cart   ││ Orders ││   Reports      │
│Service ││Service ││Service ││Service ││   Service      │
│:3001   ││:3002   ││:3003   ││:3004   ││   :3005        │
│MongoDB ││MongoDB ││MongoDB ││MongoDB ││   MySQL        │
└────────┘└────────┘└────────┘└────────┘└────────────────┘
```

---

## 📁 Estructura de Carpetas Final

```
Micro-Commerce-MS/
├── frontend/                     # 🖥️ Frontend Vue.js 3 + Vite
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                  # Capa de comunicación con API
│   │   │   ├── axiosInstance.js   # Instancia Axios con interceptors
│   │   │   ├── authApi.js
│   │   │   ├── productsApi.js
│   │   │   ├── cartApi.js
│   │   │   ├── ordersApi.js
│   │   │   └── reportsApi.js
│   │   ├── assets/               # Estilos globales, imágenes, fuentes
│   │   │   ├── css/
│   │   │   │   ├── main.css
│   │   │   │   └── variables.css
│   │   │   └── images/
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppFooter.vue
│   │   │   │   ├── AppSidebar.vue
│   │   │   │   └── AppLayout.vue
│   │   │   ├── common/
│   │   │   │   ├── LoadingSpinner.vue
│   │   │   │   ├── AlertMessage.vue
│   │   │   │   ├── ConfirmModal.vue
│   │   │   │   ├── Pagination.vue
│   │   │   │   └── SearchBar.vue
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.vue
│   │   │   │   ├── ProductGrid.vue
│   │   │   │   └── ProductFilters.vue
│   │   │   ├── cart/
│   │   │   │   ├── CartItem.vue
│   │   │   │   └── CartSummary.vue
│   │   │   └── orders/
│   │   │       ├── OrderCard.vue
│   │   │       └── OrderTimeline.vue
│   │   ├── views/                # Páginas/Vistas
│   │   │   ├── HomeView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── ProductsView.vue
│   │   │   ├── ProductDetailView.vue
│   │   │   ├── CartView.vue
│   │   │   ├── CheckoutView.vue
│   │   │   ├── OrdersView.vue
│   │   │   ├── OrderDetailView.vue
│   │   │   ├── ProfileView.vue
│   │   │   └── admin/
│   │   │       ├── DashboardView.vue
│   │   │       ├── ManageProductsView.vue
│   │   │       ├── ManageOrdersView.vue
│   │   │       ├── ManageUsersView.vue
│   │   │       └── ReportsView.vue
│   │   ├── stores/               # Estado global (Pinia)
│   │   │   ├── authStore.js
│   │   │   ├── productStore.js
│   │   │   ├── cartStore.js
│   │   │   └── orderStore.js
│   │   ├── router/               # Vue Router
│   │   │   └── index.js
│   │   ├── composables/          # Composables reutilizables
│   │   │   ├── useAuth.js
│   │   │   ├── useNotification.js
│   │   │   └── useFormatters.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── api-gateway/                  # API Gateway central
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── app.js
│   ├── package.json
│   └── .env
│
├── services/
│   ├── users-service/            # Servicio de usuarios
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── database.js
│   │   │   ├── controllers/
│   │   │   │   └── userController.js
│   │   │   ├── middlewares/
│   │   │   │   └── authMiddleware.js
│   │   │   ├── models/
│   │   │   │   └── User.js
│   │   │   ├── routes/
│   │   │   │   └── userRoutes.js
│   │   │   ├── services/
│   │   │   │   └── userService.js
│   │   │   └── app.js
│   │   ├── tests/
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── products-service/         # Servicio de productos
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── app.js
│   │   ├── tests/
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── cart-service/             # Servicio de carrito
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── app.js
│   │   ├── tests/
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── orders-service/           # Servicio de pedidos
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── app.js
│   │   ├── tests/
│   │   ├── package.json
│   │   └── .env
│   │
│   └── reports-service/          # Servicio de reportes (MySQL)
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── services/
│       │   └── app.js
│       ├── tests/
│       ├── package.json
│       └── .env
│
├── shared/                       # Código compartido
│   ├── middlewares/
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── responseHelper.js
│   └── constants/
│       └── httpStatus.js
│
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## 🗓️ FASES DE IMPLEMENTACIÓN

---

### ✅ FASE 0 — Configuración Inicial del Proyecto

**Objetivo:** Preparar la estructura base, herramientas comunes y configuración del entorno.

**Tareas:**

1. Inicializar estructura de carpetas
2. Crear `.gitignore` global
3. Crear `.env.example` con variables de entorno necesarias
4. Configurar módulo `shared/` (logger con Winston, error handler, response helper)
5. Crear `docker-compose.yml` base con MongoDB y MySQL
6. Actualizar `README.md` con descripción del proyecto

**Entregable:** Estructura base funcional, Docker Compose levantando las bases de datos.

---

### ✅ FASE 1 — Users Service (Gestión de Usuarios)

**Objetivo:** CRUD de usuarios + registro + login con JWT.

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/users/register` | Registro de nuevo usuario |
| POST | `/api/users/login` | Inicio de sesión (retorna JWT) |
| GET | `/api/users/profile` | Obtener perfil (requiere auth) |
| PUT | `/api/users/profile` | Actualizar perfil |
| GET | `/api/users` | Listar usuarios (admin) |
| DELETE | `/api/users/:id` | Eliminar usuario (admin) |

**Modelo User (MongoDB):**

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed con bcrypt),
  role: String (enum: ['customer', 'admin']),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Tareas:**

1. `npm init` + instalar dependencias (express, mongoose, bcryptjs, jsonwebtoken, dotenv, cors)
2. Crear modelo `User.js` con Mongoose
3. Crear `userService.js` con lógica de negocio
4. Crear `userController.js` con los handlers
5. Crear `userRoutes.js` con las rutas
6. Crear middleware `authMiddleware.js` para validar JWT
7. Crear `app.js` (entry point del servicio)
8. Crear archivo `.env` con configuración
9. Probar con Postman todos los endpoints
10. Escribir tests unitarios básicos

**Entregable:** Servicio de usuarios funcionando en puerto 3001.

---

### ✅ FASE 2 — Products Service (Catálogo de Productos)

**Objetivo:** CRUD completo de productos con categorías y búsqueda.

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos (con paginación, filtros) |
| GET | `/api/products/:id` | Obtener producto por ID |
| POST | `/api/products` | Crear producto (admin) |
| PUT | `/api/products/:id` | Actualizar producto (admin) |
| DELETE | `/api/products/:id` | Eliminar producto (admin) |
| GET | `/api/products/category/:category` | Filtrar por categoría |
| GET | `/api/products/search?q=` | Búsqueda por nombre/descripción |

**Modelo Product (MongoDB):**

```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String (enum: ['electronics', 'clothing', 'home', 'sports', 'books', 'other']),
  stock: Number,
  images: [String],
  sku: String (unique),
  brand: String,
  ratings: {
    average: Number,
    count: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Tareas:**

1. Inicializar servicio con dependencias
2. Crear modelo `Product.js`
3. Implementar paginación y filtros en la consulta
4. Crear controller, service, routes
5. Implementar búsqueda con regex en MongoDB
6. Probar todos los endpoints
7. Tests unitarios

**Entregable:** Servicio de productos funcionando en puerto 3002.

---

### ✅ FASE 3 — Cart Service (Carrito de Compras)

**Objetivo:** Gestión del carrito de compras por usuario con comunicación al Products Service.

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cart` | Obtener carrito del usuario |
| POST | `/api/cart/items` | Agregar item al carrito |
| PUT | `/api/cart/items/:productId` | Actualizar cantidad de item |
| DELETE | `/api/cart/items/:productId` | Eliminar item del carrito |
| DELETE | `/api/cart` | Vaciar carrito completo |

**Modelo Cart (MongoDB):**

```javascript
{
  userId: String,
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  totalItems: Number,
  totalPrice: Number,
  updatedAt: Date
}
```

**Comunicación Inter-Servicio:**

- Al agregar un producto, el Cart Service hace una petición HTTP al Products Service para:
  - Validar que el producto existe
  - Verificar disponibilidad de stock
  - Obtener precio actual

**Tareas:**

1. Inicializar servicio
2. Crear modelo `Cart.js`
3. Implementar comunicación HTTP con Products Service (usando `axios`)
4. Crear controller, service, routes
5. Manejar errores de comunicación entre servicios
6. Tests

**Entregable:** Servicio de carrito funcionando en puerto 3003, comunicándose con Products Service.

---

### ✅ FASE 4 — Orders Service (Procesamiento de Pedidos)

**Objetivo:** Crear pedidos desde el carrito, gestionar estados del pedido.

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/orders` | Crear pedido (desde el carrito) |
| GET | `/api/orders` | Listar pedidos del usuario |
| GET | `/api/orders/:id` | Obtener detalle de pedido |
| PUT | `/api/orders/:id/status` | Actualizar estado (admin) |
| GET | `/api/orders/all` | Listar todos los pedidos (admin) |

**Modelo Order (MongoDB):**

```javascript
{
  userId: String,
  orderNumber: String (auto-generado),
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  totalAmount: Number,
  status: String (enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  paymentMethod: String,
  paymentStatus: String (enum: ['pending', 'completed', 'failed', 'refunded']),
  createdAt: Date,
  updatedAt: Date
}
```

**Comunicación Inter-Servicio:**

- Al crear pedido → Obtener items del **Cart Service**
- Al confirmar pedido → Actualizar stock en **Products Service**
- Al crear pedido → Vaciar el **Cart Service**

**Tareas:**

1. Inicializar servicio
2. Crear modelo `Order.js` con generación automática de `orderNumber`
3. Implementar flujo: Cart → Order → Actualizar Stock → Vaciar Cart
4. Implementar máquina de estados para el pedido
5. Manejar transacciones y rollback en caso de error
6. Tests

**Entregable:** Servicio de pedidos funcionando en puerto 3004, orquestando Cart y Products.

---

### ✅ FASE 5 — API Gateway

**Objetivo:** Punto de entrada único que enruta a todos los microservicios, con autenticación centralizada.

**Funcionalidades:**

- Proxy reverso a cada microservicio
- Autenticación JWT centralizada
- Rate limiting por IP
- Logging de todas las peticiones
- CORS configurado
- Health check de cada servicio

**Rutas del Gateway:**

```
/api/users/*     → localhost:3001
/api/products/*  → localhost:3002
/api/cart/*      → localhost:3003
/api/orders/*    → localhost:3004
/api/reports/*   → localhost:3005
/health          → Health check de todos los servicios
```

**Tareas:**

1. Inicializar servicio Gateway
2. Configurar `http-proxy-middleware` para enrutamiento
3. Implementar middleware de autenticación JWT centralizado
4. Configurar `express-rate-limit`
5. Implementar endpoint `/health` que verifica todos los servicios
6. Logging con Winston + Morgan
7. Tests de integración

**Entregable:** Gateway funcionando en puerto 3000, enrutando correctamente a todos los servicios.

---

### ✅ FASE 6 — Reports Service (MySQL + Análisis)

**Objetivo:** Servicio de reportes y análisis de ventas usando MySQL.

**Endpoints:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reports/sales` | Reporte de ventas (por rango de fechas) |
| GET | `/api/reports/top-products` | Productos más vendidos |
| GET | `/api/reports/revenue` | Ingresos totales |
| GET | `/api/reports/users-activity` | Actividad de usuarios |
| POST | `/api/reports/sync` | Sincronizar datos desde MongoDB |

**Tablas MySQL:**

```sql
-- Tabla de ventas sincronizadas
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(100),
  user_id VARCHAR(100),
  product_id VARCHAR(100),
  product_name VARCHAR(255),
  quantity INT,
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  status VARCHAR(50),
  order_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla resumen de productos
CREATE TABLE product_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100),
  product_name VARCHAR(255),
  total_sold INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Tareas:**

1. Inicializar servicio con Sequelize o mysql2
2. Crear tablas en MySQL
3. Implementar sincronización de datos desde Orders Service
4. Crear queries de reportes (ventas por fecha, top productos, ingresos)
5. Exponer endpoints REST para consultar reportes
6. Verificar acceso con phpMyAdmin
7. Tests

**Entregable:** Servicio de reportes en puerto 3005, datos sincronizados desde MongoDB, consultables vía phpMyAdmin.

---

### ✅ FASE 7 — Logging Centralizado + Docker + Documentación

**Objetivo:** Pulir el sistema con logging centralizado, contenerización completa y documentación.

**Tareas:**

1. **Logging centralizado:**
   - Configurar Winston con transporte a archivos y consola
   - Crear formato de log estandarizado (timestamp, servicio, nivel, mensaje)
   - Logs rotativos por fecha
   - Correlación de logs con request ID

2. **Docker:**
   - Crear `Dockerfile` para cada servicio
   - Actualizar `docker-compose.yml` completo
   - Configurar red interna Docker para comunicación entre servicios
   - Volúmenes para persistencia de datos

3. **Documentación:**
   - Documentar cada endpoint con ejemplos de request/response
   - Crear colección de Postman exportable
   - Diagramas de arquitectura actualizados
   - Instrucciones de instalación y ejecución

**Entregable:** Sistema completo contenerizado, con logging y documentación profesional.

---

### ✅ FASE 8 — Frontend (Vue.js 3 + Vite)

**Objetivo:** Crear una interfaz de usuario moderna, responsiva y atractiva que consuma todos los microservicios a través del API Gateway.

**Tech Stack Frontend:**

- **Vue.js 3** (Composition API)
- **Vite** (bundler ultrarrápido)
- **Vue Router** (enrutamiento SPA)
- **Pinia** (estado global — reemplazo oficial de Vuex)
- **Axios** (cliente HTTP con interceptors)
- **CSS puro** (variables CSS, glassmorphism, animaciones)

**Páginas Públicas:**

| Vista | Ruta | Descripción |
|-------|------|-------------|
| Home | `/` | Landing page con productos destacados, categorías, hero section |
| Login | `/login` | Formulario de inicio de sesión |
| Register | `/register` | Formulario de registro de usuario |
| Productos | `/products` | Catálogo con grid, filtros por categoría, búsqueda, paginación |
| Detalle Producto | `/products/:id` | Imagen, descripción, precio, botón agregar al carrito |

**Páginas Autenticadas (Customer):**

| Vista | Ruta | Descripción |
|-------|------|-------------|
| Carrito | `/cart` | Lista de items, cantidades editables, resumen de precios |
| Checkout | `/checkout` | Dirección de envío, método de pago, confirmar pedido |
| Mis Pedidos | `/orders` | Historial de pedidos con estado |
| Detalle Pedido | `/orders/:id` | Timeline del pedido, items, totales |
| Perfil | `/profile` | Editar datos personales y dirección |

**Páginas Admin:**

| Vista | Ruta | Descripción |
|-------|------|-------------|
| Dashboard | `/admin` | Resumen general: ventas, pedidos, usuarios activos |
| Gestión Productos | `/admin/products` | CRUD de productos con formulario modal |
| Gestión Pedidos | `/admin/orders` | Lista de todos los pedidos, cambiar estados |
| Gestión Usuarios | `/admin/users` | Lista de usuarios, activar/desactivar |
| Reportes | `/admin/reports` | Gráficos de ventas, top productos, ingresos (datos de MySQL) |

**Componentes Reutilizables:**

- `AppHeader.vue` — Navbar con logo, links, carrito badge, avatar usuario
- `AppFooter.vue` — Footer con links y copyright
- `AppSidebar.vue` — Sidebar para panel admin
- `ProductCard.vue` — Tarjeta de producto con hover effects
- `ProductGrid.vue` — Grid responsivo de productos
- `ProductFilters.vue` — Panel de filtros (categoría, precio, búsqueda)
- `CartItem.vue` — Item individual del carrito con controles de cantidad
- `CartSummary.vue` — Resumen con subtotal, impuestos, total
- `OrderCard.vue` — Tarjeta resumen de pedido
- `OrderTimeline.vue` — Timeline visual del estado del pedido
- `LoadingSpinner.vue` — Spinner/skeleton para estados de carga
- `AlertMessage.vue` — Notificaciones success/error/warning
- `ConfirmModal.vue` — Modal de confirmación reutilizable
- `Pagination.vue` — Paginación con números de página
- `SearchBar.vue` — Barra de búsqueda con debounce

**Stores (Pinia):**

```javascript
// authStore.js — Estado de autenticación
{
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  // Actions: login(), register(), logout(), fetchProfile(), updateProfile()
}

// productStore.js — Estado de productos
{
  products: [],
  currentProduct: null,
  categories: [],
  filters: { category: '', search: '', page: 1 },
  totalPages: 0,
  loading: false,
  // Actions: fetchProducts(), fetchById(), create(), update(), delete(), search()
}

// cartStore.js — Estado del carrito
{
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  // Actions: fetchCart(), addItem(), updateQuantity(), removeItem(), clearCart()
}

// orderStore.js — Estado de pedidos
{
  orders: [],
  currentOrder: null,
  loading: false,
  // Actions: createOrder(), fetchOrders(), fetchById(), updateStatus()
}
```

**API Layer (Axios):**

```javascript
// axiosInstance.js — Configuración centralizada
- Base URL apuntando al API Gateway (http://localhost:3000)
- Request interceptor: agrega token JWT automáticamente
- Response interceptor: manejo global de errores (401 → redirect login, 500 → toast)
```

**Diseño UI/UX:**

- 🎨 Esquema de colores oscuro/claro con CSS variables
- 🪟 Glassmorphism en cards y modals
- ✨ Micro-animaciones en hover, transiciones de página
- 📱 Diseño totalmente responsivo (mobile-first)
- 🔤 Tipografía moderna (Google Fonts: Inter o Outfit)
- 🎭 Iconos con Lucide Icons o Heroicons

**Tareas:**

1. Inicializar proyecto con `npx create-vue@latest`
2. Configurar Vite, Vue Router, Pinia
3. Crear sistema de diseño (variables CSS, colores, tipografía)
4. Crear `axiosInstance.js` con interceptors
5. Implementar `authStore` + vistas Login/Register
6. Implementar `productStore` + vistas catálogo y detalle
7. Implementar `cartStore` + vista carrito y checkout
8. Implementar `orderStore` + vistas de pedidos
9. Crear panel de administración con dashboard y CRUD
10. Implementar vista de reportes con gráficos (Chart.js o similar)
11. Guards de navegación (rutas protegidas y rutas admin)
12. Responsive design y pulido visual
13. Tests con Vitest

**Entregable:** Frontend completo funcionando en puerto 5173, conectado al API Gateway.

---

## 📊 Resumen de Fases

| Fase | Nombre | Estimación | Dependencias |
|------|--------|------------|--------------|
| 0 | Configuración Inicial | 1-2 horas | Ninguna |
| 1 | Users Service | 3-4 horas | Fase 0 |
| 2 | Products Service | 3-4 horas | Fase 0 |
| 3 | Cart Service | 3-4 horas | Fase 1, 2 |
| 4 | Orders Service | 4-5 horas | Fase 2, 3 |
| 5 | API Gateway | 3-4 horas | Fase 1-4 |
| 6 | Reports Service (MySQL) | 4-5 horas | Fase 4 |
| 7 | Logging + Docker + Docs | 3-4 horas | Todas backend |
| **8** | **Frontend (Vue.js 3)** | **6-8 horas** | **Fase 5 (Gateway)** |

**Tiempo total estimado:** ~33-42 horas de desarrollo

---

## 🚀 Próximo Paso

**→ Comenzar con la FASE 0: Configuración Inicial del Proyecto**
