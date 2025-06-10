<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="text-h5 q-mb-md">Monitoreo de Solicitudes</div>
            <p class="text-subtitle1 text-grey-7">
              Supervisa y gestiona todas las solicitudes de ayuda.
            </p>
          </q-card>
        </div>

        <!-- Estadísticas de Solicitudes -->
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="pending" size="2rem" color="orange" />
            <div class="text-h6 q-mt-sm">{{ stats.pending }}</div>
            <div class="text-caption">Pendientes</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="schedule" size="2rem" color="blue" />
            <div class="text-h6 q-mt-sm">{{ stats.in_progress }}</div>
            <div class="text-caption">En Progreso</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="check_circle" size="2rem" color="green" />
            <div class="text-h6 q-mt-sm">{{ stats.completed }}</div>
            <div class="text-caption">Completadas</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="priority_high" size="2rem" color="red" />
            <div class="text-h6 q-mt-sm">{{ stats.urgent }}</div>
            <div class="text-caption">Urgentes</div>
          </q-card>
        </div>

        <!-- Filtros -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="filters.search"
                  label="Buscar solicitudes"
                  outlined
                  dense
                  clearable
                  @input="filterRequests"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-2">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  label="Estado"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterRequests"
                />
              </div>
              
              <div class="col-12 col-md-2">
                <q-select
                  v-model="filters.category"
                  :options="categoryOptions"
                  label="Categoría"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterRequests"
                />
              </div>
              
              <div class="col-12 col-md-2">
                <q-select
                  v-model="filters.priority"
                  :options="priorityOptions"
                  label="Prioridad"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterRequests"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <div class="row q-gutter-sm">
                  <q-btn
                    color="primary"
                    icon="refresh"
                    label="Actualizar"
                    @click="loadRequests"
                    :loading="loading"
                  />
                  <q-btn
                    color="secondary"
                    icon="download"
                    label="Exportar"
                    @click="exportRequests"
                  />
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <!-- Tabla de Solicitudes -->
        <div class="col-12">
          <q-card>
            <q-table
              :rows="filteredRequests"
              :columns="columns"
              row-key="id"
              :loading="loading"
              :pagination="pagination"
              @request="onRequest"
              binary-state-sort
            >
              <template v-slot:body-cell-priority="props">
                <q-td :props="props">
                  <q-chip
                    :color="getPriorityColor(props.row.priority)"
                    text-color="white"
                    size="sm"
                  >
                    {{ getPriorityLabel(props.row.priority) }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.row.status)"
                    text-color="white"
                    size="sm"
                  >
                    {{ getStatusLabel(props.row.status) }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-category="props">
                <q-td :props="props">
                  <q-chip
                    :color="getCategoryColor(props.row.category)"
                    text-color="white"
                    size="sm"
                  >
                    {{ props.row.category }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <div class="q-gutter-sm">
                    <q-btn
                      flat
                      round
                      icon="visibility"
                      color="primary"
                      @click="viewRequest(props.row)"
                    />
                    <q-btn
                      flat
                      round
                      icon="person_add"
                      color="green"
                      @click="assignVolunteer(props.row)"
                      v-if="props.row.status === 'pending'"
                    />
                    <q-btn
                      flat
                      round
                      icon="priority_high"
                      color="red"
                      @click="markUrgent(props.row)"
                      v-if="props.row.priority !== 'urgent'"
                    />
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog Ver Solicitud -->
    <q-dialog v-model="viewDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">Detalles de la Solicitud</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedRequest">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Título</q-item-label>
                    <q-item-label class="text-h6">{{ selectedRequest.title }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Descripción</q-item-label>
                    <q-item-label>{{ selectedRequest.description }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Usuario</q-item-label>
                    <q-item-label>{{ selectedRequest.blind_user_name }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Ubicación</q-item-label>
                    <q-item-label>{{ selectedRequest.location }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Fecha y Hora</q-item-label>
                    <q-item-label>{{ formatDateTime(selectedRequest.date, selectedRequest.time) }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Estado</q-item-label>
                    <q-item-label>
                      <q-chip :color="getStatusColor(selectedRequest.status)" text-color="white">
                        {{ getStatusLabel(selectedRequest.status) }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="selectedRequest.volunteer_name">
                  <q-item-section>
                    <q-item-label overline>Voluntario Asignado</q-item-label>
                    <q-item-label>{{ selectedRequest.volunteer_name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn 
            flat 
            label="Asignar Voluntario" 
            color="green" 
            @click="assignVolunteer(selectedRequest)"
            v-if="selectedRequest?.status === 'pending'"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { Notify, Dialog } from 'quasar'

export default defineComponent({
  name: 'RequestsMonitoringPage',
  
  setup() {
    const loading = ref(true)
    const requests = ref([])
    const filteredRequests = ref([])
    const viewDialog = ref(false)
    const selectedRequest = ref(null)
    
    const stats = ref({
      pending: 0,
      in_progress: 0,
      completed: 0,
      urgent: 0
    })
    
    const filters = ref({
      search: '',
      status: null,
      category: null,
      priority: null
    })
    
    const pagination = ref({
      sortBy: 'created_at',
      descending: true,
      page: 1,
      rowsPerPage: 10
    })
    
    const statusOptions = [
      { label: 'Pendiente', value: 'pending' },
      { label: 'Aceptada', value: 'accepted' },
      { label: 'En Progreso', value: 'in_progress' },
      { label: 'Completada', value: 'completed' },
      { label: 'Cancelada', value: 'cancelled' }
    ]
    
    const categoryOptions = [
      { label: 'Acompañamiento', value: 'acompanamiento' },
      { label: 'Compras', value: 'compras' },
      { label: 'Lectura', value: 'lectura' },
      { label: 'Trámites', value: 'tramites' },
      { label: 'Otro', value: 'otro' }
    ]
    
    const priorityOptions = [
      { label: 'Normal', value: 'normal' },
      { label: 'Alta', value: 'high' },
      { label: 'Urgente', value: 'urgent' }
    ]
    
    const columns = [
      {
        name: 'id',
        label: 'ID',
        field: 'id',
        align: 'left',
        sortable: true
      },
      {
        name: 'title',
        required: true,
        label: 'Título',
        align: 'left',
        field: 'title',
        sortable: true
      },
      {
        name: 'blind_user_name',
        label: 'Usuario',
        field: 'blind_user_name',
        sortable: true
      },
      {
        name: 'category',
        label: 'Categoría',
        field: 'category',
        sortable: true
      },
      {
        name: 'status',
        label: 'Estado',
        field: 'status',
        sortable: true
      },
      {
        name: 'priority',
        label: 'Prioridad',
        field: 'priority',
        sortable: true
      },
      {
        name: 'created_at',
        label: 'Creada',
        field: 'created_at',
        sortable: true,
        format: val => formatDate(val)
      },
      {
        name: 'actions',
        label: 'Acciones',
        field: 'actions',
        align: 'center',
        sortable: false
      }
    ]
    
    const loadRequests = async () => {
      try {
        loading.value = true
        
        // Simular datos mientras implementamos la API real
        const mockRequests = [
          {
            id: 1,
            title: 'Ayuda con compras en supermercado',
            description: 'Necesito ayuda para hacer compras en el supermercado',
            blind_user_name: 'Juan Pérez',
            location: 'Supermercado Central',
            date: '2024-01-20',
            time: '10:00',
            category: 'compras',
            status: 'pending',
            priority: 'normal',
            volunteer_name: null,
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            title: 'Acompañamiento médico urgente',
            description: 'Necesito acompañamiento para cita médica urgente',
            blind_user_name: 'Ana García',
            location: 'Hospital Central',
            date: '2024-01-18',
            time: '14:00',
            category: 'acompanamiento',
            status: 'accepted',
            priority: 'urgent',
            volunteer_name: 'María Rodríguez',
            created_at: '2024-01-16T08:15:00Z'
          }
        ]
        
        requests.value = mockRequests
        filteredRequests.value = mockRequests
        
        // Calcular estadísticas
        stats.value = {
          pending: mockRequests.filter(r => r.status === 'pending').length,
          in_progress: mockRequests.filter(r => r.status === 'in_progress').length,
          completed: mockRequests.filter(r => r.status === 'completed').length,
          urgent: mockRequests.filter(r => r.priority === 'urgent').length
        }
        
      } catch (error) {
        console.error('Error loading requests:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al cargar solicitudes'
        })
      } finally {
        loading.value = false
      }
    }
    
    const filterRequests = () => {
      let filtered = requests.value
      
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(request =>
          request.title.toLowerCase().includes(search) ||
          request.description.toLowerCase().includes(search) ||
          request.blind_user_name.toLowerCase().includes(search)
        )
      }
      
      if (filters.value.status) {
        filtered = filtered.filter(request => request.status === filters.value.status.value)
      }
      
      if (filters.value.category) {
        filtered = filtered.filter(request => request.category === filters.value.category.value)
      }
      
      if (filters.value.priority) {
        filtered = filtered.filter(request => request.priority === filters.value.priority.value)
      }
      
      filteredRequests.value = filtered
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const formatDateTime = (date, time) => {
      return `${formatDate(date)} ${time}`
    }
    
    const getStatusColor = (status) => {
      const colors = {
        'pending': 'orange',
        'accepted': 'blue',
        'in_progress': 'purple',
        'completed': 'green',
        'cancelled': 'red'
      }
      return colors[status] || 'grey'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        'pending': 'Pendiente',
        'accepted': 'Aceptada',
        'in_progress': 'En Progreso',
        'completed': 'Completada',
        'cancelled': 'Cancelada'
      }
      return labels[status] || status
    }
    
    const getPriorityColor = (priority) => {
      const colors = {
        'normal': 'grey',
        'high': 'orange',
        'urgent': 'red'
      }
      return colors[priority] || 'grey'
    }
    
    const getPriorityLabel = (priority) => {
      const labels = {
        'normal': 'Normal',
        'high': 'Alta',
        'urgent': 'Urgente'
      }
      return labels[priority] || priority
    }
    
    const getCategoryColor = (category) => {
      const colors = {
        'acompanamiento': 'blue',
        'compras': 'green',
        'lectura': 'purple',
        'tramites': 'orange',
        'otro': 'grey'
      }
      return colors[category] || 'grey'
    }
    
    const viewRequest = (request) => {
      selectedRequest.value = request
      viewDialog.value = true
    }
    
    const assignVolunteer = (request) => {
      Notify.create({
        type: 'info',
        message: 'Función de asignación de voluntario en desarrollo'
      })
    }
    
    const markUrgent = (request) => {
      Dialog.create({
        title: 'Marcar como urgente',
        message: `¿Marcar la solicitud "${request.title}" como urgente?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        request.priority = 'urgent'
        Notify.create({
          type: 'positive',
          message: 'Solicitud marcada como urgente'
        })
      })
    }
    
    const exportRequests = () => {
      Notify.create({
        type: 'info',
        message: 'Función de exportación en desarrollo'
      })
    }
    
    const onRequest = (props) => {
      pagination.value = props.pagination
    }
    
    onMounted(() => {
      loadRequests()
    })
    
    return {
      loading,
      filteredRequests,
      stats,
      filters,
      pagination,
      columns,
      statusOptions,
      categoryOptions,
      priorityOptions,
      viewDialog,
      selectedRequest,
      loadRequests,
      filterRequests,
      formatDate,
      formatDateTime,
      getStatusColor,
      getStatusLabel,
      getPriorityColor,
      getPriorityLabel,
      getCategoryColor,
      viewRequest,
      assignVolunteer,
      markUrgent,
      exportRequests,
      onRequest
    }
  }
})
</script>
