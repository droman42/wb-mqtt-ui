<template>
  <div class="device-selector">
    <label for="device-select">Select Device:</label>
    <select 
      id="device-select" 
      v-model="selectedDeviceId"
      :disabled="deviceStore.isLoading"
    >
      <option value="" disabled>-- Select a device --</option>
      <option 
        v-for="deviceId in deviceStore.devices" 
        :key="deviceId" 
        :value="deviceId"
      >
        {{ deviceId }}
      </option>
    </select>
    <button 
      @click="deviceStore.reloadAll" 
      :disabled="deviceStore.isLoading"
      class="reload-button"
      title="Reload all devices"
    >
      <span class="reload-icon">↻</span>
    </button>
    <div v-if="deviceStore.isLoading" class="loading-indicator">Loading...</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDeviceStore } from '../store/deviceStore';

const deviceStore = useDeviceStore();

const selectedDeviceId = computed({
  get: () => deviceStore.currentDeviceId || '',
  set: (value: string) => {
    if (value) {
      deviceStore.selectDevice(value);
    }
  }
});
</script>

<style src="../assets/DeviceSelector.css" scoped></style> 