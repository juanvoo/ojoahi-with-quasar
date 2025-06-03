import BlindDashboard from 'pages/BlindDashboard.vue'
import VolunteerDashboard from 'pages/VolunteerDashboard.vue'
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      {path: 'register', component: () => import('pages/RegisterPage.vue')},
      { path: '/blind-dashboard', component: BlindDashboard },
  { path: '/volunteer-dashboard', component: VolunteerDashboard }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
