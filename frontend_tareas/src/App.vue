<template>
  <v-app>
    <v-app-bar color="primary" density="compact" v-if="autenticado">
      <v-app-bar-title>Gestor de Tareas Seguro</v-app-bar-title>
      
      <v-btn to="/tareas" variant="text" class="ml-4">Mis Tareas</v-btn>
      
      <v-btn 
        v-if="usuario?.rol === 'admin'" 
        to="/admin" 
        variant="outlined" 
        color="white" 
        class="ml-2"
      >
        Panel Admin
      </v-btn>

      <v-spacer></v-spacer>
      
      <span class="mr-4 text-body-2">{{ usuario?.email }} ({{ usuario?.rol }})</span>
      
      <v-btn variant="text" @click="hacerLogout" :loading="cargandoSalir">
        Salir
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container max-width="1200" class="mt-4">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// Importamos el estado global reactivo
import { autenticado, usuario, csrfToken, clearAuth } from './store/auth.js'

const router = useRouter()
const cargandoSalir = ref(false)

const hacerLogout = async () => {
  cargandoSalir.value = true
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken.value },
      credentials: 'include'
    })
    
    // Limpiamos el store global
    clearAuth()
    
    // Lo expulsamos a la pantalla de login
    router.push('/login')
  } catch (error) {
    console.error('Error al salir:', error)
  } finally {
    cargandoSalir.value = false
  }
}
</script>