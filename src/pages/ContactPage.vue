<template>
  <q-page class="flex flex-center">
    <div class="page-container">
      <div class="text-center q-mb-xl">
        <h1 class="text-h2 text-weight-bold q-mb-md">Contacto</h1>
        <p class="text-h6 text-grey-7">
          ¿Tienes alguna pregunta? Estamos aquí para ayudarte
        </p>
      </div>

      <div class="row q-gutter-lg">
        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg">
            <h2 class="text-h5 q-mb-md">Envíanos un mensaje</h2>
            
            <q-form @submit="onSubmit" class="q-gutter-md">
              <q-input
                v-model="form.name"
                label="Nombre completo"
                outlined
                :rules="[val => !!val || 'El nombre es requerido']"
              />
              
              <q-input
                v-model="form.email"
                label="Email"
                type="email"
                outlined
                :rules="[val => !!val || 'El email es requerido']"
              />
              
              <q-input
                v-model="form.subject"
                label="Asunto"
                outlined
                :rules="[val => !!val || 'El asunto es requerido']"
              />
              
              <q-input
                v-model="form.message"
                label="Mensaje"
                type="textarea"
                rows="5"
                outlined
                :rules="[val => !!val || 'El mensaje es requerido']"
              />
              
              <q-btn
                type="submit"
                color="primary"
                label="Enviar mensaje"
                class="full-width"
                :loading="loading"
              />
            </q-form>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg">
            <h2 class="text-h5 q-mb-md">Información de contacto</h2>
            
            <div class="q-gutter-md">
              <div class="row items-center">
                <q-icon name="email" size="24px" color="primary" class="q-mr-md" />
                <div>
                  <div class="text-weight-bold">Email</div>
                  <div>contacto@ojoahi.com</div>
                </div>
              </div>
              
              <div class="row items-center">
                <q-icon name="phone" size="24px" color="primary" class="q-mr-md" />
                <div>
                  <div class="text-weight-bold">Teléfono</div>
                  <div>+34 900 123 456</div>
                </div>
              </div>
              
              <div class="row items-center">
                <q-icon name="location_on" size="24px" color="primary" class="q-mr-md" />
                <div>
                  <div class="text-weight-bold">Dirección</div>
                  <div>Calle de la Inclusión, 123<br>28001 Madrid, España</div>
                </div>
              </div>
              
              <div class="row items-center">
                <q-icon name="schedule" size="24px" color="primary" class="q-mr-md" />
                <div>
                  <div class="text-weight-bold">Horario de atención</div>
                  <div>Lunes a Viernes: 9:00 - 18:00<br>Sábados: 10:00 - 14:00</div>
                </div>
              </div>
            </div>
          </q-card>

          <q-card class="q-pa-lg q-mt-md">
            <h2 class="text-h5 q-mb-md">Preguntas frecuentes</h2>
            
            <q-expansion-item
              icon="help"
              label="¿Cómo me registro en la plataforma?"
              class="q-mb-sm"
            >
              <div class="q-pa-md">
                Puedes registrarte haciendo clic en el botón "Registrarse" y seleccionando 
                si eres una persona con discapacidad visual o un voluntario.
              </div>
            </q-expansion-item>
            
            <q-expansion-item
              icon="help"
              label="¿Es gratuito usar OjoAhi?"
              class="q-mb-sm"
            >
              <div class="q-pa-md">
                Sí, OjoAhi es completamente gratuito tanto para usuarios como para voluntarios.
              </div>
            </q-expansion-item>
            
            <q-expansion-item
              icon="help"
              label="¿Cómo puedo ser voluntario?"
              class="q-mb-sm"
            >
              <div class="q-pa-md">
                Regístrate seleccionando "Voluntario" y completa tu perfil. Podrás ver 
                y aceptar solicitudes de ayuda en tu área.
              </div>
            </q-expansion-item>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'ContactPage',
  
  setup() {
    const loading = ref(false)
    const form = ref({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
    
    const onSubmit = async () => {
      loading.value = true
      
      try {
        // Simular envío de mensaje
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        Notify.create({
          type: 'positive',
          message: 'Mensaje enviado correctamente. Te responderemos pronto.'
        })
        
        // Limpiar formulario
        form.value = {
          name: '',
          email: '',
          subject: '',
          message: ''
        }
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: 'Error al enviar el mensaje. Inténtalo de nuevo.'
        })
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      onSubmit
    }
  }
})
</script>
