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
  <div class="app-container" :class="{ 'dark-theme': uiStore.darkTheme }">
    <router-view />
  </div>
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  background-color: #f8f9fa;
  color: #333;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Dark theme styles */
.dark-theme {
  background-color: #121212;
  color: #f1f1f1;
}

/* Utility classes */
.text-center {
  text-align: center;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

/* Button styles */
button {
  cursor: pointer;
  font-family: inherit;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  transition: all 0.2s;
}

button:hover {
  background-color: #e9ecef;
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.dark-theme button {
  background-color: #333;
  color: #f1f1f1;
  border-color: #555;
}

.dark-theme button:hover {
  background-color: #444;
}
</style>
