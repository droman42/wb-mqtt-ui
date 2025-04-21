<template>
  <div class="device-remote" v-if="deviceStore.currentDevice">
    <h2>{{ deviceStore.currentDevice.name || deviceStore.currentDeviceId }}</h2>
    
    <div class="device-info">
      <p><strong>Device ID:</strong> {{ deviceStore.currentDeviceId }}</p>
      <p v-if="deviceStore.currentDevice.position !== undefined"><strong>Position:</strong> {{ deviceStore.currentDevice.position }}</p>
      <div v-if="showDeviceDetails" class="device-details">
        <pre>{{ JSON.stringify(deviceStore.currentDevice, null, 2) }}</pre>
        <button @click="showDeviceDetails = false" class="toggle-button">Hide Details</button>
      </div>
      <button v-else @click="showDeviceDetails = true" class="toggle-button">Show Device Details</button>
    </div>
    
    <!-- Grouped commands view -->
    <div class="grouped-view">
      <GroupedCommands />
    </div>
  </div>
  <div class="device-remote empty" v-else>
    <p>Please select a device</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDeviceStore } from '../store/deviceStore';
import GroupedCommands from './GroupedCommands.vue';

const deviceStore = useDeviceStore();
const showDeviceDetails = ref(false);

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