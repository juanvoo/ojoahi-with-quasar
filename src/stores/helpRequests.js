import { defineStore } from "pinia"
import { api } from "src/boot/axios"
import { Notify } from "quasar"

export const useHelpRequestsStore = defineStore("helpRequests", {
  state: () => ({
    requests: [],
    currentRequest: null,
    loading: false,
    error: null,
  }),

  getters: {
    pendingRequests: (state) => state.requests.filter((req) => req.status === "pending"),
    acceptedRequests: (state) => state.requests.filter((req) => req.status === "accepted"),
    completedRequests: (state) => state.requests.filter((req) => req.status === "completed"),
  },

  actions: {
    async fetchMyRequests() {
      try {
        this.loading = true
        const response = await api.get("/help-requests/my")

        if (response.data.success) {
          this.requests = response.data.requests || []
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Error al cargar solicitudes"
        console.error("Error fetching my requests:", error)

        // Mock data for development
        this.requests = [
          {
            id: 1,
            title: "Ayuda con compras semanales",
            description: "Necesito ayuda para hacer la compra semanal en el supermercado",
            date: "2024-01-15",
            time: "10:00",
            location: "Supermercado Mercadona, Calle Mayor 123",
            priority: "medium",
            status: "pending",
            volunteer_name: null,
            created_at: "2024-01-10T10:00:00Z",
          },
          {
            id: 2,
            title: "Acompañamiento médico",
            description: "Necesito acompañamiento para ir al médico",
            date: "2024-01-16",
            time: "09:30",
            location: "Centro de Salud San Juan",
            priority: "high",
            status: "accepted",
            volunteer_name: "María García",
            created_at: "2024-01-11T15:30:00Z",
          },
        ]
      } finally {
        this.loading = false
      }
    },

    async fetchAvailableRequests() {
      try {
        this.loading = true
        const response = await api.get("/help-requests/available")

        if (response.data.success) {
          this.requests = response.data.requests || []
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Error al cargar solicitudes disponibles"
        console.error("Error fetching available requests:", error)

        // Mock data for development
        this.requests = [
          {
            id: 3,
            title: "Lectura de documentos importantes",
            description: "Necesito ayuda para leer y entender unos documentos del banco",
            date: "2024-01-17",
            time: "16:00",
            location: "Mi domicilio - Calle Esperanza 45",
            priority: "low",
            status: "pending",
            blind_user_name: "Carlos Rodríguez",
            estimated_duration: 90,
            created_at: "2024-01-12T09:15:00Z",
          },
          {
            id: 4,
            title: "Acompañamiento para trámites",
            description: "Necesito ir al ayuntamiento para hacer unos trámites administrativos",
            date: "2024-01-18",
            time: "11:00",
            location: "Ayuntamiento de Madrid",
            priority: "medium",
            status: "pending",
            blind_user_name: "Ana Martínez",
            estimated_duration: 120,
            created_at: "2024-01-12T14:20:00Z",
          },
        ]
      } finally {
        this.loading = false
      }
    },

    async fetchRequestById(id) {
      try {
        this.loading = true
        const response = await api.get(`/help-requests/${id}`)

        if (response.data.success) {
          this.currentRequest = response.data.request
          return response.data.request
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Error al cargar la solicitud"
        Notify.create({
          type: "negative",
          message: this.error,
        })
        return null
      } finally {
        this.loading = false
      }
    },

    async createRequest(requestData) {
      try {
        this.loading = true

        console.log("🚀 Enviando solicitud al backend:", requestData)

        const response = await api.post("/help-requests", requestData)

        console.log("✅ Respuesta del backend:", response.data)

        if (response.data.success) {
          Notify.create({
            type: "positive",
            message: "Solicitud creada correctamente",
          })

          // Add to local state
          if (this.requests.length) {
            this.requests.unshift(response.data.request)
          }

          return response.data.request
        }
      } catch (error) {
        console.error("❌ Error en createRequest:", error)

        this.error = error.response?.data?.message || "Error al crear solicitud"

        // Mostrar errores de validación específicos
        if (error.response?.data?.errors) {
          const errorMessages = error.response.data.errors.map((err) => `${err.field}: ${err.message}`).join("\n")

          Notify.create({
            type: "negative",
            message: `Errores de validación:\n${errorMessages}`,
            multiLine: true,
            timeout: 5000,
          })
        } else {
          Notify.create({
            type: "negative",
            message: this.error,
          })
        }

        throw error
      } finally {
        this.loading = false
      }
    },

    async acceptRequest(requestId) {
      try {
        this.loading = true
        const response = await api.post(`/help-requests/${requestId}/accept`)

        if (response.data.success) {
          Notify.create({
            type: "positive",
            message: "Solicitud aceptada correctamente",
          })

          // Update in local state
          const index = this.requests.findIndex((r) => r.id === requestId)
          if (index !== -1) {
            this.requests[index] = response.data.request
          }

          if (this.currentRequest?.id === requestId) {
            this.currentRequest = response.data.request
          }

          return response.data.request
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Error al aceptar solicitud"
        Notify.create({
          type: "negative",
          message: this.error,
        })

        // For development, simulate success
        const index = this.requests.findIndex((r) => r.id === requestId)
        if (index !== -1) {
          this.requests[index].status = "accepted"
          this.requests[index].volunteer_name = "Voluntario"
        }

        Notify.create({
          type: "positive",
          message: "Solicitud aceptada correctamente (modo desarrollo)",
        })

        return this.requests[index]
      } finally {
        this.loading = false
      }
    },

    async completeRequest(requestId) {
      try {
        this.loading = true
        const response = await api.post(`/help-requests/${requestId}/complete`)

        if (response.data.success) {
          Notify.create({
            type: "positive",
            message: "Solicitud completada correctamente",
          })

          // Update in local state
          const index = this.requests.findIndex((r) => r.id === requestId)
          if (index !== -1) {
            this.requests[index] = response.data.request
          }

          if (this.currentRequest?.id === requestId) {
            this.currentRequest = response.data.request
          }

          return response.data.request
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Error al completar solicitud"
        Notify.create({
          type: "negative",
          message: this.error,
        })
        return null
      } finally {
        this.loading = false
      }
    },

    async cancelRequest(requestId) {
      try {
        this.loading = true
        const response = await api.post(`/help-requests/${requestId}/cancel`)

        if (response.data.success) {
          Notify.create({
            type: "positive",
            message: "Solicitud cancelada correctamente",
          })

          // Update in local state
          const index = this.requests.findIndex((r) => r.id === requestId)
          if (index !== -1) {
            this.requests[index] = response.data.request
          }

          if (this.currentRequest?.id === requestId) {
            this.currentRequest = response.data.request
          }

          return response.data.request
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Error al cancelar solicitud"
        Notify.create({
          type: "negative",
          message: this.error,
        })
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
