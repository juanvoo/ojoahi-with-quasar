import { defineStore } from "pinia"
import { api } from "src/boot/axios"
import { connectSocket, disconnectSocket } from "src/boot/socket"
import { Notify } from "quasar"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isBlind: (state) => state.user?.role === "blind",
    isVolunteer: (state) => state.user?.role === "volunteer",
    isAdmin: (state) => state.user?.role === "admin" || state.user?.is_admin === true,
  },

  actions: {
    async checkAuth() {
      if (this.loading) {
        return
      }

      try {
        this.loading = true
        const response = await api.get("/auth/user")

        if (response.data.success && response.data.user) {
          this.user = response.data.user
          this.initialized = true

          if (typeof connectSocket === "function") {
            connectSocket()
          }
        }
      } catch (error) {
        if (error.response?.status === 401) {
          this.clearAuth()
        }
      } finally {
        this.initialized = true
        this.loading = false
      }
    },

    clearAuth() {
      this.user = null
      this.initialized = true
      this.error = null

      if (typeof disconnectSocket === "function") {
        disconnectSocket()
      }
    },

    async login(credentials) {
      try {
        this.loading = true
        this.error = null

        const response = await api.post("/auth/login", credentials)

        if (response.data.success) {
          this.user = response.data.user
          this.initialized = true

          if (typeof connectSocket === "function") {
            connectSocket()
          }

          Notify.create({
            type: "positive",
            message: "¡Bienvenido de nuevo!",
          })

          return true
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Error al iniciar sesión"

        Notify.create({
          type: "negative",
          message: this.error,
        })

        return false
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      try {
        this.loading = true
        this.error = null

        const response = await api.post("/auth/register", userData)

        if (response.data.success) {
          Notify.create({
            type: "positive",
            message: "Registro exitoso. Ahora puedes iniciar sesión.",
          })

          return true
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Error al registrarse"

        Notify.create({
          type: "negative",
          message: this.error,
        })

        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        this.loading = true
        await api.post("/auth/logout")

        this.clearAuth()

        Notify.create({
          type: "positive",
          message: "Has cerrado sesión correctamente",
        })

        return true
      } catch (error) {
        console.error("Error during logout:", error)
        this.clearAuth()
        return true
      } finally {
        this.loading = false
      }
    },

    async updateProfile(profileData) {
      try {
        this.loading = true
        console.log("Updating profile with data:", profileData)

        const response = await api.put("/users/profile", profileData)

        if (response.data.success) {
          // Actualizar el usuario en el estado con los datos del servidor
          this.user = {
            ...this.user,
            ...response.data.user,
          }

          Notify.create({
            type: "positive",
            message: "Perfil actualizado correctamente",
          })

          return true
        }
      } catch (error) {
        console.error("Error updating profile:", error)

        Notify.create({
          type: "negative",
          message: error.response?.data?.message || "Error al actualizar perfil",
        })

        return false
      } finally {
        this.loading = false
      }
    },

    async changePassword(passwordData) {
      try {
        this.loading = true

        const response = await api.post("/users/change-password", passwordData)

        if (response.data.success) {
          Notify.create({
            type: "positive",
            message: "Contraseña cambiada correctamente",
          })

          return true
        }
      } catch (error) {
        console.error("Error changing password:", error)

        Notify.create({
          type: "negative",
          message: error.response?.data?.message || "Error al cambiar contraseña",
        })

        return false
      } finally {
        this.loading = false
      }
    },
  },
})