# 🛠️ Guía Completa de Desarrollo Frontend (Vue 3 + Vite) - NexaCommerce

Esta guía contiene la estructura completa, los archivos y el código base necesario para montar el **Frontend de NexaCommerce** de principio a fin dentro del directorio `frontend/src/`. Con esto tendrás una aplicación totalmente funcional y conectada al API Gateway.

---

## 📂 1. Estructura de Carpetas

Asegúrate de borrar todo dentro de tu `frontend/src/` actual (menos `main.js` y `App.vue` que vamos a reemplazar a continuación) y crea la siguiente estructura:

```text
frontend/src/
├── api/
│   └── axios.js
├── router/
│   └── index.js
├── stores/
│   ├── auth.js
│   └── cart.js
├── components/
│   ├── Navbar.vue
│   ├── Footer.vue
│   └── ProductCard.vue
├── views/
│   ├── HomeView.vue
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   ├── CatalogView.vue
│   ├── CartView.vue
│   └── OrdersView.vue
├── App.vue
├── main.js
└── style.css
```

---

## 🔌 2. Configuración Principal (`main.js` y `api/axios.js`)

**📁 `src/api/axios.js`**
Este archivo configura Axios para que apunte directamente a tu API Gateway (puerto 3000) e inyecte el token JWT en cada petición gracias al interceptor.

```javascript
import axios from 'axios';

// Instancia apuntando al API Gateway
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**📁 `src/main.js`**
Punto de entrada de Vue. Aquí instanciamos Vue, Vue Router y Pinia (para manejo de estado global).

```javascript
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
```

---

## 🗃️ 3. Gestión de Estado Global con Pinia (`stores/`)

**📁 `src/stores/auth.js`**
Manejará el Login, Logout y los datos del usuario logueado.

```javascript
import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },
  actions: {
    async login(email, password) {
      const { data } = await api.post('/users/login', { email, password });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    },
    async register(userData) {
      await api.post('/users/register', userData);
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
```

**📁 `src/stores/cart.js`**
Manejo del estado del carrito.

```javascript
import { defineStore } from 'pinia';
import api from '../api/axios';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    totalPrice: 0,
    totalItems: 0
  }),
  actions: {
    async fetchCart() {
      try {
        const { data } = await api.get('/cart');
        this.items = data.items || [];
        this.totalPrice = data.totalPrice || 0;
        this.totalItems = data.totalItems || 0;
      } catch (error) {
        console.error("Error al cargar carrito", error);
      }
    },
    async addToCart(productId, quantity) {
      await api.post('/cart/add', { productId, quantity });
      await this.fetchCart();
    },
    async clearCart() {
      await api.delete('/cart');
      this.items = [];
      this.totalPrice = 0;
      this.totalItems = 0;
    }
  }
});
```

---

## 🚦 4. Enrutamiento (`router/`)

**📁 `src/router/index.js`**
Manejará las rutas y las protegerá (rutas que necesitan Auth).

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/RegisterView.vue') },
  { path: '/catalog', name: 'Catalog', component: () => import('../views/CatalogView.vue') },
  { path: '/cart', name: 'Cart', component: () => import('../views/CartView.vue'), meta: { requiresAuth: true } },
  { path: '/orders', name: 'Orders', component: () => import('../views/OrdersView.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de Navegación (Proteger Rutas Privadas)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
```

---

## 🧩 5. Componentes Principales (`App.vue` y `components/`)

**📁 `src/App.vue`**
Esqueleto principal de nuestra aplicación. Envolverá el Navbar, el Router View de Vue (donde cambian las páginas) y el Footer.

```vue
<template>
  <div class="app">
    <Navbar />
    <main class="container">
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.container {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>
```

**📁 `src/components/Navbar.vue`**

```vue
<template>
  <header class="navbar">
    <div class="logo">
      <router-link to="/">🛍️ NexaCommerce</router-link>
    </div>
    <nav class="nav-links">
      <router-link to="/catalog">Catálogo</router-link>
      <template v-if="authStore.isAuthenticated">
        <router-link to="/cart">🛒 Carrito ({{ cartStore.totalItems }})</router-link>
        <router-link to="/orders">Mis Pedidos</router-link>
        <button @click="logout" class="btn-logout">Salir</button>
      </template>
      <template v-else>
        <router-link to="/login">Iniciar Sesión</router-link>
        <router-link to="/register">Registrarse</router-link>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

// Cargar carrito si está autenticado
if (authStore.isAuthenticated) {
  cartStore.fetchCart();
}

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
}
.navbar a {
  color: white;
  text-decoration: none;
  margin-left: 15px;
}
.btn-logout {
  margin-left: 15px;
  background: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
```

**📁 `src/components/Footer.vue`**

```vue
<template>
  <footer class="footer">
    <p>&copy; 2026 NexaCommerce Microservicios. Todos los derechos reservados.</p>
  </footer>
</template>

<style scoped>
.footer {
  text-align: center;
  padding: 1rem;
  background: #ecf0f1;
  color: #7f8c8d;
  margin-top: 2rem;
}
</style>
```

---

## 🖥️ 6. Vistas (Páginas de la Aplicación en `views/`)

**📁 `src/views/HomeView.vue`**

