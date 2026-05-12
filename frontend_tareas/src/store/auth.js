import { ref } from 'vue'

export const autenticado = ref(false)
export const usuario = ref(null)
export const csrfToken = ref('')

export const setAuth = (data) => {
  autenticado.value = true
  usuario.value = data.usuario
  csrfToken.value = data.csrfToken
}

export const clearAuth = () => {
  autenticado.value = false
  usuario.value = null
  csrfToken.value = ''
}