<template>
  <v-card flat border>
    <v-toolbar color="blue-grey-darken-3" dark>
      <v-toolbar-title>Panel de Administración</v-toolbar-title>
      <template v-slot:extension>
        <v-tabs v-model="tab" align-tabs="title">
          <v-tab value="usuarios">Gestión de Usuarios</v-tab>
          <v-tab value="busquedas">Búsquedas Avanzadas</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-card-text>
      <v-window v-model="tab">
        
        <v-window-item value="usuarios">
          <v-row class="mb-2 align-center">
            <v-col>
              <h3 class="text-h6">Usuarios Registrados</h3>
            </v-col>
            <v-col class="text-right">
              <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirDialogoUsuario()">
                Nuevo Usuario
              </v-btn>
            </v-col>
          </v-row>

          <v-table density="comfortable" hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in listaUsuarios" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.nombre }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <v-chip size="small" :color="user.rol === 'admin' ? 'red' : 'blue'">
                    {{ user.rol }}
                  </v-chip>
                </td>
                <td>
                  <v-chip size="small" :color="user.activo ? 'success' : 'error'">
                    {{ user.activo ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </td>
                <td class="text-center">
                  <v-btn 
                    size="small" variant="text" color="blue" 
                    icon="mdi-pencil" @click="abrirDialogoUsuario(user)" title="Editar">
                  </v-btn>

                  <v-btn 
                    size="small" variant="text" :color="user.activo ? 'warning' : 'success'"
                    :icon="user.activo ? 'mdi-cancel' : 'mdi-check-circle'"
                    @click="cambiarEstadoUsuario(user)" :title="user.activo ? 'Desactivar' : 'Activar'">
                  </v-btn>

                  <v-btn 
                    size="small" variant="text" color="error" 
                    icon="mdi-delete" @click="eliminarUsuario(user.id)" title="Eliminar">
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <v-window-item value="busquedas">
          <v-row>
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="pa-4">
                <h4 class="text-subtitle-1 font-weight-bold mb-4">Parámetros</h4>
                
                <v-select
                  v-model="tipoBusqueda"
                  :items="opcionesBusqueda"
                  label="¿Qué deseas buscar?"
                  variant="outlined"
                  density="comfortable"
                ></v-select>

                <v-select
                  v-if="tipoBusqueda === 'tareas' || tipoBusqueda === 'usuarios'"
                  v-model="tagsSeleccionados"
                  :items="listaTags"
                  item-title="nombre"
                  item-value="id"
                  label="Selecciona Etiquetas"
                  multiple
                  chips
                  variant="outlined"
                  density="comfortable"
                ></v-select>

                <v-select
                  v-if="tipoBusqueda === 'etiquetas'"
                  v-model="usuariosSeleccionados"
                  :items="listaUsuarios"
                  item-title="email"
                  item-value="id"
                  label="Selecciona Usuarios"
                  multiple
                  chips
                  variant="outlined"
                  density="comfortable"
                ></v-select>

                <v-btn color="primary" block @click="ejecutarBusqueda" :loading="cargandoBusqueda">
                  Buscar
                </v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" md="8">
              <v-card variant="outlined" class="pa-4 h-100">
                <h4 class="text-subtitle-1 font-weight-bold mb-4">Resultados</h4>
                
                <v-alert v-if="resultados.length === 0" type="info" variant="tonal">
                  No hay resultados para mostrar.
                </v-alert>

                <v-list v-if="tipoBusqueda === 'tareas' && resultados.length > 0">
                  <v-list-item v-for="tarea in resultados" :key="tarea.id" border class="mb-2">
                    <v-list-item-title class="font-weight-bold">{{ tarea.titulo }}</v-list-item-title>
                    <v-list-item-subtitle>Autor: {{ tarea.autor?.email }}</v-list-item-subtitle>
                    <template v-slot:append>
                      <v-chip size="small" v-for="tag in tarea.etiquetas" :key="tag.id" class="ml-1">
                        {{ tag.nombre }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>

                <v-list v-if="tipoBusqueda === 'usuarios' && resultados.length > 0">
                  <v-list-item v-for="user in resultados" :key="user.id" border class="mb-2">
                    <v-list-item-title class="font-weight-bold">{{ user.nombre }} ({{ user.email }})</v-list-item-title>
                    <v-list-item-subtitle>Rol: {{ user.rol }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <v-chip-group v-if="tipoBusqueda === 'etiquetas' && resultados.length > 0">
                  <v-chip v-for="tag in resultados" :key="tag.id" color="primary" variant="flat">
                    {{ tag.nombre }}
                  </v-chip>
                </v-chip-group>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

      </v-window>
    </v-card-text>

    <v-dialog v-model="dialogoUsuario" max-width="500">
      <v-card>
        <v-card-title>{{ esEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="formUser.nombre" label="Nombre" variant="outlined" density="compact"></v-text-field>
          <v-text-field v-model="formUser.email" label="Email" type="email" variant="outlined" density="compact"></v-text-field>
          <v-text-field 
            v-model="formUser.password" 
            :label="esEdicion ? 'Nueva Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña'" 
            type="password" 
            variant="outlined" 
            density="compact">
          </v-text-field>
          <v-select v-model="formUser.rol" :items="['usuario', 'admin']" label="Rol" variant="outlined" density="compact"></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialogoUsuario = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarUsuario">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { csrfToken } from '../store/auth.js'

const API_URL = import.meta.env.VITE_API_URL
const tab = ref('usuarios')

const listaUsuarios = ref([])
const listaTags = ref([])

const fetchSeguro = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: { 'x-csrf-token': csrfToken.value },
    credentials: 'include'
  }
  if (body) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }
  const res = await fetch(`${API_URL}${endpoint}`, options)
  if (!res.ok) throw new Error('Error en la petición')
  return await res.json()
}

// ==========================================
// LÓGICA DE USUARIOS (CRUD COMPLETO)
// ==========================================
const cargarUsuarios = async () => {
  try {
    const res = await fetchSeguro('/personas')
    listaUsuarios.value = res.data || res 
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

const cargarTags = async () => {
  try {
    const res = await fetchSeguro('/tags')
    listaTags.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const dialogoUsuario = ref(false)
const esEdicion = ref(false)
const formUser = ref({ nombre: '', email: '', password: '', rol: 'usuario' })

const abrirDialogoUsuario = (user = null) => {
  if (user) {
    esEdicion.value = true
    formUser.value = { ...user, password: '' } // Password vacío para no sobreescribir si no lo cambia
  } else {
    esEdicion.value = false
    formUser.value = { nombre: '', email: '', password: '', rol: 'usuario' }
  }
  dialogoUsuario.value = true
}

const guardarUsuario = async () => {
  try {
    if (esEdicion.value) {
      const payload = { ...formUser.value }
      if (!payload.password) delete payload.password 
      await fetchSeguro(`/personas/${formUser.value.id}`, 'PUT', payload)
    } else {
      await fetchSeguro('/personas/registro', 'POST', formUser.value)
    }
    dialogoUsuario.value = false
    cargarUsuarios()
  } catch (error) {
    alert('Error al guardar usuario')
  }
}

const cambiarEstadoUsuario = async (user) => {
  try {
    await fetchSeguro(`/personas/${user.id}/estado`, 'PATCH', { activo: !user.activo })
    cargarUsuarios()
  } catch (error) {
    alert('Error al cambiar estado')
  }
}

const eliminarUsuario = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario permanentemente?')) return
  try {
    await fetchSeguro(`/personas/${id}`, 'DELETE')
    cargarUsuarios()
  } catch (error) {
    alert('Error al eliminar usuario')
  }
}

// ==========================================
// LÓGICA DE BÚSQUEDAS AVANZADAS
// ==========================================
const opcionesBusqueda = [
  { title: 'Buscar Tareas (por etiquetas)', value: 'tareas' },
  { title: 'Buscar Usuarios (por etiquetas)', value: 'usuarios' },
  { title: 'Buscar Etiquetas (por usuarios)', value: 'etiquetas' }
]
const tipoBusqueda = ref('tareas')
const tagsSeleccionados = ref([])
const usuariosSeleccionados = ref([])
const resultados = ref([])
const cargandoBusqueda = ref(false)

const ejecutarBusqueda = async () => {
  // Validación de que hayan seleccionado algo
  if ((tipoBusqueda.value === 'tareas' || tipoBusqueda.value === 'usuarios') && tagsSeleccionados.value.length === 0) {
    return alert('Por favor, selecciona al menos una etiqueta.')
  }
  if (tipoBusqueda.value === 'etiquetas' && usuariosSeleccionados.value.length === 0) {
    return alert('Por favor, selecciona al menos un usuario.')
  }

  cargandoBusqueda.value = true
  resultados.value = []
  try {
    let endpoint = ''
    let payload = {}

    if (tipoBusqueda.value === 'tareas') {
      endpoint = '/admin/busqueda/tareas'
      payload = { tagsIds: tagsSeleccionados.value }
    } else if (tipoBusqueda.value === 'usuarios') {
      endpoint = '/admin/busqueda/usuarios'
      payload = { tagsIds: tagsSeleccionados.value }
    } else if (tipoBusqueda.value === 'etiquetas') {
      endpoint = '/admin/busqueda/etiquetas'
      payload = { usuariosIds: usuariosSeleccionados.value }
    }

    const res = await fetchSeguro(endpoint, 'POST', payload)
    resultados.value = res.data || []
  } catch (error) {
    console.error('Error en búsqueda', error)
  } finally {
    cargandoBusqueda.value = false
  }
}

onMounted(() => {
  cargarUsuarios()
  cargarTags()
})
</script>