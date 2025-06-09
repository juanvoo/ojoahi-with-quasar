<template>
  <q-card class="auth-card q-pa-lg">
    <q-card-section>
      <div class="text-center q-mb-lg">
        <h4 class="text-h4 q-my-none">Crear cuenta</h4>
        <p class="text-subtitle1 q-mt-sm">Únete a OjoAhi</p>
      </div>
      
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          v-model="username"
          label="Nombre de usuario"
          :rules="[val => !!val || 'El nombre de usuario es requerido', val => val.length >= 3 || 'Mínimo 3 caracteres']"
          outlined
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>
        
        <q-input
          v-model="email"
          label="Email"
          type="email"
          :rules="[val => !!val || 'El email es requerido', isValidEmail]"
          outlined
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>
        
        <q-input
          v-model="password"
          label="Contraseña"
          :type="isPwd ? 'password' : 'text'"
          :rules="[
            val => !!val || 'La contraseña es requerida',
            val => val.length >= 6 || 'Mínimo 6 caracteres',
            isStrongPassword
          ]"
          outlined
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
        
        <q-input
          v-model="confirmPassword"
          label="Confirmar contraseña"
          :type="isPwd ? 'password' : 'text'"
          :rules="[
            val => !!val || 'Confirma tu contraseña',
            val => val === password || 'Las contraseñas no coinciden'
          ]"
          outlined
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>
        
        <q-select
          v-model="role"
          :options="roleOptions"
          label="Tipo de usuario"
          outlined
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="badge" />
          </template>
        </q-select>
        
        <q-checkbox v-model="acceptTerms" label="Acepto los términos y condiciones" />
        
        <q-btn
          type="submit"
          color="primary"
          label="Registrarse"
          class="full-width"
          :loading="loading"
          :disable="!acceptTerms"
          size="lg"
        />
      </q-form>
    </q-card-section>
    
    <q-card-section class="text-center q-pt-none">
      <p>¿Ya tienes una cuenta? <router-link to="/login" class="text-primary">Inicia sesión</router-link></p>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { Notify } from 'quasar';

export default defineComponent({
  name: 'RegisterPage',
  
  setup() {
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const role = ref('blind');
    const acceptTerms = ref(false);
    const isPwd = ref(true);
    const loading = ref(false);
    
    const router = useRouter();
    const authStore = useAuthStore();
    
    const roleOptions = [
      { label: 'Persona con discapacidad visual', value: 'blind' },
      { label: 'Voluntario', value: 'volunteer' }
    ];
    
    const isValidEmail = (val) => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(val) || 'Email inválido';
    };
    
    const isStrongPassword = (val) => {
      // At least one uppercase, one lowercase and one number
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
      return passwordPattern.test(val) || 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    };
    
    const onSubmit = async () => {
      if (!acceptTerms.value) {
        Notify.create({
          type: 'negative',
          message: 'Debes aceptar los términos y condiciones'
        });
        return;
      }
      
      if (password.value !== confirmPassword.value) {
        Notify.create({
          type: 'negative',
          message: 'Las contraseñas no coinciden'
        });
        return;
      }
      
      loading.value = true;
      
      try {
        const success = await authStore.register({
          username: username.value,
          email: email.value,
          password: password.value,
          role: role.value
        });
        
        if (success) {
          Notify.create({
            type: 'positive',
            message: 'Registro exitoso. Ahora puedes iniciar sesión.'
          });
          
          // Redirect to login page
          router.push('/login');
        }
      } catch (error) {
        console.error('Registration error:', error);
        
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Error al registrarse'
        });
      } finally {
        loading.value = false;
      }
    };
    
    return {
      username,
      email,
      password,
      confirmPassword,
      role,
      roleOptions,
      acceptTerms,
      isPwd,
      loading,
      isValidEmail,
      isStrongPassword,
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
