<template>
   <q-page class="q-pa-md">
  <!-- Hero Section -->
  <section class="hero-section text-white py-5" style="background-color: #5dd62c;" id="home">
    <div class="container py-5">
      <div class="row align-items-center">
        <div class="col-lg-6 mb-5 mb-lg-0">
          <h1 class="display-4 fw-bold mb-4">Mejorando la autonomía y calidad de vida</h1>
          <p class="lead mb-4">
            Nuestra aplicación revoluciona la vida diaria de personas ciegas o con baja visión a través de la tecnología más avanzada de inteligencia artificial.
          </p>
          <div class="d-flex flex-column flex-sm-row">
            <RouterLink to="/register" class="btn btn-light btn-lg me-sm-3 mb-3 mb-sm-0">Comenzar ahora</RouterLink>
            <RouterLink to="/services" class="btn btn-outline-light btn-lg">Conocer más</RouterLink>
          </div>
        </div>
        <div class="col-lg-6 text-center">
          <img src="/src/assets/home.jpg" alt="Tecnología para personas con discapacidad visual" class="img-fluid rounded shadow-lg" />
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section py-5" style="background-color: #0f0f0f;">
    <div class="container py-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold mb-3" style="color:#f8f8f8">Funcionalidades destacadas</h2>
        <p class="lead text-muted">Soluciones innovadoras que facilitan la vida diaria</p>
      </div>
      <div class="row g-4">
        <div class="col-md-4" v-for="feature in features" :key="feature.title">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body text-center p-4">
              <div class="feature-icon bg-primary text-white rounded-circle mb-4 mx-auto">
                <i :class="feature.icon"></i>
              </div>
              <h4 class="card-title mb-3">{{ feature.title }}</h4>
              <p class="card-text">{{ feature.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="testimonials-section bg-light py-5">
    <div class="container py-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold mb-3">Lo que dicen nuestros usuarios</h2>
        <p class="lead text-muted">Experiencias reales que transforman vidas</p>
      </div>
      <div class="row">
        <div class="col-lg-4 mb-4" v-for="t in testimonials" :key="t.name">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-4">
                <img :src="t.img" alt="Usuario" class="rounded-circle" width="60" height="60" />
                <div class="ms-3">
                  <h5 class="mb-0">{{ t.name }}</h5>
                  <p class="text-muted mb-0">{{ t.since }}</p>
                </div>
              </div>
              <p class="mb-0">{{ t.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</q-page>
  <!-- Resto de secciones, migradas de manera similar (puedes seguir este patrón para el resto del contenido de home.hbs) -->
</template>

<script setup>
import { RouterLink } from 'vue-router'

const features = [
  {
    icon: "fas fa-map-marked-alt",
    title: "Navegación asistida",
    text: "Guía en tiempo real con instrucciones de voz para desplazarse con seguridad en entornos desconocidos."
  },
  {
    icon: "fas fa-camera",
    title: "Reconocimiento de objetos",
    text: "Identificación instantánea de objetos, personas y textos en su entorno mediante análisis de imágenes."
  },
  {
    icon: "fas fa-book-reader",
    title: "Lectura asistida",
    text: "Lectura de textos impresos y digitales con voz natural, permitiendo acceder a todo tipo de contenidos."
  }
]

const testimonials = [
  {
    img: "/images/Cesar.png",
    name: "María González",
    since: "Usuario desde 2022",
    text: "VisionAssist me ha devuelto la independencia. Ahora puedo pasear por mi vecindario, reconocer objetos y leer el correo sin depender constantemente de otros."
  },
  {
    img: "https://same-assets.com/v0/s1/o/5e05f/testimonial2.webp",
    name: "Carlos Rodríguez",
    since: "Usuario desde 2023",
    text: "La función de reconocimiento de objetos es increíble. Me ayuda a identificar productos en el supermercado, lo que ha hecho mis compras mucho más sencillas."
  },
  {
    img: "https://same-assets.com/v0/s1/o/5e05f/testimonial3.webp",
    name: "Laura Martínez",
    since: "Usuario desde 2021",
    text: "Como estudiante, la función de lectura ha sido fundamental. Puedo acceder a libros y apuntes de forma autónoma, lo que ha mejorado significativamente mi rendimiento académico."
  }
]
</script>

<style scoped>
/* Agrega aquí tus estilos personalizados o importa tu CSS global si lo prefieres */

</style>
