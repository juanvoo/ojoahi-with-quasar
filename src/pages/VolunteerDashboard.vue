<template>
  <div class="dashboard-container q-pa-md">
    <!-- Encabezado del Dashboard -->
    <div class="row items-center q-mb-lg justify-between">
      <div>
        <h2>¡Bienvenido, {{ user?.username }}!</h2>
      </div>
      <q-btn
        color="primary"
        icon="fas fa-comments"
        to="/chat"
        class="relative-position"
        label="Mensajes"
      >
        <q-badge v-if="unreadMessages" color="negative" floating>{{ unreadMessages }}</q-badge>
      </q-btn>
    </div>

    <!-- Notificaciones -->
    <q-card v-if="notifications.length" class="q-mb-lg">
      <q-card-section class="row items-center justify-between">
        <div class="row items-center">
          <q-icon name="fas fa-bell" color="warning" size="md" class="q-mr-md"/>
          <h6 class="q-mb-none">Notificaciones</h6>
        </div>
        <q-btn
          flat
          dense
          icon="fas fa-check-double"
          label="Marcar todas como leídas"
          @click="markAllNotificationsRead"
        />
      </q-card-section>
      <q-separator />
      <div class="row q-col-gutter-md q-pa-md">
        <div class="col-xs-12 col-md-6" v-for="notif in notifications" :key="notif.id">
          <q-card :class="notif.read ? '' : 'notification-unread'">
            <q-card-section>
              <div class="row items-center q-mb-xs">
                <q-icon
                  :name="notificationTypeIcon(notif.type)"
                  :color="notificationTypeColor(notif.type)"
                  class="q-mr-sm"
                />
                <div class="text-subtitle2">{{ notif.title }}</div>
              </div>
              <div class="text-body2">{{ notif.message }}</div>
              <div class="text-caption text-grey-7 row items-center q-mt-xs">
                <q-icon name="fas fa-clock" size="xs" class="q-mr-xs"/>
                {{ formatDate(notif.created_at) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card>

    <!-- Estadísticas -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-xs-12 col-md-4">
        <q-card class="stats-card">
          <q-card-section class="row items-center">
            <q-icon name="fas fa-calendar-check" color="primary" size="md" class="q-mr-md"/>
            <div>
              <div class="text-subtitle2">Reservas Totales</div>
              <div class="text-h4">{{ reservations.length }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-md-4">
        <q-card class="stats-card">
          <q-card-section class="row items-center">
            <q-icon name="fas fa-star" color="yellow" size="md" class="q-mr-md"/>
            <div>
              <div class="text-subtitle2">Calificación Promedio</div>
              <div class="text-h4">
                {{ averageRating }}/5
                <span class="rating-stars text-yellow-8">
                  <span v-for="i in 5" :key="i">{{ i <= Math.round(averageRating) ? '★' : '☆' }}</span>
                </span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-md-4">
        <q-card class="stats-card">
          <q-card-section class="row items-center">
            <q-icon name="fas fa-hands-helping" color="orange" size="md" class="q-mr-md"/>
            <div>
              <div class="text-subtitle2">Solicitudes Pendientes</div>
              <div class="text-h4">{{ pendingRequests.length }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Solicitudes Pendientes -->
    <q-card class="q-mb-lg">
      <q-card-section class="row items-center">
        <q-icon name="fas fa-clock" color="warning" class="q-mr-sm" />
        <div class="text-h6 q-mb-none">Solicitudes de Ayuda Pendientes</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          :rows="pendingRequests"
          :columns="pendingColumns"
          row-key="id"
          flat
          dense
          v-if="pendingRequests.length"
        >
          <template v-slot:body-cell-actions="props">
            <q-td>
              <q-btn
                size="sm"
                color="positive"
                icon="check"
                label="Aceptar"
                class="q-mr-xs"
                @click="acceptRequest(props.row.id)"
              />
              <q-btn
                size="sm"
                color="negative"
                icon="close"
                label="Rechazar"
                @click="rejectRequest(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
        <div v-else class="text-center q-pt-lg">
          <q-icon name="fas fa-check-circle" color="positive" size="48px" class="q-mb-md"/>
          <div>No hay solicitudes pendientes por el momento</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Historial de Reservas -->
    <q-card class="q-mb-lg">
      <q-card-section class="row items-center">
        <q-icon name="fas fa-history" color="primary" class="q-mr-sm"/>
        <div class="text-h6 q-mb-none">Historial de Reservas</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          :rows="reservations"
          :columns="reservationColumns"
          row-key="id"
          flat
          dense
          v-if="reservations.length"
        >
          <template v-slot:body-cell-status="props">
            <q-td>
              <q-badge :color="props.row.status === 'accepted' ? 'positive' : 'negative'" class="q-pa-xs">
                <q-icon :name="props.row.status === 'accepted' ? 'check_circle' : 'cancel'" class="q-mr-xs" />
                {{ props.row.status === 'accepted' ? 'Aceptada' : 'Rechazada' }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
        <div v-else class="text-center q-pt-lg">
          <q-icon name="fas fa-calendar-times" color="grey-5" size="48px" class="q-mb-md"/>
          <div>No hay reservas en tu historial</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Reseñas Recibidas -->
    <q-card class="q-mb-lg">
      <q-card-section class="row items-center">
        <q-icon name="fas fa-star" color="yellow" class="q-mr-sm"/>
        <div class="text-h6 q-mb-none">Reseñas Recibidas</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div v-if="reviews.length" class="row q-col-gutter-md">
          <div class="col-xs-12 col-md-6" v-for="review in reviews" :key="review.id">
            <q-card>
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="row items-center">
                    <q-icon name="fas fa-user-circle" color="primary" size="32px" class="q-mr-md"/>
                    <div>
                      <div class="text-subtitle2">{{ review.user_name }}</div>
                      <div class="text-caption text-grey-7">{{ formatDate(review.created_at) }}</div>
                    </div>
                  </div>
                  <span class="rating-stars text-yellow-8">
                    <span v-for="i in 5" :key="i">{{ i <= Math.round(review.rating) ? '★' : '☆' }}</span>
                  </span>
                </div>
                <div class="q-mt-md">{{ review.comment }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <div v-else class="text-center q-pt-lg">
          <q-icon name="fas fa-star" color="grey-5" size="48px" class="q-mb-md"/>
          <div>Aún no has recibido reseñas</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from 'src/stores/user'

// Simulación de datos. En producción, reemplaza por fetch o store.
const userStore = useUserStore()
const user = userStore.user // O ref a un usuario simulado si quieres testear

// Ejemplo datos mock (reemplaza con tus llamadas a API/store)
const unreadMessages = ref(2)
const notifications = ref([
  { id: 1, type: 'help_request_accepted', title: 'Solicitud aceptada', message: 'Tu ayuda fue aceptada', read: false, created_at: new Date() },
  { id: 2, type: 'new_review', title: 'Nueva reseña', message: 'Recibiste una nueva reseña', read: true, created_at: new Date() },
])
const reservations = ref([
  { id: 1, user_name: 'Juan', date: '2025-06-01', time: '15:00', description: 'Ayuda con trámites', status: 'accepted' },
  { id: 2, user_name: 'Maria', date: '2025-06-02', time: '17:00', description: 'Asistencia médica', status: 'rejected' },
])
const averageRating = ref(4.3)
const pendingRequests = ref([
  { id: 1, user_name: 'Pedro', date: '2025-06-03', time: '12:00', description: 'Necesito ayuda con medicamentos' }
])
const reviews = ref([
  { id: 1, user_name: 'Ana', rating: 5, comment: '¡Excelente ayuda!', created_at: '2025-05-29' },
  { id: 2, user_name: 'Luis', rating: 4, comment: 'Muy buena experiencia', created_at: '2025-05-30' },
])

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// Icons para tipos de notificación
function notificationTypeIcon(type) {
  switch (type) {
    case 'help_request_accepted': return 'fas fa-check-circle'
    case 'help_request_rejected': return 'fas fa-times-circle'
    case 'new_review': return 'fas fa-star'
    default: return 'fas fa-info-circle'
  }
}
function notificationTypeColor(type) {
  switch (type) {
    case 'help_request_accepted': return 'positive'
    case 'help_request_rejected': return 'negative'
    case 'new_review': return 'warning'
    default: return 'info'
  }
}

// Acciones
function acceptRequest(id) {
  // Aquí va la lógica real
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== id)
}
function rejectRequest(id) {
  // Aquí va la lógica real
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== id)
}
function markAllNotificationsRead() {
  notifications.value.forEach(n => n.read = true)
}

// Columnas para tablas
const pendingColumns = [
  { name: 'user_name', label: 'Usuario', field: 'user_name' },
  { name: 'date', label: 'Fecha', field: 'date' },
  { name: 'time', label: 'Hora', field: 'time' },
  { name: 'description', label: 'Descripción', field: 'description' },
  { name: 'actions', label: 'Acciones', field: 'actions' },
]

const reservationColumns = [
  { name: 'user_name', label: 'Usuario', field: 'user_name' },
  { name: 'date', label: 'Fecha', field: 'date' },
  { name: 'time', label: 'Hora', field: 'time' },
  { name: 'description', label: 'Descripción', field: 'description' },
  { name: 'status', label: 'Estado', field: 'status' },
]
</script>

<style scoped>
.dashboard-container {
  max-width: 1100px;
  margin: 0 auto;
}
.stats-card {
  min-height: 100px;
}
.rating-stars {
  font-size: 1.3em;
  letter-spacing: 1px;
}
.notification-unread {
  border-left: 4px solid #ffc107;
  background: #fffbe6;
}
</style>