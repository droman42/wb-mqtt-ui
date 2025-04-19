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

<style src="../assets/DeviceRemote.css" scoped></style> 