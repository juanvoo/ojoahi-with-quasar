<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-lg">
            <div class="row items-center justify-between">
              <div class="col">
                <h1 class="text-h4 q-mb-sm">Mis Solicitudes de Ayuda</h1>
                <p class="text-subtitle1 text-grey-7">
                  Gestiona todas tus solicitudes de ayuda
                </p>
              </div>
              <div class="col-auto">
                <q-btn
                  to="/app/blind/help-requests/new"
                  color="primary"
                  icon="add"
                  label="Nueva Solicitud"
                  size="lg"
                />
              </div>
            </div>
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
            <div class="text-h6 q-mt-sm">Aceptadas</div>
            <div class="text-h4 text-weight-bold text-green">{{ acceptedCount }}</div>
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
                  v-model="searchQuery"
                  label="Buscar solicitudes"
                  outlined
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-4">
                <q-btn
                  @click="refreshRequests"
                  color="primary"
                  outline
                  icon="refresh"
                  label="Actualizar"
                  :loading="loading"
                />
              </div>
            </div>
          </q-card>
        </div>
        
        <!-- Requests List -->
        <div class="col-12">
          <q-card>
            <q-list separator>
              <q-item v-if="loading" class="q-py-lg">
                <q-item-section>
                  <div class="text-center">
                    <q-spinner size="40px" color="primary" />
                    <div class="q-mt-md">Cargando solicitudes...</div>
                  </div>
                </q-item-section>
              </q-item>
              
              <q-item v-else-if="!filteredRequests.length" class="q-py-lg">
                <q-item-section class="text-center">
                  <q-icon name="inbox" size="3rem" color="grey-5" />
                  <div class="text-h6 q-mt-md">No hay solicitudes</div>
                  <div class="text-body2 text-grey-6">
                    {{ statusFilter ? 'No hay solicitudes con este estado' : 'Aún no has creado ninguna solicitud' }}
                  </div>
                  <q-btn
                    v-if="!statusFilter"
                    to="/app/blind/help-requests/new"
                    color="primary"
                    label="Crear primera solicitud"
                    class="q-mt-md"
                  />
                </q-item-section>
              </q-item>
              
              <q-item
                v-for="request in filteredRequests"
                :key="request.id"
                clickable
                @click="viewRequest(request.id)"
                class="request-item"
              >
                <q-item-section avatar>
                  <q-avatar :color="getStatusColor(request.status)" text-color="white">
                    <q-icon :name="getStatusIcon(request.status)" />
                  </q-avatar>
                </q-item-section>
                
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ request.title }}</q-item-label>
                  <q-item-label caption lines="2">{{ request.description }}</q-item-label>
                  
                  <div class="row q-mt-sm q-gutter-sm">
                    <q-chip
                      :color="getStatusColor(request.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ getStatusLabel(request.status) }}
                    </q-chip>
                    
                    <q-chip
                      :color="getPriorityColor(request.priority)"
                      text-color="white"
                      size="sm"
                    >
                      {{ getPriorityLabel(request.priority) }}
                    </q-chip>
                  </div>
                </q-item-section>
                
                <q-item-section side>
                  <div class="text-right">
                    <div class="text-body2 text-weight-medium">
                      {{ formatDate(request.date) }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ request.time }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      <q-icon name="location_on" size="xs" />
                      {{ request.location }}
                    </div>
                    <div v-if="request.volunteer_name" class="text-caption text-primary q-mt-xs">
                      <q-icon name="person" size="xs" />
                      {{ request.volunteer_name }}
                    </div>
                  </div>
                </q-item-section>
                
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    icon="more_vert"
                    @click.stop="showRequestMenu(request, $event)"
                  >
                    <q-menu>
                      <q-list>
                        <q-item clickable @click="viewRequest(request.id)">
                          <q-item-section>Ver detalles</q-item-section>
                        </q-item>
                        
                        <q-item 
                          v-if="request.status === 'pending'"
                          clickable 
                          @click="editRequest(request.id)"
                        >
                          <q-item-section>Editar</q-item-section>
                        </q-item>
                        
                        <q-item 
                          v-if="['pending', 'accepted'].includes(request.status)"
                          clickable 
                          @click="cancelRequest(request.id)"
                        >
                          <q-item-section>Cancelar</q-item-section>
                        </q-item>
                        
                        <q-item 
                          v-if="request.status === 'accepted'"
                          clickable 
                          @click="markCompleted(request.id)"
                        >
                          <q-item-section>Marcar como completada</q-item-section>
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
import { useHelpRequestsStore } from 'src/stores/helpRequests'
import { Notify, Dialog } from 'quasar'

