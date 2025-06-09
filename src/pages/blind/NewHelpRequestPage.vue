<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-lg">
            <h1 class="text-h4 q-mb-md">Nueva Solicitud de Ayuda</h1>
            <p class="text-subtitle1 text-grey-7">
              Describe la ayuda que necesitas y un voluntario se pondrá en contacto contigo.
            </p>
          </q-card>
        </div>
        
        <div class="col-12 col-lg-8">
          <q-card class="q-pa-lg">
            <q-form @submit="createRequest" class="q-gutter-md">
              <q-input
                v-model="form.title"
                label="Título de la solicitud"
                outlined
                :rules="[
                  val => !!val || 'El título es requerido',
                  val => val.length >= 5 || 'El título debe tener al menos 5 caracteres',
                  val => val.length <= 200 || 'El título no puede tener más de 200 caracteres'
                ]"
                hint="Ej: Ayuda con compras semanales"
                counter
                maxlength="200"
              />
              
              <q-input
                v-model="form.description"
                label="Descripción detallada"
                type="textarea"
                rows="4"
                outlined
                :rules="[
                  val => !!val || 'La descripción es requerida',
                  val => val.length >= 10 || 'La descripción debe tener al menos 10 caracteres',
                  val => val.length <= 1000 || 'La descripción no puede tener más de 1000 caracteres'
                ]"
                hint="Describe específicamente qué tipo de ayuda necesitas"
                counter
                maxlength="1000"
              />
              
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.date"
                    label="Fecha"
                    type="date"
                    outlined
                    :rules="[
                      val => !!val || 'La fecha es requerida',
                      val => new Date(val) >= new Date(today) || 'La fecha debe ser futura'
                    ]"
                    :min="today"
                  />
                </div>
                
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.time"
                    label="Hora"
                    type="time"
                    outlined
                    :rules="[val => !!val || 'La hora es requerida']"
                  />
                </div>
              </div>
              
              <q-input
                v-model="form.location"
                label="Ubicación"
                outlined
                :rules="[
                  val => !!val || 'La ubicación es requerida',
                  val => val.length >= 5 || 'La ubicación debe tener al menos 5 caracteres',
                  val => val.length <= 255 || 'La ubicación no puede tener más de 255 caracteres'
                ]"
                hint="Dirección o punto de encuentro"
                counter
                maxlength="255"
              />
              
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.priority"
                    :options="priorityOptions"
                    label="Prioridad"
                    outlined
                    emit-value
                    map-options
                  />
                </div>
                
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="form.estimated_duration"
                    label="Duración estimada (minutos)"
                    type="number"
                    outlined
                    min="15"
                    max="480"
                    :rules="[
                      val => val === null || val === '' || (val >= 15 && val <= 480) || 'La duración debe estar entre 15 y 480 minutos'
                    ]"
                    hint="Entre 15 minutos y 8 horas (opcional)"
                  />
                </div>
              </div>
              
              <q-input
                v-model="form.notes"
                label="Notas adicionales (opcional)"
                type="textarea"
                rows="2"
                outlined
                :rules="[
                  val => !val || val.length <= 500 || 'Las notas no pueden tener más de 500 caracteres'
                ]"
                hint="Información adicional que pueda ser útil para el voluntario"
                counter
                maxlength="500"
              />
              
              <div class="q-mt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Crear Solicitud"
                  :loading="loading"
                  size="lg"
                  class="q-mr-md"
                />
                
                <q-btn
                  to="/app/blind/help-requests"
                  outline
                  color="grey-7"
                  label="Cancelar"
                  size="lg"
                />
              </div>
            </q-form>
          </q-card>
        </div>
        
        <div class="col-12 col-lg-4">
          <q-card class="q-pa-lg">
            <h2 class="text-h6 q-mb-md">Consejos para tu solicitud</h2>
            
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="lightbulb" color="amber" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Sé específico</q-item-label>
                  <q-item-label caption>
                    Describe claramente qué tipo de ayuda necesitas
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon name="schedule" color="blue" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Planifica con tiempo</q-item-label>
                  <q-item-label caption>
                    Crea tu solicitud con al menos 24 horas de anticipación
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon name="location_on" color="red" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Ubicación clara</q-item-label>
                  <q-item-label caption>
                    Proporciona una dirección específica o punto de referencia
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon name="phone" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Mantente disponible</q-item-label>
                  <q-item-label caption>
                    Asegúrate de estar disponible para coordinar con el voluntario
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
          
          <!-- Debug info (solo en desarrollo) -->
          <q-card v-if="$q.dev" class="q-pa-md q-mt-md">
            <h3 class="text-h6 q-mb-md">Debug Info</h3>
            <pre class="text-caption">{{ JSON.stringify(form, null, 2) }}</pre>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHelpRequestsStore } from 'src/stores/helpRequests'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'NewHelpRequestPage',
  
  setup() {
    const router = useRouter()
    const helpRequestsStore = useHelpRequestsStore()
    
    const loading = ref(false)
    
    const form = ref({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      priority: 'medium',
      estimated_duration: null,
      notes: ''
    })
    
    const priorityOptions = [
      { label: 'Baja', value: 'low' },
      { label: 'Media', value: 'medium' },
      { label: 'Alta', value: 'high' }
    ]
    
    const today = computed(() => {
      const date = new Date()
      return date.toISOString().split('T')[0]
    })
    
    const createRequest = async () => {
      loading.value = true
      
      try {
        console.log('📝 Enviando solicitud:', form.value)
        
        // Preparar datos para envío
        const requestData = {
          title: form.value.title.trim(),
          description: form.value.description.trim(),
          date: form.value.date,
          time: form.value.time,
          location: form.value.location.trim(),
          priority: form.value.priority,
          estimated_duration: form.value.estimated_duration || null,
          notes: form.value.notes.trim() || null
        }
        
        console.log('📤 Datos preparados:', requestData)
        
        const success = await helpRequestsStore.createRequest(requestData)
        
        if (success) {
          Notify.create({
            type: 'positive',
            message: 'Solicitud creada correctamente'
          })
          
          router.push('/app/blind/help-requests')
        }
      } catch (error) {
        console.error('❌ Error creating request:', error)
        
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Error al crear la solicitud'
        })
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      priorityOptions,
      today,
      createRequest
    }
  }
})
</script>
