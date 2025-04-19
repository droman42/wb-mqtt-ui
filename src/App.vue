<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import DeviceSelector from './components/DeviceSelector.vue';
import DeviceRemote from './components/DeviceRemote.vue';
import LogsPanel from './components/LogsPanel.vue';
import ErrorDisplay from './components/ErrorDisplay.vue';
import { useDeviceStore } from './store/deviceStore';
import { useUiStore } from './store/uiStore';
import { checkServerConnectivity } from './utils/serverCheck';

// Define error type
interface ErrorInfo {
  title: string;
  message: string;
  type: 'cors' | 'network' | 'server' | 'unknown' | 'device';
}

const deviceStore = useDeviceStore();
const uiStore = useUiStore();
const error = ref<ErrorInfo | null>(null);
const isConnecting = ref(false);

// Watch for errors in the logs
watch(() => deviceStore.logs, (newLogs) => {
  if (newLogs.length > 0 && !newLogs[0].success) {
    const message = newLogs[0].message;
    
    if (message.includes('Network Error')) {
      error.value = {
        title: 'Network Error',
        message: 'Could not connect to the server. Check if the server is running and accessible.',
        type: 'network'
      };
    } else if (message.includes('CORS')) {
      error.value = {
        title: 'CORS Error',
        message: 'The server is not configured to allow cross-origin requests from this application.',
        type: 'cors'
      };
    } else if (message.includes('Failed to load device configuration')) {
      error.value = {
        title: 'Device Configuration Error',
        message: 'Could not load the device configuration. The device might not exist or the configuration format is incorrect.',
        type: 'device'
      };
    } else if (message.includes('MQTT')) {
      error.value = {
        title: 'MQTT Operation Error',
        message: 'The server encountered an error when trying to publish to MQTT. Check the server logs for more details.',
        type: 'server'
      };
    } else {
      error.value = {
        title: 'Error',
        message: message,
        type: 'unknown'
      };
    }
  } else if (deviceStore.devices.length > 0) {
    // If we have devices, clear the error
    error.value = null;
  }
}, { deep: true });

const reloadData = async () => {
  error.value = null;
  isConnecting.value = true;
  
  try {
    const result = await checkServerConnectivity();
    if (result.success) {
      // Require system configuration
      await deviceStore.reloadAll(); 
    } else {
      error.value = {
        title: 'Connection Error',
        message: result.message,
        type: 'network'
      };
    }
  } catch (err) {
    console.error('Error checking connectivity:', err);
    error.value = {
      title: 'System Configuration Error',
      message: 'Could not reload system configuration. Please check the server.',
      type: 'server'
    };
  } finally {
    isConnecting.value = false;
  }
};

onMounted(async () => {
  // Check server connectivity first
  isConnecting.value = true;
  
  try {
    const result = await checkServerConnectivity();
    if (result.success) {
      // System configuration is required
      await deviceStore.loadSystemConfig();
      
      // Load command groups
      try {
        await deviceStore.loadCommandGroups();
      } catch (err) {
        console.error('Error loading command groups:', err);
        // Command groups are optional, so we can continue
      }
    } else {
      error.value = {
        title: 'Connection Error',
        message: result.message,
        type: 'network'
      };
    }
  } catch (err) {
    console.error('Error in initial connectivity check:', err);
    error.value = {
      title: 'System Configuration Error',
      message: 'Could not load essential system configuration. Please check the server.',
      type: 'server'
    };
  } finally {
    isConnecting.value = false;
  }
});
</script>

<template>
  <div id="app">
    <header>
      <h1>WB MQTT UI</h1>
      <div class="toolbar">
        <DeviceSelector />
        
        <div class="ui-settings">
          <label class="ui-setting-toggle">
            <input 
              type="checkbox" 
              v-model="uiStore.showButtonText"
              @change="uiStore.saveSettings"
            />
            Show button text
          </label>
          
          <label class="ui-setting-toggle">
            <input 
              type="checkbox" 
              v-model="uiStore.defaultUseMqtt"
              @change="uiStore.saveSettings"
            />
            Use MQTT by default
          </label>
        </div>
      </div>
    </header>
    
    <div v-if="isConnecting || deviceStore.isLoading" class="loading-message">
      {{ isConnecting ? 'Connecting to server...' : 'Loading data...' }}
    </div>
    
    <ErrorDisplay 
      v-if="error" 
      :error="error" 
      @retry="reloadData" 
    />
    
    <main>
      <DeviceRemote />
    </main>
    
    <aside>
      <LogsPanel />
    </aside>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  line-height: 1.6;
  background-color: #f5f5f5;
}

#app {
  display: grid;
  grid-template-areas:
    "header header"
    "main aside";
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

header {
  grid-area: header;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
}

header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.ui-settings {
  display: flex;
  gap: 1rem;
}

.ui-setting-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.loading-message {
  grid-area: main;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
  color: #6c757d;
}

main {
  grid-area: main;
}

aside {
  grid-area: aside;
}

@media (max-width: 768px) {
  #app {
    grid-template-areas:
      "header"
      "main"
      "aside";
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .ui-settings {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 0.5rem;
  }
}
</style>
