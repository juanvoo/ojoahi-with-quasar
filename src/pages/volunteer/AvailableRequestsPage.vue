<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-lg">
            <h1 class="text-h4 q-mb-md">Solicitudes Disponibles</h1>
            <p class="text-subtitle1 text-grey-7">
              Encuentra solicitudes de ayuda que puedes aceptar
            </p>
          </q-card>
        </div>
        
        <!-- Filters -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-3">
                <q-select
                  v-model="priorityFilter"
                  :options="priorityOptions"
                  label="Filtrar por prioridad"
                  outlined
                  clearable
                  emit-value
                  map-options
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="locationFilter"
                  label="Filtrar por ubicación"
                  outlined
                  clearable
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="dateFilter"
                  label="Filtrar por fecha"
                  type="date"
                  outlined
                  clearable
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-btn
                  @click="refreshRequests"
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
        
        <!-- Requests List -->
        <div class="col-12">
          <div class="row q-col-gutter-md">
            <div v-if="loading" class="col-12">
              <q-card class="q-pa-xl text-center">
                <q-spinner size="40px" color="primary" />
                <div class="q-mt-md">Cargando solicitudes...</div>
              </q-card>
            </div>
            
            <div v-else-if="!filteredRequests.length" class="col-12">
              <q-card class="q-pa-xl text-center">
                <q-icon name="search_off" size="4rem" color="grey-5" />
                <h2 class="text-h5 q-mt-md">No hay solicitudes disponibles</h2>
                <p class="text-body1 text-grey-6">
                  {{ hasFilters ? 'No se encontraron solicitudes con esos criterios' : 'No hay solicitudes pendientes en este momento' }}
                </p>
                <q-btn
                  v-if="hasFilters"
                  @click="clearFilters"
                  color="primary"
                  outline
                  label="Limpiar filtros"
                  class="q-mt-md"
                />
              </q-card>
            </div>
            
            <div
              v-for="request in filteredRequests"
              :key="request.id"
              class="col-12 col-lg-6"
            >
              <q-card class="request-card full-height">
                <q-card-section>
                  <div class="row items-start justify-between q-mb-md">
                    <div class="col">
                      <h3 class="text-h6 q-mb-xs">{{ request.title }}</h3>
                      <div class="text-subtitle2 text-grey-6">
                        Por {{ request.blind_user_name || 'Usuario' }}
                      </div>
                    </div>
                    
                    <div class="col-auto">
                      <q-chip
                        :color="getPriorityColor(request.priority)"
                        text-color="white"
                        size="sm"
                      >
                        {{ getPriorityLabel(request.priority) }}
                      </q-chip>
                    </div>
                  </div>
                  
                  <p class="text-body2 q-mb-md">{{ request.description }}</p>
                  
                  <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-12 col-sm-6">
                      <div class="text-caption text-grey-6">
                        <q-icon name="event" size="sm" class="q-mr-xs" />
                        Fecha y hora
                      </div>
                      <div class="text-body2">
                        {{ formatDate(request.date) }} a las {{ request.time }}
                      </div>
                    </div>
                    
                    <div class="col-12 col-sm-6">
                      <div class="text-caption text-grey-6">
                        <q-icon name="location_on" size="sm" class="q-mr-xs" />
                        Ubicación
                      </div>
                      <div class="text-body2">{{ request.location }}</div>
                    </div>
                    
                    <div v-if="request.estimated_duration" class="col-12 col-sm-6">
                      <div class="text-caption text-grey-6">
                        <q-icon name="schedule" size="sm" class="q-mr-xs" />
                        Duración estimada
                      </div>
                      <div class="text-body2">{{ request.estimated_duration }} minutos</div>
                    </div>
                    
                    <div class="col-12 col-sm-6">
                      <div class="text-caption text-grey-6">
                        <q-icon name="access_time" size="sm" class="q-mr-xs" />
                        Publicado
                      </div>
                      <div class="text-body2">{{ getTimeAgo(request.created_at) }}</div>
                    </div>
                  </div>
                </q-card-section>
                
                <q-card-actions class="q-pa-md">
                  <q-btn
                    @click="viewRequestDetails(request.id)"
                    outline
                    color="primary"
                    label="Ver detalles"
                    class="q-mr-sm"
                  />
                  
                  <q-btn
                    @click="acceptRequest(request.id)"
                    color="primary"
                    label="Aceptar solicitud"
                    icon="volunteer_activism"
                    :loading="acceptingRequest === request.id"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
        
        <!-- Load More Button -->
        <div v-if="hasMore && !loading" class="col-12 text-center">
          <q-btn
            @click="loadMore"
            color="primary"
            outline
            label="Cargar más solicitudes"
            :loading="loadingMore"
          />
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
  name: 'AvailableRequestsPage',
  
  setup() {
    const router = useRouter()
    const helpRequestsStore = useHelpRequestsStore()
    
    const loading = ref(false)
    const loadingMore = ref(false)
    const acceptingRequest = ref(null)
    const priorityFilter = ref('')
    const locationFilter = ref('')
    const dateFilter = ref('')
    const hasMore = ref(false)
    
    const priorityOptions = [
      { label: 'Alta prioridad', value: 'high' },
      { label: 'Media prioridad', value: 'medium' },
      { label: 'Baja prioridad', value: 'low' }
    ]
    
    const requests = computed(() => helpRequestsStore.requests)
    
    const hasFilters = computed(() => 
      priorityFilter.value || locationFilter.value || dateFilter.value
    )
    
    const filteredRequests = computed(() => {
      let filtered = requests.value
      
      if (priorityFilter.value) {
        filtered = filtered.filter(req => req.priority === priorityFilter.value)
      }
      
      if (locationFilter.value) {
        const location = locationFilter.value.toLowerCase()
        filtered = filtered.filter(req => 
          req.location.toLowerCase().includes(location)
        )
      }
      
      if (dateFilter.value) {
        filtered = filtered.filter(req => req.date === dateFilter.value)
      }
      
      // Sort by priority and creation date
      return filtered.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        
        if (priorityDiff !== 0) return priorityDiff
        
        return new Date(b.created_at) - new Date(a.created_at)
      })
    })
    
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
    
    const getTimeAgo = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Hace menos de 1 hora'
      if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
      
      const diffInDays = Math.floor(diffInHours / 24)
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
    }
    
    const refreshRequests = async () => {
      loading.value = true
      try {
        await helpRequestsStore.fetchAvailableRequests()
      } finally {
        loading.value = false
      }
    }
    
    const loadMore = () => {
      // TODO: Implement pagination
      loadingMore.value = true
      setTimeout(() => {
        loadingMore.value = false
      }, 1000)
    }
    
    const clearFilters = () => {
      priorityFilter.value = ''
      locationFilter.value = ''
      dateFilter.value = ''
    }
    
    const viewRequestDetails = (id) => {
      // TODO: Create request detail page for volunteers
      Notify.create({
        type: 'info',
        message: 'Vista de detalles próximamente disponible'
      })
    }
    
    const acceptRequest = (id) => {
      const request = requests.value.find(req => req.id === id)
      
      Dialog.create({
        title: 'Aceptar solicitud',
        message: `¿Estás seguro de que quieres aceptar la solicitud "${request?.title}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        acceptingRequest.value = id
        
        try {
          const success = await helpRequestsStore.acceptRequest(id)
          
          if (success) {
            Notify.create({
              type: 'positive',
              message: 'Solicitud aceptada correctamente'
            })
            
            // Refresh the list to remove the accepted request
            await refreshRequests()
          }
        } catch (error) {
          console.error('Error accepting request:', error)
        } finally {
          acceptingRequest.value = null
        }
      })
    }
    
    onMounted(() => {
      refreshRequests()
    })
    
    return {
      loading,
      loadingMore,
      acceptingRequest,
      priorityFilter,
      locationFilter,
      dateFilter,
      priorityOptions,
      filteredRequests,
      hasFilters,
      hasMore,
      getPriorityColor,
      getPriorityLabel,
      formatDate,
      getTimeAgo,
      refreshRequests,
      loadMore,
      clearFilters,
      viewRequestDetails,
      acceptRequest
    }
  }
})
</script>

<style scoped>
.request-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
