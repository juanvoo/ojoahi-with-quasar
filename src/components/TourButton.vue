<template>
  <q-btn
    round
    color="primary"
    icon="help"
    @click="startTour"
    class="tour-trigger-btn"
    :class="{ 'tour-pulse': shouldPulse }"
  >
    <q-tooltip>Iniciar tour guiado</q-tooltip>
  </q-btn>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useTour } from 'src/composables/useTour'
import { useAuthStore } from 'src/stores/auth'

export default defineComponent({
  name: 'TourButton',
  
  setup() {
    const tour = useTour()
    const authStore = useAuthStore()

    const shouldPulse = computed(() => {
      if (!authStore.isAuthenticated) return false
      
      const userRole = authStore.user.role
      const tourKey = `tour_completed_${userRole}-user-tour_${authStore.user.id}`
      return !localStorage.getItem(tourKey)
    })

    const startTour = () => {
      tour.startTour(true) // Force start
    }

    return {
      startTour,
      shouldPulse
    }
  }
})
</script>

<style scoped>
.tour-trigger-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.tour-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}

@media (max-width: 768px) {
  .tour-trigger-btn {
    bottom: 80px;
    right: 16px;
  }
}
</style>