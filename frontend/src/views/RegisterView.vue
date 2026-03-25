<template>
  <div class="auth-container">
    <h2>Registro de Usuario</h2>
    <form @submit.prevent="handleRegister">
      <div>
        <label>Nombre Completo:</label>
        <input v-model="name" type="text" required />
      </div>
      <div>
        <label>Email:</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Teléfono:</label>
        <input v-model="phone" type="text" />
      </div>
      <div>
        <label>Contraseña:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Registrarse</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      phone: phone.value,
      password: password.value
    });
    // Tratar de auto-logear al usuario despues de registro
    await authStore.login(email.value, password.value);
    router.push('/catalog');
  } catch (err) {
    error.value = 'Error al registrar usuario. Verifica el email.';
  }
};
</script>

<style scoped>
.auth-container { max-width: 400px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
input { width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px; }
button { width: 100%; padding: 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;}
.error { color: red; margin-top: 10px; font-size: 14px; }
</style>
