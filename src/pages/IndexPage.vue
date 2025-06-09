<template>
  <q-page class="flex flex-center">
    <div class="page-container">
      <!-- Hero Section -->
      <section class="hero-section q-py-xl">
        <div class="row items-center">
          <div class="col-12 col-md-6 q-pr-md">
            <h1 class="text-h2 text-weight-bold q-mb-md">OjoAhi</h1>
            <h2 class="text-h4 q-mb-lg">Conectando personas, construyendo comunidad</h2>
            <p class="text-body1 q-mb-lg">
              OjoAhi es una plataforma que conecta a personas con discapacidad visual 
              con voluntarios dispuestos a ayudar. Juntos, construimos una comunidad 
              más inclusiva y accesible para todos.
            </p>
            <div class="q-gutter-md">
              <q-btn 
                to="/register" 
                color="primary" 
                size="lg" 
                label="Únete ahora"
                class="q-px-xl"
              />
              <q-btn 
                to="/about" 
                outline 
                color="primary" 
                size="lg" 
                label="Conoce más"
                class="q-px-xl"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 text-center">
            <q-img
              src="../assets/home.jpg"
              spinner-color="primary"
              style="height: 400px; max-width: 100%"
              class="rounded-borders"
            />
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section q-py-xl">
        <h2 class="text-h3 text-center q-mb-xl">¿Cómo funciona?</h2>
        
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-4">
            <q-card class="feature-card text-center q-pa-md">
              <q-icon name="person_add" size="4rem" color="primary" />
              <h3 class="text-h5 q-mt-md">Regístrate</h3>
              <p class="q-mt-sm">
                Crea tu cuenta como persona con discapacidad visual o como voluntario.
              </p>
            </q-card>
          </div>
          
          <div class="col-12 col-md-4">
            <q-card class="feature-card text-center q-pa-md">
              <q-icon name="connect_without_contact" size="4rem" color="primary" />
              <h3 class="text-h5 q-mt-md">Conecta</h3>
              <p class="q-mt-sm">
                Solicita ayuda o encuentra personas que necesiten tu apoyo.
              </p>
            </q-card>
          </div>
          
          <div class="col-12 col-md-4">
            <q-card class="feature-card text-center q-pa-md">
              <q-icon name="volunteer_activism" size="4rem" color="primary" />
              <h3 class="text-h5 q-mt-md">Colabora</h3>
              <p class="q-mt-sm">
                Ayuda en tareas cotidianas y construye una comunidad más inclusiva.
              </p>
            </q-card>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="testimonials-section q-py-xl">
        <h2 class="text-h3 text-center q-mb-xl">Testimonios</h2>
        
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <q-card class="testimonial-card q-pa-lg">
              <div class="row items-center q-mb-md">
                <q-avatar size="56px">
                  <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                </q-avatar>
                <div class="q-ml-md">
                  <div class="text-h6">Carlos Rodríguez</div>
                  <div class="text-subtitle2">Usuario</div>
                </div>
              </div>
              <p class="text-body1">
                "OjoAhi ha cambiado mi vida. Ahora puedo realizar actividades que antes 
                eran un desafío. Los voluntarios son increíbles y siempre están dispuestos a ayudar."
              </p>
              <div class="text-yellow q-mt-sm">
                <q-icon name="star" v-for="i in 5" :key="i" />
              </div>
            </q-card>
          </div>
          
          <div class="col-12 col-md-6">
            <q-card class="testimonial-card q-pa-lg">
              <div class="row items-center q-mb-md">
                <q-avatar size="56px">
                  <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
                </q-avatar>
                <div class="q-ml-md">
                  <div class="text-h6">Laura Martínez</div>
                  <div class="text-subtitle2">Voluntaria</div>
                </div>
              </div>
              <p class="text-body1">
                "Ser voluntaria en OjoAhi me ha permitido conocer personas increíbles y 
                sentir que realmente estoy haciendo una diferencia en mi comunidad."
              </p>
              <div class="text-yellow q-mt-sm">
                <q-icon name="star" v-for="i in 5" :key="i" />
              </div>
            </q-card>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section q-py-xl text-center">
        <h2 class="text-h3 q-mb-md">¿Listo para unirte a nuestra comunidad?</h2>
        <p class="text-body1 q-mb-lg">
          Juntos podemos construir un mundo más accesible e inclusivo.
        </p>
        <div class="q-gutter-md">
          <q-btn 
            to="/register" 
            color="primary" 
            size="lg" 
            label="Regístrate ahora"
            class="q-px-xl"
          />
          <q-btn 
            to="/contact" 
            outline 
            color="primary" 
            size="lg" 
            label="Contáctanos"
            class="q-px-xl"
          />
        </div>
      </section>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexPage'
})
</script>

<style scoped>
.hero-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.feature-card, .testimonial-card {
  height: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover, .testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.text-yellow {
  color: #F2C037;
}

.cta-section {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 40px;
  margin-top: 60px;
}
</style>
