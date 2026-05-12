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

    <v-card class="mb-4 pa-3" flat border bg-color="grey-lighten-4">
      <v-select
        v-model="tagsBusqueda"
        :items="listaTagsDisponibles"
        item-title="nombre"
        item-value="id"
        label="Buscar tareas por etiquetas..."
        multiple
        chips
        clearable
        variant="outlined"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-filter"
        @update:modelValue="buscarPorEtiquetas"
        @click:clear="obtenerTareas"
        :loading="buscando"
      ></v-select>
    </v-card>

    <v-card title="Mis Tareas" flat border>
      <v-progress-linear v-if="cargando" indeterminate color="primary"></v-progress-linear>
      <v-list>
        <v-list-item v-for="tarea in tareas" :key="tarea.id" border class="mb-2 mx-2 rounded">
          <template v-slot:prepend>
            <v-checkbox-btn v-model="tarea.completada" @change="actualizarEstado(tarea)"></v-checkbox-btn>
          </template>
          
          <v-list-item-title :class="{'text-decoration-line-through text-grey': tarea.completada}">
            {{ tarea.titulo }}
          </v-list-item-title>
          
          <v-list-item-subtitle class="mt-1">
            <v-chip 
              v-for="tag in tarea.etiquetas" 
              :key="tag.id" 
              size="x-small" 
              color="primary" 
              class="mr-1"
            >
              {{ tag.nombre }}
            </v-chip>
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-btn 
              icon="mdi-tag-plus" 
              variant="text" 
              color="blue" 
              density="comfortable" 
              @click="abrirDialogoTag(tarea)"
              title="Añadir Etiqueta"
            ></v-btn>
            <v-btn 
              icon="mdi-delete" 
              variant="text" 
              color="error" 
              density="comfortable" 
              @click="eliminarTarea(tarea.id)" 
              :disabled="cargando"
            ></v-btn>
          </template>
        </v-list-item>

        <v-list-item v-if="tareas.length === 0 && !cargando">
          <v-list-item-title class="text-center text-medium-emphasis">No se encontraron tareas.</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="dialogoTag" max-width="400">
      <v-card>
        <v-card-title>Añadir Etiqueta a la Tarea</v-card-title>
        <v-card-text>
          <v-select
            v-model="tagSeleccionadoParaAsignar"
            :items="listaTagsDisponibles"
            item-title="nombre"
            item-value="id"
            label="Selecciona una etiqueta"
            variant="outlined"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialogoTag = false">Cancelar</v-btn>
          <v-btn color="primary" @click="asignarTag" :loading="guardandoTag">Asignar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { csrfToken, clearAuth } from '../store/auth.js' // Usamos el store en lugar de props

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

// Estados
const tareas = ref([])
const nuevaTarea = ref('')
const listaTagsDisponibles = ref([])
const tagsBusqueda = ref([]) // Array de IDs de tags para filtrar

// Cargas
const cargando = ref(false)
const guardando = ref(false)
const buscando = ref(false)

// Dialogo Tags
const dialogoTag = ref(false)
const guardandoTag = ref(false)
const tareaActual = ref(null)
const tagSeleccionadoParaAsignar = ref(null)

// Función auxiliar para las peticiones
const fetchSeguro = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken.value 
    },
    credentials: 'include'
  }
  if (body) options.body = JSON.stringify(body)
  
  const res = await fetch(`${API_URL}${endpoint}`, options)
  
  // Si el token expira o es inválido, cerramos sesión y mandamos al login
  if (res.status === 401 || res.status === 403) {
    clearAuth()
    router.push('/login')
    throw new Error('Sesión expirada')
  }
  
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
  return await res.json()
}


const obtenerTareas = async () => {
  cargando.value = true
  try {
    const res = await fetchSeguro('/tareas')
    tareas.value = res.data
  } catch (error) {
    console.error('Error al cargar tareas:', error)
  } finally {
    cargando.value = false
  }
}

const crearTarea = async () => {
  if (!nuevaTarea.value.trim()) return
  guardando.value = true
  try {
    await fetchSeguro('/tareas', 'POST', { titulo: nuevaTarea.value.trim(), completada: false })
    nuevaTarea.value = ''
    tagsBusqueda.value = [] // Limpiamos el filtro si estaba activo
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
    await fetchSeguro(`/tareas/${id}`, 'DELETE')
    tagsBusqueda.value.length > 0 ? await buscarPorEtiquetas() : await obtenerTareas()
  } catch (error) {
    console.error('Error al eliminar tarea:', error)
  } finally {
    cargando.value = false
  }
}

const actualizarEstado = async (tarea) => {
  try {
    await fetchSeguro(`/tareas/${tarea.id}`, 'PUT', { completada: tarea.completada })
  } catch (error) {
    console.error('Error al actualizar:', error)
    tarea.completada = !tarea.completada // Revertimos si falla
  }
}

const cargarTagsDisponibles = async () => {
  try {
    const res = await fetchSeguro('/tags')
    listaTagsDisponibles.value = res.data
  } catch (error) {
    console.error('Error al cargar tags:', error)
  }
}

const buscarPorEtiquetas = async () => {
  // Si limpian el select, traemos todas
  if (!tagsBusqueda.value || tagsBusqueda.value.length === 0) {
    return obtenerTareas()
  }

  buscando.value = true
  try {
    // Llamamos al endpoint POST que creamos en el backend para buscar por tags
    const res = await fetchSeguro('/tareas/buscar', 'POST', { tagsIds: tagsBusqueda.value })
    tareas.value = res.data
  } catch (error) {
    console.error('Error al buscar tareas:', error)
  } finally {
    buscando.value = false
  }
}

const abrirDialogoTag = (tarea) => {
  tareaActual.value = tarea
  tagSeleccionadoParaAsignar.value = null
  dialogoTag.value = true
}

const asignarTag = async () => {
  if (!tagSeleccionadoParaAsignar.value || !tareaActual.value) return
  
  guardandoTag.value = true
  try {
    await fetchSeguro(`/tareas/${tareaActual.value.id}/tags`, 'POST', { 
      tagId: tagSeleccionadoParaAsignar.value 
    })
    
    dialogoTag.value = false
    // Refrescamos la vista respetando si había un filtro activo
    tagsBusqueda.value.length > 0 ? await buscarPorEtiquetas() : await obtenerTareas()
  } catch (error) {
    console.error('Error al asignar tag:', error)
  } finally {
    guardandoTag.value = false
  }
}

onMounted(() => {
  obtenerTareas()
  cargarTagsDisponibles()
})
</script>