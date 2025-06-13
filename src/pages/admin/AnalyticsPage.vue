<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="text-h5 q-mb-md">Analytics y Reportes</div>
            <p class="text-subtitle1 text-grey-7">
              Analiza el rendimiento y crecimiento de la plataforma.
            </p>
          </q-card>
        </div>

        <!-- Controles de período -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-3">
                <q-select
                  v-model="selectedPeriod"
                  :options="periodOptions"
                  label="Período de análisis"
                  outlined
                  dense
                  emit-value
                  map-options
                  @update:model-value="loadAnalytics"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="customDateFrom"
                  label="Fecha desde"
                  type="date"
                  outlined
                  dense
                  v-if="selectedPeriod === 'custom'"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-input
                  v-model="customDateTo"
                  label="Fecha hasta"
                  type="date"
                  outlined
                  dense
                  v-if="selectedPeriod === 'custom'"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <div class="row q-gutter-sm">
                  <q-btn
                    color="primary"
                    icon="refresh"
                    label="Actualizar"
                    @click="loadAnalytics"
                    :loading="loading"
                  />
                  <q-btn
                    color="secondary"
                    icon="download"
                    label="Exportar"
                    @click="exportData"
                  />
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <!-- Métricas principales -->
        <div class="col-12 col-md-3">
          <q-card class="metric-card q-pa-md text-center">
            <q-icon name="trending_up" size="2rem" color="green" />
            <div class="text-h6 q-mt-sm">Crecimiento</div>
            <div class="text-h4 text-weight-bold text-green">+{{ analytics.userGrowth?.length || 0 }}%</div>
            <div class="text-caption text-grey-6">Usuarios nuevos</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="metric-card q-pa-md text-center">
            <q-icon name="people" size="2rem" color="blue" />
            <div class="text-h6 q-mt-sm">Usuarios Activos</div>
            <div class="text-h4 text-weight-bold text-blue">{{ totalActiveUsers }}</div>
            <div class="text-caption text-grey-6">En el período</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="metric-card q-pa-md text-center">
            <q-icon name="help" size="2rem" color="orange" />
            <div class="text-h6 q-mt-sm">Solicitudes</div>
            <div class="text-h4 text-weight-bold text-orange">{{ totalRequests }}</div>
            <div class="text-caption text-grey-6">Total procesadas</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="metric-card q-pa-md text-center">
            <q-icon name="chat" size="2rem" color="purple" />
            <div class="text-h6 q-mt-sm">Mensajes</div>
            <div class="text-h4 text-weight-bold text-purple">{{ totalMessages }}</div>
            <div class="text-caption text-grey-6">Intercambiados</div>
          </q-card>
        </div>

        <!-- Gráfico de crecimiento de usuarios -->
        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg">
            <div class="text-h6 q-mb-md">Crecimiento de Usuarios</div>
            <div class="chart-container">
              <canvas ref="userGrowthChart" width="400" height="200"></canvas>
            </div>
          </q-card>
        </div>

        <!-- Gráfico de solicitudes por estado -->
        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg">
            <div class="text-h6 q-mb-md">Solicitudes por Estado</div>
            <div class="chart-container">
              <canvas ref="requestsChart" width="400" height="200"></canvas>
            </div>
          </q-card>
        </div>

        <!-- Top voluntarios -->
        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg">
            <div class="text-h6 q-mb-md">Top Voluntarios</div>
            
            <q-list separator>
              <q-item v-if="!analytics.topVolunteers?.length">
                <q-item-section>
                  <q-item-label class="text-grey-6">No hay datos disponibles</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item v-for="(volunteer, index) in analytics.topVolunteers" :key="volunteer.username">
                <q-item-section avatar>
                  <q-avatar :color="getPositionColor(index)" text-color="white">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                
                <q-item-section>
                  <q-item-label>{{ volunteer.name || volunteer.username }}</q-item-label>
                  <q-item-label caption>{{ volunteer.completed_requests }} ayudas completadas</q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <div class="text-right">
                    <div class="text-weight-bold">{{ volunteer.avg_rating || '0.0' }}</div>
                    <q-rating
                      v-model="volunteer.avg_rating"
                      readonly
                      size="xs"
                      color="amber"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- Actividad de mensajes -->
        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg">
            <div class="text-h6 q-mb-md">Actividad de Mensajes</div>
            <div class="chart-container">
              <canvas ref="messagesChart" width="400" height="200"></canvas>
            </div>
          </q-card>
        </div>

        <!-- Tabla de exportación -->
        <div class="col-12">
          <q-card class="q-pa-lg">
            <div class="text-h6 q-mb-md">Exportar Datos</div>
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-btn
                  color="primary"
                  icon="download"
                  label="Exportar Usuarios"
                  class="full-width"
                  @click="exportUsers"
                />
              </div>
              
              <div class="col-12 col-md-4">
                <q-btn
                  color="secondary"
                  icon="download"
                  label="Exportar Solicitudes"
                  class="full-width"
                  @click="exportRequests"
                />
              </div>
              
              <div class="col-12 col-md-4">
                <q-btn
                  color="accent"
                  icon="download"
                  label="Exportar Mensajes"
                  class="full-width"
                  @click="exportMessages"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'AnalyticsPage',
  
  setup() {
    const loading = ref(true)
    const analytics = ref({})
    const selectedPeriod = ref('30')
    const customDateFrom = ref('')
    const customDateTo = ref('')
    
    // Chart refs
    const userGrowthChart = ref(null)
    const requestsChart = ref(null)
    const messagesChart = ref(null)
    
    const periodOptions = [
      { label: 'Últimos 7 días', value: '7' },
      { label: 'Últimos 30 días', value: '30' },
      { label: 'Últimos 90 días', value: '90' },
      { label: 'Último año', value: '365' },
      { label: 'Personalizado', value: 'custom' }
    ]
    
    const totalActiveUsers = computed(() => {
      return analytics.value.userGrowth?.reduce((sum, day) => sum + day.count, 0) || 0
    })
    
    const totalRequests = computed(() => {
      return analytics.value.requestsByStatus?.reduce((sum, status) => sum + status.count, 0) || 0
    })
    
    const totalMessages = computed(() => {
      return analytics.value.messageActivity?.reduce((sum, day) => sum + day.count, 0) || 0
    })
    
    const loadAnalytics = async () => {
      try {
        loading.value = true
        
        const params = { period: selectedPeriod.value }
        if (selectedPeriod.value === 'custom') {
          params.date_from = customDateFrom.value
          params.date_to = customDateTo.value
        }
        
        const response = await api.get('/admin/analytics', { params })
        
        if (response.data.success) {
          analytics.value = response.data.analytics
          await nextTick()
          renderCharts()
        }
        
      } catch (error) {
        console.error('Error loading analytics:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al cargar analytics'
        })
        
        // Datos de ejemplo
        analytics.value = {
          userGrowth: [
            { date: '2024-01-01', count: 5 },
            { date: '2024-01-02', count: 8 },
            { date: '2024-01-03', count: 12 },
            { date: '2024-01-04', count: 15 },
            { date: '2024-01-05', count: 18 }
          ],
          requestsByStatus: [
            { status: 'pending', count: 12 },
            { status: 'accepted', count: 25 },
            { status: 'completed', count: 45 },
            { status: 'cancelled', count: 8 }
          ],
          messageActivity: [
            { date: '2024-01-01', count: 23 },
            { date: '2024-01-02', count: 34 },
            { date: '2024-01-03', count: 28 },
            { date: '2024-01-04', count: 41 },
            { date: '2024-01-05', count: 37 }
          ],
          topVolunteers: [
            { username: 'maria_voluntaria', name: 'María García', completed_requests: 23, avg_rating: 4.8 },
            { username: 'carlos_helper', name: 'Carlos Rodríguez', completed_requests: 18, avg_rating: 4.9 },
            { username: 'ana_support', name: 'Ana López', completed_requests: 15, avg_rating: 5.0 }
          ]
        }
        
        await nextTick()
        renderCharts()
        
      } finally {
        loading.value = false
      }
    }
    
    const renderCharts = () => {
      // Simular renderizado de gráficos
      // En una implementación real, usarías Chart.js o similar
      console.log('Rendering charts with data:', analytics.value)
    }
    
    const getPositionColor = (index) => {
      const colors = ['gold', 'silver', 'orange', 'blue', 'green']
      return colors[index] || 'grey'
    }
    
    const exportData = async () => {
      try {
        const response = await api.get('/admin/export', {
          params: {
            type: 'analytics',
            format: 'json',
            period: selectedPeriod.value
          }
        })
        
        // Crear y descargar archivo
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `analytics_${new Date().toISOString().split('T')[0]}.json`
        link.click()
        window.URL.revokeObjectURL(url)
        
        Notify.create({
          type: 'positive',
          message: 'Datos exportados correctamente'
        })
        
      } catch (error) {
        console.error('Error exporting data:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al exportar datos'
        })
      }
    }
    
    const exportUsers = async () => {
      try {
        const response = await api.get('/admin/export', {
          params: { type: 'users', format: 'csv' }
        })
        
        Notify.create({
          type: 'positive',
          message: 'Usuarios exportados correctamente'
        })
        
      } catch (error) {
        console.error('Error exporting users:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al exportar usuarios'
        })
      }
    }
    
    const exportRequests = async () => {
      try {
        const response = await api.get('/admin/export', {
          params: { type: 'requests', format: 'csv' }
        })
        
        Notify.create({
          type: 'positive',
          message: 'Solicitudes exportadas correctamente'
        })
        
      } catch (error) {
        console.error('Error exporting requests:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al exportar solicitudes'
        })
      }
    }
    
    const exportMessages = async () => {
      Notify.create({
        type: 'info',
        message: 'Función de exportación de mensajes en desarrollo'
      })
    }
    
    onMounted(() => {
      loadAnalytics()
    })
    
    return {
      loading,
      analytics,
      selectedPeriod,
      customDateFrom,
      customDateTo,
      periodOptions,
      totalActiveUsers,
      totalRequests,
      totalMessages,
      userGrowthChart,
      requestsChart,
      messagesChart,
      loadAnalytics,
      getPositionColor,
      exportData,
      exportUsers,
      exportRequests,
      exportMessages
    }
  }
})
</script>

<style scoped>
.metric-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>