<template>
  <div class="modern-dashboard">
    <main class="main-content" role="main">
      <div class="user-info-header">
        <div class="user-profile-info">
          <h2>{{ user?.username }}</h2>
          <div class="user-status">
            <span class="status-dot" :style="{ background: isOnline ? '#10b981' : '#d1d5db' }"></span>
            <p class="status-text">
              Usuario &middot; {{ isOnline ? 'En línea' : 'Desconectado' }}
            </p>
          </div>
        </div>
        <q-btn
          round
          flat
          dense
          color="secondary"
          class="notification-toggle"
          @click="toggleNotifications"
          aria-label="Ver notificaciones"
        >
          <q-icon name="notifications" />
          <q-badge
            v-if="notifications.length"
            floating
            color="red"
            :label="notifications.length"
            aria-label="notificaciones sin leer"
          />
        </q-btn>
      </div>
      <!-- Notificaciones -->
<q-icon :name="notifIcon(notif.type)" color="primary" />

<!-- Fechas -->
<small class="notification-time">{{ formatDate(notif.created_at) }}</small>

<!-- Botón marcar como leído -->
<q-btn
  v-if="notif.unread"
  size="sm"
  flat
  icon="check"
  aria-label="Marcar como leída"
  class="mark-read"
  @click="markAsRead(notif.id)"
/>

<!-- Botón marcar todas como leídas -->
<q-btn
  v-if="notifications.length"
  size="sm"
  color="primary"
  flat
  @click="markAllAsRead"
  aria-label="Marcar todas como leídas"
  label="Marcar todas como leídas"
/>

<!-- Botón cancelar reserva -->
<q-btn
  v-if="r.status === 'pending'"
  color="negative"
  class="cancel-btn q-mt-sm"
  label="Cancelar"
  :aria-label="`Cancelar reserva con ${r.volunteer_name}`"
  @click="cancelReservation(r.id)"
/>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { io } from 'socket.io-client';

const user = ref(null);
const isOnline = ref(false);
let socket = null; // Usar let para poder asignar después

const notifications = ref([]);
const unreadMessages = ref(0);
const reservations = ref([]);
const reviews = ref([]);
const showNotifications = ref(false);

const $q = useQuasar();
const router = useRouter();

onMounted(async () => {
  // 1. Carga usuario autenticado desde backend
  const res = await fetch('http://localhost:3000/api/auth/user', { credentials: 'include' });
  if (res.ok) {
    user.value = await res.json();
  } else {
    // Demo/datos simulados en caso de no autenticado
    user.value = { id: 'demo', username: 'Juan Ciego' };
    notifications.value = [
      { id: '1', type: 'assistance', title: 'Ayuda aceptada', message: 'Un voluntario aceptó tu solicitud.', created_at: new Date(), unread: true },
      { id: '2', type: 'message', title: 'Nuevo mensaje', message: 'Tienes un mensaje nuevo en el chat.', created_at: new Date(), unread: true }
    ];
    unreadMessages.value = 2;
    reservations.value = [
      { id: 'r1', volunteer_name: 'Mario Voluntario', date: new Date(), time: '16:00', status: 'pending', description: 'Asistencia para compras' }
    ];
    reviews.value = [
      { id: 'rv1', volunteer_name: 'Mario Voluntario', rating: 5, comment: 'Excelente ayuda, muy atento.', created_at: new Date() }
    ];
  }
});

// 2. Conecta el socket SOLO cuando tengas el usuario real
watch(user, (val) => {
  if (val && val.id && !socket) {
    socket = io('http://localhost:3000', { withCredentials: true });
    socket.on('connect', () => {
      console.log('Socket conectado');
      socket.emit('user-online', val.id);
    });
    socket.on('user-status', ({ userId, status }) => {
      if (userId === val.id) {
        isOnline.value = status === 'online';
      }
    });
    socket.on('disconnect', () => {
      isOnline.value = false;
    });
  }
});

// ... el resto de tu lógica igual (notificaciones, reservas, etc.) ...

