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
          <router-link to="/app" class="text-white text-decoration-none">
            OjoAhi Dashboard
          </router-link>
        </q-toolbar-title>

        <div class="q-gutter-sm">
          <q-btn to="/app/notifications" flat round icon="notifications">
            <q-badge v-if="notificationCount" color="red" floating>{{ notificationCount }}</q-badge>
          </q-btn>
          
          <q-btn to="/app/chat" flat round icon="chat">
            <q-badge v-if="unreadMessages" color="red" floating>{{ unreadMessages }}</q-badge>
          </q-btn>
          
          <q-btn flat round>
            <q-avatar size="26px">
              <img :src="userAvatar" alt="Avatar">
            </q-avatar>
            
            <q-menu>
              <q-list style="min-width: 200px">
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
      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px;">
        <q-list>
          <q-item-label header>Dashboard</q-item-label>
          
          <q-item clickable to="/app" exact>
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Inicio</q-item-section>
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
          
          <q-item clickable to="/app/notifications">
            <q-item-section avatar>
              <q-icon name="notifications" />
            </q-item-section>
            <q-item-section>
              Notificaciones
              <q-badge v-if="notificationCount" color="red" floating>{{ notificationCount }}</q-badge>
            </q-item-section>
          </q-item>
          
          <q-separator />
          
          <!-- Menu items for blind users -->
          <template v-if="isBlind">
            <q-item-label header>Persona con discapacidad visual</q-item-label>
            
            <q-item clickable to="/app/blind/help-requests">
              <q-item-section avatar>
                <q-icon name="help" />
              </q-item-section>
              <q-item-section>Mis solicitudes</q-item-section>
            </q-item>
            
            <q-item clickable to="/app/blind/help-requests/new">
              <q-item-section avatar>
                <q-icon name="add_circle" />
              </q-item-section>
              <q-item-section>Nueva solicitud</q-item-section>
            </q-item>
            
            <q-item clickable to="/app/blind/volunteers">
              <q-item-section avatar>
                <q-icon name="people" />
              </q-item-section>
              <q-item-section>Voluntarios</q-item-section>
            </q-item>
          </template>
          
          <!-- Menu items for volunteer users -->
          <template v-if="isVolunteer">
            <q-item-label header>Voluntario</q-item-label>
            
            <q-item clickable to="/app/volunteer/available-requests">
              <q-item-section avatar>
                <q-icon name="search" />
              </q-item-section>
              <q-item-section>Solicitudes disponibles</q-item-section>
            </q-item>
            
            <q-item clickable to="/app/volunteer/my-reservations">
              <q-item-section avatar>
                <q-icon name="event" />
              </q-item-section>
              <q-item-section>Mis reservas</q-item-section>
            </q-item>
            
            <q-item clickable to="/app/volunteer/reviews">
              <q-item-section avatar>
                <q-icon name="star" />
              </q-item-section>
              <q-item-section>Mis reseñas</q-item-section>
            </q-item>
          </template>
          
          <q-separator />
          
          <q-item clickable to="/">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Volver al inicio</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
      
      <q-img
        class="absolute-top"
        src="https://cdn.quasar.dev/img/material.png"
        style="height: 150px"
      >
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <img :src="userAvatar" alt="Avatar">
          </q-avatar>
          <div class="text-weight-bold">{{ username }}</div>
          <div>{{ userRole }}</div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useChatStore } from 'src/stores/chat';

export default defineComponent({
  name: 'DashboardLayout',

  setup() {
    const leftDrawerOpen = ref(false);
    const authStore = useAuthStore();
    const chatStore = useChatStore();
    
    const isBlind = computed(() => authStore.isBlind);
    const isVolunteer = computed(() => authStore.isVolunteer);
    const username = computed(() => authStore.user?.username || '');
    const userRole = computed(() => {
      if (authStore.isBlind) return 'Persona con discapacidad visual';
      if (authStore.isVolunteer) return 'Voluntario';
      return '';
    });
    
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
      window.location.href = '/';
    };
    
    onMounted(() => {
      // Setup socket listeners for chat
      chatStore.setupSocketListeners();
      
      if (authStore.isAuthenticated) {
        setTimeout(() => {
          chatStore.fetchConversations();
        }, 1000);
      }
    });
    
    onUnmounted(() => {
      chatStore.cleanupSocketListeners();
    });

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      isBlind,
      isVolunteer,
      username,
      userRole,
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
