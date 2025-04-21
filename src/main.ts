import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { useUiStore } from './store/uiStore'

// Import PrimeFlex CSS
import 'primeflex/primeflex.css'

// Import views
import DevicePage from './views/DevicePage.vue'
import SettingsPage from './views/SettingsPage.vue'

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DevicePage },
    { path: '/settings', component: SettingsPage },
  ]
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize UI settings from localStorage or defaults
const uiStore = useUiStore()
uiStore.initializeSettings()

// Mount the application
app.mount('#app')
