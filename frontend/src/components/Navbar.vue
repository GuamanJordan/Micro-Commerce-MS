<template>
  <header class="navbar">
    <div class="logo">
      <router-link to="/">NexaCommerce</router-link>
    </div>
    <nav class="nav-links">
      <router-link to="/catalog">Catálogo</router-link>
      <template v-if="authStore.isAuthenticated">
        <router-link to="/cart">Carrito ({{ cartStore.totalItems }})</router-link>
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
