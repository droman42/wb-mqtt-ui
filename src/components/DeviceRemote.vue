<template>
  <div class="device-remote" v-if="deviceStore.currentDevice">
    <h2>{{ deviceStore.currentDevice.name || deviceStore.currentDeviceId }}</h2>
    
    <div class="device-info">
      <p><strong>Device ID:</strong> {{ deviceStore.currentDeviceId }}</p>
      <div v-if="showDeviceDetails" class="device-details">
        <pre>{{ JSON.stringify(deviceStore.currentDevice, null, 2) }}</pre>
        <button @click="showDeviceDetails = false" class="toggle-button">Hide Details</button>
      </div>
      <button v-else @click="showDeviceDetails = true" class="toggle-button">Show Device Details</button>
    </div>
    
    <div class="commands-container">
      <template v-if="deviceStore.currentDevice.commands && deviceStore.currentDevice.commands.length">
        <CommandButton 
          v-for="command in deviceStore.currentDevice.commands" 
          :key="generateKey(command)" 
          :command="command"
        />
      </template>
      <div v-else class="no-commands">
        <p>No commands available for this device</p>
        <button @click="reloadDevice" class="reload-button">Reload Device</button>
      </div>
    </div>
  </div>
  <div class="device-remote empty" v-else>
    <p>Please select a device</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDeviceStore } from '../store/deviceStore';
import CommandButton from './CommandButton.vue';

const deviceStore = useDeviceStore();
const showDeviceDetails = ref(false);

// Generate a unique key for each command
const generateKey = (command: any) => {
  if (command.name) return command.name;
  if (command.action) return command.action;
  if (command.topic) return command.topic;
  return Math.random().toString(36).substring(2, 9); // fallback to random key
};

// Reload the current device
const reloadDevice = async () => {
  if (deviceStore.currentDeviceId) {
    // Force a reload by clearing the cached config first
    delete deviceStore.deviceConfigs[deviceStore.currentDeviceId];
    await deviceStore.selectDevice(deviceStore.currentDeviceId);
  }
};
</script>

<style scoped>
.device-remote {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 200px;
}

.device-remote.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-style: italic;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
  color: #2c3e50;
}

.device-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #ecf0f1;
  border-radius: 4px;
}

.device-details {
  margin-top: 10px;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.toggle-button {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 12px;
}

.reload-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}

.commands-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.no-commands {
  grid-column: 1 / -1;
  color: #7f8c8d;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 12px;
}
</style> 