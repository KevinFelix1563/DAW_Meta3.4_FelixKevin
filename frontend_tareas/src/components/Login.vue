<template>
  <v-card flat border class="mx-auto" max-width="400">
    <v-card-title class="text-center text-h5 mt-4">Iniciar Sesión</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="hacerLogin">
        <v-text-field
          v-model="emailLogin"
          label="Correo electrónico"
          type="email"
          variant="outlined"
          class="mb-2 mt-4"
          :disabled="cargando"
          required
        ></v-text-field>

        <v-alert v-if="errorMsg" type="error" density="compact" class="mb-4">
          {{ errorMsg }}
        </v-alert>

        <v-btn type="submit" color="primary" block :loading="cargando">
          Entrar
        </v-btn>
      </v-form>

      <v-divider class="my-6">O</v-divider>

      <v-btn 
        @click="iniciarSesionGoogle" 
        color="red-darken-1" 
        block 
        :loading="cargandoGoogle"
        prepend-icon="mdi-google"
      >
        Iniciar sesión con Google
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['login-exitoso'])

const emailLogin = ref('')
const errorMsg = ref('')
const cargando = ref(false)
const cargandoGoogle = ref(false)

// Función auxiliar para leer cookies del navegador
const obtenerCookie = (nombre) => {
  const valor = `; ${document.cookie}`
  const partes = valor.split(`; ${nombre}=`)
  if (partes.length === 2) return partes.pop().split(';').shift()
  return null
}

// Manejo del Login con Google (OAuth 2.0)
const iniciarSesionGoogle = async () => { 
  cargandoGoogle.value = true
  errorMsg.value = ''

  try {
    // Obtenemos la URL de autorización del backend 
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/login`, {
      method: 'GET'
    })

    if (!response.ok) throw new Error('No se pudo conectar con el servidor para iniciar OAuth')
    
    const data = await response.json()
    
    // Redirigimos el navegador a Google 
    if (data.url) {
      window.location.href = data.url
    }
  } catch (error) {
    errorMsg.value = error.message
    console.error('Error iniciando Google OAuth:', error)
    cargandoGoogle.value = false
  }
}

// Revisar si venimos de una redirección de Google
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const loginStatus = urlParams.get('login')
  const csrfParam = urlParams.get('csrf') // Atrapamos el token de la URL

  if (loginStatus) {
    // Limpiamos la URL para que el token y el status no se queden a la vista
    window.history.replaceState({}, document.title, '/')

    if (loginStatus === 'success' && csrfParam) { 
      // Pasamos el token directamente a la función
      verificarSesionExitosaGoogle(csrfParam)
    } else if (loginStatus === 'unauthorized') {  
      errorMsg.value = 'Tu cuenta de Google no está registrada o autorizada en el sistema.'
    } else {
      errorMsg.value = 'Ocurrió un error durante la autenticación con Google.'
    }
  }
})

const verificarSesionExitosaGoogle = async (tokenCsrf) => { 
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'x-csrf-token': tokenCsrf
      },
      credentials: 'include' 
    })
    
    if (response.ok) {
      const data = await response.json()
      
      data.csrfToken = tokenCsrf; 
      
      emit('login-exitoso', data)
    } else {
      errorMsg.value = 'Fallo la verificación de seguridad (CSRF).'
    }
  } catch (error) {
    console.error('Error verificando sesión de Google:', error)
  }
}

// Login Tradicional
const hacerLogin = async () => {
  if (!emailLogin.value.trim()) return
  
  cargando.value = true
  errorMsg.value = ''

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY 
      },
      body: JSON.stringify({ email: emailLogin.value.trim() }),
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Credenciales inválidas o error en el servidor')
    
    const data = await response.json()
    emit('login-exitoso', data)

  } catch (error) {
    errorMsg.value = error.message
    console.error('Error login tradicional:', error)
  } finally {
    cargando.value = false
  }
}
</script>