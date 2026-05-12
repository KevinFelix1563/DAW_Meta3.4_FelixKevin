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

        <v-text-field
          v-model="passwordLogin"
          label="Contraseña"
          type="password"
          variant="outlined"
          class="mb-2"
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
import { useRouter } from 'vue-router' // Importamos el router
import { setAuth } from '../store/auth.js' // Importamos el store global

const router = useRouter()

const emailLogin = ref('')
const passwordLogin = ref('') // Referencia para la contraseña
const errorMsg = ref('')
const cargando = ref(false)
const cargandoGoogle = ref(false)

const iniciarSesionGoogle = async () => { 
  cargandoGoogle.value = true
  errorMsg.value = ''
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/login`, { method: 'GET' })
    if (!response.ok) throw new Error('No se pudo conectar con el servidor')
    const data = await response.json()
    if (data.url) window.location.href = data.url
  } catch (error) {
    errorMsg.value = error.message
    cargandoGoogle.value = false
  }
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const loginStatus = urlParams.get('login')
  const csrfParam = urlParams.get('csrf') 

  if (loginStatus) {
    window.history.replaceState({}, document.title, '/login')

    if (loginStatus === 'success' && csrfParam) { 
      verificarSesionExitosaGoogle(csrfParam)
    } else if (loginStatus === 'unauthorized') {  
      errorMsg.value = 'Tu cuenta de Google no está registrada.'
    } else {
      errorMsg.value = 'Ocurrió un error.'
    }
  }
})

const verificarSesionExitosaGoogle = async (tokenCsrf) => { 
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
      method: 'GET',
      headers: { 'x-csrf-token': tokenCsrf },
      credentials: 'include' 
    })
    
    if (response.ok) {
      const data = await response.json()
      data.csrfToken = tokenCsrf; 
      
      // Guardamos en el store y navegamos a Tareas
      setAuth(data)
      router.push('/tareas')
    } else {
      errorMsg.value = 'Fallo la verificación de seguridad (CSRF).'
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

const hacerLogin = async () => {
  if (!emailLogin.value.trim() || !passwordLogin.value.trim()) return
  
  cargando.value = true
  errorMsg.value = ''

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY 
      },
      // Enviamos también la contraseña al backend
      body: JSON.stringify({ 
        email: emailLogin.value.trim(),
        password: passwordLogin.value.trim() 
      }),
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Credenciales inválidas')
    
    const data = await response.json()
    
    // Guardamos en el store y navegamos a Tareas
    setAuth(data)
    router.push('/tareas')

  } catch (error) {
    errorMsg.value = error.message
  } finally {
    cargando.value = false
  }
}
</script>