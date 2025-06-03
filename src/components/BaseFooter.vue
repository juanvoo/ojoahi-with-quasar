<template>
  <q-footer class="bg-dark text-white q-pt-xl q-pb-lg">
    <q-container class="q-mx-auto" style="max-width: 1200px;">
      <q-row class="q-col-gutter-xl">
        <!-- Logo y descripción -->
        <q-col cols="12" md="4" class="flex flex-column items-start">
          <div class="row items-center">
            <span class="text-h3 text-bold q-mr-md" style="color:#00f8b6;">OjoAhi</span>
            <div class="q-mt-sm q-ml-md" style="max-width: 300px;">
              Mejorando la autonomía y calidad de vida de personas ciegas o con baja visión mediante tecnología innovadora y accesible.
            </div>
          </div>
          <div class="q-mt-md row items-center">
            <q-btn flat round dense @click="goTo('https://facebook.com')" color="white" class="q-mr-xs">
              <q-icon name="fa-brands fa-facebook-f" />
            </q-btn>
            <q-btn flat round dense @click="goTo('https://twitter.com')" color="white" class="q-mr-xs">
              <q-icon name="fa-brands fa-twitter" />
            </q-btn>
            <q-btn flat round dense @click="goTo('https://instagram.com')" color="white" class="q-mr-xs">
              <q-icon name="fa-brands fa-instagram" />
            </q-btn>
            <q-btn flat round dense @click="goTo('https://linkedin.com')" color="white">
              <q-icon name="fa-brands fa-linkedin-in" />
            </q-btn>
          </div>
        </q-col>

        <!-- Enlaces rápidos -->
        <q-col cols="12" sm="4" md="2">
          <div class="text-h6 text-bold q-mb-md">Enlaces rápidos</div>
          <ul>
            <li><RouterLink to="/" class="footer-link">Inicio</RouterLink></li>
            <li><RouterLink to="/about" class="footer-link">Nosotros</RouterLink></li>
            <li><RouterLink to="/services" class="footer-link">Servicios</RouterLink></li>
            <li><RouterLink to="/team" class="footer-link">Equipo</RouterLink></li>
          </ul>
        </q-col>

        <!-- Servicios -->
        <q-col cols="12" sm="4" md="3">
          <div class="text-h6 text-bold q-mb-md">Servicios</div>
          <ul>
            <li><RouterLink to="/services#navigation" class="footer-link">Navegación asistida</RouterLink></li>
            <li><RouterLink to="/services#recognition" class="footer-link">Reconocimiento de objetos</RouterLink></li>
            <li><RouterLink to="/services#reading" class="footer-link">Lectura de textos</RouterLink></li>
            <li><RouterLink to="/services#training" class="footer-link">Capacitación</RouterLink></li>
          </ul>
        </q-col>

        <!-- Contacto -->
        <q-col cols="12" sm="4" md="3">
          <div class="text-h6 text-bold q-mb-md">Contacto</div>
          <ul>
            <li class="row items-center q-mb-xs">
              <q-icon name="place" color="primary" size="sm" class="q-mr-xs" />
              <span>Calle Principal 123</span>
            </li>
            <li class="row items-center q-mb-xs">
              <q-icon name="phone" color="primary" size="sm" class="q-mr-xs" />
              <span>+123 456 7890</span>
            </li>
            <li class="row items-center">
              <q-icon name="mail" color="primary" size="sm" class="q-mr-xs" />
              <span>info@visionassist.com</span>
            </li>
          </ul>
        </q-col>
      </q-row>
    </q-container>
    <q-separator color="grey-8" />
    <div class="text-center q-pa-sm" style="background: #0d0d0d; color: #00f8b6;">
      © 2025 OjoAhi. Todos los derechos reservados.
    </div>
  </q-footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
function goTo(url) {
  window.open(url, "_blank")
}
</script>

<style scoped>
ul {
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
}
.footer-link {
  color: #fff;
  text-decoration: underline;
}
.footer-link:hover {
  color: #00f8b6;
}
.text-h3 {
  font-family: 'Montserrat', 'Poppins', sans-serif;
}
</style>