export default defineComponent({
  name: 'HelpRequestsPage',
  
  setup() {
    const router = useRouter()
    const helpRequestsStore = useHelpRequestsStore()
    
    const loading = ref(false)
    const statusFilter = ref('')
    const searchQuery = ref('')
    
    const statusOptions = [
      { label: 'Pendientes', value: 'pending' },
      { label: 'Aceptadas', value: 'accepted' },
      { label: 'Completadas', value: 'completed' },
      { label: 'Canceladas', value: 'cancelled' }
    ]
    
    const requests = computed(() => helpRequestsStore.requests)
    
    const filteredRequests = computed(() => {
      let filtered = requests.value
      
      if (statusFilter.value) {
        filtered = filtered.filter(req => req.status === statusFilter.value)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(req => 
          req.title.toLowerCase().includes(query) ||
          req.description.toLowerCase().includes(query) ||
          req.location.toLowerCase().includes(query)
        )
      }
      
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })
    
    const pendingCount = computed(() => 
      requests.value.filter(req => req.status === 'pending').length
    )
    
    const acceptedCount = computed(() => 
      requests.value.filter(req => req.status === 'accepted').length
    )
    
    const completedCount = computed(() => 
      requests.value.filter(req => req.status === 'completed').length
    )
    
    const cancelledCount = computed(() => 
      requests.value.filter(req => req.status === 'cancelled').length
    )
    
    const getStatusColor = (status) => {
      const colors = {
        pending: 'orange',
        accepted: 'green',
        completed: 'blue',
        cancelled: 'red'
      }
      return colors[status] || 'grey'
    }
    
    const getStatusIcon = (status) => {
      const icons = {
        pending: 'pending',
        accepted: 'check_circle',
        completed: 'done_all',
        cancelled: 'cancel'
      }
      return icons[status] || 'help'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        pending: 'Pendiente',
        accepted: 'Aceptada',
        completed: 'Completada',
        cancelled: 'Cancelada'
      }
      return labels[status] || status
    }
    
    const getPriorityColor = (priority) => {
      const colors = {
        low: 'green',
        medium: 'orange',
        high: 'red'
      }
      return colors[priority] || 'grey'
    }
    
    const getPriorityLabel = (priority) => {
      const labels = {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta'
      }
      return labels[priority] || priority
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const refreshRequests = async () => {
      loading.value = true
      try {
        await helpRequestsStore.fetchMyRequests()
      } finally {
        loading.value = false
      }
    }
    
    const viewRequest = (id) => {
      router.push(`/app/blind/help-requests/${id}`)
    }
    
    const editRequest = (id) => {
      // TODO: Implement edit functionality
      Notify.create({
        type: 'info',
        message: 'Función de edición próximamente disponible'
      })
    }
    
    const cancelRequest = (id) => {
      Dialog.create({
        title: 'Cancelar solicitud',
        message: '¿Estás seguro de que quieres cancelar esta solicitud?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await helpRequestsStore.cancelRequest(id)
          await refreshRequests()
        } catch (error) {
          console.error('Error cancelling request:', error)
        }
      })
    }
    
    const markCompleted = (id) => {
      Dialog.create({
        title: 'Marcar como completada',
        message: '¿Confirmas que esta solicitud ha sido completada satisfactoriamente?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await helpRequestsStore.completeRequest(id)
          await refreshRequests()
        } catch (error) {
          console.error('Error completing request:', error)
        }
      })
    }
    
    const showRequestMenu = (request, event) => {
      // Menu is handled by the template
    }
    
    onMounted(() => {
      refreshRequests()
    })
    
    return {
      loading,
      statusFilter,
      searchQuery,
      statusOptions,
      filteredRequests,
      pendingCount,
      acceptedCount,
      completedCount,
      cancelledCount,
      getStatusColor,
      getStatusIcon,
      getStatusLabel,
      getPriorityColor,
      getPriorityLabel,
      formatDate,
      refreshRequests,
      viewRequest,
      editRequest,
      cancelRequest,
      markCompleted,
      showRequestMenu
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

.request-item:hover {
  background-color: rgba(0,0,0,0.02);
}
</style>
