<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <!-- Cabecera con botón de volver -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row items-center">
              <q-btn
                flat
                round
                icon="arrow_back"
                color="primary"
                @click="goBack"
                class="q-mr-sm"
              />
              <h1 class="text-h4 q-my-none">Perfil de Voluntario</h1>
            </div>
          </q-card>
        </div>
        
        <!-- Loading state -->
        <template v-if="loading">
          <div class="col-12">
            <q-card class="q-pa-xl text-center">
              <q-spinner size="50px" color="primary" />
              <div class="text-h6 q-mt-md">Cargando perfil...</div>
            </q-card>
          </div>
        </template>
        
        <!-- Error state -->
        <template v-else-if="error">
          <div class="col-12">
            <q-card class="q-pa-xl text-center">
              <q-icon name="error" size="50px" color="negative" />
              <div class="text-h6 q-mt-md">Error al cargar el perfil</div>
              <p class="text-body1 q-mt-md">{{ error }}</p>
              <q-btn
                color="primary"
                label="Reintentar"
                @click="loadVolunteerProfile"
                class="q-mt-md"
              />
            </q-card>
          </div>
        </template>
        
        <!-- Volunteer profile -->
        <template v-else-if="volunteer">
          <!-- Profile header -->
          <div class="col-12 col-md-4">
            <q-card class="q-pa-lg text-center">
              <q-avatar size="150px" class="q-mb-md">
                <img :src="volunteer.profile_image || defaultAvatar" :alt="volunteer.name">
              </q-avatar>
              
              <h2 class="text-h5 q-mb-xs">{{ volunteer.name || volunteer.username }}</h2>
              <div class="text-subtitle1 text-grey-7 q-mb-md">@{{ volunteer.username }}</div>
              
              <div class="q-mb-md">
                <q-rating
                  v-model="volunteer.avg_rating"
                  readonly
                  size="md"
                  color="amber"
                />
                <div class="text-body2 q-mt-xs">
                  {{ volunteer.avg_rating ? volunteer.avg_rating.toFixed(1) : '0.0' }} 
                  ({{ volunteer.review_count || 0 }} reseñas)
                </div>
              </div>
              
              <div class="row q-col-gutter-sm q-mt-md">
                <div class="col-12">
                  <q-btn
                    color="primary"
                    icon="chat"
                    label="Contactar"
                    class="full-width"
                    @click="openContactDialog"
                    :loading="sendingMessage"
                  />
                </div>
                
                <div class="col-12">
                  <q-btn
                    outline
                    color="primary"
                    icon="help"
                    label="Solicitar ayuda"
                    class="full-width"
                    to="/app/blind/help-requests/new"
                  />
                </div>
              </div>
            </q-card>
          </div>
          
          <!-- Profile details -->
          <div class="col-12 col-md-8">
            <q-card class="q-pa-lg">
              <h3 class="text-h6 q-mb-md">Información del Voluntario</h3>
              
              <div v-if="volunteer.bio" class="q-mb-lg">
                <div class="text-subtitle1 text-weight-medium q-mb-sm">Biografía</div>
                <p class="text-body1">{{ volunteer.bio }}</p>
              </div>
              
              <div v-if="volunteer.availability" class="q-mb-lg">
                <div class="text-subtitle1 text-weight-medium q-mb-sm">Disponibilidad</div>
                <p class="text-body1">{{ volunteer.availability }}</p>
              </div>
              
              <div class="q-mb-lg">
                <div class="text-subtitle1 text-weight-medium q-mb-sm">Estadísticas</div>
                <div class="row q-col-gutter-md">
                  <div class="col-6 col-md-3">
                    <div class="text-h5 text-primary">{{ volunteer.stats?.completed || 0 }}</div>
                    <div class="text-caption">Ayudas completadas</div>
                  </div>
                  
                  <div class="col-6 col-md-3">
                    <div class="text-h5 text-amber">{{ volunteer.avg_rating?.toFixed(1) || '0.0' }}</div>
                    <div class="text-caption">Calificación media</div>
                  </div>
                  
                  <div class="col-6 col-md-3">
                    <div class="text-h5 text-green">{{ volunteer.stats?.acceptance_rate || '0%' }}</div>
                    <div class="text-caption">Tasa de aceptación</div>
                  </div>
                  
                  <div class="col-6 col-md-3">
                    <div class="text-h5 text-blue">{{ volunteer.stats?.response_time || 'N/A' }}</div>
                    <div class="text-caption">Tiempo de respuesta</div>
                  </div>
                </div>
              </div>
              
              <div class="q-mb-lg">
                <div class="text-subtitle1 text-weight-medium q-mb-sm">Especialidades</div>
                <div class="row q-col-gutter-sm">
                  <div v-for="(specialty, index) in volunteer.specialties || defaultSpecialties" :key="index" class="col-auto">
                    <q-chip
                      color="primary"
                      text-color="white"
                      size="md"
                    >
                      {{ specialty }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-card>
            
            <!-- Reviews -->
            <q-card class="q-pa-lg q-mt-md">
              <div class="row items-center justify-between q-mb-md">
                <h3 class="text-h6 q-my-none">Reseñas</h3>
                <q-btn
                  outline
                  color="primary"
                  label="Ver todas"
                  size="sm"
                  v-if="(volunteer.reviews || []).length > 3"
                />
              </div>
              
              <div v-if="!volunteer.reviews || volunteer.reviews.length === 0" class="text-center q-py-lg">
                <q-icon name="star_border" size="3rem" color="grey-5" />
                <div class="text-h6 q-mt-md">Sin reseñas</div>
                <p class="text-body2 text-grey-6">
                  Este voluntario aún no tiene reseñas
                </p>
              </div>
              
              <q-list separator v-else>
                <q-item v-for="review in volunteer.reviews.slice(0, 3)" :key="review.id" class="q-py-md">
                  <q-item-section avatar top>
                    <q-avatar>
                      <img :src="review.reviewer_avatar || defaultAvatar" :alt="review.reviewer_name">
                    </q-avatar>
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ review.reviewer_name }}</q-item-label>
                    <q-item-label caption>{{ formatDate(review.created_at) }}</q-item-label>
                    
                    <div class="q-mt-sm">
                      <q-rating
                        v-model="review.rating"
                        readonly
                        size="sm"
                        color="amber"
                      />
                    </div>
                    
                    <q-item-label class="q-mt-sm">{{ review.comment }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Contact Dialog -->
    <q-dialog v-model="contactDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Contactar a {{ volunteer?.name || volunteer?.username }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="sendMessage" class="q-gutter-md">
            <q-input
              v-model="messageForm.subject"
              label="Asunto"
              outlined
              :rules="[val => !!val || 'El asunto es requerido']"
            />
            
            <q-input
              v-model="messageForm.content"
              label="Mensaje"
              type="textarea"
              rows="4"
              outlined
              :rules="[val => !!val || 'El mensaje es requerido']"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn 
            flat 
            label="Enviar" 
            color="primary" 
            @click="sendMessage" 
            :loading="sendingMessage"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from 'src/stores/chat'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'VolunteerDetailPage',
  
  setup() {
    const route = useRoute()
    const router = useRouter()
    const chatStore = useChatStore()
    
    const loading = ref(true)
    const error = ref(null)
    const volunteer = ref(null)
    const defaultAvatar = 'https://cdn.quasar.dev/img/boy-avatar.png'
    const contactDialog = ref(false)
    const sendingMessage = ref(false)
    
    const messageForm = ref({
      subject: '',
      content: ''
    })
    
    const volunteerId = computed(() => route.params.id)
    
    const defaultSpecialties = [
      'Acompañamiento',
      'Compras',
      'Lectura',
      'Trámites'
    ]
    
    const loadVolunteerProfile = async () => {
      loading.value = true
      error.value = null
      
      try {
        // En un caso real, haríamos una llamada a la API
        // const response = await api.get(`/users/volunteers/${volunteerId.value}`)
        
        // Simulamos una respuesta exitosa
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Datos de ejemplo
        volunteer.value = {
          id: volunteerId.value,
          username: "maria_voluntaria",
          name: "María García",
          bio: "Me encanta ayudar a las personas. Tengo experiencia en acompañamiento y compras. Soy paciente y empática, y me gusta contribuir a mejorar la calidad de vida de las personas con discapacidad visual.",
          availability: "Lunes a Viernes: 9:00-18:00, Sábados: 10:00-14:00",
          avg_rating: 4.8,
          review_count: 15,
          profile_image: null,
          stats: {
            completed: 23,
            acceptance_rate: "95%",
            response_time: "< 1h"
          },
          specialties: [
            "Acompañamiento",
            "Compras",
            "Lectura",
            "Trámites administrativos"
          ],
          reviews: [
            {
              id: 1,
              reviewer_name: "Juan Pérez",
              reviewer_avatar: null,
              rating: 5,
              comment: "María es una excelente voluntaria. Muy puntual y amable. Me ayudó muchísimo con las compras.",
              created_at: "2024-01-10T15:30:00Z"
            },
            {
              id: 2,
              reviewer_name: "Carlos Rodríguez",
              reviewer_avatar: null,
              rating: 5,
              comment: "Increíble persona, me ayudó más de lo esperado. Definitivamente la recomiendo.",
              created_at: "2024-01-05T14:20:00Z"
            },
            {
              id: 3,
              reviewer_name: "Ana Martínez",
              reviewer_avatar: null,
              rating: 4,
              comment: "Muy buena experiencia, aunque llegó un poco tarde. Pero fue muy servicial y amable.",
              created_at: "2023-12-20T10:15:00Z"
            }
          ]
        }
      } catch (err) {
        console.error('Error loading volunteer profile:', err)
        error.value = 'No se pudo cargar el perfil del voluntario'
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const goBack = () => {
      router.back()
    }
    
    const openContactDialog = () => {
      contactDialog.value = true
      messageForm.value = {
        subject: `Contacto con ${volunteer.value?.name || volunteer.value?.username}`,
        content: ''
      }
    }
    
    const sendMessage = async () => {
      if (!messageForm.value.subject || !messageForm.value.content) {
        Notify.create({
          type: 'negative',
          message: 'Por favor completa todos los campos'
        })
        return
      }
      
      sendingMessage.value = true
      
      try {
        // Enviar mensaje usando el store de chat
        const message = await chatStore.sendMessage(
          null, // No hay conversación existente
          `${messageForm.value.subject}\n\n${messageForm.value.content}`,
          volunteerId.value
        )
        
        if (message) {
          Notify.create({
            type: 'positive',
            message: 'Mensaje enviado correctamente'
          })
          
          contactDialog.value = false
          
          // Redirigir al chat después de un breve delay
          setTimeout(() => {
            router.push('/app/chat')
          }, 1000)
        }
      } catch (err) {
        console.error('Error sending message:', err)
        
        Notify.create({
          type: 'negative',
          message: 'Error al enviar el mensaje'
        })
      } finally {
        sendingMessage.value = false
      }
    }
    
    onMounted(() => {
      loadVolunteerProfile()
    })
    
    return {
      loading,
      error,
      volunteer,
      defaultAvatar,
      defaultSpecialties,
      contactDialog,
      messageForm,
      sendingMessage,
      formatDate,
      goBack,
      loadVolunteerProfile,
      openContactDialog,
      sendMessage
    }
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
