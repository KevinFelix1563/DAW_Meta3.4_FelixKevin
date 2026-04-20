<template>
  <v-app>
    <v-app-bar color="primary" density="compact" v-if="autenticado">
      <v-app-bar-title>Gestor de Tareas Seguro</v-app-bar-title>
      <v-spacer></v-spacer>
      <span class="mr-4 text-body-2">{{ usuario?.email }}</span>
      <v-btn variant="text" @click="hacerLogout" :loading="cargandoSalir">
        Salir
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container max-width="600" class="mt-4">
        
        <Login 
          v-if="!autenticado" 
          @login-exitoso="configurarSesion" 
        />

        <ListaTareas 
          v-else 
          :csrfToken="csrfToken" 
          @sesion-expirada="hacerLogout" 
        />

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import Login from './components/Login.vue'
import ListaTareas from './components/ListaTareas.vue'

const autenticado = ref(false)
const usuario = ref(null)
const csrfToken = ref('')
const cargandoSalir = ref(false)

// Esta función recibe los datos que nos envía el componente Login.vue
const configurarSesion = (datosLogin) => {
  autenticado.value = true
  usuario.value = datosLogin.usuario
  csrfToken.value = datosLogin.csrfToken
}

const hacerLogout = async () => {
  cargandoSalir.value = true
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken.value },
      credentials: 'include'
    })
    
    autenticado.value = false
    usuario.value = null
    csrfToken.value = ''
  } catch (error) {
    console.error('Error al salir:', error)
  } finally {
    cargandoSalir.value = false
  }
}
</script>