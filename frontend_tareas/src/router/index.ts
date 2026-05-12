import { createRouter, createWebHistory } from 'vue-router'
import { autenticado, usuario } from '../store/auth.js'

import Login from '../components/Login.vue'
import ListaTareas from '../components/ListaTareas.vue'
import AdminView from '../components/AdminView.vue' 

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true } // Solo para no logueados
  },
  {
    path: '/tareas',
    name: 'Tareas',
    component: ListaTareas,
    meta: { requiresAuth: true } // Requiere estar logueado
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true } // Requiere ser admin
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/tareas' // Cualquier ruta no encontrada va a tareas
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardia de seguridad de Vue Router
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !autenticado.value) {
    // Si la ruta requiere auth y no hay sesión, al login
    next('/login')
  } else if (to.meta.requiresAdmin && usuario.value?.rol !== 'admin') {
    // Si la ruta requiere ser admin y es un usuario normal, lo regresamos
    next('/tareas')
  } else if (to.meta.requiresGuest && autenticado.value) {
    // Si ya está logueado y quiere ir al login, lo mandamos a sus tareas
    next('/tareas')
  } else {
    next()
  }
})

export default router