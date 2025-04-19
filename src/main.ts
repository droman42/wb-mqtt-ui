import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useUiStore } from './store/uiStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Initialize UI settings from localStorage or defaults
const uiStore = useUiStore()
uiStore.initializeSettings()

// Mount the application
app.mount('#app')
