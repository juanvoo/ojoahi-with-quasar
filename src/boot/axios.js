import { boot } from "quasar/wrappers"
import axios from "axios"
import { Notify } from "quasar"

// Create axios instance
const api = axios.create({
  baseURL: process.env.API_URL || "http://localhost:8000/api",
  withCredentials: true,
  timeout: 30000,
})

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 Enviando solicitud: ${config.method?.toUpperCase()} ${config.url}`, config.data || {})
    return config
  },
  (error) => {
    console.error("❌ Error en solicitud:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Respuesta recibida: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    const { response } = error

    // Log error for debugging
    console.error(
      `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      error.response?.data || error.message,
    )

    // Mostrar notificación para errores de red
    if (!response) {
      Notify.create({
        type: "negative",
        message: "Error de conexión. Verifica tu conexión a internet.",
      })
      return Promise.reject(error)
    }

    // Handle session expiration
    if (response.status === 401) {
      // Only redirect to login if not already there and not on auth endpoints
      const currentPath = window.location.pathname
      const isAuthEndpoint = error.config?.url?.includes("/auth/")

      if (currentPath !== "/login" && !isAuthEndpoint) {
        console.warn("Session expired, redirecting to login")

        Notify.create({
          type: "warning",
          message: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
        })

        // Usar timeout para evitar redirección inmediata
        setTimeout(() => {
          window.location.href = "/login?session=expired"
        }, 1500)
      }
    }

    return Promise.reject(error)
  },
)

export default boot(({ app }) => {
  // Make api available as $api
  app.config.globalProperties.$api = api
})

export { api }
