<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Lista de conversaciones -->
      <div class="col-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Conversaciones</div>
          </q-card-section>
          
          <q-separator />
          
          <div v-if="chatStore.loading" class="text-center q-pa-md">
            <q-spinner size="40px" />
            <div class="q-mt-sm">Cargando...</div>
          </div>
          
          <div v-else-if="!chatStore.conversations.length" class="text-center q-pa-md">
            <q-icon name="chat_bubble_outline" size="3rem" color="grey-5" />
            <div class="q-mt-md">Sin conversaciones</div>
          </div>
          
          <q-list v-else separator>
            <q-item 
              v-for="conversation in chatStore.conversations" 
              :key="conversation.id"
              clickable 
              @click="selectConversation(conversation)"
              :active="selectedConversation?.id === conversation.id"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ conversation.other_user_name.charAt(0).toUpperCase() }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ conversation.other_user_name }}</q-item-label>
                <q-item-label caption>{{ conversation.last_message || 'Sin mensajes' }}</q-item-label>
              </q-item-section>

              <q-item-section side v-if="conversation.unread_count > 0">
                <q-badge color="red" rounded>{{ conversation.unread_count }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Área de chat -->
      <div class="col-8">
        <q-card style="height: 600px; display: flex; flex-direction: column;">
          <!-- Header del chat -->
          <q-card-section v-if="selectedConversation" class="q-pb-none">
            <div class="text-h6">{{ selectedConversation.other_user_name }}</div>
          </q-card-section>

          <q-separator v-if="selectedConversation" />

          <!-- Mensajes -->
          <q-card-section 
            v-if="selectedConversation"
            class="col q-pa-md"
            style="overflow-y: auto; flex: 1;"
            ref="messagesContainer"
          >
            <div v-if="chatStore.loading" class="text-center">
              <q-spinner size="30px" />
            </div>
            
            <div v-else>
              <div 
                v-for="message in chatStore.messages" 
                :key="message.id"
                :class="message.sender_id === authStore.user?.id ? 'text-right q-mb-md' : 'text-left q-mb-md'"
              >
                <div 
                  :class="message.sender_id === authStore.user?.id ? 'bg-primary text-white' : 'bg-grey-3'"
                  class="q-pa-sm rounded-borders inline-block"
                  style="max-width: 70%;"
                >
                  {{ message.content }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ formatTime(message.created_at) }}
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Sin conversación seleccionada -->
          <q-card-section v-else class="col flex flex-center">
            <div class="text-center">
              <q-icon name="chat" size="4rem" color="grey-5" />
              <div class="text-h6 q-mt-md">Selecciona una conversación</div>
            </div>
          </q-card-section>

          <!-- Input de mensaje -->
          <q-separator v-if="selectedConversation" />
          
          <q-card-actions v-if="selectedConversation">
            <q-input
              v-model="newMessage"
              placeholder="Escribe un mensaje..."
              outlined
              dense
              class="col"
              @keyup.enter="sendMessage"
            />
            <q-btn 
              color="primary" 
              icon="send" 
              round 
              @click="sendMessage"
              :disable="!newMessage.trim()"
              class="q-ml-sm"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, nextTick } from 'vue'
import { useChatStore } from 'src/stores/chat'
import { useAuthStore } from 'src/stores/auth'

export default defineComponent({
  name: 'ChatPage',
  
  setup() {
    const chatStore = useChatStore()
    const authStore = useAuthStore()
    
    const selectedConversation = ref(null)
    const newMessage = ref('')
    const messagesContainer = ref(null)
    
    const selectConversation = async (conversation) => {
      selectedConversation.value = conversation
      await chatStore.fetchMessages(conversation.id)
      scrollToBottom()
    }
    
    const sendMessage = async () => {
      if (!newMessage.value.trim()) return
      
      const message = await chatStore.sendMessage(
        selectedConversation.value.id,
        newMessage.value.trim(),
        selectedConversation.value.other_user_id
      )
      
      if (message) {
        newMessage.value = ''
        await nextTick()
        scrollToBottom()
      }
    }
    
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        setTimeout(() => {
          const container = messagesContainer.value.$el || messagesContainer.value
          container.scrollTop = container.scrollHeight
        }, 100)
      }
    }
    
    const formatTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    onMounted(async () => {
      await chatStore.fetchConversations()
    })
    
    return {
      chatStore,
      authStore,
      selectedConversation,
      newMessage,
      messagesContainer,
      selectConversation,
      sendMessage,
      formatTime
    }
  }
})
</script>
