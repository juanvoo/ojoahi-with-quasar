<template>
  <q-header class="bg-dark" elevated>
    <q-toolbar class="q-px-lg" style="background-color: #202020;">
      <!-- Logo y nombre -->
      <q-btn flat round dense icon="menu" @click="drawer = !drawer" class="q-mr-md" aria-label="Abrir menú" />
      <router-link to="/" class="row items-center q-mr-lg" style="text-decoration: none;">
        <img src="/images/Ojo.png" style="width: 3rem; padding-right: 5px;" alt="OjoAhi Logo" />
        <span class="text-bold text-white text-h6">OjoAhi</span>
      </router-link>
      <!-- Menú principal -->
      <q-space />
      <q-btn
        v-for="item in visibleNavItems"
        :key="item.label"
        :flat="!item.active"
        :unelevated="item.active"
        :to="item.to"
        class="q-mx-xs"
        :color="item.color || 'white'"
        :class="item.active ? 'text-bold' : ''"
        no-caps
        @click="item.click ? item.click() : undefined"
      >
        <q-icon v-if="item.icon" :name="item.icon" class="q-mr-xs" />
        <span>{{ item.label }}</span>
        <q-badge v-if="item.badge" floating color="red" transparent>{{ item.badge }}</q-badge>
      </q-btn>
    </q-toolbar>
    <!-- Responsive Drawer para móvil -->
    <q-drawer show-if-above v-model="drawer" side="left" class="bg-dark">
      <q-list>
        <q-item
          v-for="item in visibleNavItems"
          :key="item.label"
          clickable
          v-ripple
          :to="item.to"
          @click="drawer = false; if(item.click) item.click()"
          :active="item.active"
          :class="item.active ? 'text-bold' : ''"
        >
          <q-item-section avatar v-if="item.icon"><q-icon :name="item.icon" /></q-item-section>
          <q-item-section>
            <span :style="{ color: item.color ? '#5dd62c' : '' }">{{ item.label }}</span>
            <q-badge v-if="item.badge" color="red" transparent>{{ item.badge }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </q-header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from 'stores/user'
import axios from 'axios'

const drawer = ref(false)
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const unreadMessages = ref(0) // Puedes actualizarlo según tu backend

function isActive(pathOrHash) {
  return route.path === pathOrHash || route.hash === pathOrHash
}

// function logout() {
//   userStore.logout()
//   router.push('/')
// }
async function logout() {
  try {
    await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true })
    userStore.logout()
    router.push('/login')
  } catch {
    userStore.logout()
    router.push('/login')
  }
}

// Define el menú dinámicamente
const navItems = computed(() => {
  if (user.value) {
    return [
      {
        label: 'Dashboard',
        to: '/users/dashboard',
        icon: 'dashboard',
        active: isActive('/users/dashboard')
      },
      {
        label: 'Chat',
        to: '/chat',
        icon: 'fas fa-comments',
        active: isActive('/chat'),
        badge: unreadMessages.value > 0 ? unreadMessages.value : null
      },
      {
        label: 'Perfil',
        to: '/users/new-profile',
        icon: 'person',
        active: isActive('/users/new-profile')
      },
      {
        label: 'Cerrar Sesión',
        to: '',
        icon: 'logout',
        active: false,
        click: logout,
        hide: false
      }
    ]
  } else {
    return [
      { label: 'Inicio', to: '/', active: isActive('/'), icon: 'home' },
      { label: 'Nosotros', to: '/#nosotros', active: isActive('#nosotros') },
      { label: 'Servicios', to: '/#servicios', active: isActive('#servicios') },
      { label: 'Equipo', to: '/#equipo', active: isActive('#equipo') },
      { label: 'Iniciar Sesión', to: '/login', icon: 'login', active: isActive('/login') },
      { label: 'Registrarse', to: '/register', icon: 'person_add', active: isActive('/register') },
      {
        label: 'Ayuda',
        to: '/support/help',
        icon: 'fas fa-question-circle',
        color: 'green-4',
        active: isActive('/support/help')
      }
    ]
  }
})

// Corregido: solo iteramos items visibles (sin v-if en el template)
const visibleNavItems = computed(() => navItems.value.filter(item => !item.hide))
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
.text-bold {
  font-weight: bold;
}
.q-toolbar {
  min-height: 60px;
}
.router-link-exact-active {
  font-weight: bold;
  color: #5dd62c;
}
</style>