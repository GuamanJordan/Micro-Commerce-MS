<!-- frontend/src/views/ProductDetailView.vue -->
<template>
  <div class="container mx-auto p-8">
    <button @click="$router.back()" class="text-sky-600 hover:underline mb-4">&larr; Volver</button>
    <div class="bg-white shadow-lg rounded-xl flex flex-col md:flex-row p-6">
      <div class="w-full md:w-1/2 bg-gray-200 h-96 rounded-lg flex items-center justify-center">
        <!-- Renderizar Info de la variable route.params.id -->
        <span class="text-gray-500">Imagen del Producto ID: {{ $route.params.id }}</span>
      </div>
      <div class="w-full md:w-1/2 md:pl-10 mt-6 md:mt-0 flex flex-col justify-center">
        <h1 class="text-4xl font-extrabold text-gray-800 mb-2">Detalles del Producto</h1>
        <p class="text-2xl text-sky-600 font-bold mb-4">$99.99</p>
        <p class="text-gray-600 mb-6">Descripción detallada del microservicio o producto virtual iría en este bloque.</p>
        <button class="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold w-full sm:w-64 transition-all">
          Agregar al Carrito
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
// Aquí harías la petición individual api.get(`/products/${route.params.id}`)
</script>
