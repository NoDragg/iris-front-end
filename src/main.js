import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { i18n } from './i18n'
import { api } from './api'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.mount('#app')

// Ping BE mỗi 5 phút để giữ server Render không sleep (không cần user tương tác).
api.ping()
setInterval(() => api.ping(), 5 * 60 * 1000)
