<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <router-link to="/" class="text-white text-decoration-none">
            OjoAhi
          </router-link>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="auth-container">
        <div class="auth-card-wrapper">
          <router-view />
        </div>
      </div>
    </q-page-container>
    
    <q-footer bordered class="bg-white text-dark">
      <q-toolbar>
        <q-toolbar-title class="text-center text-body2">
          &copy; {{ currentYear }} OjoAhi - Todos los derechos reservados
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'AuthLayout',

  setup() {
    const currentYear = computed(() => new Date().getFullYear());

    return {
      currentYear
    };
  }
});
</script>

<style scoped>
.text-decoration-none {
  text-decoration: none;
}

.auth-container {
  min-height: calc(100vh - 100px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card-wrapper {
  width: 100%;
  max-width: 450px;
}
</style>
