import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify.ts'
import router from './router/index.js' // <-- Importamos el router

const app = createApp(App)

app.use(vuetify)
app.use(router) // <-- Lo conectamos a Vue

app.mount('#app')