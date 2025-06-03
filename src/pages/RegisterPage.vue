<template>
  <q-page class="flex flex-center items-center register-green-bg q-pt-xl">
    <q-card class="q-pa-lg shadow-10 register-card">
      <q-card-section class="text-center">
        <q-icon name="person_add" color="primary" size="56px" class="q-mb-md" />
        <div class="text-h5 text-weight-bold q-mb-xs">Crear Cuenta</div>
        <div class="text-subtitle2 text-grey-7 q-mb-md">
          Únete a OjoAhi y comienza a mejorar tu autonomía
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="username"
            label="Nombre completo"
            autocomplete="name"
            lazy-rules
            :rules="[val => !!val || 'Ingresa tu nombre']"
            prepend-inner-icon="person"
          />
          <q-input
            filled
            v-model="email"
            type="email"
            label="Correo electrónico"
            autocomplete="email"
            lazy-rules
            :rules="[val => !!val || 'Correo requerido', val => /.+@.+\..+/.test(val) || 'Correo inválido']"
            prepend-inner-icon="email"
          />
          <q-input
            filled
            v-model="phone"
            type="tel"
            label="Teléfono (opcional)"
            autocomplete="tel"
            prepend-inner-icon="phone"
          />
          <q-input
            filled
            v-model="password"
            type="password"
            label="Contraseña"
            autocomplete="new-password"
            lazy-rules
            :rules="[
              val => !!val || 'Contraseña requerida',
              val => val.length >= 8 || 'Mínimo 8 caracteres',
              val => /[a-zA-Z]/.test(val) || 'Debe tener letras',
              val => /[0-9]/.test(val) || 'Debe tener números'
            ]"
            prepend-inner-icon="lock"
          />
          <div class="text-caption text-grey-6 q-mb-xs">
            La contraseña debe tener al menos 8 caracteres e incluir letras y números.
          </div>
          <q-input
            filled
            v-model="passwordConfirm"
            type="password"
            label="Confirmar contraseña"
            autocomplete="new-password"
            lazy-rules
            :rules="[val => !!val || 'Confirma tu contraseña', val => val === password || 'Las contraseñas no coinciden']"
            prepend-inner-icon="lock"
          />
          <q-select
            filled
            v-model="role"
            label="Tipo de usuario"
            :options="roleOptions"
            emit-value
            map-options
            lazy-rules
            :rules="[val => !!val || 'Selecciona un tipo de usuario']"
            prepend-inner-icon="people"
          />
          <q-checkbox
            v-model="acceptedTerms"
            :rules="[val => !!val || 'Debes aceptar los términos']"
            required
          >
            <span>
              Acepto los
              <q-btn flat color="primary" size="sm" to="/terms" label="Términos y condiciones" no-caps class="q-px-xs"/>
              y la
              <q-btn flat color="primary" size="sm" to="/privacy" label="Política de privacidad" no-caps class="q-px-xs"/>
            </span>
          </q-checkbox>
          <q-checkbox
            v-model="newsletter"
            label="Quiero recibir noticias, actualizaciones y ofertas de OjoAhi"
          />
          <q-btn
            type="submit"
            color="primary"
            label="Registrarse"
            class="full-width q-mt-sm"
            unelevated
            no-caps
            size="lg"
            :loading="loading"
          />
        </q-form>
        <div class="text-center q-mt-md">
          <span>¿Ya tienes cuenta?</span>
          <q-btn flat color="primary" to="/login" label="Inicia sesión aquí" no-caps />
        </div>
      </q-card-section>
      <q-separator />
      <div class="text-center q-pt-lg">
        <div class="text-subtitle2 text-grey-7">O regístrate con</div>
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
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const username = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const passwordConfirm = ref('')
const role = ref('')
const acceptedTerms = ref(false)
const newsletter = ref(false)
const loading = ref(false)

const roleOptions = [
  { label: 'Persona con discapacidad visual', value: 'blind' },
  { label: 'Voluntario', value: 'volunteer' }
]

function onSubmit () {
  if (!acceptedTerms.value) {
    $q.notify({ color: 'negative', message: 'Debes aceptar los términos y condiciones.' })
    return
  }
  loading.value = true
  setTimeout(() => {
    loading.value = false
    $q.notify({ color: 'positive', message: '¡Registro simulado exitoso!' })
    // Aquí va tu lógica real de registro
  }, 1200)
}
</script>

<style scoped>
/* .register-green-bg {
  min-height: 100vh;
  background: #5dd62c;
  flex-direction: column;
} */
.register-card {
  max-width: 420px;
  width: 100%;
  border-radius: 1.5rem;
}
</style>