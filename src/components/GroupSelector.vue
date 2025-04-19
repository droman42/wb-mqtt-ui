<template>
  <div class="group-selector">
    <h3>Command Groups</h3>
    <div class="groups-container">
      <button 
        v-for="group in deviceStore.deviceGroupsList" 
        :key="group.group_id"
        @click="selectGroup(group.group_id)"
        :class="{ active: deviceStore.currentGroupId === group.group_id, 'no-actions': group.status === 'no_actions' }"
        :disabled="group.status === 'no_actions'"
      >
        {{ group.group_name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDeviceStore } from '../store/deviceStore';

const deviceStore = useDeviceStore();

const selectGroup = async (groupId: string) => {
  await deviceStore.selectGroup(groupId);
};
</script>

<style>
.group-selector {
  margin-bottom: 1rem;
}

.groups-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.groups-container button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
}

.groups-container button:hover {
  background-color: #e0e0e0;
}

.groups-container button.active {
  background-color: #007bff;
  color: white;
  border-color: #0069d9;
}

.groups-container button.no-actions {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 