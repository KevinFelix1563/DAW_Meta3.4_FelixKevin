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
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

// Definimos los eventos que este componente puede emitir hacia su padre (App.vue)
const emit = defineEmits(['login-exitoso'])

const emailLogin = ref('')
const errorMsg = ref('')
const cargando = ref(false)

const hacerLogin = async () => {
  if (!emailLogin.value.trim()) return
  
  cargando.value = true
  errorMsg.value = ''

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY // Usamos la variable de entorno
      },
      body: JSON.stringify({ email: emailLogin.value.trim() }),
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Credenciales inválidas o error en el servidor')
    
    const data = await response.json()
    
    // Le avisamos a App.vue que todo salió bien y le mandamos los datos
    emit('login-exitoso', data)

  } catch (error) {
    errorMsg.value = error.message
    console.error('Error login:', error)
  } finally {
    cargando.value = false
  }
}
</script>