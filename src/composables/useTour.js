import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'

export function useTour() {
  const authStore = useAuthStore()
  const router = useRouter()
  const isActive = ref(false)
  const currentStep = ref(0)
  const tourData = ref(null)

  // Configuración de tours por rol
  const tourConfigs = {
    blind: {
      id: 'blind-user-tour',
      title: 'Bienvenido a OjoAhi',
      description: 'Te guiaremos por las principales funciones de la plataforma',
      steps: [
        {
          element: '[data-tour="dashboard"]',
          title: 'Panel Principal',
          description: 'Aquí puedes ver un resumen de tus solicitudes y actividad reciente. Usa Ctrl+Shift+R para que el lector de pantalla lea cualquier elemento.',
          position: 'bottom'
        },
        {
          element: '[data-tour="new-request"]',
          title: 'Nueva Solicitud',
          description: 'Haz clic aquí para crear una nueva solicitud de ayuda. Puedes pedir ayuda para compras, acompañamiento, lectura de documentos y más.',
          position: 'bottom'
        },
        {
          element: '[data-tour="my-requests"]',
          title: 'Mis Solicitudes',
          description: 'Aquí puedes ver y gestionar todas tus solicitudes de ayuda, tanto pendientes como completadas.',
          position: 'bottom'
        },
        {
          element: '[data-tour="volunteers"]',
          title: 'Voluntarios',
          description: 'Explora los perfiles de voluntarios disponibles y contacta directamente con ellos.',
          position: 'bottom'
        },
        {
          element: '[data-tour="chat"]',
          title: 'Mensajes',
          description: 'Comunícate con voluntarios a través del sistema de mensajería integrado.',
          position: 'bottom'
        },
        {
          element: '[data-tour="accessibility"]',
          title: 'Accesibilidad',
          description: 'Tienes acceso a herramientas de lectura de pantalla. Usa Ctrl+Shift+S para detener la lectura, Ctrl+Shift+P para pausar.',
          position: 'top'
        }
      ]
    },
    volunteer: {
      id: 'volunteer-tour',
      title: 'Bienvenido Voluntario',
      description: 'Descubre cómo puedes ayudar a nuestra comunidad',
      steps: [
        {
          element: '[data-tour="dashboard"]',
          title: 'Panel de Voluntario',
          description: 'Aquí puedes ver tus estadísticas como voluntario y las ayudas que has realizado.',
          position: 'bottom'
        },
        {
          element: '[data-tour="available-requests"]',
          title: 'Solicitudes Disponibles',
          description: 'Encuentra solicitudes de ayuda que puedes aceptar según tu disponibilidad y ubicación.',
          position: 'bottom'
        },
        {
          element: '[data-tour="my-reservations"]',
          title: 'Mis Reservas',
          description: 'Gestiona las solicitudes que has aceptado y mantén un seguimiento de tus compromisos.',
          position: 'bottom'
        },
        {
          element: '[data-tour="reviews"]',
          title: 'Mis Reseñas',
          description: 'Ve las reseñas y calificaciones que has recibido de las personas que has ayudado.',
          position: 'bottom'
        },
        {
          element: '[data-tour="chat"]',
          title: 'Comunicación',
          description: 'Mantente en contacto con las personas que ayudas a través del chat integrado.',
          position: 'bottom'
        }
      ]
    },
    admin: {
      id: 'admin-tour',
      title: 'Panel de Administración',
      description: 'Gestiona la plataforma y supervisa la actividad',
      steps: [
        {
          element: '[data-tour="admin-dashboard"]',
          title: 'Dashboard Administrativo',
          description: 'Supervisa las estadísticas generales de la plataforma y la actividad de usuarios.',
          position: 'bottom'
        },
        {
          element: '[data-tour="user-management"]',
          title: 'Gestión de Usuarios',
          description: 'Administra usuarios, verifica cuentas y gestiona permisos.',
          position: 'bottom'
        },
        {
          element: '[data-tour="monitoring"]',
          title: 'Monitorización',
          description: 'Supervisa el rendimiento del sistema y revisa logs de actividad.',
          position: 'bottom'
        }
      ]
    }
  }

  const startTour = (forceStart = false) => {
    if (!authStore.isAuthenticated) return

    const userRole = authStore.user.role
    const tourConfig = tourConfigs[userRole]
    
    if (!tourConfig) return

    // Verificar si el usuario ya ha visto el tour
    const tourKey = `tour_completed_${tourConfig.id}_${authStore.user.id}`
    const hasSeenTour = localStorage.getItem(tourKey)

    if (hasSeenTour && !forceStart) return

    tourData.value = tourConfig
    currentStep.value = 0
    isActive.value = true

    // Crear overlay y elementos del tour
    createTourElements()
  }

  const createTourElements = () => {
    // Crear overlay
    const overlay = document.createElement('div')
    overlay.id = 'tour-overlay'
    overlay.className = 'tour-overlay'
    overlay.innerHTML = `
      <div class="tour-backdrop"></div>
      <div class="tour-spotlight"></div>
      <div class="tour-popup">
        <div class="tour-header">
          <h3 class="tour-title"></h3>
          <button class="tour-close" aria-label="Cerrar tour">&times;</button>
        </div>
        <div class="tour-content">
          <p class="tour-description"></p>
        </div>
        <div class="tour-footer">
          <div class="tour-progress">
            <span class="tour-step-counter"></span>
            <div class="tour-progress-bar">
              <div class="tour-progress-fill"></div>
            </div>
          </div>
          <div class="tour-buttons">
            <button class="tour-btn tour-btn-prev">Anterior</button>
            <button class="tour-btn tour-btn-next">Siguiente</button>
            <button class="tour-btn tour-btn-finish" style="display: none;">Finalizar</button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    // Agregar estilos
    addTourStyles()

    // Configurar eventos
    setupTourEvents()

    // Mostrar primer paso
    showStep(0)
  }

  const addTourStyles = () => {
    if (document.getElementById('tour-styles')) return

    const styles = document.createElement('style')
    styles.id = 'tour-styles'
    styles.textContent = `
      .tour-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        pointer-events: none;
      }

      .tour-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        pointer-events: auto;
      }

      .tour-spotlight {
        position: absolute;
        border: 3px solid #1976D2;
        border-radius: 8px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .tour-popup {
        position: absolute;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 350px;
        min-width: 300px;
        pointer-events: auto;
        z-index: 10001;
      }

      .tour-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px 0;
      }

      .tour-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #1976D2;
      }

      .tour-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tour-close:hover {
        color: #333;
      }

      .tour-content {
        padding: 15px 20px;
      }

      .tour-description {
        margin: 0;
        line-height: 1.5;
        color: #333;
      }

      .tour-footer {
        padding: 0 20px 20px;
      }

      .tour-progress {
        margin-bottom: 15px;
      }

      .tour-step-counter {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 8px;
        display: block;
      }

      .tour-progress-bar {
        width: 100%;
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
      }

      .tour-progress-fill {
        height: 100%;
        background: #1976D2;
        transition: width 0.3s ease;
      }

      .tour-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }

      .tour-btn {
        padding: 8px 16px;
        border: 1px solid #1976D2;
        border-radius: 6px;
        background: white;
        color: #1976D2;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
      }

      .tour-btn:hover {
        background: #1976D2;
        color: white;
      }

      .tour-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .tour-btn-next, .tour-btn-finish {
        background: #1976D2;
        color: white;
      }

      .tour-btn-next:hover, .tour-btn-finish:hover {
        background: #1565C0;
      }

      .tour-highlighted {
        position: relative;
        z-index: 10002 !important;
      }

      @media (max-width: 768px) {
        .tour-popup {
          max-width: 90vw;
          min-width: 280px;
        }
      }
    `

    document.head.appendChild(styles)
  }

  const setupTourEvents = () => {
    const overlay = document.getElementById('tour-overlay')
    if (!overlay) return

    // Botón cerrar
    overlay.querySelector('.tour-close').addEventListener('click', endTour)

    // Botón anterior
    overlay.querySelector('.tour-btn-prev').addEventListener('click', () => {
      if (currentStep.value > 0) {
        showStep(currentStep.value - 1)
      }
    })

    // Botón siguiente
    overlay.querySelector('.tour-btn-next').addEventListener('click', () => {
      if (currentStep.value < tourData.value.steps.length - 1) {
        showStep(currentStep.value + 1)
      }
    })

    // Botón finalizar
    overlay.querySelector('.tour-btn-finish').addEventListener('click', endTour)

    // Cerrar con Escape
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        endTour()
      }
    }

    document.addEventListener('keydown', handleKeydown)

    // Guardar referencia para cleanup
    overlay._keydownHandler = handleKeydown
  }

  const showStep = (stepIndex) => {
    if (!tourData.value || stepIndex < 0 || stepIndex >= tourData.value.steps.length) return

    currentStep.value = stepIndex
    const step = tourData.value.steps[stepIndex]
    const overlay = document.getElementById('tour-overlay')
    
    if (!overlay) return

    // Actualizar contenido
    overlay.querySelector('.tour-title').textContent = step.title
    overlay.querySelector('.tour-description').textContent = step.description
    overlay.querySelector('.tour-step-counter').textContent = 
      `Paso ${stepIndex + 1} de ${tourData.value.steps.length}`

    // Actualizar barra de progreso
    const progress = ((stepIndex + 1) / tourData.value.steps.length) * 100
    overlay.querySelector('.tour-progress-fill').style.width = `${progress}%`

    // Actualizar botones
    const prevBtn = overlay.querySelector('.tour-btn-prev')
    const nextBtn = overlay.querySelector('.tour-btn-next')
    const finishBtn = overlay.querySelector('.tour-btn-finish')

    prevBtn.disabled = stepIndex === 0
    
    if (stepIndex === tourData.value.steps.length - 1) {
      nextBtn.style.display = 'none'
      finishBtn.style.display = 'inline-block'
    } else {
      nextBtn.style.display = 'inline-block'
      finishBtn.style.display = 'none'
    }

    // Posicionar spotlight y popup
    positionTourElements(step)

    // Scroll al elemento si es necesario
    scrollToElement(step.element)
  }

  const positionTourElements = (step) => {
    const element = document.querySelector(step.element)
    const overlay = document.getElementById('tour-overlay')
    
    if (!element || !overlay) return

    const spotlight = overlay.querySelector('.tour-spotlight')
    const popup = overlay.querySelector('.tour-popup')
    
    // Remover highlight anterior
    document.querySelectorAll('.tour-highlighted').forEach(el => {
      el.classList.remove('tour-highlighted')
    })

    // Agregar highlight al elemento actual
    element.classList.add('tour-highlighted')

    const rect = element.getBoundingClientRect()
    const padding = 8

    // Posicionar spotlight
    spotlight.style.left = `${rect.left - padding}px`
    spotlight.style.top = `${rect.top - padding}px`
    spotlight.style.width = `${rect.width + padding * 2}px`
    spotlight.style.height = `${rect.height + padding * 2}px`

    // Posicionar popup
    const popupRect = popup.getBoundingClientRect()
    let popupLeft, popupTop

    switch (step.position) {
      case 'top':
        popupLeft = rect.left + (rect.width / 2) - (popupRect.width / 2)
        popupTop = rect.top - popupRect.height - 20
        break
      case 'bottom':
        popupLeft = rect.left + (rect.width / 2) - (popupRect.width / 2)
        popupTop = rect.bottom + 20
        break
      case 'left':
        popupLeft = rect.left - popupRect.width - 20
        popupTop = rect.top + (rect.height / 2) - (popupRect.height / 2)
        break
      case 'right':
        popupLeft = rect.right + 20
        popupTop = rect.top + (rect.height / 2) - (popupRect.height / 2)
        break
      default:
        popupLeft = rect.left + (rect.width / 2) - (popupRect.width / 2)
        popupTop = rect.bottom + 20
    }

    // Ajustar si se sale de la pantalla
    const margin = 20
    popupLeft = Math.max(margin, Math.min(window.innerWidth - popupRect.width - margin, popupLeft))
    popupTop = Math.max(margin, Math.min(window.innerHeight - popupRect.height - margin, popupTop))

    popup.style.left = `${popupLeft}px`
    popup.style.top = `${popupTop}px`
  }

  const scrollToElement = (selector) => {
    const element = document.querySelector(selector)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }

  const endTour = () => {
    isActive.value = false
    currentStep.value = 0

    // Remover elementos del DOM
    const overlay = document.getElementById('tour-overlay')
    if (overlay) {
      // Remover event listener
      if (overlay._keydownHandler) {
        document.removeEventListener('keydown', overlay._keydownHandler)
      }
      overlay.remove()
    }

    // Remover estilos
    const styles = document.getElementById('tour-styles')
    if (styles) {
      styles.remove()
    }

    // Remover highlights
    document.querySelectorAll('.tour-highlighted').forEach(el => {
      el.classList.remove('tour-highlighted')
    })

    // Marcar tour como completado
    if (tourData.value && authStore.user) {
      const tourKey = `tour_completed_${tourData.value.id}_${authStore.user.id}`
      localStorage.setItem(tourKey, 'true')
    }

    tourData.value = null
  }

  const resetTour = () => {
    if (tourData.value && authStore.user) {
      const tourKey = `tour_completed_${tourData.value.id}_${authStore.user.id}`
      localStorage.removeItem(tourKey)
    }
  }

  return {
    isActive,
    currentStep,
    tourData,
    startTour,
    endTour,
    resetTour
  }
}