<template>
  <q-page class="flex flex-center">
    <div class="page-container">
      <div class="text-center q-mb-xl">
        <h1 class="text-h2 text-weight-bold q-mb-md">Acerca de OjoAhi</h1>
        <p class="text-h6 text-grey-7">
          Conectando corazones, construyendo puentes hacia la inclusión
        </p>
      </div>

      <div class="row q-gutter-lg">
        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg">
            <h2 class="text-h4 q-mb-md">Nuestra Misión</h2>
            <p class="text-body1">
              OjoAhi nace con la misión de crear una comunidad inclusiva donde las personas 
              con discapacidad visual puedan acceder fácilmente a la ayuda que necesitan en 
              su día a día, conectándolas con voluntarios comprometidos y solidarios.
            </p>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="q-pa-lg">
            <h2 class="text-h4 q-mb-md">Nuestra Visión</h2>
            <p class="text-body1">
              Aspiramos a ser la plataforma líder en España para la asistencia a personas 
              con discapacidad visual, fomentando la autonomía, la dignidad y la participación 
              plena en la sociedad.
            </p>
          </q-card>
        </div>
      </div>

      <div class="q-mt-xl">
        <h2 class="text-h3 text-center q-mb-lg">Nuestros Valores</h2>
        
        <div class="row q-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="text-center q-pa-md">
              <q-icon name="favorite" size="48px" color="red" />
              <h3 class="text-h6 q-mt-md">Solidaridad</h3>
              <p class="text-body2">
                Creemos en el poder de la ayuda mutua y la colaboración.
              </p>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="text-center q-pa-md">
              <q-icon name="security" size="48px" color="green" />
              <h3 class="text-h6 q-mt-md">Confianza</h3>
              <p class="text-body2">
                Garantizamos un entorno seguro y confiable para todos.
              </p>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="text-center q-pa-md">
              <q-icon name="accessibility" size="48px" color="blue" />
              <h3 class="text-h6 q-mt-md">Inclusión</h3>
              <p class="text-body2">
                Promovemos la igualdad de oportunidades para todos.
              </p>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="text-center q-pa-md">
              <q-icon name="star" size="48px" color="amber" />
              <h3 class="text-h6 q-mt-md">Excelencia</h3>
              <p class="text-body2">
                Nos esforzamos por ofrecer el mejor servicio posible.
              </p>
            </q-card>
          </div>
        </div>
      </div>

      <div class="q-mt-xl text-center">
        <h2 class="text-h3 q-mb-lg">¿Cómo empezar?</h2>
        
        <div class="q-gutter-md">
          <q-btn 
            to="/register" 
            color="primary" 
            size="lg" 
            label="Únete como usuario"
            class="q-px-xl"
          />
          <q-btn 
            to="/register" 
            outline 
            color="primary" 
            size="lg" 
            label="Ser voluntario"
            class="q-px-xl"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AboutPage'
})
</script>
