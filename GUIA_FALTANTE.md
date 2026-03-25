# 🚀 Guía de Implementación Restante - NexaCommerce (Fases Finales)

Esta guía detalla los pasos finales para completar el proyecto NexaCommerce, centrándose exclusivamente en lo que falta: **La creación del Frontend** y el **Despliegue Completo mediante Docker**.

---

## FASE 8: Frontend (Vue.js 3 + Vite)

El frontend será una aplicación SPA (Single Page Application) que se conectará con todos los microservicios, interactuando únicamente a través del **API Gateway** (puerto 3000).

### Paso 8.1 — Inicializar el Proyecto Vue

Abre una terminal en la raíz del proyecto (`Micro-Commerce-MS/`) y ejecuta:

```bash
npm create vite@latest frontend -- --template vue
cd frontend
npm install

# Instalar dependencias esenciales para nuestra app
npm install vue-router@4 pinia axios chart.js vue-chartjs
```

### Paso 8.2 — Estructura de Carpetas del Frontend

Dentro de `frontend/src/`, es necesario estructurar el proyecto de la siguiente manera para un óptimo trabajo y escalabilidad:

```text
frontend/src/
├── api/
│   └── axios.js              # Configuración de Axios apuntando al http://localhost:3000 (Gateway)
├── router/
│   └── index.js              # Archivo principal de enrutamiento (Vue Router)
├── stores/
│   ├── auth.js               # Estado global de sesión y guardado del JWT en localStorage (Pinia)
│   ├── cart.js               # Estado del carrito (Pinia)
│   └── products.js           # Estado de los productos (Pinia)
├── views/
│   ├── HomeView.vue          # Página principal
│   ├── LoginView.vue         # Pantalla de inicio de sesión
│   ├── RegisterView.vue      # Pantalla de registro
│   ├── CatalogView.vue       # Listado de productos y filtros
│   ├── ProductDetailView.vue # Detalle de un único producto
│   ├── CartView.vue          # Ver el carrito y proceder al checkout
│   ├── OrdersView.vue        # Historial de pedidos del cliente
│   ├── ProfileView.vue       # Ver y editar perfil
│   └── admin/
│       ├── DashboardView.vue      # Dashboard con las gráficas de Chart.js y estadísticas de ventas
│       ├── ManageProductsView.vue # Creación y edicion de productos
│       └── ManageOrdersView.vue   # Cambio de estado de los pedidos de los usuarios
├── components/
│   ├── Navbar.vue            # Cabecera de navegación principal
│   ├── ProductCard.vue       # Componente reutilizable mostrando un producto
│   └── Footer.vue            # Pie de página
├── App.vue                   # Contenedor raíz y router-view
└── main.js                   # Entry point de la aplicación de Vue
```

### Paso 8.3 — Configuración global del cliente HTTP (Axios)

Será necesario que el cliente HTTP inyecte el token de autenticación del usuario en todas las peticiones a rutas protegidas. Al configurar `api/axios.js`, debes incluir un **interceptador** que lea el JWT del `localStorage` o Pinia para añadirlo a los headers (`Authorization: Bearer <token>`).

---

## FASE 9: Dockerización Completa (Preparación para Producción)

Actualmente, el `docker-compose.yml` inicial únicamente cuenta con los servicios de base de datos (`mongodb` y `mysql`). Para verdaderamente implementar tu aplicación con una estrategia de microservicios contenerizada, todos los módulos de Node.js y el Frontend deben levantarse automáticamente mediante Docker Compose.

### Paso 9.1 — Crear un `Dockerfile` en cada Backend y el Gateway

Hay un total de 6 servicios que requieren ser contenerizados en Node.
En cada una de las siguientes carpetas deberás crear un archivo llamado `Dockerfile`:
- `gateway/`
- `services/users-service/`
- `services/products-service/`
- `services/cart-service/`
- `services/orders-service/`
- `services/reports-service/`

**Plantilla base de Dockerfile (Node):**
```dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

# Recuerda cambiar el EXPOSE dependiendo del servicio (3000, 3001, 3002...)
EXPOSE 300x 

CMD ["node", "server.js"]
```

### Paso 9.2 — Crear el `Dockerfile` del Frontend (Vue)

El Frontend de Vue debe ser construido y luego servido mediante Nginx en un contenedor muy liviano.
En el directorio `frontend/`, crea este `Dockerfile`:

```dockerfile
# Etapa 1: Build y compilación (Node)
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir los archivos estáticos (Nginx)
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Se expone el puerto 80 del servidor Nginx por defecto
EXPOSE 80 
CMD ["nginx", "-g", "daemon off;"]
```

### Paso 9.3 — Actualizar el `docker-compose.yml` Maestro

Deberás expandir dramáticamente tu actual archivo `docker-compose.yml` para incorporar cada contenedor construido arriba.

A su vez:
1. Crearás una `network` puente (bridge network) para que todos los contenedores se comuniquen.
2. Usarás las directivas `depends_on` para asegurar que las Bases de Datos inicien antes de que se inicien los backend.
3. Actualizarás las URLs internas del Gateway para que en vez de consultar `http://localhost:3001` , consulte directamente al servicio de Docker (por ej: `http://users-service:3001`).

### Paso 9.4 — Orquestando e Iniciando Todo

Una vez configurado todo el `docker-compose.yml`, ya no tendrás que abrir múltiples terminales con `npm run dev`. Solo necesitarás correr, en la terminal ubicada en la raíz del proyecto, el comando:

```bash
docker-compose --env-file .env up -d --build
```

Esto hará lo siguiente de manera autónoma:
1. Descargará MySQL y Mongo.
2. Contruirá las 6 imágenes de Node.js de tu API y microservicios y echará a andar cada una en su puerto.
3. Compilará automáticamente Vue.js usando Vite y levantará un Nginx sirviendo la interfaz de usuario en el puerto asignado (por ej: puerto 80 u 8080 público).
4. Todas las entidades se conectarán a través de la red interna Docker.
