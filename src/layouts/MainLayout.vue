<template>
  <q-layout>
    <q-header elevated>
      <AppHeader />
    </q-header>

    <q-page-container class="column flex flex-center">
      <router-view />
    </q-page-container>

    <q-footer>
      <BaseFooter />
    </q-footer>
  </q-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import AppHeader from 'components/AppHeader.vue'
import BaseFooter from 'components/BaseFooter.vue'
import { useUserStore } from 'src/stores/user'


let accessibilityManager

// const toggleVoice = () => accessibilityManager?.toggleVoiceAssistant()
// const toggleReader = () => digitalReader?.startObjectDetection()
// const zoomIn = () => accessibilityManager?.zoomIn()
// const zoomOut = () => accessibilityManager?.zoomOut()
// const readPage = () => accessibilityManager?.readCurrentPage()

const $q = useQuasar()

onMounted(() => {
  
  if (window.AccessibilityManager) {
    accessibilityManager = new window.AccessibilityManager()
    // digitalReader = new window.DigitalReader(accessibilityManager)

    setTimeout(() => {
      accessibilityManager.speak(
        'Bienvenido a OjoAhí. Presione Alt + A para activar el asistente de voz, ' +
        'Alt + L para leer la página, Alt + más para aumentar el zoom, ' +
        'y Alt + menos para reducir el zoom.'
      )
    }, 1000)
  }

  
  if (window.success_msg) {
    $q.notify({ type: 'positive', message: window.success_msg, caption: 'Éxito' })
  }
  if (window.error_msg) {
    $q.notify({ type: 'negative', message: window.error_msg, caption: 'Error' })
  }
})

const userStore = useUserStore()

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/user', { credentials: 'include' })
    if (res.ok) {
      userStore.setUser(await res.json())
    } else {
      userStore.clearUser()
    }
  } catch (err) {
  console.error(err)
  userStore.clearUser()
}
})
</script>

<style>
/* ...tus estilos aquí, igual que antes... */
</style>