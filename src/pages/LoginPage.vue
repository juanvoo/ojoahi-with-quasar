<template>
  <q-page class="flex flex-center items-center login-green-bg q-pt-xl">
    <q-card class="q-pa-lg shadow-10 login-card">
      <q-card-section class="text-center">
        <q-icon name="visibility_off" color="primary" size="56px" class="q-mb-md" />
        <div class="text-h5 text-weight-bold q-mb-xs">Iniciar Sesión</div>
        <div class="text-subtitle2 text-grey-7 q-mb-md">
          Accede a tu cuenta para utilizar todas las funciones de OjoAhi
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="email"
            label="Correo electrónico"
            type="email"
            autocomplete="username"
            lazy-rules
            :rules="[val => !!val || 'Ingresa tu correo']"
            prepend-inner-icon="email"
          />
          <div>
            <div class="row items-center justify-between">
              <label class="text-body2" for="password">Contraseña</label>
              <q-btn flat dense no-caps color="primary" size="sm" to="/forgot-password">¿Olvidaste tu contraseña?</q-btn>
            </div>
            <q-input
              filled
              v-model="password"
              label="Contraseña"
              type="password"
              id="password"
              autocomplete="current-password"
              lazy-rules
              :rules="[val => !!val || 'Ingresa tu contraseña']"
              prepend-inner-icon="lock"
            />
          </div>
          <q-checkbox v-model="remember" label="Recordarme en este dispositivo" />
          <q-btn type="submit" color="primary" label="Ingresar" class="full-width q-mt-sm" unelevated no-caps size="lg" />
        </q-form>
        <div class="text-center q-mt-md">
          <span>¿No tienes cuenta?</span>
          <q-btn flat color="primary" to="/register" label="Regístrate" no-caps />
        </div>
      </q-card-section>
      <q-separator />
      <div class="text-center q-pt-lg">
        <div class="text-subtitle2 text-grey-7">O inicia sesión con</div>
        <div class="row justify-center q-gutter-md q-mt-sm">
          <q-btn round outline color="secondary" href="/auth/google" aria-label="Google">
            <q-icon name="fab fa-google" />
          </q-btn>
          <q-btn round outline color="secondary" href="/auth/facebook" aria-label="Facebook">
            <q-icon name="fab fa-facebook-f" />
          </q-btn>
          <q-btn round outline color="secondary" href="/auth/apple" aria-label="Apple">
            <q-icon name="fab fa-apple" />
          </q-btn>
        </div>
      </div>
      <div class="text-center q-mt-md login-terms">
        <p class="text-caption text-grey-7">
          Al iniciar sesión, aceptas nuestros
          <q-btn flat color="primary" size="sm" to="/terms" label="Términos y condiciones" no-caps class="q-px-xs"/>
          y
          <q-btn flat color="primary" size="sm" to="/privacy" label="Política de privacidad" no-caps class="q-px-xs"/>
          .
        </p>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const remember = ref(false)

function onSubmit() {
  // Aquí va la lógica real de login
  if (!email.value || !password.value) return
  // Simulación
  router.push('/users/dashboard')
}
</script>

<style scoped>
/* .login-green-bg {
  min-height: 100vh;
  background: #5dd62c;
  flex-direction: column;
} */
.login-card {
  max-width: 400px;
  width: 100%;
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.login-terms {
  max-width: 100%;
  width: 100%;
  margin-top: 1rem;
}
</style>