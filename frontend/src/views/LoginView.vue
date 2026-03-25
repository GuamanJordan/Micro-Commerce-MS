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
