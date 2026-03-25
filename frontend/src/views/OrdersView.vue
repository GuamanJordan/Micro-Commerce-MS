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
