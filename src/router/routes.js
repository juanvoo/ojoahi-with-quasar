const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "about",
        name: "about",
        component: () => import("pages/AboutPage.vue"),
      },
      {
        path: "contact",
        name: "contact",
        component: () => import("pages/ContactPage.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("layouts/AuthLayout.vue"),
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("pages/auth/LoginPage.vue"),
        meta: { requiresGuest: true },
      },
      {
        path: "register",
        name: "register",
        component: () => import("pages/auth/RegisterPage.vue"),
        meta: { requiresGuest: true },
      },
      {
        path: "forgot-password",
        name: "forgot-password",
        component: () => import("pages/auth/ForgotPasswordPage.vue"),
        meta: { requiresGuest: true },
      },
    ],
  },
  {
    path: "/app",
    component: () => import("layouts/DashboardLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("pages/dashboard/DashboardPage.vue"),
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("pages/dashboard/ProfilePage.vue"),
      },
      {
        path: "chat",
        name: "chat",
        component: () => import("pages/dashboard/ChatPage.vue"),
      },
      {
        path: "chat/:id",
        name: "chat-detail",
        component: () => import("pages/dashboard/ChatDetailPage.vue"),
      },
      {
        path: "notifications",
        name: "notifications",
        component: () => import("pages/dashboard/NotificationsPage.vue"),
      },
    ],
  },
  {
    path: "/app/blind",
    component: () => import("layouts/DashboardLayout.vue"),
    meta: { requiresAuth: true, requiresBlind: true },
    children: [
      {
        path: "help-requests",
        name: "help-requests",
        component: () => import("pages/blind/HelpRequestsPage.vue"),
      },
      {
        path: "help-requests/new",
        name: "new-help-request",
        component: () => import("pages/blind/NewHelpRequestPage.vue"),
      },
      {
        path: "help-requests/:id",
        name: "help-request-detail",
        component: () => import("pages/blind/HelpRequestDetailPage.vue"),
      },
      {
        path: "volunteers",
        name: "volunteers",
        component: () => import("pages/blind/VolunteersPage.vue"),
      },
      {
        path: "volunteers/:id",
        name: "volunteer-detail",
        component: () => import("pages/blind/VolunteerDetailPage.vue"),
      },
    ],
  },
  {
    path: "/app/volunteer",
    component: () => import("layouts/DashboardLayout.vue"),
    meta: { requiresAuth: true, requiresVolunteer: true },
    children: [
      {
        path: "available-requests",
        name: "available-requests",
        component: () => import("pages/volunteer/AvailableRequestsPage.vue"),
      },
      {
        path: "my-reservations",
        name: "my-reservations",
        component: () => import("pages/volunteer/MyReservationsPage.vue"),
      },
      {
        path: "reviews",
        name: "reviews",
        component: () => import("pages/volunteer/ReviewsPage.vue"),
      },
    ],
  },

  {
    path: "/users",
    name: "AdminUsers",
    component: () => import("src/pages/admin/UsersManagementPage.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/requests",
    name: "AdminRequests",
    component: () => import("src/pages/admin/RequestsMonitoringPage.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
]

export default routes
