<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-lg">
            <div class="row items-center q-mb-md">
              <div class="col">
                <h1 class="text-h4 q-mb-none">Notificaciones</h1>
                <p class="text-subtitle1 text-grey-7 q-mb-none">
                  Mantente al día con las últimas actualizaciones
                </p>
              </div>
              <div class="col-auto">
                <q-btn
                  v-if="notificationsStore.unreadCount > 0"
                  flat
                  color="primary"
                  label="Marcar todas como leídas"
                  @click="markAllAsRead"
                  :loading="markingAllAsRead"
                />
              </div>
            </div>

            <!-- Filtros -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="selectedType"
                  :options="typeOptions"
                  label="Filtrar por tipo"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="showUnreadOnly"
                  label="Solo no leídas"
                  color="primary"
                />
              </div>
            </div>
          </q-card>
        </div>
        
        <div class="col-12">
          <q-card>
            <!-- Loading state -->
            <div v-if="notificationsStore.loading && !notificationsStore.notifications.length" class="text-center q-pa-xl">
              <q-spinner size="40px" color="primary" />
              <div class="q-mt-md">Cargando notificaciones...</div>
            </div>

            <!-- Empty state -->
            <div v-else-if="!filteredNotifications.length" class="text-center q-pa-xl">
              <q-icon name="notifications_none" size="4rem" color="grey-5" />
              <h2 class="text-h5 q-mt-md">
                {{ showUnreadOnly ? 'No hay notificaciones sin leer' : 'No hay notificaciones' }}
              </h2>
              <p class="text-body1 text-grey-6">
                {{ showUnreadOnly 
                  ? 'Todas tus notificaciones están al día' 
                  : 'Cuando tengas notificaciones, aparecerán aquí' 
                }}
              </p>
            </div>

            <!-- Notifications list -->
            <q-list v-else separator>
              <q-item
                v-for="notification in filteredNotifications"
                :key="notification.id"
                clickable
                v-ripple
                @click="handleNotificationClick(notification)"
                :class="{ 'bg-blue-1': !notification.is_read }"
              >
                <q-item-section avatar>
                  <q-avatar :color="getNotificationColor(notification.type)" text-color="white">
                    <q-icon :name="getNotificationIcon(notification.type)" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ notification.title }}
                    <q-badge v-if="!notification.is_read" color="red" rounded class="q-ml-sm">
                      Nuevo
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption lines="2">
                    {{ notification.message }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6 q-mt-xs">
                    {{ formatDate(notification.created_at) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="column items-end">
                    <q-chip
                      :label="getTypeLabel(notification.type)"
                      :color="getNotificationColor(notification.type)"
                      text-color="white"
                      size="sm"
                      class="q-mb-sm"
                    />
                    <q-btn
                      v-if="!notification.is_read"
                      flat
                      round
                      size="sm"
                      icon="done"
                      color="primary"
                      @click.stop="markAsRead(notification.id)"
                      :loading="markingAsRead === notification.id"
                    >
                      <q-tooltip>Marcar como leída</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <!-- Load more button -->
            <div v-if="hasMoreNotifications" class="text-center q-pa-md">
              <q-btn
                flat
                color="primary"
                label="Cargar más"
                @click="loadMoreNotifications"
                :loading="notificationsStore.loading"
              />
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useNotificationsStore } from 'src/stores/notifications'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'NotificationsPage',
  
  setup() {
    const notificationsStore = useNotificationsStore()
    const router = useRouter()
    
    const selectedType = ref(null)
    const showUnreadOnly = ref(false)
    const markingAsRead = ref(null)
    const markingAllAsRead = ref(false)
    const hasMoreNotifications = ref(true)
    
    const typeOptions = [
      { label: 'Mensajes', value: 'message' },
      { label: 'Solicitudes de ayuda', value: 'help_request' },
      { label: 'Reseñas', value: 'review' },
      { label: 'Reservas', value: 'reservation' },
      { label: 'Sistema', value: 'system' }
    ]
    
    const filteredNotifications = computed(() => {
      let notifications = notificationsStore.notifications
      
      if (selectedType.value) {
        notifications = notifications.filter(n => n.type === selectedType.value)
      }
      
      if (showUnreadOnly.value) {
        notifications = notifications.filter(n => !n.is_read)
      }
      
      return notifications
    })
    
    const getNotificationIcon = (type) => {
      const icons = {
        message: 'chat',
        help_request: 'help',
        review: 'star',
        reservation: 'event',
        system: 'info'
      }
      return icons[type] || 'notifications'
    }
    
    const getNotificationColor = (type) => {
      const colors = {
        message: 'blue',
        help_request: 'green',
        review: 'orange',
        reservation: 'purple',
        system: 'grey'
      }
      return colors[type] || 'grey'
    }
    
    const getTypeLabel = (type) => {
      const labels = {
        message: 'Mensaje',
        help_request: 'Ayuda',
        review: 'Reseña',
        reservation: 'Reserva',
        system: 'Sistema'
      }
      return labels[type] || 'Notificación'
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        return 'Hace unos minutos'
      } else if (diffInHours < 24) {
        return `Hace ${Math.floor(diffInHours)} horas`
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString('es-ES', { weekday: 'long' })
      } else {
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }
    }
    
    const handleNotificationClick = async (notification) => {
      // Mark as read if not already
      if (!notification.is_read) {
        await markAsRead(notification.id)
      }
      
      // Navigate based on notification type
      if (notification.data) {
        const data = typeof notification.data === 'string' 
          ? JSON.parse(notification.data) 
          : notification.data
          
        switch (notification.type) {
          case 'message':
            if (data.conversation_id) {
              router.push('/dashboard/chat')
            }
            break
          case 'help_request':
            if (data.help_request_id) {
              // Navigate to help requests page
              router.push('/dashboard/help-requests')
            }
            break
          case 'review':
            if (data.review_id) {
              router.push('/dashboard/reviews')
            }
            break
          case 'reservation':
            if (data.reservation_id) {
              router.push('/dashboard/reservations')
            }
            break
        }
      }
    }
    
    const markAsRead = async (notificationId) => {
      markingAsRead.value = notificationId
      try {
        await notificationsStore.markAsRead(notificationId)
      } finally {
        markingAsRead.value = null
      }
    }
    
    const markAllAsRead = async () => {
      markingAllAsRead.value = true
      try {
        await notificationsStore.markAllAsRead()
      } finally {
        markingAllAsRead.value = false
      }
    }
    
    const loadMoreNotifications = async () => {
      const result = await notificationsStore.loadMore()
      if (!result || result.length === 0) {
        hasMoreNotifications.value = false
      }
    }
    
    onMounted(async () => {
      await notificationsStore.fetchNotifications()
    })
    
    return {
      notificationsStore,
      selectedType,
      showUnreadOnly,
      markingAsRead,
      markingAllAsRead,
      hasMoreNotifications,
      typeOptions,
      filteredNotifications,
      getNotificationIcon,
      getNotificationColor,
      getTypeLabel,
      formatDate,
      handleNotificationClick,
      markAsRead,
      markAllAsRead,
      loadMoreNotifications
    }
  }
})
</script>
