<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-lg">
            <h1 class="text-h4 q-mb-md">Mis Reseñas</h1>
            <p class="text-subtitle1 text-grey-7">
              Ve las reseñas y calificaciones que has recibido
            </p>
          </q-card>
        </div>
        
        <!-- Stats Overview -->
        <div class="col-12 col-md-4">
          <q-card class="q-pa-lg text-center">
            <div class="text-h2 text-weight-bold text-primary q-mb-sm">
              {{ averageRating }}
            </div>
            <q-rating
              v-model="averageRating"
              readonly
              size="lg"
              color="amber"
              class="q-mb-sm"
            />
            <div class="text-h6">Calificación promedio</div>
            <div class="text-body2 text-grey-6">
              Basado en {{ totalReviews }} reseña{{ totalReviews !== 1 ? 's' : '' }}
            </div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-8">
          <q-card class="q-pa-lg">
            <h2 class="text-h6 q-mb-md">Distribución de calificaciones</h2>
            
            <div v-for="star in 5" :key="star" class="row items-center q-mb-sm">
              <div class="col-auto q-mr-md" style="width: 60px;">
                <div class="row items-center">
                  <span class="q-mr-xs">{{ 6 - star }}</span>
                  <q-icon name="star" color="amber" size="sm" />
                </div>
              </div>
              
              <div class="col">
                <q-linear-progress
                  :value="getRatingPercentage(6 - star)"
                  color="amber"
                  size="md"
                  class="q-mr-md"
                />
              </div>
              
              <div class="col-auto" style="width: 40px;">
                <span class="text-body2">{{ getRatingCount(6 - star) }}</span>
              </div>
            </div>
          </q-card>
        </div>
        
        <!-- Filters -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="ratingFilter"
                  :options="ratingFilterOptions"
                  label="Filtrar por calificación"
                  outlined
                  clearable
                  emit-value
                  map-options
                />
              </div>
              
              <div class="col-12 col-md-4">
                <q-input
                  v-model="searchQuery"
                  label="Buscar en comentarios"
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
                  @click="refreshReviews"
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
        
        <!-- Reviews List -->
        <div class="col-12">
          <q-card>
            <q-list separator>
              <q-item v-if="loading" class="q-py-lg">
                <q-item-section>
                  <div class="text-center">
                    <q-spinner size="40px" color="primary" />
                    <div class="q-mt-md">Cargando reseñas...</div>
                  </div>
                </q-item-section>
              </q-item>
              
              <q-item v-else-if="!filteredReviews.length" class="q-py-lg">
                <q-item-section class="text-center">
                  <q-icon name="star_border" size="3rem" color="grey-5" />
                  <div class="text-h6 q-mt-md">No hay reseñas</div>
                  <div class="text-body2 text-grey-6">
                    {{ hasFilters ? 'No se encontraron reseñas con esos criterios' : 'Aún no has recibido reseñas' }}
                  </div>
                </q-item-section>
              </q-item>
              
              <q-item
                v-for="review in filteredReviews"
                :key="review.id"
                class="review-item q-pa-md"
              >
                <q-item-section avatar top>
                  <q-avatar size="50px">
                    <img :src="review.reviewer_avatar || defaultAvatar" :alt="review.reviewer_name">
                  </q-avatar>
                </q-item-section>
                
                <q-item-section>
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="col">
                      <q-item-label class="text-weight-medium">
                        {{ review.reviewer_name || 'Usuario anónimo' }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ formatDate(review.created_at) }}
                      </q-item-label>
                    </div>
                    
                    <div class="col-auto">
                      <q-rating
                        v-model="review.rating"
                        readonly
                        size="sm"
                        color="amber"
                      />
                    </div>
                  </div>
                  
                  <div v-if="review.comment" class="text-body2 q-mb-sm">
                    {{ review.comment }}
                  </div>
                  
                  <div v-if="review.help_request_title" class="text-caption text-grey-6">
                    <q-icon name="help" size="xs" class="q-mr-xs" />
                    Relacionado con: {{ review.help_request_title }}
                  </div>
                </q-item-section>
                
                <q-item-section side top>
                  <q-btn
                    flat
                    round
                    icon="more_vert"
                    size="sm"
                  >
                    <q-menu>
                      <q-list>
                        <q-item clickable @click="reportReview(review.id)">
                          <q-item-section>Reportar reseña</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
        
        <!-- Load More Button -->
        <div v-if="hasMore && !loading" class="col-12 text-center">
          <q-btn
            @click="loadMore"
            color="primary"
            outline
            label="Cargar más reseñas"
            :loading="loadingMore"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth'
