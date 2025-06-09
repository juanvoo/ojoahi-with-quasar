import { defineStore } from "pinia"
import { api } from "src/boot/axios"
import { Notify } from "quasar"

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,
    currentPage: 0,
    pageSize: 20,
  }),

  actions: {
    async fetchNotifications(reset = true) {
      try {
        this.loading = true
        this.error = null

        const params = {
          limit: this.pageSize,
          offset: reset ? 0 : this.currentPage * this.pageSize,
        }

        const response = await api.get("/notifications", { params })

        if (response.data.success) {
          if (reset) {
            this.notifications = response.data.notifications || []
            this.currentPage = 0
          } else {
            this.notifications.push(...(response.data.notifications || []))
          }

          this.unreadCount = response.data.unread_count || 0

          if (!reset) {
            this.currentPage++
          }

          return response.data.notifications
        } else {
          throw new Error(response.data.message || "Error al cargar notificaciones")
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || "Error al cargar notificaciones"
        console.error("Error fetching notifications:", error)

        if (error.response?.status !== 401) {
          Notify.create({
            type: "negative",
            message: this.error,
          })
        }

        return []
      } finally {
        this.loading = false
      }
    },

    async loadMore() {
      return await this.fetchNotifications(false)
    },

    async markAsRead(notificationId) {
      try {
        const response = await api.post(`/notifications/${notificationId}/read`)

        if (response.data.success) {
          // Update local state
          const notification = this.notifications.find((n) => n.id === notificationId)
          if (notification && !notification.is_read) {
            notification.is_read = true
            this.unreadCount = Math.max(0, this.unreadCount - 1)
          }
        } else {
          throw new Error(response.data.message || "Error al marcar como leída")
        }
      } catch (error) {
        console.error("Error marking notification as read:", error)
        Notify.create({
          type: "negative",
          message: error.response?.data?.message || "Error al marcar como leída",
        })
      }
    },

    async markAllAsRead() {
      try {
        const response = await api.post("/notifications/read-all")

        if (response.data.success) {
          // Update local state
          this.notifications.forEach((notification) => {
            notification.is_read = true
          })
          this.unreadCount = 0

          Notify.create({
            type: "positive",
            message: "Todas las notificaciones marcadas como leídas",
          })
        } else {
          throw new Error(response.data.message || "Error al marcar todas como leídas")
        }
      } catch (error) {
        console.error("Error marking all notifications as read:", error)
        Notify.create({
          type: "negative",
          message: error.response?.data?.message || "Error al marcar todas como leídas",
        })
      }
    },

    // Add a new notification (for real-time updates)
    addNotification(notification) {
      this.notifications.unshift(notification)
      if (!notification.is_read) {
        this.unreadCount++
      }
    },

    // Get unread notifications count
    getUnreadCount() {
      return this.unreadCount
    },
  },
})
