import { boot } from "quasar/wrappers"
import { useAuthStore } from "src/stores/auth"

export default boot(async ({ router }) => {
  const authStore = useAuthStore()

  router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
    const requiresBlind = to.matched.some((record) => record.meta.requiresBlind)
    const requiresVolunteer = to.matched.some((record) => record.meta.requiresVolunteer)

    // Solo verificar autenticación si la ruta lo requiere Y no hemos inicializado
    if ((requiresAuth || requiresGuest || requiresBlind || requiresVolunteer) && !authStore.initialized) {
      try {
        await authStore.checkAuth()
      } catch (error) {
        console.error("Error checking authentication:", error)
      }
    }

    // Check if route requires authentication
    if (requiresAuth && !authStore.isAuthenticated) {
      next({ name: "login", query: { redirect: to.fullPath } })
      return
    }

    // Check if route requires guest (not authenticated)
    if (requiresGuest && authStore.isAuthenticated) {
      next({ name: "dashboard" })
      return
    }

    // Check if route requires blind role
    if (requiresBlind && (!authStore.isAuthenticated || authStore.user.role !== "blind")) {
      next({ name: "dashboard" })
      return
    }

    // Check if route requires volunteer role
    if (requiresVolunteer && (!authStore.isAuthenticated || authStore.user.role !== "volunteer")) {
      next({ name: "dashboard" })
      return
    }

    next()
  })
})
