<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-lg">
            <h1 class="text-h4 q-mb-md">Mis Reservas</h1>
            <p class="text-subtitle1 text-grey-7">
              Gestiona las solicitudes que has aceptado
            </p>
          </q-card>
        </div>
        
        <!-- Stats Cards -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="pending" size="2rem" color="orange" />
            <div class="text-h6 q-mt-sm">Pendientes</div>
            <div class="text-h4 text-weight-bold text-orange">{{ pendingCount }}</div>
          </q-card>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="check_circle" size="2rem" color="green" />
            <div class="text-h6 q-mt-sm">Confirmadas</div>
            <div class="text-h4 text-weight-bold text-green">{{ confirmedCount }}</div>
          </q-card>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="done_all" size="2rem" color="blue" />
            <div class="text-h6 q-mt-sm">Completadas</div>
            <div class="text-h4 text-weight-bold text-blue">{{ completedCount }}</div>
          </q-card>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="cancel" size="2rem" color="red" />
            <div class="text-h6 q-mt-sm">Canceladas</div>
            <div class="text-h4 text-weight-bold text-red">{{ cancelledCount }}</div>
          </q-card>
        </div>
        
        <!-- Filters -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="statusFilter"
                  :options="statusOptions"
                  label="Filtrar por estado"
                  outlined
                  clearable
                  emit-value
                  map-options
                />
              </div>
              
              <div class="col-12 col-md-4">
                <q-input
                  v-model="dateFilter"
                  label="Filtrar por fecha"
                  type="date"
                  outlined
                  clearable
                />
              </div>
              
              <div class="col-12 col-md-4">
                <q-btn
                  @click="refreshReservations"
                  color="primary"
                  outline
                  icon="refresh"
                  label="Actualizar"
                  :loading="loading"
                  class="full-width"
                />
              </div>
            </div>
          </q-card>
        </div>
        
        <!-- Reservations List -->
        <div class="col-12">
          <q-card>
            <q-list separator>
              <q-item v-if="loading" class="q-py-lg">
                <q-item-section>
                  <div class="text-center">
                    <q-spinner size="40px" color="primary" />
                    <div class="q-mt-md">Cargando reservas...</div>
                  </div>
                </q-item-section>
              </q-item>
              
              <q-item v-else-if="!filteredReservations.length" class="q-py-lg">
                <q-item-section class="text-center">
                  <q-icon name="event_busy" size="3rem" color="grey-5" />
                  <div class="text-h6 q-mt-md">No hay reservas</div>
                  <div class="text-body2 text-grey-6">
                    {{ statusFilter ? 'No hay reservas con este estado' : 'Aún no has aceptado ninguna solicitud' }}
                  </div>
                  <q-btn
                    v-if="!statusFilter"
                    to="/app/volunteer/available-requests"
                    color="primary"
                    label="Buscar solicitudes"
                    class="q-mt-md"
                  />
                </q-item-section>
              </q-item>
              
              <q-item
                v-for="reservation in filteredReservations"
                :key="reservation.id"
                class="reservation-item"
              >
                <q-item-section avatar>
                  <q-avatar :color="getStatusColor(reservation.status)" text-color="white">
                    <q-icon :name="getStatusIcon(reservation.status)" />
                  </q-avatar>
                </q-item-section>
                
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ reservation.title }}</q-item-label>
                  <q-item-label caption lines="2">{{ reservation.description }}</q-item-label>
                  
                  <div class="row q-mt-sm q-gutter-sm">
                    <q-chip
                      :color="getStatusColor(reservation.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ getStatusLabel(reservation.status) }}
                    </q-chip>
                    
                    <q-chip
                      color="blue"
                      text-color="white"
                      size="sm"
                      icon="person"
                    >
                      {{ reservation.blind_user_name }}
                    </q-chip>
                  </div>
                </q-item-section>
                
                <q-item-section side>
                  <div class="text-right">
                    <div class="text-body2 text-weight-medium">
                      {{ formatDate(reservation.date) }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ reservation.time }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      <q-icon name="location_on" size="xs" />
                      {{ reservation.location }}
                    </div>
                  </div>
                </q-item-section>
                
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    icon="more_vert"
                    @click="showReservationMenu(reservation, $event)"
                  >
                    <q-menu>
                      <q-list>
                        <q-item clickable @click="viewReservation(reservation.id)">
                          <q-item-section>Ver detalles</q-item-section>
                        </q-item>
                        
                        <q-item 
                          v-if="reservation.status === 'pending'"
                          clickable 
                          @click="confirmReservation(reservation.id)"
                        >
                          <q-item-section>Confirmar</q-item-section>
                        </q-item>
                        
                        <q-item 
                          v-if="reservation.status === 'confirmed'"
                          clickable 
                          @click="completeReservation(reservation.id)"
                        >
                          <q-item-section>Marcar como completada</q-item-section>
                        </q-item>
                        
                        <q-item 
                          v-if="['pending', 'confirmed'].includes(reservation.status)"
                          clickable 
                          @click="cancelReservation(reservation.id)"
                        >
                          <q-item-section>Cancelar</q-item-section>
                        </q-item>
                        
                        <q-item 
                          clickable 
                          @click="contactUser(reservation.blind_user_id)"
                        >
                          <q-item-section>Contactar usuario</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { Notify, Dialog } from 'quasar'

