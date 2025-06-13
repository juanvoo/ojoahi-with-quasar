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
              <img :src="userAvatar" alt="Avatar" />
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
      <q-scroll-area style="height: calc(100% - 180px); margin-top: 180px;">
        <q-list>
          <q-item-label header>Dashboard</q-item-label>
          <q-item
            v-for="item in items"
            :key="item.title"
            clickable
            :to="item.link"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.title }}</q-item-section>
          </q-item>

          <q-separator />

          <template v-if="isBlind">
            <q-item-label header>Persona con discapacidad visual</q-item-label>
            <q-item v-for="item in blindItems" :key="item.title" clickable :to="item.link">
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{ item.title }}</q-item-section>
            </q-item>
          </template>

          <template v-if="isVolunteer">
            <q-item-label header>Voluntario</q-item-label>
            <q-item v-for="item in volunteerItems" :key="item.title" clickable :to="item.link">
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{ item.title }}</q-item-section>
            </q-item>
          </template>

          <!-- ADMIN -->
          <template v-if="isAdmin">
            <q-separator />
            <q-item-label header>Administración</q-item-label>
            <q-item
              v-for="item in adminItems"
              :key="item.title"
              clickable
              :to="item.link"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{ item.title }}</q-item-section>
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
        style="height: 180px"
      >
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <img :src="userAvatar" alt="Avatar" />
          </q-avatar>
          <div class="text-weight-bold">{{ username }}</div>
          <div>{{ userRole }}</div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="text-center bg-grey-2 q-pa-sm">
      <span>&copy; {{ currentYear }} OjoAhi</span>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useChatStore } from 'src/stores/chat';

const leftDrawerOpen = ref(false);
const authStore = useAuthStore();
const chatStore = useChatStore();

const isBlind = computed(() => authStore.isBlind);
const isVolunteer = computed(() => authStore.isVolunteer);
const isAdmin = computed(() => authStore.isAdmin);
const username = computed(() => authStore.user?.username || '');
const userRole = computed(() => {
  if (authStore.isBlind) return 'Persona con discapacidad visual';
  if (authStore.isVolunteer) return 'Voluntario';
  if (authStore.isAdmin) return 'Administrador';
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

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function logout() {
  await authStore.logout();
  window.location.href = '/';
}

const currentYear = new Date().getFullYear();

// Menú principal
const items = [
  {
    title: 'Inicio',
    icon: 'dashboard',
    link: '/app'
  },
  {
    title: 'Perfil',
    icon: 'person',
    link: '/app/profile'
  },
  {
    title: 'Mensajes',
    icon: 'chat',
    link: '/app/chat'
  },
  {
    title: 'Notificaciones',
    icon: 'notifications',
    link: '/app/notifications'
  }
];

// Menú para persona con discapacidad visual
const blindItems = [
  {
    title: 'Mis solicitudes',
    icon: 'help',
    link: '/app/blind/help-requests'
  },
  {
    title: 'Nueva solicitud',
    icon: 'add_circle',
    link: '/app/blind/help-requests/new'
  },
  {
    title: 'Voluntarios',
    icon: 'people',
    link: '/app/blind/volunteers'
  }
];

// Menú para voluntarios
const volunteerItems = [
  {
    title: 'Solicitudes disponibles',
    icon: 'search',
    link: '/app/volunteer/available-requests'
  },
  {
    title: 'Mis reservas',
    icon: 'event',
    link: '/app/volunteer/my-reservations'
  },
  {
    title: 'Mis reseñas',
    icon: 'star',
    link: '/app/volunteer/reviews'
  }
];

// Menú de administración actualizado
const adminItems = [
  {
    title: 'Panel de Gestión de Usuarios',
    icon: 'manage_accounts',
    link: '/app/admin/users'
  },
  {
    title: 'Monitoreo de Solicitudes',
    icon: 'monitor_heart',
    link: '/app/admin/requests'
  },
  {
    title: 'Sistema de Reportes',
    icon: 'bar_chart',
    link: '/app/admin/reports'
  },
  {
    title: 'Moderación y Seguridad',
    icon: 'shield',
    link: '/app/admin/moderation'
  }
];

onMounted(() => {
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
</script>

<style scoped>
.text-decoration-none {
  text-decoration: none;
}
</style>