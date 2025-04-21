<template>
  <div class="device-page">
    <h1>Universal Remote Control</h1>
    
    <!-- First Grid Row: Selectors and Settings Button -->
    <div class="grid">
      <!-- Device Selector (col-8) -->
      <div class="col-8">
        <div class="grid">
          <div class="col-6">
            <DeviceSelector />
          </div>
          <div class="col-6">
            <div class="scenario-selector">
              <select disabled>
                <option>Scenario Selector (placeholder)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty cell for spacing (col-2) -->
      <div class="col-2"></div>
      
      <!-- Settings Button (col-2) -->
      <div class="col-2">
        <button class="settings-button" @click="navigateToSettings">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Second Grid Row: Information Panel -->
    <div class="grid mt-3">
      <div class="col-12 info-panel" v-if="deviceStore.currentDevice">
        <p><strong>Device ID:</strong> {{ deviceStore.currentDeviceId }}</p>
        <p><strong>Device Name:</strong> {{ deviceStore.currentDevice.name }}</p>
      </div>
      <div class="col-12 info-panel empty" v-else>
        <p>Please select a device to view details</p>
      </div>
    </div>
    
    <!-- Third Grid Row and Beyond: Remote Simulator -->
    <div v-if="isConnecting || deviceStore.isLoading" class="grid mt-3">
      <div class="col-12 loading-message">
        {{ isConnecting ? 'Connecting to server...' : 'Loading data...' }}
      </div>
    </div>
    
    <ErrorDisplay 
      v-if="error" 
      :error="error" 
      @retry="reloadData" 
    />
    
    <RemoteSimulator v-if="deviceStore.currentDevice && !isConnecting && !error" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import DeviceSelector from '../components/DeviceSelector.vue';
import RemoteSimulator from '../components/RemoteSimulator.vue';
import ErrorDisplay from '../components/ErrorDisplay.vue';
import { useDeviceStore } from '../store/deviceStore';
import { useUiStore } from '../store/uiStore';
import { checkServerConnectivity } from '../utils/serverCheck';

// Define error type
interface ErrorInfo {
  title: string;
  message: string;
  type: 'cors' | 'network' | 'server' | 'unknown' | 'device';
}

const router = useRouter();
const deviceStore = useDeviceStore();
const uiStore = useUiStore();
const error = ref<ErrorInfo | null>(null);
const isConnecting = ref(false);

function navigateToSettings() {
  router.push('/settings');
}

// Watch for errors in the logs
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

<style>
.device-page {
  padding: 1rem;
}

.info-panel {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-panel.empty {
  background-color: #e9ecef;
  color: #6c757d;
  text-align: center;
}

.loading-message {
  padding: 1rem;
  background-color: #e9ecef;
  border-radius: 8px;
  text-align: center;
  color: #6c757d;
}

.scenario-selector select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-button svg {
  fill: #6c757d;
}

.settings-button:hover {
  background-color: #e9ecef;
}

/* Dark theme styles */
.dark-theme .info-panel {
  background-color: #2a2a2a;
}

.dark-theme .info-panel.empty {
  background-color: #333;
  color: #adb5bd;
}

.dark-theme .loading-message {
  background-color: #333;
  color: #adb5bd;
}

.dark-theme .scenario-selector select {
  background-color: #333;
  border-color: #444;
  color: #adb5bd;
}

.dark-theme .settings-button {
  background-color: #333;
  border-color: #444;
}

.dark-theme .settings-button svg {
  fill: #adb5bd;
}

.dark-theme .settings-button:hover {
  background-color: #444;
}
</style> 