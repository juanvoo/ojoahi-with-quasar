import { defineStore } from "pinia"
import { api } from "src/boot/axios"
import { Notify } from "quasar"

export const useChatStore = defineStore("chat", {
  state: () => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    loading: false,
    error: null,
    unreadCount: 0,
    debug: {
      lastApiCall: null,
      lastApiResponse: null,
      lastError: null,
    },
  }),

  actions: {
    async fetchConversations() {
      try {
        this.loading = true
        this.error = null
        this.debug.lastApiCall = "fetchConversations"

        console.log("🔄 Cargando conversaciones...")

        const response = await api.get("/chat")
        this.debug.lastApiResponse = response.data

        if (response.data.success) {
          this.conversations = response.data.conversations
          console.log(`✅ ${this.conversations.length} conversaciones cargadas`)
          this.unreadCount = this.conversations.reduce((count, conv) => count + (conv.unread_count || 0), 0)
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        this.error = error.message
        this.debug.lastError = error
        console.error("❌ Error cargando conversaciones:", error)

        if (error.response?.status !== 401) {
          Notify.create({
            type: "negative",
            message: "Error al cargar conversaciones",
          })
        }
      } finally {
        this.loading = false
      }
    },

    async fetchMessages(conversationId) {
      try {
        this.loading = true
        this.error = null
        this.debug.lastApiCall = "fetchMessages"

        console.log(`🔄 Cargando mensajes de conversación ${conversationId}...`)

        const response = await api.get(`/chat/${conversationId}`)
        this.debug.lastApiResponse = response.data

        if (response.data.success) {
          this.messages = response.data.messages
          this.currentConversation = response.data.conversation
          console.log(`✅ ${this.messages.length} mensajes cargados`)

          // Join socket room for this conversation
          // const socket = this.getSocket()
          // if (socket && socket.connected) {
          //   socket.emit("join-chat", conversationId)
          // }

          // Marcar como leídos
          await this.markAsRead(conversationId)

          return response.data.messages
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        this.error = error.message
        this.debug.lastError = error
        console.error("❌ Error cargando mensajes:", error)

        Notify.create({
          type: "negative",
          message: "Error al cargar mensajes",
        })

        return []
      } finally {
        this.loading = false
      }
    },

    async sendMessage(conversationId, content, receiverId) {
      try {
        this.loading = true
        this.error = null
        this.debug.lastApiCall = "sendMessage"

        console.log(`📤 Enviando mensaje...`)

        const response = await api.post("/chat/send", {
          receiver_id: receiverId,
          content: content,
        })
        this.debug.lastApiResponse = response.data

        if (response.data.success) {
          // Agregar mensaje a la lista local
          this.messages.push(response.data.message)
          console.log("✅ Mensaje enviado correctamente")

          // Actualizar conversaciones
          await this.fetchConversations()

          return response.data.message
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        this.error = error.message
        this.debug.lastError = error
        console.error("❌ Error enviando mensaje:", error)

        Notify.create({
          type: "negative",
          message: "Error al enviar mensaje",
        })

        return null
      } finally {
        this.loading = false
      }
    },

    async startConversation(userId, initialMessage) {
      try {
        this.loading = true
        this.error = null
        this.debug.lastApiCall = "startConversation"

        console.log(`🔄 Iniciando conversación con usuario ${userId}...`)
        const response = await api.post("/chat/send", {
          receiver_id: userId,
          content: initialMessage,
        })
        this.debug.lastApiResponse = response.data

        if (response.data.success) {
          console.log("✅ Conversación iniciada correctamente")

          // Refresh conversations to include the new one
          await this.fetchConversations()

          Notify.create({
            type: "positive",
            message: "Conversación iniciada",
          })

          return response.data.message
        } else {
          throw new Error(response.data.message || "Error al iniciar conversación")
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || "Error al iniciar conversación"
        this.debug.lastError = error
        console.error("❌ Error iniciando conversación:", error)

        Notify.create({
          type: "negative",
          message: this.error,
        })
        return null
      } finally {
        this.loading = false
      }
    },

    async markAsRead(conversationId) {
      try {
        this.debug.lastApiCall = "markAsRead"
        console.log(`👁️ Mensajes marcados como leídos`)
        await api.post(`/chat/${conversationId}/read`)
        this.debug.lastApiResponse = "Mensajes marcados como leídos"
        console.log(`👁️ Mensajes marcados como leídos`)
      } catch (error) {
        this.debug.lastError = error
        console.error("❌ Error marcando como leído:", error)
      }
    },

    // Get socket instance
    getSocket() {
      try {
        // Try to get socket from global properties
        // const app = getCurrentInstance()?.appContext?.app
        // return app?.config?.globalProperties?.$socket
        return null
      } catch (error) {
        console.error("Error getting socket:", error)
        return null
      }
    },

    // Handle incoming message from socket
    handleNewMessage(message) {
      console.log("📩 Nuevo mensaje recibido:", message)

      // Add message to current conversation if it's open
      if (this.currentConversation?.id === message.conversation_id) {
        this.messages.push(message)
        this.markAsRead(message.conversation_id)
      } else {
        // Update unread count
        this.unreadCount += 1

        // Update conversation unread count
        const conversation = this.conversations.find((c) => c.id === message.conversation_id)
        if (conversation) {
          conversation.unread_count = (conversation.unread_count || 0) + 1
          conversation.last_message = message.content
          conversation.updated_at = message.created_at

          // Move conversation to top
          this.conversations = [conversation, ...this.conversations.filter((c) => c.id !== message.conversation_id)]
        }

        // Show notification
        Notify.create({
          type: "info",
          message: `Nuevo mensaje de ${message.sender_name}`,
          caption: message.content.substring(0, 50) + (message.content.length > 50 ? "..." : ""),
        })
      }
    },

    // Setup socket listeners
    setupSocketListeners() {
      const socket = this.getSocket()
      if (socket) {
        console.log("🔌 Configurando listeners de socket")
        socket.on("new-message", this.handleNewMessage)
      }
    },

    // Cleanup socket listeners
    cleanupSocketListeners() {
      const socket = this.getSocket()
      if (socket) {
        console.log("🔌 Limpiando listeners de socket")
        socket.off("new-message", this.handleNewMessage)
      }
    },

    // Clear current conversation
    clearCurrentConversation() {
      this.currentConversation = null
      this.messages = []
    },

    // Debug function
    async debugChatSystem() {
      try {
        console.log("🔍 Ejecutando diagnóstico del chat...")
        const response = await api.get("/chat/debug")
        console.log("📊 Resultado del diagnóstico:", response.data)
        return response.data
      } catch (error) {
        console.error("❌ Error en diagnóstico:", error)
        return { success: false, error: error.message }
      }
    },
  },
})
