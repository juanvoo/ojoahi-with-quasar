<template>
  <q-dialog v-model="showPanel" persistent>
    <q-card style="min-width: 400px; max-width: 500px;">
      <q-card-section class="row items-center">
        <div class="text-h6">Configuración de Accesibilidad</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-gutter-md">
          <!-- Controles de Lectura de Pantalla -->
          <div class="accessibility-section">
            <h3 class="text-subtitle1 q-mb-md">Lectura de Pantalla</h3>
            
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-btn
                  color="primary"
                  icon="play_arrow"
                  label="Leer Página"
                  @click="screenReader.readPageTitle()"
                  :disable="!screenReader.isEnabled"
                  class="full-width"
                />
              </div>
              <div class="col-6">
                <q-btn
                  color="secondary"
                  icon="stop"
                  label="Detener"
                  @click="screenReader.stop()"
                  :disable="!screenReader.isReading"
                  class="full-width"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-btn
                  outline
                  color="primary"
                  icon="format_list_numbered"
                  label="Encabezados"
                  @click="screenReader.readHeadings()"
                  :disable="!screenReader.isEnabled"
                  class="full-width"
                />
              </div>
              <div class="col-6">
                <q-btn
                  outline
                  color="primary"
                  icon="map"
                  label="Navegación"
                  @click="screenReader.readLandmarks()"
                  :disable="!screenReader.isEnabled"
                  class="full-width"
                />
              </div>
            </div>
          </div>

          <!-- Configuración de Voz -->
          <div class="accessibility-section">
            <h3 class="text-subtitle1 q-mb-md">Configuración de Voz</h3>
            
            <q-select
              v-model="selectedVoice"
              :options="voiceOptions"
              option-label="name"
              option-value="voice"
              label="Voz"
              outlined
              dense
              @update:model-value="onVoiceChange"
              class="q-mb-md"
            />

            <div class="q-mb-md">
              <label class="text-body2">Velocidad: {{ screenReader.voiceSettings.rate.toFixed(1) }}</label>
              <q-slider
                v-model="screenReader.voiceSettings.rate"
                :min="0.5"
                :max="2"
                :step="0.1"
                @update:model-value="screenReader.setRate"
                color="primary"
                class="q-mt-sm"
              />
            </div>

            <div class="q-mb-md">
              <label class="text-body2">Tono: {{ screenReader.voiceSettings.pitch.toFixed(1) }}</label>
              <q-slider
                v-model="screenReader.voiceSettings.pitch"
                :min="0.5"
                :max="2"
                :step="0.1"
                @update:model-value="screenReader.setPitch"
                color="primary"
                class="q-mt-sm"
              />
            </div>

            <div class="q-mb-md">
              <label class="text-body2">Volumen: {{ Math.round(screenReader.voiceSettings.volume * 100) }}%</label>
              <q-slider
                v-model="screenReader.voiceSettings.volume"
                :min="0"
                :max="1"
                :step="0.1"
                @update:model-value="screenReader.setVolume"
                color="primary"
                class="q-mt-sm"
              />
            </div>

            <q-btn
              outline
              color="primary"
              icon="record_voice_over"
              label="Probar Voz"
              @click="testVoice"
              :disable="!screenReader.isEnabled"
              class="full-width"
            />
          </div>

          <!-- Atajos de Teclado -->
          <div class="accessibility-section">
            <h3 class="text-subtitle1 q-mb-md">Atajos de Teclado</h3>
            
            <div class="keyboard-shortcuts">
              <div class="shortcut-item">
                <kbd>Ctrl + Shift + R</kbd>
                <span>Leer elemento enfocado</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl + Shift + S</kbd>
                <span>Detener lectura</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl + Shift + P</kbd>
                <span>Pausar/Reanudar</span>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useScreenReader } from 'src/composables/useScreenReader'

export default defineComponent({
  name: 'AccessibilityPanel',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const screenReader = useScreenReader()
    const selectedVoice = ref(null)
    const voiceOptions = ref([])

    const showPanel = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const loadVoices = () => {
      const voices = screenReader.getVoices()
      voiceOptions.value = voices.map(voice => ({
        name: `${voice.name} (${voice.lang})`,
        voice: voice
      }))

      // Seleccionar voz actual
      if (screenReader.voiceSettings.voice) {
        selectedVoice.value = voiceOptions.value.find(
          option => option.voice.voiceURI === screenReader.voiceSettings.voice.voiceURI
        )
      }
    }

    const onVoiceChange = (option) => {
      if (option && option.voice) {
        screenReader.setVoice(option.voice)
      }
    }

    const testVoice = () => {
      screenReader.speak('Esta es una prueba de la configuración de voz actual.')
    }

    // Cargar voces cuando se abra el panel
    watch(showPanel, (isOpen) => {
      if (isOpen) {
        setTimeout(loadVoices, 100)
      }
    })

    onMounted(() => {
      // Cargar voces después de un delay para asegurar que estén disponibles
      setTimeout(loadVoices, 500)
      
      // Recargar voces cuando cambien (algunos navegadores las cargan de forma asíncrona)
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    })

    return {
      showPanel,
      screenReader,
      selectedVoice,
      voiceOptions,
      onVoiceChange,
      testVoice
    }
  }
})
</script>

<style scoped>
.accessibility-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.keyboard-shortcuts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

kbd {
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
}
</style>