<template>
  <q-card class="auth-card q-pa-lg">
    <q-card-section>
      <div class="text-center q-mb-lg">
        <h4 class="text-h4 q-my-none">Iniciar sesión</h4>
        <p class="text-subtitle1 q-mt-sm">Bienvenido de nuevo a OjoAhi</p>
      </div>
      
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          v-model="email"
          label="Email"
          type="email"
          outlined
          :rules="[val => !!val || 'El email es requerido']"
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>
        
        <q-input
          v-model="password"
          label="Contraseña"
          :type="isPwd ? 'password' : 'text'"
          outlined
          :rules="[val => !!val || 'La contraseña es requerida']"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        
        <div class="flex justify-between items-center">
          <q-checkbox v-model="rememberMe" label="Recordarme" />
          <router-link to="/forgot-password" class="text-primary">¿Olvidaste tu contraseña?</router-link>
        </div>
        
        <q-btn
          type="submit"
          color="primary"
          label="Iniciar sesión"
          class="full-width"
          :loading="loading"
          size="lg"
        />
      </q-form>
    </q-card-section>
    
    <q-card-section class="text-center q-pt-none">
      <p>¿No tienes una cuenta? <router-link to="/register" class="text-primary">Regístrate</router-link></p>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { Notify } from 'quasar';

export default defineComponent({
  name: 'LoginPage',
  
  setup() {
    const email = ref('');
    const password = ref('');
    const isPwd = ref(true);
    const rememberMe = ref(false);
    const loading = ref(false);
    
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    
    // Check if session expired
    if (route.query.session === 'expired') {
      Notify.create({
        type: 'warning',
        message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
      });
    }
    
    const onSubmit = async () => {
      loading.value = true;
      
      try {
        const success = await authStore.login({
          email: email.value,
          password: password.value
        });
        
        if (success) {
          const redirectPath = route.query.redirect || '/app';
          router.push(redirectPath);
        }
      } catch (error) {
        console.error('Error en login:', error);
        
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Error al iniciar sesión'
        });
      } finally {
        loading.value = false;
      }
    };
    
    return {
      email,
      password,
      isPwd,
      rememberMe,
      loading,
      onSubmit
    };
  }
});
</script>

<style scoped>
.auth-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
