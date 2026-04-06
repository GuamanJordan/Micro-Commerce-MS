<!-- frontend/src/components/ProductCard.vue -->
<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer" @click="goToDetail">
    <div class="h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center overflow-hidden">
      <!-- Muestra una imagen por defecto si el producto no tiene image_url -->
      <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="h-full w-full object-cover" />
      <span v-else class="text-gray-400">Sin Imagen</span>
    </div>
    <h3 class="text-lg font-semibold text-gray-800 truncate">{{ product.name }}</h3>
    <p class="text-sm text-gray-500 mb-2 truncate">{{ product.description }}</p>
    <div class="flex justify-between items-center mt-4">
      <span class="text-xl font-bold text-sky-600">${{ product.price }}</span>
      <button @click.stop="addToCart" class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded transition-colors">
        Agregar
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
// Importa tu store de carrito en caso de que ya lo tengas listo:
// import { useCartStore } from '../stores/cart';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();
// const cartStore = useCartStore();

const goToDetail = () => {
  router.push(`/product/${props.product.id}`);
};

const addToCart = () => {
  // cartStore.addToCart(props.product.id, 1);
  alert('Producto agregado al carrito: ' + props.product.name);
};
</script>
