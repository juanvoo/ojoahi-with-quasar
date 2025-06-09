import { route } from "quasar/wrappers"
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from "vue-router"
import routes from "./routes"
import { useAuthStore } from "src/stores/auth"

export default route((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Inicializar autenticación al cargar la aplicación
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Verificar autenticación si es necesario
    if (!authStore.initialized && !authStore.loading) {
      try {
        await authStore.checkAuth()
      } catch (error) {
        console.error("Error checking authentication:", error)
      }
    }

    next()
  })

  return Router
})
