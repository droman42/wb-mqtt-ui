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

<style src="../assets/GroupSelector.css" scoped></style> 