<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <router-link to="/" class="text-white text-decoration-none">
            OjoAhi
          </router-link>
        </q-toolbar-title>

        <div class="q-gutter-sm">
          <q-btn v-if="!isAuthenticated" to="/login" flat label="Iniciar sesión" />
          <q-btn v-if="!isAuthenticated" to="/register" outline label="Registrarse" />
          
          <q-btn v-if="isAuthenticated" flat round icon="notifications">
            <q-badge v-if="notificationCount" color="red" floating>{{ notificationCount }}</q-badge>
          </q-btn>
          
          <q-btn v-if="isAuthenticated" flat round>
            <q-avatar size="26px">
              <img :src="userAvatar" alt="Avatar">
            </q-avatar>
            
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item clickable v-close-popup to="/app">
                  <q-item-section>Dashboard</q-item-section>
                </q-item>
                
                <q-item clickable v-close-popup to="/app/profile">
                  <q-item-section>Mi perfil</q-item-section>
                </q-item>
                
                <q-separator />
                
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section>Cerrar sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="240"
    >
      <q-list>
        <q-item-label header>Navegación</q-item-label>
        
        <q-item clickable to="/" exact>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>
        
        <q-item clickable to="/about">
          <q-item-section avatar>
            <q-icon name="info" />
          </q-item-section>
          <q-item-section>Acerca de</q-item-section>
        </q-item>
        
        <q-item clickable to="/contact">
          <q-item-section avatar>
            <q-icon name="mail" />
          </q-item-section>
          <q-item-section>Contacto</q-item-section>
        </q-item>
        
        <q-separator v-if="isAuthenticated" />
        
        <template v-if="isAuthenticated">
          <q-item-label header>Mi cuenta</q-item-label>
          
          <q-item clickable to="/app">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>
          
          <q-item clickable to="/app/profile">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>Mi perfil</q-item-section>
          </q-item>
          
          <q-item clickable to="/app/chat">
            <q-item-section avatar>
              <q-icon name="chat" />
            </q-item-section>
            <q-item-section>
              Mensajes
              <q-badge v-if="unreadMessages" color="red" floating>{{ unreadMessages }}</q-badge>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
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
import { defineComponent, ref, computed } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useChatStore } from 'src/stores/chat';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const leftDrawerOpen = ref(false);
    const authStore = useAuthStore();
    const chatStore = useChatStore();
    
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const currentYear = computed(() => new Date().getFullYear());
    const unreadMessages = computed(() => chatStore.unreadCount);
    const notificationCount = ref(0);
    
    const userAvatar = computed(() => {
      if (authStore.user?.profile_image) {
        return authStore.user.profile_image;
      }
      return 'https://cdn.quasar.dev/img/boy-avatar.png';
    });

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };
    
    const logout = async () => {
      await authStore.logout();
      // Redirect to home page
      window.location.href = '/';
    };

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      isAuthenticated,
      currentYear,
      userAvatar,
      unreadMessages,
      notificationCount,
      logout
    };
  }
});
</script>

<style scoped>
.text-decoration-none {
  text-decoration: none;
}
</style>
