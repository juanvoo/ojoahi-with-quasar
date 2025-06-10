<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="text-h5 q-mb-md">Mis Reseñas</div>
            <p class="text-subtitle1 text-grey-7">
              Reseñas que has dado a voluntarios que te han ayudado.
            </p>
          </q-card>
        </div>

        <!-- Filtros -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="filters.search"
                  label="Buscar por voluntario"
                  outlined
                  dense
                  clearable
                  @input="filterReviews"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-4">
                <q-select
                  v-model="filters.rating"
                  :options="ratingOptions"
                  label="Filtrar por calificación"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterReviews"
                />
              </div>
              
              <div class="col-12 col-md-4">
                <q-btn
                  color="primary"
                  icon="add"
                  label="Nueva Reseña"
                  @click="openNewReviewDialog"
                />
              </div>
            </div>
          </q-card>
        </div>

        <!-- Lista de Reseñas -->
        <div class="col-12">
          <q-card>
            <q-card-section v-if="loading" class="text-center">
              <q-spinner size="50px" color="primary" />
              <div class="text-h6 q-mt-md">Cargando reseñas...</div>
            </q-card-section>

            <q-card-section v-else-if="filteredReviews.length === 0" class="text-center q-py-xl">
              <q-icon name="star_border" size="4rem" color="grey-5" />
              <div class="text-h6 q-mt-md">No hay reseñas</div>
              <p class="text-body1 text-grey-6">
                Aún no has dado reseñas a voluntarios.
              </p>
              <q-btn
                color="primary"
                label="Dar Primera Reseña"
                @click="openNewReviewDialog"
                class="q-mt-md"
              />
            </q-card-section>

            <q-list separator v-else>
              <q-item v-for="review in filteredReviews" :key="review.id" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar size="60px">
                    <img :src="review.volunteer_avatar || defaultAvatar" :alt="review.volunteer_name">
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-h6">{{ review.volunteer_name }}</q-item-label>
                  <q-item-label caption class="text-body2">{{ formatDate(review.created_at) }}</q-item-label>
                  
                  <div class="q-mt-sm">
                    <q-rating
                      v-model="review.rating"
                      readonly
                      size="md"
                      color="amber"
                    />
                  </div>
                  
                  <q-item-label class="q-mt-sm">{{ review.comment }}</q-item-label>
                  
                  <div class="q-mt-sm">
                    <q-chip
                      :color="getServiceTypeColor(review.service_type)"
                      text-color="white"
                      size="sm"
                    >
                      {{ review.service_type || 'Ayuda general' }}
                    </q-chip>
                  </div>
                </q-item-section>

                <q-item-section side>
                  <div class="column q-gutter-sm">
                    <q-btn
                      flat
                      round
                      icon="edit"
                      color="primary"
                      @click="editReview(review)"
                    />
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      @click="deleteReview(review)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog para Nueva/Editar Reseña -->
    <q-dialog v-model="reviewDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingReview ? 'Editar Reseña' : 'Nueva Reseña' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveReview" class="q-gutter-md">
            <q-select
              v-if="!editingReview"
              v-model="reviewForm.volunteer_id"
              :options="volunteerOptions"
              option-value="id"
              option-label="name"
              label="Seleccionar Voluntario"
              outlined
              :rules="[val => !!val || 'Selecciona un voluntario']"
            />

            <q-rating
              v-model="reviewForm.rating"
              size="2rem"
              color="amber"
              :max="5"
            />
            <div class="text-caption">Calificación: {{ reviewForm.rating }}/5</div>

            <q-select
              v-model="reviewForm.service_type"
              :options="serviceTypeOptions"
              label="Tipo de servicio"
              outlined
            />

            <q-input
              v-model="reviewForm.comment"
              label="Comentario"
              type="textarea"
              rows="4"
              outlined
              :rules="[val => !!val || 'El comentario es requerido']"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn 
            flat 
            :label="editingReview ? 'Actualizar' : 'Guardar'" 
            color="primary" 
            @click="saveReview" 
            :loading="savingReview"
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
  name: 'ReviewsPage',
  
  setup() {
    const loading = ref(true)
    const reviews = ref([])
    const filteredReviews = ref([])
    const reviewDialog = ref(false)
    const editingReview = ref(null)
    const savingReview = ref(false)
    const volunteerOptions = ref([])
    const defaultAvatar = 'https://cdn.quasar.dev/img/boy-avatar.png'
    
    const filters = ref({
      search: '',
      rating: null
    })
    
    const reviewForm = ref({
      volunteer_id: null,
      rating: 5,
      comment: '',
      service_type: ''
    })
    
    const ratingOptions = [
      { label: '5 estrellas', value: 5 },
      { label: '4 estrellas', value: 4 },
      { label: '3 estrellas', value: 3 },
      { label: '2 estrellas', value: 2 },
      { label: '1 estrella', value: 1 }
    ]
    
    const serviceTypeOptions = [
      'Acompañamiento',
      'Compras',
      'Lectura',
      'Navegación',
      'Trámites',
      'Transporte',
      'Otro'
    ]
    
    const loadReviews = async () => {
      try {
        loading.value = true
        const response = await api.get('/reviews/my-reviews')
        
        if (response.data.success) {
          reviews.value = response.data.reviews
          filteredReviews.value = reviews.value
        }
      } catch (error) {
        console.error('Error loading reviews:', error)
        // Datos de ejemplo
        reviews.value = [
          {
            id: 1,
            volunteer_name: 'María García',
            volunteer_avatar: null,
            rating: 5,
            comment: 'Excelente voluntaria, muy amable y puntual. Me ayudó muchísimo con las compras.',
            service_type: 'Compras',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            volunteer_name: 'Carlos Rodríguez',
            volunteer_avatar: null,
            rating: 4,
            comment: 'Muy buen servicio, aunque llegó un poco tarde. Pero fue muy servicial.',
            service_type: 'Acompañamiento',
            created_at: '2024-01-10T14:20:00Z'
          }
        ]
        filteredReviews.value = reviews.value
      } finally {
        loading.value = false
      }
    }
    
    const loadVolunteers = async () => {
      try {
        const response = await api.get('/users/volunteers')
        
        if (response.data.success) {
          volunteerOptions.value = response.data.volunteers.map(volunteer => ({
            id: volunteer.id,
            name: volunteer.name || volunteer.username
          }))
        }
      } catch (error) {
        console.error('Error loading volunteers:', error)
        // Datos de ejemplo
        volunteerOptions.value = [
          { id: 1, name: 'María García' },
          { id: 2, name: 'Carlos Rodríguez' },
          { id: 3, name: 'Ana Martínez' }
        ]
      }
    }
    
    const filterReviews = () => {
      let filtered = reviews.value
      
      if (filters.value.search) {
        filtered = filtered.filter(review =>
          review.volunteer_name.toLowerCase().includes(filters.value.search.toLowerCase())
        )
      }
      
      if (filters.value.rating) {
        filtered = filtered.filter(review => review.rating === filters.value.rating.value)
      }
      
      filteredReviews.value = filtered
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const getServiceTypeColor = (serviceType) => {
      const colors = {
        'Acompañamiento': 'blue',
        'Compras': 'green',
        'Lectura': 'purple',
        'Navegación': 'orange',
        'Trámites': 'red',
        'Transporte': 'teal'
      }
      return colors[serviceType] || 'grey'
    }
    
    const openNewReviewDialog = () => {
      editingReview.value = null
      reviewForm.value = {
        volunteer_id: null,
        rating: 5,
        comment: '',
        service_type: ''
      }
      reviewDialog.value = true
    }
    
    const editReview = (review) => {
      editingReview.value = review
      reviewForm.value = {
        volunteer_id: review.volunteer_id,
        rating: review.rating,
        comment: review.comment,
        service_type: review.service_type
      }
      reviewDialog.value = true
    }
    
    const saveReview = async () => {
      if (!reviewForm.value.comment || !reviewForm.value.rating) {
        Notify.create({
          type: 'negative',
          message: 'Por favor completa todos los campos requeridos'
        })
        return
      }
      
      try {
        savingReview.value = true
        
        let response
        if (editingReview.value) {
          response = await api.put(`/reviews/${editingReview.value.id}`, reviewForm.value)
        } else {
          response = await api.post('/reviews', reviewForm.value)
        }
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: editingReview.value ? 'Reseña actualizada correctamente' : 'Reseña creada correctamente'
          })
          
          reviewDialog.value = false
          await loadReviews()
        }
      } catch (error) {
        console.error('Error saving review:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al guardar la reseña'
        })
      } finally {
        savingReview.value = false
      }
    }
    
    const deleteReview = (review) => {
      Dialog.create({
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que quieres eliminar esta reseña?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          const response = await api.delete(`/reviews/${review.id}`)
          
          if (response.data.success) {
            Notify.create({
              type: 'positive',
              message: 'Reseña eliminada correctamente'
            })
            
            await loadReviews()
          }
        } catch (error) {
          console.error('Error deleting review:', error)
          Notify.create({
            type: 'negative',
            message: 'Error al eliminar la reseña'
          })
        }
      })
    }
    
    onMounted(async () => {
      await loadReviews()
      await loadVolunteers()
    })
    
    return {
      loading,
      filteredReviews,
      filters,
      ratingOptions,
      serviceTypeOptions,
      reviewDialog,
      editingReview,
      reviewForm,
      savingReview,
      volunteerOptions,
      defaultAvatar,
      filterReviews,
      formatDate,
      getServiceTypeColor,
      openNewReviewDialog,
      editReview,
      saveReview,
      deleteReview
    }
  }
})
</script>
