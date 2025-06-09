<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <!-- Welcome Section -->
        <div class="col-12">
          <q-card class="welcome-card q-pa-lg">
            <div class="row items-center">
              <div class="col">
                <h1 class="text-h4 q-mb-sm">¡Bienvenido, {{ username }}!</h1>
                <p class="text-subtitle1 text-grey-7">
                  {{ welcomeMessage }}
                </p>
              </div>
              <div class="col-auto">
                <q-avatar size="80px">
                  <img :src="userAvatar" alt="Avatar">
                </q-avatar>
              </div>
            </div>
          </q-card>
        </div>

        <!-- Quick Stats -->
        <div class="col-12 col-md-4" v-if="isBlind">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="help" size="2rem" color="primary" />
            <div class="text-h6 q-mt-sm">Mis Solicitudes</div>
            <div class="text-h4 text-weight-bold text-primary">{{ stats.requests || 0 }}</div>
          </q-card>
        </div>

        <div class="col-12 col-md-4" v-if="isVolunteer">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="volunteer_activism" size="2rem" color="green" />
            <div class="text-h6 q-mt-sm">Ayudas Realizadas</div>
            <div class="text-h4 text-weight-bold text-green">{{ stats.completed || 0 }}</div>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="chat" size="2rem" color="orange" />
            <div class="text-h6 q-mt-sm">Mensajes</div>
            <div class="text-h4 text-weight-bold text-orange">{{ unreadMessages }}</div>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="stat-card q-pa-md text-center">
            <q-icon name="star" size="2rem" color="amber" />
            <div class="text-h6 q-mt-sm">Calificación</div>
            <div class="text-h4 text-weight-bold text-amber">{{ stats.rating || '0.0' }}</div>
          </q-card>
        </div>

        <!-- Quick Actions -->
        <div class="col-12">
          <q-card class="q-pa-lg">
            <h2 class="text-h5 q-mb-md">Acciones Rápidas</h2>
            
            <div class="row q-col-gutter-md">
              <template v-if="isBlind">
                <div class="col-12 col-sm-6 col-md-3">
                  <q-btn
                    to="/app/blind/help-requests/new"
                    color="primary"
                    icon="add_circle"
                    label="Nueva Solicitud"
                    class="full-width"
                    size="lg"
                  />
                </div>
                
                <div class="col-12 col-sm-6 col-md-3">
                  <q-btn
                    to="/app/blind/help-requests"
                    outline
                    color="primary"
                    icon="list"
                    label="Mis Solicitudes"
                    class="full-width"
                    size="lg"
                  />
                </div>
                
                <div class="col-12 col-sm-6 col-md-3">
                  <q-btn
                    to="/app/blind/volunteers"
                    outline
                    color="secondary"
                    icon="people"
                    label="Ver Voluntarios"
                    class="full-width"
                    size="lg"
                  />
                </div>
              </template>
              
              <template v-if="isVolunteer">
                <div class="col-12 col-sm-6 col-md-3">
                  <q-btn
                    to="/app/volunteer/available-requests"
                    color="primary"
                    icon="search"
                    label="Buscar Ayudas"
                    class="full-width"
                    size="lg"
                  />
                </div>
                
                <div class="col-12 col-sm-6 col-md-3">
                  <q-btn
                    to="/app/volunteer/my-reservations"
                    outline
                    color="primary"
                    icon="event"
                    label="Mis Reservas"
                    class="full-width"
                    size="lg"
                  />
                </div>
              </template>
              
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  to="/app/chat"
                  outline
                  color="orange"
                  icon="chat"
                  label="Mensajes"
                  class="full-width"
                  size="lg"
                />
              </div>
              
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  to="/app/profile"
                  outline
                  color="grey-7"
                  icon="person"
                  label="Mi Perfil"
                  class="full-width"
                  size="lg"
                />
              </div>
            </div>
          </q-card>
        </div>

        <!-- Recent Activity -->
        <div class="col-12">
          <q-card class="q-pa-lg">
            <h2 class="text-h5 q-mb-md">Actividad Reciente</h2>
            
            <q-list separator>
              <q-item v-if="!recentActivity.length">
                <q-item-section>
                  <q-item-label class="text-grey-6">No hay actividad reciente</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item v-for="activity in recentActivity" :key="activity.id">
                <q-item-section avatar>
                  <q-icon :name="activity.icon" :color="activity.color" />
                </q-item-section>
                
                <q-item-section>
                  <q-item-label>{{ activity.title }}</q-item-label>
                  <q-item-label caption>{{ activity.description }}</q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <q-item-label caption>{{ activity.time }}</q-item-label>
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
import { useAuthStore } from 'src/stores/auth'
import { useChatStore } from 'src/stores/chat'

export default defineComponent({
  name: 'DashboardPage',
  
  setup() {
    const authStore = useAuthStore()
    const chatStore = useChatStore()
    
    const stats = ref({
      requests: 0,
      completed: 0,
      rating: '0.0'
    })
    
    const recentActivity = ref([])
    
    const isBlind = computed(() => authStore.isBlind)
    const isVolunteer = computed(() => authStore.isVolunteer)
    const username = computed(() => authStore.user?.username || 'Usuario')
    const unreadMessages = computed(() => chatStore.unreadCount)
    
    const userAvatar = computed(() => {
      if (authStore.user?.profile_image) {
        return authStore.user.profile_image
      }
      return 'https://cdn.quasar.dev/img/boy-avatar.png'
    })
    
    const welcomeMessage = computed(() => {
      if (isBlind.value) {
        return 'Aquí puedes gestionar tus solicitudes de ayuda y conectar con voluntarios.'
      } else if (isVolunteer.value) {
        return 'Gracias por ser parte de nuestra comunidad de voluntarios.'
      }
      return 'Bienvenido a tu panel de control.'
    })
    
    onMounted(() => {
      // Simular carga de estadísticas
      if (isBlind.value) {
        stats.value = {
          requests: 3,
          rating: '4.8'
        }
        
        recentActivity.value = [
          {
            id: 1,
            icon: 'help',
            color: 'primary',
            title: 'Nueva solicitud creada',
            description: 'Ayuda con compras semanales',
            time: 'Hace 2 horas'
          },
          {
            id: 2,
            icon: 'check_circle',
            color: 'green',
            title: 'Solicitud completada',
            description: 'Acompañamiento médico',
            time: 'Ayer'
          }
        ]
      } else if (isVolunteer.value) {
        stats.value = {
          completed: 12,
          rating: '4.9'
        }
        
        recentActivity.value = [
          {
            id: 1,
            icon: 'volunteer_activism',
            color: 'green',
            title: 'Ayuda completada',
            description: 'Compras en supermercado',
            time: 'Hace 1 hora'
          },
          {
            id: 2,
            icon: 'star',
            color: 'amber',
            title: 'Nueva reseña recibida',
            description: 'Calificación: 5 estrellas',
            time: 'Hace 3 horas'
          }
        ]
      }
    })
    
    return {
      isBlind,
      isVolunteer,
      username,
      userAvatar,
      welcomeMessage,
      unreadMessages,
      stats,
      recentActivity
    }
  }
})
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
</style>
