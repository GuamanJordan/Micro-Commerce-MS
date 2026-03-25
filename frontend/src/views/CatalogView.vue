<template>
  <div class="catalog">
    <h2>Catálogo de Productos</h2>
    <div class="products-grid">
      <div v-for="product in products" :key="product._id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p class="price">${{ product.price }}</p>
        <p>{{ product.description }}</p>
        <button v-if="authStore.isAuthenticated" @click="addToCart(product._id)">Agregar</button>
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
