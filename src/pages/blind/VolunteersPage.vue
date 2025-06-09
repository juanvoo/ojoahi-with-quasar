<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-lg">
            <h1 class="text-h4 q-mb-md">Voluntarios Disponibles</h1>
            <p class="text-subtitle1 text-grey-7">
              Conoce a los voluntarios de nuestra comunidad y sus especialidades
            </p>
          </q-card>
        </div>
        
        <!-- Search and Filters -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="searchQuery"
                  label="Buscar voluntarios"
                  outlined
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-3">
                <q-select
                  v-model="ratingFilter"
                  :options="ratingOptions"
                  label="Calificación mínima"
                  outlined
                  clearable
                  emit-value
                  map-options
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-btn
                  @click="refreshVolunteers"
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
        
        <!-- Volunteers Grid -->
        <div class="col-12">
          <div class="row q-col-gutter-md">
            <div v-if="loading" class="col-12">
              <q-card class="q-pa-xl text-center">
                <q-spinner size="40px" color="primary" />
                <div class="q-mt-md">Cargando voluntarios...</div>
              </q-card>
            </div>
            
            <div v-else-if="!filteredVolunteers.length" class="col-12">
              <q-card class="q-pa-xl text-center">
                <q-icon name="people" size="4rem" color="grey-5" />
                <h2 class="text-h5 q-mt-md">No hay voluntarios disponibles</h2>
                <p class="text-body1 text-grey-6">
                  {{ searchQuery ? 'No se encontraron voluntarios con esos criterios' : 'Aún no hay voluntarios registrados' }}
                </p>
              </q-card>
            </div>
            
            <div
              v-for="volunteer in filteredVolunteers"
              :key="volunteer.id"
              class="col-12 col-sm-6 col-lg-4"
            >
              <q-card class="volunteer-card full-height">
                <q-card-section class="text-center q-pb-none">
                  <q-avatar size="80px" class="q-mb-md">
                    <img :src="volunteer.profile_image || defaultAvatar" :alt="volunteer.name">
                  </q-avatar>
                  
                  <h3 class="text-h6 q-mb-xs">{{ volunteer.name || volunteer.username }}</h3>
                  <div class="text-subtitle2 text-grey-6">@{{ volunteer.username }}</div>
                  
                  <div class="q-mt-sm">
                    <q-rating
                      v-model="volunteer.avg_rating"
                      readonly
                      size="sm"
                      color="amber"
                    />
                    <div class="text-caption text-grey-6">
                      {{ volunteer.avg_rating ? volunteer.avg_rating.toFixed(1) : '0.0' }} 
                      ({{ volunteer.review_count || 0 }} reseñas)
                    </div>
                  </div>
                </q-card-section>
                
                <q-card-section>
                  <div v-if="volunteer.bio" class="text-body2 text-grey-8 q-mb-md">
                    {{ volunteer.bio }}
                  </div>
                  
                  <div v-if="volunteer.availability" class="q-mb-md">
                    <div class="text-weight-medium text-grey-8 q-mb-xs">
                      <q-icon name="schedule" size="sm" class="q-mr-xs" />
                      Disponibilidad:
                    </div>
                    <div class="text-body2 text-grey-7">
                      {{ volunteer.availability }}
                    </div>
                  </div>
                  
                  <div class="row q-gutter-xs">
                    <q-chip
                      color="primary"
                      text-color="white"
                      size="sm"
                      icon="volunteer_activism"
                    >
                      Voluntario
                    </q-chip>
                    
                    <q-chip
                      v-if="volunteer.avg_rating >= 4.5"
                      color="amber"
                      text-color="white"
                      size="sm"
                      icon="star"
                    >
                      Top Rated
                    </q-chip>
                  </div>
                </q-card-section>
                
                <q-card-actions class="q-pa-md">
                  <q-btn
                    @click="viewVolunteer(volunteer.id)"
                    color="primary"
                    outline
                    label="Ver Perfil"
                    class="full-width q-mb-sm"
                  />
                  
                  <q-btn
                    @click="contactVolunteer(volunteer.id)"
                    color="secondary"
                    label="Contactar"
                    icon="chat"
                    class="full-width"
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
            label="Cargar más voluntarios"
            :loading="loadingMore"
          />
        </div>
      </div>
    </div>
    
    <!-- Contact Dialog -->
    <q-dialog v-model="contactDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Contactar a {{ selectedVolunteer?.name || selectedVolunteer?.username }}</div>
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
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'VolunteersPage',
  
  setup() {
    const router = useRouter()
    
    const loading = ref(false)
    const loadingMore = ref(false)
    const volunteers = ref([])
    const searchQuery = ref('')
    const ratingFilter = ref('')
    const hasMore = ref(false)
    const page = ref(1)
    const contactDialog = ref(false)
    const selectedVolunteer = ref(null)
    const sendingMessage = ref(false)
    
    const messageForm = ref({
      subject: '',
      content: ''
    })
    
    const defaultAvatar = 'https://cdn.quasar.dev/img/boy-avatar.png'
    
    const ratingOptions = [
      { label: '4+ estrellas', value: 4 },
      { label: '4.5+ estrellas', value: 4.5 },
      { label: '5 estrellas', value: 5 }
    ]
    
    const filteredVolunteers = computed(() => {
      let filtered = volunteers.value
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(volunteer => 
          volunteer.name?.toLowerCase().includes(query) ||
          volunteer.username.toLowerCase().includes(query) ||
          volunteer.bio?.toLowerCase().includes(query)
        )
      }
      
      if (ratingFilter.value) {
        filtered = filtered.filter(volunteer => 
          (volunteer.avg_rating || 0) >= ratingFilter.value
        )
      }
      
      return filtered.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    })
    
    const fetchVolunteers = async (reset = false) => {
      try {
        if (reset) {
          loading.value = true
          page.value = 1
        } else {
          loadingMore.value = true
        }
        
        const response = await api.get('/users/volunteers', {
          params: {
            page: page.value,
            limit: 12
          }
        })
        
        if (response.data.success) {
          if (reset) {
            volunteers.value = response.data.volunteers || []
          } else {
            volunteers.value.push(...(response.data.volunteers || []))
          }
          
          hasMore.value = response.data.hasMore || false
        }
      } catch (error) {
        console.error('Error fetching volunteers:', error)
        
        Notify.create({
          type: 'negative',
          message: 'Error al cargar voluntarios'
        })
        
        // Mock data for development
        if (reset) {
          volunteers.value = [
            {
              id: 1,
              username: 'maria_voluntaria',
              name: 'María García',
              bio: 'Me encanta ayudar a las personas. Tengo experiencia en acompañamiento y compras.',
              availability: 'Lunes a Viernes: 9:00-18:00, Sábados: 10:00-14:00',
              avg_rating: 4.8,
              review_count: 15,
              profile_image: null
            },
            {
              id: 2,
              username: 'carlos_helper',
              name: 'Carlos Rodríguez',
              bio: 'Voluntario desde hace 2 años. Especializado en trámites y gestiones.',
              availability: 'Tardes y fines de semana',
              avg_rating: 4.9,
              review_count: 23,
              profile_image: null
            },
            {
              id: 3,
              username: 'ana_support',
              name: 'Ana López',
              bio: 'Psicóloga voluntaria. Ofrezco apoyo emocional y acompañamiento.',
              availability: 'Flexible, previa coordinación',
              avg_rating: 5.0,
              review_count: 8,
              profile_image: null
            }
          ]
        }
      } finally {
        loading.value = false
        loadingMore.value = false
      }
    }
    
    const refreshVolunteers = () => {
      fetchVolunteers(true)
    }
    
    const loadMore = () => {
      page.value++
      fetchVolunteers(false)
    }
    
    const viewVolunteer = (id) => {
      router.push(`/app/blind/volunteers/${id}`)
    }
    
    const contactVolunteer = (id) => {
      selectedVolunteer.value = volunteers.value.find(v => v.id === id)
      
      if (selectedVolunteer.value) {
        contactDialog.value = true
        messageForm.value = {
          subject: `Contacto con ${selectedVolunteer.value.name || selectedVolunteer.value.username}`,
          content: ''
        }
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
        // En un caso real, haríamos una llamada a la API
        // await api.post('/chat/start', {
        //   receiver_id: selectedVolunteer.value.id,
        //   subject: messageForm.value.subject,
        //   content: messageForm.value.content
        // })
        
        // Simulamos una respuesta exitosa
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        Notify.create({
          type: 'positive',
          message: 'Mensaje enviado correctamente'
        })
        
        contactDialog.value = false
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
      fetchVolunteers(true)
    })
    
    return {
      loading,
      loadingMore,
      searchQuery,
      ratingFilter,
      ratingOptions,
      filteredVolunteers,
      hasMore,
      defaultAvatar,
      contactDialog,
      selectedVolunteer,
      messageForm,
      sendingMessage,
      refreshVolunteers,
      loadMore,
      viewVolunteer,
      contactVolunteer,
      sendMessage
    }
  }
})
</script>

<style scoped>
.volunteer-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.volunteer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
</style>
