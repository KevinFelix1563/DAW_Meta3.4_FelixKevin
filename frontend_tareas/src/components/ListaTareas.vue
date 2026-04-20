<template>
  <div>
    <v-card class="mb-4" flat border>
      <v-card-text>
        <v-form @submit.prevent="crearTarea">
          <v-row align="center">
            <v-col cols="8" sm="9">
              <v-text-field
                v-model="nuevaTarea"
                label="Escribe una nueva tarea..."
                variant="outlined"
                density="compact"
                hide-details
                :disabled="guardando"
              ></v-text-field>
            </v-col>
            <v-col cols="4" sm="3">
              <v-btn type="submit" color="primary" block :loading="guardando">
                Agregar
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <v-text-field
      v-model="terminoBusqueda"
      label="Buscar tarea..."
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-magnify"
      clearable
      hide-details
      class="mb-4"
      @input="buscarTareas"
      @click:clear="obtenerTareas"
      :loading="buscando"
    ></v-text-field>

    <v-card title="Mis Tareas" flat border>
      <v-progress-linear v-if="cargando" indeterminate color="primary"></v-progress-linear>
      <v-list>
        <v-list-item v-for="tarea in tareas" :key="tarea.id">
          <template v-slot:prepend>
            <v-checkbox-btn v-model="tarea.completada" @change="actualizarEstado(tarea)"></v-checkbox-btn>
          </template>
          <v-list-item-title>{{ tarea.titulo }}</v-list-item-title>
          <template v-slot:append>
            <v-btn icon="mdi-delete" variant="text" color="error" density="comfortable" @click="eliminarTarea(tarea.id)" :disabled="cargando"></v-btn>
          </template>
        </v-list-item>

        <v-list-item v-if="tareas.length === 0 && !cargando">
          <v-list-item-title class="text-center text-medium-emphasis">No se encontraron tareas.</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Recibimos el token CSRF desde App.vue
const props = defineProps({
  csrfToken: {
    type: String,
    required: true
  }
})

// Evento por si el token expiró y necesitamos sacar al usuario
const emit = defineEmits(['sesion-expirada'])

const tareas = ref([])
const nuevaTarea = ref('')
const terminoBusqueda = ref('')

const cargando = ref(false)
const guardando = ref(false)
const buscando = ref(false)

const headersSeguros = {
  'Content-Type': 'application/json',
  'x-csrf-token': props.csrfToken
}

const API_URL = import.meta.env.VITE_API_URL

const obtenerTareas = async () => {
  cargando.value = true
  try {
    const response = await fetch(`${API_URL}/tareas`, {
      method: 'GET',
      headers: headersSeguros,
      credentials: 'include'
    })
    
    if (response.status === 401) return emit('sesion-expirada')
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
    
    const resultado = await response.json()
    tareas.value = resultado.data
  } catch (error) {
    console.error('Error al cargar tareas:', error)
  } finally {
    cargando.value = false
  }
}

const buscarTareas = async () => {
  const termino = terminoBusqueda.value.trim()
  if (!termino) return obtenerTareas()

  buscando.value = true
  try {
    const response = await fetch(`${API_URL}/tareas/buscar?q=${termino}`, {
      method: 'GET',
      headers: headersSeguros,
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
    const resultado = await response.json()
    tareas.value = resultado.data
  } catch (error) {
    console.error('Error al buscar tareas:', error)
  } finally {
    buscando.value = false
  }
}

const crearTarea = async () => {
  if (!nuevaTarea.value.trim()) return

  guardando.value = true
  try {
    const response = await fetch(`${API_URL}/tareas`, {
      method: 'POST',
      headers: headersSeguros,
      credentials: 'include',
      body: JSON.stringify({ titulo: nuevaTarea.value.trim(), completada: false })
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
    
    nuevaTarea.value = ''
    if (terminoBusqueda.value) terminoBusqueda.value = ''
    await obtenerTareas()

  } catch (error) {
    console.error('Error al crear tarea:', error)
  } finally {
    guardando.value = false
  }
}

const eliminarTarea = async (id) => {
  cargando.value = true
  try {
    const response = await fetch(`${API_URL}/tareas/${id}`, {
      method: 'DELETE',
      headers: headersSeguros,
      credentials: 'include'
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
    terminoBusqueda.value.trim() ? await buscarTareas() : await obtenerTareas()

  } catch (error) {
    console.error('Error al eliminar tarea:', error)
  } finally {
    cargando.value = false
  }
}

const actualizarEstado = async (tarea) => {
  try {
    const response = await fetch(`${API_URL}/tareas/${tarea.id}`, {
      method: 'PATCH',
      headers: headersSeguros,
      credentials: 'include',
      body: JSON.stringify({ completada: tarea.completada })
    })

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
  } catch (error) {
    console.error('Error al actualizar:', error)
    tarea.completada = !tarea.completada
  }
}

// Al montar el componente, cargamos las tareas automáticamente
onMounted(() => {
  obtenerTareas()
})
</script>