<template>
  <div class="home">
    <h1>Bienvenido a NexaCommerce</h1>
    <p>La mejor tienda en línea basada en arquitectura de microservicios.</p>
    <router-link to="/catalog" class="btn-primary">Ver Catálogo de Productos</router-link>
  </div>
</template>

<style scoped>
.home { text-align: center; margin-top: 50px; }
.btn-primary { display: inline-block; padding: 10px 20px; background: #3498db; color: white; border-radius: 5px; text-decoration: none; margin-top: 20px;}
</style>
