<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="text-h5 q-mb-md">Moderación de Reportes</div>
            <p class="text-subtitle1 text-grey-7">
              Gestiona las denuncias y reportes de usuarios.
            </p>
          </q-card>
        </div>

        <!-- Estadísticas de reportes -->
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="pending" size="2rem" color="orange" />
            <div class="text-h6 q-mt-sm">Pendientes</div>
            <div class="text-h4 text-weight-bold text-orange">{{ pendingCount }}</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="search" size="2rem" color="blue" />
            <div class="text-h6 q-mt-sm">Investigando</div>
            <div class="text-h4 text-weight-bold text-blue">{{ investigatingCount }}</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="check_circle" size="2rem" color="green" />
            <div class="text-h6 q-mt-sm">Aprobados</div>
            <div class="text-h4 text-weight-bold text-green">{{ approvedCount }}</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="cancel" size="2rem" color="red" />
            <div class="text-h6 q-mt-sm">Rechazados</div>
            <div class="text-h4 text-weight-bold text-red">{{ rejectedCount }}</div>
          </q-card>
        </div>

        <!-- Filtros -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  label="Estado"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterReports"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.reason"
                  :options="reasonOptions"
                  label="Motivo"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterReports"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="filters.search"
                  label="Buscar usuario"
                  outlined
                  dense
                  clearable
                  @input="filterReports"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-3">
                <q-btn
                  color="primary"
                  icon="refresh"
                  label="Actualizar"
                  @click="loadReports"
                  :loading="loading"
                />
              </div>
            </div>
          </q-card>
        </div>

        <!-- Lista de reportes -->
        <div class="col-12">
          <q-card>
            <q-table
              :rows="filteredReports"
              :columns="columns"
              row-key="id"
              :loading="loading"
              :pagination="pagination"
              @request="onRequest"
              binary-state-sort
            >
              <template v-slot:body-cell-reason="props">
                <q-td :props="props">
                  <q-chip
                    :color="getReasonColor(props.row.reason)"
                    text-color="white"
                    size="sm"
                  >
                    {{ getReasonLabel(props.row.reason) }}
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

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <div class="q-gutter-sm">
                    <q-btn
                      flat
                      round
                      icon="visibility"
                      color="primary"
                      @click="viewReport(props.row)"
                    />
                    <q-btn
                      v-if="props.row.status === 'pending'"
                      flat
                      round
                      icon="search"
                      color="blue"
                      @click="investigateReport(props.row)"
                    />
                    <q-btn
                      v-if="['pending', 'investigating'].includes(props.row.status)"
                      flat
                      round
                      icon="check"
                      color="green"
                      @click="approveReport(props.row)"
                    />
                    <q-btn
                      v-if="['pending', 'investigating'].includes(props.row.status)"
                      flat
                      round
                      icon="close"
                      color="red"
                      @click="rejectReport(props.row)"
                    />
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog Ver Reporte -->
    <q-dialog v-model="viewDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">Detalles del Reporte</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedReport">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Reportado por</q-item-label>
                    <q-item-label class="text-h6">{{ selectedReport.reporter_name }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Usuario reportado</q-item-label>
                    <q-item-label class="text-h6">{{ selectedReport.reported_user_name }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Motivo</q-item-label>
                    <q-item-label>
                      <q-chip :color="getReasonColor(selectedReport.reason)" text-color="white">
                        {{ getReasonLabel(selectedReport.reason) }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Descripción</q-item-label>
                    <q-item-label>{{ selectedReport.description || 'Sin descripción' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Estado</q-item-label>
                    <q-item-label>
                      <q-chip :color="getStatusColor(selectedReport.status)" text-color="white">
                        {{ getStatusLabel(selectedReport.status) }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Fecha del reporte</q-item-label>
                    <q-item-label>{{ formatDate(selectedReport.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="selectedReport.admin_notes">
                  <q-item-section>
                    <q-item-label overline>Notas del administrador</q-item-label>
                    <q-item-label>{{ selectedReport.admin_notes }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn 
            v-if="selectedReport?.status === 'pending'"
            flat 
            label="Investigar" 
            color="blue" 
            @click="investigateReport(selectedReport)"
          />
          <q-btn 
            v-if="['pending', 'investigating'].includes(selectedReport?.status)"
            flat 
            label="Aprobar" 
            color="green" 
            @click="approveReport(selectedReport)"
          />
          <q-btn 
            v-if="['pending', 'investigating'].includes(selectedReport?.status)"
            flat 
            label="Rechazar" 
            color="red" 
            @click="rejectReport(selectedReport)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Manejar Reporte -->
    <q-dialog v-model="handleDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ handleAction === 'approve' ? 'Aprobar' : 'Rechazar' }} Reporte</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitHandleReport" class="q-gutter-md">
            <q-input
              v-model="handleForm.notes"
              label="Notas del administrador"
              type="textarea"
              rows="4"
              outlined
              :rules="[val => !!val || 'Las notas son requeridas']"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn 
            flat 
            :label="handleAction === 'approve' ? 'Aprobar' : 'Rechazar'" 
            :color="handleAction === 'approve' ? 'green' : 'red'" 
            @click="submitHandleReport" 
            :loading="handlingReport"
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
  name: 'ReportsPage',
  
  setup() {
    const loading = ref(true)
    const reports = ref([])
    const filteredReports = ref([])
    const viewDialog = ref(false)
    const handleDialog = ref(false)
    const selectedReport = ref(null)
    const handleAction = ref('')
    const handlingReport = ref(false)
    
    const filters = ref({
      status: null,
      reason: null,
      search: ''
    })
    
    const handleForm = ref({
      notes: ''
    })
    
    const pagination = ref({
      sortBy: 'created_at',
      descending: true,
      page: 1,
      rowsPerPage: 10
    })
    
    const statusOptions = [
      { label: 'Pendiente', value: 'pending' },
      { label: 'Investigando', value: 'investigating' },
      { label: 'Aprobado', value: 'approved' },
      { label: 'Rechazado', value: 'rejected' }
    ]
    
    const reasonOptions = [
      { label: 'Spam', value: 'spam' },
      { label: 'Acoso', value: 'harassment' },
      { label: 'Contenido inapropiado', value: 'inappropriate_content' },
      { label: 'Perfil falso', value: 'fake_profile' },
      { label: 'Otro', value: 'other' }
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
        name: 'reporter_name',
        required: true,
        label: 'Reportado por',
        align: 'left',
        field: 'reporter_name',
        sortable: true
      },
      {
        name: 'reported_user_name',
        label: 'Usuario reportado',
        field: 'reported_user_name',
        sortable: true
      },
      {
        name: 'reason',
        label: 'Motivo',
        field: 'reason',
        sortable: true
      },
      {
        name: 'status',
        label: 'Estado',
        field: 'status',
        sortable: true
      },
      {
        name: 'created_at',
        label: 'Fecha',
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
    
    const pendingCount = computed(() => 
      reports.value.filter(r => r.status === 'pending').length
    )
    
    const investigatingCount = computed(() => 
      reports.value.filter(r => r.status === 'investigating').length
    )
    
    const approvedCount = computed(() => 
      reports.value.filter(r => r.status === 'approved').length
    )
    
    const rejectedCount = computed(() => 
      reports.value.filter(r => r.status === 'rejected').length
    )
    
    const loadReports = async () => {
      try {
        loading.value = true
        
        const response = await api.get('/admin/reports')
        
        if (response.data.success) {
          reports.value = response.data.reports || []
          filteredReports.value = reports.value
        }
        
      } catch (error) {
        console.error('Error loading reports:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al cargar reportes'
        })
        
        // Datos de ejemplo
        reports.value = [
          {
            id: 1,
            reporter_name: 'Juan Pérez',
            reported_user_name: 'Usuario Problemático',
            reason: 'harassment',
            status: 'pending',
            description: 'Este usuario me ha estado enviando mensajes inapropiados',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            reporter_name: 'María García',
            reported_user_name: 'Spam Bot',
            reason: 'spam',
            status: 'investigating',
            description: 'Envía mensajes de spam constantemente',
            created_at: '2024-01-14T14:20:00Z'
          }
        ]
        filteredReports.value = reports.value
        
      } finally {
        loading.value = false
      }
    }
    
    const filterReports = () => {
      let filtered = reports.value
      
      if (filters.value.status) {
        filtered = filtered.filter(report => report.status === filters.value.status.value)
      }
      
      if (filters.value.reason) {
        filtered = filtered.filter(report => report.reason === filters.value.reason.value)
      }
      
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(report =>
          report.reporter_name.toLowerCase().includes(search) ||
          report.reported_user_name.toLowerCase().includes(search)
        )
      }
      
      filteredReports.value = filtered
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const getReasonColor = (reason) => {
      const colors = {
        'spam': 'orange',
        'harassment': 'red',
        'inappropriate_content': 'purple',
        'fake_profile': 'blue',
        'other': 'grey'
      }
      return colors[reason] || 'grey'
    }
    
    const getReasonLabel = (reason) => {
      const labels = {
        'spam': 'Spam',
        'harassment': 'Acoso',
        'inappropriate_content': 'Contenido inapropiado',
        'fake_profile': 'Perfil falso',
        'other': 'Otro'
      }
      return labels[reason] || reason
    }
    
    const getStatusColor = (status) => {
      const colors = {
        'pending': 'orange',
        'investigating': 'blue',
        'approved': 'green',
        'rejected': 'red'
      }
      return colors[status] || 'grey'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        'pending': 'Pendiente',
        'investigating': 'Investigando',
        'approved': 'Aprobado',
        'rejected': 'Rechazado'
      }
      return labels[status] || status
    }
    
    const viewReport = (report) => {
      selectedReport.value = report
      viewDialog.value = true
    }
    
    const investigateReport = (report) => {
      handleAction.value = 'investigate'
      selectedReport.value = report
      handleForm.value.notes = ''
      handleDialog.value = true
    }
    
    const approveReport = (report) => {
      handleAction.value = 'approve'
      selectedReport.value = report
      handleForm.value.notes = ''
      handleDialog.value = true
    }
    
    const rejectReport = (report) => {
      handleAction.value = 'reject'
      selectedReport.value = report
      handleForm.value.notes = ''
      handleDialog.value = true
    }
    
    const submitHandleReport = async () => {
      if (!handleForm.value.notes) {
        Notify.create({
          type: 'negative',
          message: 'Las notas son requeridas'
        })
        return
      }
      
      handlingReport.value = true
      
      try {
        const response = await api.post(`/admin/reports/${selectedReport.value.id}/handle`, {
          action: handleAction.value,
          notes: handleForm.value.notes
        })
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Reporte manejado correctamente'
          })
          
          handleDialog.value = false
          viewDialog.value = false
          await loadReports()
        }
        
      } catch (error) {
        console.error('Error handling report:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al manejar reporte'
        })
      } finally {
        handlingReport.value = false
      }
    }
    
    const onRequest = (props) => {
      pagination.value = props.pagination
    }
    
    onMounted(() => {
      loadReports()
    })
    
    return {
      loading,
      filteredReports,
      filters,
      statusOptions,
      reasonOptions,
      columns,
      pagination,
      viewDialog,
      handleDialog,
      selectedReport,
      handleAction,
      handleForm,
      handlingReport,
      pendingCount,
      investigatingCount,
      approvedCount,
      rejectedCount,
      loadReports,
      filterReports,
      formatDate,
      getReasonColor,
      getReasonLabel,
      getStatusColor,
      getStatusLabel,
      viewReport,
      investigateReport,
      approveReport,
      rejectReport,
      submitHandleReport,
      onRequest
    }
  }
})
</script>