function notifIcon(type) {
  switch (type) {
    case 'assistance': return 'volunteer_activism';
    case 'message': return 'mail';
    case 'review': return 'star';
    default: return 'notifications';
  }
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function goTo(path) {
  router.push(path);
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
}

function markAsRead(id) {
  const notif = notifications.value.find(n => n.id === id);
  if (notif) notif.unread = false;
  $q.notify({ type: 'positive', message: 'Notificación marcada como leída' });
}

function markAllAsRead() {
  notifications.value.forEach(n => (n.unread = false));
  $q.notify({ type: 'positive', message: 'Todas las notificaciones leídas' });
}

function cancelReservation(requestId) {
  $q.dialog({
    title: 'Cancelar reserva',
    message: '¿Estás seguro de que deseas cancelar esta reserva?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    reservations.value = reservations.value.filter(r => r.id !== requestId);
    $q.notify({ type: 'info', message: 'Reserva cancelada' });
  });
}

onMounted(() => {
  window.addEventListener('keydown', keyHandler);
});

function keyHandler(e) {
  if (e.altKey) {
    switch (e.key) {
      case 'h':
        goTo('/help-requests/create');
        break;
      case 'v':
        goTo('/users/volunteers');
        break;
      case 'c':
        goTo('/chat');
        break;
      case 'r':
        goTo('/reviews/create');
        break;
      case 'n':
        toggleNotifications();
        break;
    }
  }
}
</script>


<style scoped>
/* Puedes copiar aquí los estilos de tu CSS anterior (adaptar a clases si necesario) */
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap');
:root {
  --primary-color: #2563eb;
  --secondary-color: #4b5563;
  --accent-color: #8b5cf6;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --background-color: #f3f4f6;
  --card-background: #ffffff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-radius: 12px;
  --transition: all 0.3s ease;
}
.modern-dashboard {
  background: var(--background-color);
  min-height: 100vh;
  padding: 1.5rem;
  font-family: 'Quicksand', sans-serif;
}
.user-info-header {
  background: var(--card-background);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.user-profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.user-profile-info h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}
.user-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.status-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
}
.status-text {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
}
.main-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.action-card {
  background: var(--card-background);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: var(--transition);
}
.action-card:hover {
  transform: translateY(-5px);
}
.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}
.notifications-panel {
  background: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  max-height: 500px;
  overflow-y: auto;
}
.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.notifications-list {
  padding: 1rem;
}
.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  background: white;
  margin-bottom: 0.5rem;
  transition: var(--transition);
}
.notification-item.unread {
  background: #f0f9ff;
  border-left: 4px solid var(--primary-color);
}
.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notification-content {
  flex-grow: 1;
}
.notification-content h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}
.notification-content p {
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}
.notification-time {
  color: var(--text-secondary);
  font-size: 0.875rem;
}
.mark-read {
  align-self: center;
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-secondary);
  text-align: center;
  gap: 1rem;
}
.reservations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}
.reservation-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.reservation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.reservation-card h3 {
  font-size: 1.2em;
  color: #444;
  margin: 0 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.reservation-card p {
  font-size: 0.95em;
  color: #555;
  margin: 8px 0;
  line-height: 1.4;
}
.reservation-card .status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.85em;
  font-weight: 500;
  text-transform: capitalize;
}
.reservation-card .status[data-status="pending"] {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}
.reservation-card .status[data-status="accepted"] {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
.reservation-card .status[data-status="rejected"] {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
.reservation-card .cancel-btn {
  display: inline-block;
  padding: 8px 16px;
  margin-top: 15px;
  font-size: 0.9em;
  color: #fff;
  background-color: #dc3545;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.reservation-card .cancel-btn:hover {
  background-color: #c82333;
}
.no-reservations {
  text-align: center;
  padding: 40px 20px;
  color: #555;
  font-size: 1.1em;
  background-color: #fff;
  border-radius: 5px;
  margin: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.reviews-section {
  margin: 20px 0;
  padding: 20px;
}
.reviews-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.review-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}
.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.review-card h3 {
  font-size: 1.1em;
  color: #444;
  margin: 0 0 10px;
}
.review-card .rating {
  color: #ffc107;
  font-size: 1.2em;
  margin: 10px 0;
}
.review-card .review-comment {
  color: #555;
  font-size: 0.95em;
  line-height: 1.4;
  margin: 10px 0;
}
.review-card .review-date {
  color: #777;
  font-size: 0.85em;
  margin-top: 10px;
}
@media (max-width: 768px) {
  .reviews-list,
  .reservations-list {
    grid-template-columns: 1fr;
    padding: 10px;
  }
  .reviews-section {
    padding: 10px;
  }
  .reservation-card {
    margin: 10px;
  }
}
</style>