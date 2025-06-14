import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'

export function useScreenReader() {
  const authStore = useAuthStore()
  const isEnabled = ref(false)
  const isReading = ref(false)
  const currentText = ref('')
  const speechSynthesis = ref(null)
  const currentUtterance = ref(null)
  
  // Configuración de voz
  const voiceSettings = ref({
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null
  })

  const init = () => {
    if (!authStore.isBlind) return
    
    if ('speechSynthesis' in window) {
      speechSynthesis.value = window.speechSynthesis
      isEnabled.value = true
      
      // Cargar configuración guardada
      loadSettings()
      
      // Configurar eventos de teclado
      setupKeyboardShortcuts()
      
      console.log('✅ Sistema de lectura de pantalla inicializado')
    } else {
      console.warn('⚠️ Speech Synthesis no está disponible en este navegador')
    }
  }

  const speak = (text, options = {}) => {
    if (!isEnabled.value || !speechSynthesis.value || !text) return

    // Detener lectura actual si existe
    stop()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Aplicar configuración
    utterance.rate = options.rate || voiceSettings.value.rate
    utterance.pitch = options.pitch || voiceSettings.value.pitch
    utterance.volume = options.volume || voiceSettings.value.volume
    
    if (voiceSettings.value.voice) {
      utterance.voice = voiceSettings.value.voice
    }

    // Eventos
    utterance.onstart = () => {
      isReading.value = true
      currentText.value = text
    }

    utterance.onend = () => {
      isReading.value = false
      currentText.value = ''
      currentUtterance.value = null
    }

    utterance.onerror = (event) => {
      console.error('Error en speech synthesis:', event)
      isReading.value = false
      currentText.value = ''
    }

    currentUtterance.value = utterance
    speechSynthesis.value.speak(utterance)
  }

  const stop = () => {
    if (speechSynthesis.value) {
      speechSynthesis.value.cancel()
      isReading.value = false
      currentText.value = ''
      currentUtterance.value = null
    }
  }

  const pause = () => {
    if (speechSynthesis.value && isReading.value) {
      speechSynthesis.value.pause()
    }
  }

  const resume = () => {
    if (speechSynthesis.value) {
      speechSynthesis.value.resume()
    }
  }

  const getVoices = () => {
    if (!speechSynthesis.value) return []
    return speechSynthesis.value.getVoices()
  }

  const setVoice = (voice) => {
    voiceSettings.value.voice = voice
    saveSettings()
  }

  const setRate = (rate) => {
    voiceSettings.value.rate = Math.max(0.1, Math.min(10, rate))
    saveSettings()
  }

  const setPitch = (pitch) => {
    voiceSettings.value.pitch = Math.max(0, Math.min(2, pitch))
    saveSettings()
  }

  const setVolume = (volume) => {
    voiceSettings.value.volume = Math.max(0, Math.min(1, volume))
    saveSettings()
  }

  const saveSettings = () => {
    const settings = {
      rate: voiceSettings.value.rate,
      pitch: voiceSettings.value.pitch,
      volume: voiceSettings.value.volume,
      voiceURI: voiceSettings.value.voice?.voiceURI || null
    }
    localStorage.setItem('screenReaderSettings', JSON.stringify(settings))
  }

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('screenReaderSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        voiceSettings.value.rate = settings.rate || 1
        voiceSettings.value.pitch = settings.pitch || 1
        voiceSettings.value.volume = settings.volume || 1
        
        // Buscar la voz guardada
        if (settings.voiceURI) {
          const voices = getVoices()
          const savedVoice = voices.find(v => v.voiceURI === settings.voiceURI)
          if (savedVoice) {
            voiceSettings.value.voice = savedVoice
          }
        }
      }
    } catch (error) {
      console.error('Error cargando configuración de lectura:', error)
    }
  }

  const setupKeyboardShortcuts = () => {
    const handleKeydown = (event) => {
      // Ctrl + Shift + S: Detener lectura
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault()
        stop()
        return
      }

      // Ctrl + Shift + P: Pausar/Reanudar
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault()
        if (isReading.value) {
          pause()
        } else {
          resume()
        }
        return
      }

      // Ctrl + Shift + R: Leer elemento enfocado
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault()
        readFocusedElement()
        return
      }
    }

    document.addEventListener('keydown', handleKeydown)
    
    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }

  const readFocusedElement = () => {
    const focused = document.activeElement
    if (!focused) return

    let textToRead = ''

    // Obtener texto del elemento
    if (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA') {
      const label = document.querySelector(`label[for="${focused.id}"]`)
      if (label) {
        textToRead += label.textContent + '. '
      }
      textToRead += `Campo de entrada. Valor actual: ${focused.value || 'vacío'}`
    } else if (focused.tagName === 'BUTTON') {
      textToRead = `Botón: ${focused.textContent || focused.getAttribute('aria-label') || 'sin etiqueta'}`
    } else if (focused.tagName === 'A') {
      textToRead = `Enlace: ${focused.textContent || focused.getAttribute('aria-label') || 'sin texto'}`
    } else {
      textToRead = focused.textContent || focused.getAttribute('aria-label') || 'Elemento sin texto'
    }

    if (textToRead) {
      speak(textToRead)
    }
  }

  const readPageTitle = () => {
    const title = document.title
    if (title) {
      speak(`Página: ${title}`)
    }
  }

  const readHeadings = () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    if (headings.length === 0) {
      speak('No se encontraron encabezados en esta página')
      return
    }

    let headingsText = 'Encabezados de la página: '
    headings.forEach((heading, index) => {
      headingsText += `${heading.tagName} ${heading.textContent}. `
    })

    speak(headingsText)
  }

  const readLandmarks = () => {
    const landmarks = document.querySelectorAll('[role], nav, main, aside, header, footer')
    if (landmarks.length === 0) {
      speak('No se encontraron puntos de referencia en esta página')
      return
    }

    let landmarksText = 'Puntos de referencia: '
    landmarks.forEach((landmark) => {
      const role = landmark.getAttribute('role') || landmark.tagName.toLowerCase()
      const label = landmark.getAttribute('aria-label') || ''
      landmarksText += `${role} ${label}. `
    })

    speak(landmarksText)
  }

  onMounted(() => {
    init()
  })

  return {
    isEnabled,
    isReading,
    currentText,
    voiceSettings,
    speak,
    stop,
    pause,
    resume,
    getVoices,
    setVoice,
    setRate,
    setPitch,
    setVolume,
    readFocusedElement,
    readPageTitle,
    readHeadings,
    readLandmarks
  }
}