import { Notify, Dialog } from 'quasar'

export default defineComponent({
  name: 'ReviewsPage',
  
  setup() {
    const authStore = useAuthStore()
    
    const loading = ref(false)
    const loadingMore = ref(false)
    const reviews = ref([])
    const ratingFilter = ref('')
    const searchQuery = ref('')
    const hasMore = ref(false)
    
    const defaultAvatar = 'https://cdn.quasar.dev/img/boy-avatar.png'
    
    const ratingFilterOptions = [
      { label: '5 estrellas', value: 5 },
      { label: '4 estrellas', value: 4 },
      { label: '3 estrellas', value: 3 },
      { label: '2 estrellas', value: 2 },
      { label: '1 estrella', value: 1 }
    ]
    
    const hasFilters = computed(() => ratingFilter.value || searchQuery.value)
    
    const filteredReviews = computed(() => {
      let filtered = reviews.value
      
      if (ratingFilter.value) {
        filtered = filtered.filter(review => review.rating === ratingFilter.value)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(review => 
          review.comment?.toLowerCase().includes(query) ||
          review.reviewer_name?.toLowerCase().includes(query)
        )
      }
      
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })
    
    const totalReviews = computed(() => reviews.value.length)
    
    const averageRating = computed(() => {
      if (reviews.value.length === 0) return 0
      
      const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
      return Number((sum / reviews.value.length).toFixed(1))
    })
    
    const getRatingCount = (rating) => {
      return reviews.value.filter(review => review.rating === rating).length
    }
    
    const getRatingPercentage = (rating) => {
      if (totalReviews.value === 0) return 0
      return getRatingCount(rating) / totalReviews.value
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const fetchReviews = async () => {
      loading.value = true
      
      try {
        const response = await api.get(`/reviews/volunteer/${authStore.user.id}`)
        
        if (response.data.success) {
          reviews.value = response.data.reviews || []
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        
        Notify.create({
          type: 'negative',
          message: 'Error al cargar reseñas'
        })
        
        // Mock data for development
        reviews.value = [
          {
            id: 1,
            rating: 5,
            comment: 'Excelente voluntario, muy puntual y amable. Me ayudó muchísimo con las compras.',
            reviewer_name: 'Juan Pérez',
            reviewer_avatar: null,
            help_request_title: 'Ayuda con compras semanales',
            created_at: '2024-01-10T15:30:00Z'
          },
          {
            id: 2,
            rating: 4,
            comment: 'Muy buena experiencia, aunque llegó un poco tarde. Pero fue muy servicial.',
            reviewer_name: 'María González',
            reviewer_avatar: null,
            help_request_title: 'Acompañamiento médico',
            created_at: '2024-01-08T10:15:00Z'
          },
          {
            id: 3,
            rating: 5,
            comment: 'Increíble persona, me ayudó más de lo esperado. Definitivamente lo recomiendo.',
            reviewer_name: 'Carlos Rodríguez',
            reviewer_avatar: null,
            help_request_title: 'Lectura de documentos',
            created_at: '2024-01-05T14:20:00Z'
          }
        ]
      } finally {
        loading.value = false
      }
    }
    
    const refreshReviews = () => {
      fetchReviews()
    }
    
    const loadMore = () => {
      // TODO: Implement pagination
      loadingMore.value = true
      setTimeout(() => {
        loadingMore.value = false
      }, 1000)
    }
    
    const reportReview = (reviewId) => {
      Dialog.create({
        title: 'Reportar reseña',
        message: '¿Por qué quieres reportar esta reseña?',
        prompt: {
          model: '',
          type: 'textarea',
          placeholder: 'Describe el motivo del reporte...'
        },
        cancel: true,
        persistent: true
      }).onOk(async (reason) => {
        try {
          // TODO: Implement report API
          Notify.create({
            type: 'positive',
            message: 'Reporte enviado correctamente'
          })
        } catch (error) {
          console.error('Error reporting review:', error)
        }
      })
    }
    
    onMounted(() => {
      fetchReviews()
    })
    
    return {
      loading,
      loadingMore,
      ratingFilter,
      searchQuery,
      ratingFilterOptions,
      filteredReviews,
      totalReviews,
      averageRating,
      hasFilters,
      hasMore,
      defaultAvatar,
      getRatingCount,
      getRatingPercentage,
      formatDate,
      refreshReviews,
      loadMore,
      reportReview
    }
  }
})
</script>

<style scoped>
.review-item:hover {
  background-color: rgba(0,0,0,0.02);
}
</style>
