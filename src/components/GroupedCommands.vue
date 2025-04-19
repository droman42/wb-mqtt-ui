<template>
  <div class="grouped-commands">
    <div v-if="deviceStore.currentGroupId" class="group-commands">
      <h3>{{ currentGroupName }}</h3>
      <div class="commands-container">
        <template v-if="deviceStore.currentGroupCommands.length">
          <CommandButton 
            v-for="command in deviceStore.currentGroupCommands" 
            :key="generateKey(command)" 
            :command="command"
          />
        </template>
        <div v-else class="no-commands">
          <p>No commands available in this group</p>
        </div>
      </div>
    </div>
    <div v-else class="no-group-selected">
      <p>Please select a command group</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDeviceStore } from '../store/deviceStore';
import CommandButton from './CommandButton.vue';

const deviceStore = useDeviceStore();

// Get the name of the currently selected group
const currentGroupName = computed(() => {
  if (!deviceStore.currentDeviceId || !deviceStore.currentGroupId) return '';
  
  const groups = deviceStore.deviceGroups[deviceStore.currentDeviceId] || [];
  const currentGroup = groups.find(g => g.group_id === deviceStore.currentGroupId);
  
  return currentGroup?.group_name || '';
});

// Generate a unique key for each command
const generateKey = (command: any) => {
  if (command.name) return command.name;
  if (command.action) return command.action;
  if (command.topic) return command.topic;
  return Math.random().toString(36).substring(2, 9); // fallback to random key
};
</script>

<style>
.grouped-commands {
  margin-top: 1rem;
}

.group-commands {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  background-color: #f9f9f9;
}

.commands-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.no-commands, .no-group-selected {
  padding: 1rem;
  text-align: center;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-top: 1rem;
}
</style> 