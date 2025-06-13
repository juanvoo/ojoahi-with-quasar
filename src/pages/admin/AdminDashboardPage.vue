<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <!-- Header -->
        <div class="col-12">
          <q-card class="q-pa-lg">
            <div class="text-h4 q-mb-md">Panel de Administración</div>
            <p class="text-subtitle1 text-grey-7">
              Gestiona usuarios, solicitudes y supervisa la actividad de la plataforma.
            </p>
          </q-card>
        </div>

        <!-- Estadísticas principales -->
        <div class="col-12 col-md-3">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="people" size="2rem" color="primary" />
            <div class="text-h6 q-mt-sm">Usuarios Totales</div>
            <div class="text-h4 text-weight-bold text-primary">{{ stats.users?.total_users || 0 }}</div>
            <div class="text-caption text-grey-6">
              +{{ stats.users?.new_users_month || 0 }} este mes
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="help" size="2rem" color="orange" />
            <div class="text-h6 q-mt-sm">Solicitudes</div>
            <div class="text-h4 text-weight-bold text-orange">{{ stats.requests?.total_requests || 0 }}</div>
            <div class="text-caption text-grey-6">
              {{ stats.requests?.pending_requests || 0 }} pendientes
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="chat" size="2rem" color="blue" />
            <div class="text-h6 q-mt-sm">Mensajes</div>
            <div class="text-h4 text-weight-bold text-blue">{{ stats.messages?.total_messages || 0 }}</div>
            <div class="text-caption text-grey-6">
              {{ stats.messages?.messages_today || 0 }} hoy
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="warning" size="2rem" color="red" />
            <div class="text-h6 q-mt-sm">Alertas</div>
            <div class="text-h4 text-weight-bold text-red">{{ securityAlerts.length }}</div>
            <div class="text-caption text-grey-6">
              Requieren atención
            </div>
          </q-card>
        </div>

        <!-- Acciones rápidas -->
        <div class="col-12">
          <q-card class="q-pa-lg">
            <div class="text-h5 q-mb-md">Acciones Rápidas</div>
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  to="/app/admin/users"
                  color="primary"
                  icon="people"
                  label="Gestionar Usuarios"
                  class="full-width"
                  size="lg"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  to="/app/admin/requests"
                  color="orange"
                  icon="help"
                  label="Ver Solicitudes"
                  class="full-width"
                  size="lg"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  to="/app/admin/reports"
                  color="red"
                  icon="report"
                  label="Moderar Reportes"
                  class="full-width"
                  size="lg"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  to="/app/admin/analytics"
                  color="purple"
                  icon="analytics"
                  label="Ver Analytics"
                  class="full-width"
                  size="lg"
                />
              </div>
            </div>
          </q-card>
        </div>

        <!-- Actividad reciente -->
        <div class="col-12 col-md-8">
          <q-card class="q-pa-lg">
            <div class="text-h5 q-mb-md">Actividad Reciente</div>
            
            <q-list separator>
              <q-item v-if="!recentActivity.length">
                <q-item-section>
                  <q-item-label class="text-grey-6">No hay actividad reciente</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item v-for="activity in recentActivity" :key="activity.id">
                <q-item-section avatar>
                  <q-icon :name="getActivityIcon(activity.type)" :color="getActivityColor(activity.type)" />
                </q-item-section>
                
                <q-item-section>
                  <q-item-label>{{ activity.title }}</q-item-label>
                  <q-item-label caption>{{ activity.description }}</q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <q-item-label caption>{{ formatDate(activity.created_at) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- Alertas de seguridad -->
        <div class="col-12 col-md-4">
          <q-card class="q-pa-lg">
            <div class="text-h5 q-mb-md">Alertas de Seguridad</div>
            
            <q-list separator>
              <q-item v-if="!securityAlerts.length">
                <q-item-section>
                  <q-item-label class="text-grey-6">No hay alertas</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item v-for="alert in securityAlerts" :key="alert.id">
                <q-item-section avatar>
                  <q-icon name="warning" :color="getSeverityColor(alert.severity)" />
                </q-item-section>
                
                <q-item-section>
                  <q-item-label>{{ alert.title }}</q-item-label>
                  <q-item-label caption>{{ alert.description }}</q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    icon="more_vert"
                    size="sm"
                  >
                    <q-menu>
                      <q-list>
                        <q-item clickable @click="investigateAlert(alert)">
                          <q-item-section>Investigar</q-item-section>
                        </q-item>
                        <q-item clickable @click="dismissAlert(alert)">
                          <q-item-section>Descartar</q-item-section>
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
import { defineComponent, ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'AdminDashboardPage',
  
  setup() {
    const loading = ref(true)
    const stats = ref({})
    const recentActivity = ref([])
    const securityAlerts = ref([])
    
    const loadDashboardData = async () => {
      try {
        loading.value = true
        
        // Cargar estadísticas
        const statsResponse = await api.get('/admin/dashboard')
        if (statsResponse.data.success) {
          stats.value = statsResponse.data.stats
          recentActivity.value = statsResponse.data.recentActivity || []
        }
        
        // Cargar alertas de seguridad
        const alertsResponse = await api.get('/admin/security-alerts')
        if (alertsResponse.data.success) {
          securityAlerts.value = alertsResponse.data.alerts || []
        }
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al cargar datos del dashboard'
        })
        
        // Datos de ejemplo para desarrollo
        stats.value = {
          users: { total_users: 150, new_users_month: 25 },
          requests: { total_requests: 89, pending_requests: 12 },
          messages: { total_messages: 456, messages_today: 23 }
        }
        
        recentActivity.value = [
          {
            id: 1,
            type: 'user_registered',
            title: 'Nuevo usuario registrado',
            description: 'juan_nuevo se registró como usuario ciego',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            type: 'help_request',
            title: 'Nueva solicitud de ayuda',
            description: 'Ayuda con compras semanales',
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ]
        
        securityAlerts.value = [
          {
            id: 1,
            type: 'multiple_failed_logins',
            title: 'Múltiples intentos fallidos',
            description: 'Usuario: suspicious_user',
            severity: 'high'
          }
        ]
      } finally {
        loading.value = false
      }
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        user_registered: 'person_add',
        help_request: 'help',
        message: 'chat',
        report: 'report'
      }
      return icons[type] || 'info'
    }
    
    const getActivityColor = (type) => {
      const colors = {
        user_registered: 'green',
        help_request: 'blue',
        message: 'purple',
        report: 'red'
      }
      return colors[type] || 'grey'
    }
    
    const getSeverityColor = (severity) => {
      const colors = {
        low: 'green',
        medium: 'orange',
        high: 'red'
      }
      return colors[severity] || 'grey'
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const investigateAlert = (alert) => {
      Notify.create({
        type: 'info',
        message: 'Función de investigación en desarrollo'
      })
    }
    
    const dismissAlert = (alert) => {
      const index = securityAlerts.value.findIndex(a => a.id === alert.id)
      if (index !== -1) {
        securityAlerts.value.splice(index, 1)
        Notify.create({
          type: 'positive',
          message: 'Alerta descartada'
        })
      }
    }
    
    onMounted(() => {
      loadDashboardData()
    })
    
    return {
      loading,
      stats,
      recentActivity,
      securityAlerts,
      getActivityIcon,
      getActivityColor,
      getSeverityColor,
      formatDate,
      investigateAlert,
      dismissAlert
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
</style>