export default defineComponent({
  name: 'MyReservationsPage',
  
  setup() {
    const router = useRouter()
    
    const loading = ref(false)
    const reservations = ref([])
    const statusFilter = ref('')
    const dateFilter = ref('')
    
    const statusOptions = [
      { label: 'Pendientes', value: 'pending' },
      { label: 'Confirmadas', value: 'confirmed' },
      { label: 'Completadas', value: 'completed' },
      { label: 'Canceladas', value: 'cancelled' }
    ]
    
    const filteredReservations = computed(() => {
      let filtered = reservations.value
      
      if (statusFilter.value) {
        filtered = filtered.filter(res => res.status === statusFilter.value)
      }
      
      if (dateFilter.value) {
        filtered = filtered.filter(res => res.date === dateFilter.value)
      }
      
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })
    
    const pendingCount = computed(() => 
      reservations.value.filter(res => res.status === 'pending').length
    )
    
    const confirmedCount = computed(() => 
      reservations.value.filter(res => res.status === 'confirmed').length
    )
    
    const completedCount = computed(() => 
      reservations.value.filter(res => res.status === 'completed').length
    )
    
    const cancelledCount = computed(() => 
      reservations.value.filter(res => res.status === 'cancelled').length
    )
    
    const getStatusColor = (status) => {
      const colors = {
        pending: 'orange',
        confirmed: 'green',
        completed: 'blue',
        cancelled: 'red'
      }
      return colors[status] || 'grey'
    }
    
    const getStatusIcon = (status) => {
      const icons = {
        pending: 'pending',
        confirmed: 'check_circle',
        completed: 'done_all',
        cancelled: 'cancel'
      }
      return icons[status] || 'help'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        pending: 'Pendiente',
        confirmed: 'Confirmada',
        completed: 'Completada',
        cancelled: 'Cancelada'
      }
      return labels[status] || status
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const fetchReservations = async () => {
      loading.value = true
      
      try {
        const response = await api.get('/reservations')
        
        if (response.data.success) {
          reservations.value = response.data.reservations || []
        }
      } catch (error) {
        console.error('Error fetching reservations:', error)
        
        Notify.create({
          type: 'negative',
          message: 'Error al cargar reservas'
        })
        
        // Mock data for development
        reservations.value = [
          {
            id: 1,
            help_request_id: 1,
            title: 'Ayuda con compras semanales',
            description: 'Necesito ayuda para hacer la compra semanal en el supermercado',
            date: '2024-01-15',
            time: '10:00',
            location: 'Supermercado Mercadona, Calle Mayor 123',
            status: 'confirmed',
            blind_user_id: 2,
            blind_user_name: 'Juan Pérez',
            created_at: '2024-01-10T10:00:00Z'
          },
          {
            id: 2,
            help_request_id: 2,
            title: 'Acompañamiento médico',
            description: 'Necesito acompañamiento para ir al médico',
            date: '2024-01-16',
            time: '09:30',
            location: 'Centro de Salud San Juan',
            status: 'pending',
            blind_user_id: 4,
            blind_user_name: 'Carlos Rodríguez',
            created_at: '2024-01-11T15:30:00Z'
          }
        ]
      } finally {
        loading.value = false
      }
    }
    
    const refreshReservations = () => {
      fetchReservations()
    }
    
    const viewReservation = (id) => {
      // TODO: Create reservation detail page
      Notify.create({
        type: 'info',
        message: 'Vista de detalles próximamente disponible'
      })
    }
    
    const confirmReservation = (id) => {
      Dialog.create({
        title: 'Confirmar reserva',
        message: '¿Confirmas que puedes realizar esta ayuda en la fecha y hora indicada?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          // TODO: Implement API call
          const reservation = reservations.value.find(r => r.id === id)
          if (reservation) {
            reservation.status = 'confirmed'
          }
          
          Notify.create({
            type: 'positive',
            message: 'Reserva confirmada correctamente'
          })
        } catch (error) {
          console.error('Error confirming reservation:', error)
        }
      })
    }
    
    const completeReservation = (id) => {
      Dialog.create({
        title: 'Completar reserva',
        message: '¿Confirmas que has completado esta ayuda satisfactoriamente?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          // TODO: Implement API call
          const reservation = reservations.value.find(r => r.id === id)
          if (reservation) {
            reservation.status = 'completed'
          }
          
          Notify.create({
            type: 'positive',
            message: 'Reserva completada correctamente'
          })
        } catch (error) {
          console.error('Error completing reservation:', error)
        }
      })
    }
    
    const cancelReservation = (id) => {
      Dialog.create({
        title: 'Cancelar reserva',
        message: '¿Estás seguro de que quieres cancelar esta reserva?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          // TODO: Implement API call
          const reservation = reservations.value.find(r => r.id === id)
          if (reservation) {
            reservation.status = 'cancelled'
          }
          
          Notify.create({
            type: 'positive',
            message: 'Reserva cancelada correctamente'
          })
        } catch (error) {
          console.error('Error cancelling reservation:', error)
        }
      })
    }
    
    const contactUser = (userId) => {
      // TODO: Implement chat functionality
      Notify.create({
        type: 'info',
        message: 'Función de chat próximamente disponible'
      })
    }
    
    const showReservationMenu = (reservation, event) => {
      // Menu is handled by the template
    }
    
    onMounted(() => {
      fetchReservations()
    })
    
    return {
      loading,
      statusFilter,
      dateFilter,
      statusOptions,
      filteredReservations,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      getStatusColor,
      getStatusIcon,
      getStatusLabel,
      formatDate,
      refreshReservations,
      viewReservation,
      confirmReservation,
      completeReservation,
      cancelReservation,
      contactUser,
      showReservationMenu
    }
  }
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.reservation-item:hover {
  background-color: rgba(0,0,0,0.02);
}
</style>
