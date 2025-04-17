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

<style scoped>
.device-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

label {
  margin-right: 10px;
  font-weight: bold;
}

select {
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-width: 200px;
}

.reload-button {
  margin-left: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.reload-button:hover {
  background-color: #2980b9;
  transform: rotate(45deg);
}

.reload-icon {
  font-size: 20px;
}

.loading-indicator {
  margin-left: 10px;
  color: #3498db;
  font-style: italic;
}
</style> 