```vue
<template>
  <div class="home">
    <h1>Bienvenido a NexaCommerce 🚀</h1>
    <p>La mejor tienda en línea basada en arquitectura de microservicios.</p>
    <router-link to="/catalog" class="btn-primary">Ver Catálogo de Productos</router-link>
  </div>
</template>

<style scoped>
.home { text-align: center; margin-top: 50px; }
.btn-primary { display: inline-block; padding: 10px 20px; background: #3498db; color: white; border-radius: 5px; text-decoration: none; margin-top: 20px;}
</style>
```

**📁 `src/views/LoginView.vue`**

```vue
<template>
  <div class="auth-container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label>Email:</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Contraseña:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Ingresar</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value);
    router.push('/catalog');
  } catch (err) {
    error.value = 'Credenciales inválidas o error de conexión.';
  }
};
</script>

<style scoped>
.auth-container { max-width: 400px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
input { width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px; }
button { width: 100%; padding: 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;}
.error { color: red; margin-top: 10px; font-size: 14px; }
</style>
```

**📁 `src/views/CatalogView.vue`**

```vue
<template>
  <div class="catalog">
    <h2>Catálogo de Productos</h2>
    <div class="products-grid">
      <div v-for="product in products" :key="product._id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p class="price">${{ product.price }}</p>
        <p>{{ product.description }}</p>
        <button v-if="authStore.isAuthenticated" @click="addToCart(product._id)">🛒 Agregar</button>
        <p v-else><em>Inicia sesión para comprar</em></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const products = ref([]);
const cartStore = useCartStore();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    const { data } = await api.get('/products');
    products.value = data;
  } catch (error) {
    console.error("Error cargando productos", error);
  }
});

const addToCart = async (id) => {
  try {
    await cartStore.addToCart(id, 1);
    alert('Producto añadido al carrito!');
  } catch (err) {
    alert('Error al añadir producto');
  }
};
</script>

<style scoped>
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
.product-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: white; text-align: center; }
.price { font-size: 20px; font-weight: bold; color: #27ae60; }
button { background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
</style>
```

**📁 `src/views/CartView.vue`**

```vue
<template>
  <div class="cart">
    <h2>Mi Carrito</h2>
    <div v-if="cartStore.items.length === 0">
      <p>Tu carrito está vacío.</p>
    </div>
    <div v-else>
      <ul class="cart-items">
        <li v-for="item in cartStore.items" :key="item.productId">
          <span>{{ item.name }} (x{{ item.quantity }})</span>
          <span>${{ item.subtotal }}</span>
        </li>
      </ul>
      <h3 class="total">Total a pagar: ${{ cartStore.totalPrice }}</h3>
      
      <div class="checkout">
        <h4>Datos de Envío:</h4>
        <input v-model="address.street" placeholder="Calle" required />
        <input v-model="address.city" placeholder="Ciudad" required />
        <button @click="checkout" class="btn-checkout">Confirmar Pedido</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCartStore } from '../stores/cart';
import api from '../api/axios';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();

const address = ref({
  street: '',
  city: '',
  state: 'n/a',
  zipCode: '00000'
});

const checkout = async () => {
  if (!address.value.street || !address.value.city) {
    return alert('Completa tu dirección.');
  }
  
  try {
    const { data } = await api.post('/orders', { shippingAddress: address.value });
    alert(`Pedido creado con éxito! Orden: ${data.orderNumber}`);
    await cartStore.clearCart(); // El backend ya lo vacía, pero limpimos el store.
    router.push('/orders');
  } catch (error) {
    alert('Error al procesar el pedido. Comprueba el Stock.');
  }
};
</script>

<style scoped>
.cart-items { list-style: none; padding: 0; }
.cart-items li { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 10px 0; }
.total { text-align: right; margin-top: 15px; color: #2ecc71; }
.checkout { margin-top: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
.checkout input { display: block; width: 100%; margin-bottom: 10px; padding: 8px; }
.btn-checkout { background: #e67e22; color: white; padding: 10px; border: none; width: 100%; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;}
</style>
```

**📁 `src/views/OrdersView.vue`**

```vue
<template>
  <div class="orders">
    <h2>Mis Pedidos</h2>
    <div v-if="orders.length === 0">
      <p>Aún no has realizado pedidos.</p>
    </div>
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order._id" class="order-card">
        <h4>Pedido: {{ order.orderNumber }}</h4>
        <p>Estado: <strong>{{ order.status }}</strong></p>
        <p>Total: <strong>${{ order.totalAmount }}</strong></p>
        <p>Fecha: {{ new Date(order.createdAt).toLocaleDateString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const orders = ref([]);

onMounted(async () => {
  try {
    const { data } = await api.get('/orders/my-orders');
    orders.value = data;
  } catch (error) {
    console.error("Error cargando pedidos", error);
  }
});
</script>

<style scoped>
.order-card { border: 1px solid #bdc3c7; margin-bottom: 15px; padding: 15px; border-radius: 8px; background: #fafafa; }
</style>
```

---

## 🎨 7. Estilos Globales Extra (`style.css`)

**📁 `src/style.css`** (Para que luzca bien y limpio sin mucho esfuerzo).

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  background-color: #ffffff;
  color: #333333;
}
```

---

### ¿Cómo arrancarlo? 🚀

1. Asegúrate de tener corriendo los **bases de datos, 5 microservicios backend, y la terminal del gateway**.
2. Abre la terminal de la carpeta `frontend/`.
3. Ejecuta `npm run dev`
4. ¡Abre tu navegador en `http://localhost:5173` y disfruta de la aplicación de NexaCommerce en Vue!
