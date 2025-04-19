<template>
  <div class="device-page">
    <h1>Device Testing Interface</h1>
    
    <DeviceSelector />
    
    <div v-if="isConnecting || deviceStore.isLoading" class="loading-message">
      {{ isConnecting ? 'Connecting to server...' : 'Loading data...' }}
    </div>
    
    <ErrorDisplay 
      v-if="error" 
      :error="error" 
      @retry="reloadData" 
    />
    
    <div v-if="showDebug" class="debug-info">
      <h4>Debug Info:</h4>
      <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      <button @click="toggleDebug" class="debug-button">
        Hide Debug Info
      </button>
    </div>
    <button v-else @click="toggleDebug" class="debug-button">
      Show Debug Info
    </button>
    
    <DeviceRemote v-if="deviceStore.devices.length > 0" />
    
    <LogsPanel />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, defineComponent } from 'vue';
import DeviceSelector from '../components/DeviceSelector.vue';
import DeviceRemote from '../components/DeviceRemote.vue';
import LogsPanel from '../components/LogsPanel.vue';
import ErrorDisplay from '../components/ErrorDisplay.vue';
import { useDeviceStore } from '../store/deviceStore';
import { checkServerConnectivity } from '../utils/serverCheck';

// Export the component for Vetur
defineComponent({
  name: 'DevicePage'
});

// Define error type
interface ErrorInfo {
  title: string;
  message: string;
  type: 'cors' | 'network' | 'server' | 'unknown' | 'device';
}

const deviceStore = useDeviceStore();
const showDebug = ref(false);
const error = ref<ErrorInfo | null>(null);
const isConnecting = ref(false);

const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_BASE_URL || '/api';
});

const debugInfo = computed(() => {
  return {
    api: apiBaseUrl.value,
    devices: deviceStore.devices,
    currentDeviceId: deviceStore.currentDeviceId,
    isLoading: deviceStore.isLoading,
    systemConfig: deviceStore.systemConfig,
    logs: deviceStore.logs.slice(0, 5) // Just show the first 5 logs
  };
});

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
  } finally {
    isConnecting.value = false;
  }
};

const toggleDebug = () => {
  showDebug.value = !showDebug.value;
};

onMounted(async () => {
  // Check server connectivity first
  isConnecting.value = true;
  
  try {
    const result = await checkServerConnectivity();
    if (result.success) {
      // Load system configuration on page load
      await deviceStore.loadSystemConfig();
    } else {
      error.value = {
        title: 'Connection Error',
        message: result.message,
        type: 'network'
      };
    }
  } catch (err) {
    console.error('Error in initial connectivity check:', err);
  } finally {
    isConnecting.value = false;
  }
});
</script>

<style scoped>
.device-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

.loading-message {
  text-align: center;
  font-size: 18px;
  padding: 20px;
  color: #3498db;
}

.debug-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin: 15px 0;
  display: block;
}

.debug-info {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 15px;
  margin: 15px 0;
  text-align: left;
  color: #212529;
  overflow-x: auto;
}

pre {
  white-space: pre-wrap;
  font-family: monospace;
}
</style> 