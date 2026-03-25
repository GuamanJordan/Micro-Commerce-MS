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
    await cartStore.clearCart(); 
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
