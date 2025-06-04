<template>
  <q-header elevated class="bg-dark text-white">
    <q-toolbar class="q-px-xl q-py-sm" style="min-height: 64px;">
      <!-- Logo y marca -->
      <q-btn flat dense no-caps to="/" class="q-ma-none q-pa-none flex items-center" aria-label="Ir a inicio">
        <q-avatar size="38px" class="q-mr-sm">
          <img src="/src/assets/OjoAhiLogo.png" alt="Logo OjoAhí"/>
        </q-avatar>
        <span class="text-weight-bold text-h6" style="letter-spacing: 0.2rem; color: #f8f8f8;">OjoAhi</span>
      </q-btn>

      <q-space />

      <!-- Menú grande (desktop) -->
      <div class="row items-center q-gutter-sm q-hidden-xs">
        <template v-if="userStore.user">
          <q-btn flat dense no-caps to="/users/dashboard" label="Dashboard" class="text-white"/>
          <q-btn flat dense no-caps to="/chat" class="text-white">
            <q-icon name="fas fa-comments" />
            <span class="q-ml-xs">Chat</span>
            <q-badge v-if="unreadMessages" color="negative" floating>{{ unreadMessages }}</q-badge>
          </q-btn>
          <q-btn flat dense no-caps to="/users/new-profile" label="Perfil" class="text-white"/>
          <q-btn
            flat dense no-caps
            color="negative"
            icon="logout"
            label="Cerrar sesión"
            @click="logout"
            class="text-white"
          />
        </template>
        <template v-else>
          <q-btn flat dense no-caps to="/" label="Inicio" class="text-white" :class="{'text-bold': isActive('home')}"/>
          <q-btn flat dense no-caps to="/#nosotros" label="Nosotros" class="text-white" :class="{'text-bold': isActive('about')}"/>
          <q-btn flat dense no-caps to="/#servicios" label="Servicios" class="text-white" :class="{'text-bold': isActive('services')}"/>
          <q-btn flat dense no-caps to="/#equipo" label="Equipo" class="text-white" :class="{'text-bold': isActive('team')}"/>
          <q-btn flat dense no-caps to="/login" label="Iniciar Sesión" class="text-white"/>
          <q-btn flat dense no-caps to="/register" label="Registrarse" class="text-white"/>
          <q-btn flat dense no-caps to="/support/help" class="text-green-4">
            <q-icon name="fas fa-question-circle"/>
            <span class="q-ml-xs">Ayuda</span>
          </q-btn>
        </template>
      </div>

      <!-- Menú hamburguesa (mobile) -->
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Abrir menú"
        class="q-hidden-md-up text-white"
        @click="drawer = !drawer"
      />
    </q-toolbar>
    
    <!-- Drawer lateral para mobile -->
    <q-drawer
      v-model="drawer"
      side="right"
      overlay
      behavior="mobile"
      class="bg-dark text-white"
      :breakpoint="600"
      content-class="q-pa-md"
    >
      <q-list>
        <template v-if="userStore.user">
          <q-item clickable v-ripple to="/users/dashboard" @click="drawer = false">
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/chat" @click="drawer = false">
            <q-item-section avatar><q-icon name="fas fa-comments" /></q-item-section>
            <q-item-section>Chat</q-item-section>
            <q-item-section side v-if="unreadMessages">
              <q-badge color="negative">{{ unreadMessages }}</q-badge>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/users/new-profile" @click="drawer = false">
            <q-item-section avatar><q-icon name="person" /></q-item-section>
            <q-item-section>Perfil</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="logoutMobile">
            <q-item-section avatar><q-icon name="logout" /></q-item-section>
            <q-item-section>Cerrar Sesión</q-item-section>
          </q-item>
        </template>
        <template v-else>
          <q-item clickable v-ripple to="/" @click="drawer = false">
            <q-item-section avatar><q-icon name="home" /></q-item-section>
            <q-item-section>Inicio</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/#nosotros" @click="drawer = false">
            <q-item-section avatar><q-icon name="groups" /></q-item-section>
            <q-item-section>Nosotros</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/#servicios" @click="drawer = false">
            <q-item-section avatar><q-icon name="build" /></q-item-section>
            <q-item-section>Servicios</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/#equipo" @click="drawer = false">
            <q-item-section avatar><q-icon name="people" /></q-item-section>
            <q-item-section>Equipo</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/login" @click="drawer = false">
            <q-item-section avatar><q-icon name="login" /></q-item-section>
            <q-item-section>Iniciar Sesión</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/register" @click="drawer = false">
            <q-item-section avatar><q-icon name="person_add" /></q-item-section>
            <q-item-section>Registrarse</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/support/help" @click="drawer = false">
            <q-item-section avatar><q-icon name="fas fa-question-circle" color="green-4" /></q-item-section>
            <q-item-section><span class="text-green-4">Ayuda</span></q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>
  </q-header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'

// Store global del usuario
const userStore = useUserStore()
const unreadMessages = ref(0)
const $q = useQuasar()
const router = useRouter()

// Carga usuario al montar
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/user', { credentials: 'include' })
    if (res.ok) {
      userStore.setUser(await res.json())
    } else {
      userStore.clearUser()
    }
  } catch {
    userStore.clearUser()
  }
})

// Logout para desktop
async function logout() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/logout', { credentials: 'include' })
    if (res.ok) {
      userStore.clearUser()
      $q.notify({ color: 'positive', message: 'Sesión cerrada correctamente' })
      router.push('/login')
    } else {
      $q.notify({ color: 'negative', message: 'No se pudo cerrar sesión' })
    }
  } catch {
    $q.notify({ color: 'negative', message: 'Error al cerrar sesión' })
  }
}

// Logout en el drawer mobile (cierra drawer también)
async function logoutMobile() {
  await logout()
  drawer.value = false
}

// Estado del drawer
const drawer = ref(false)

// Para estilos activos
const route = useRoute()
const isActive = (name) => {
  if (name === 'home') return route.path === '/'
  if (name === 'about') return route.hash === '#nosotros'
  if (name === 'services') return route.hash === '#servicios'
  if (name === 'team') return route.hash === '#equipo'
  return false
}
</script>

<style scoped>
.bg-dark {
  background-color: #202020 !important;
}
.text-white {
  color: #f8f8f8 !important;
}
.text-green-4 {
  color: #5dd62c !important;
}
.q-toolbar {
  min-height: 60px;
}
.text-bold {
  font-weight: bold;
}
.q-btn[aria-label="Abrir menú"] {
  margin-left: 8px;
}
</style>