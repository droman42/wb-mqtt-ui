<template>
  <div class="grouped-commands">
    <div v-if="filteredGroups.length" class="command-grid">
      <template v-for="group in filteredGroups" :key="group.group_id">
        <!-- Group container that spans only the needed columns -->
        <div 
          class="group-container"
          :class="[
            `span-${Math.min(4, group.actions?.length || 1)}`,
            { 'empty-group': !group.actions || !group.actions.length }
          ]"
        >
          <span class="group-name">{{ group.group_name }}</span>
          <div class="group-commands">
            <template v-if="group.actions && group.actions.length">
              <CommandButton 
                v-for="command in group.actions" 
                :key="generateKey(command)" 
                :command="command"
                class="grid-button"
              />
            </template>
            <div v-else class="no-commands">
              <p>No commands available in this group</p>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div v-else class="no-groups">
      <p>No command groups available for this device</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDeviceStore } from '../store/deviceStore';
import CommandButton from './CommandButton.vue';

const deviceStore = useDeviceStore();

// Filter groups to hide empty 'default' group
const filteredGroups = computed(() => {
  return deviceStore.sortedDeviceGroups.filter(group => {
    // Hide default group if it has no actions
    if (group.group_id === 'default' && (!group.actions || group.actions.length === 0)) {
      return false;
    }
    return true;
  });
});

// Generate a unique key for each command
const generateKey = (command: any) => {
  if (command.name) return command.name;
  if (command.action) return command.action;
  if (command.topic) return command.topic;
  return Math.random().toString(36).substring(2, 9); // fallback to random key
};
</script>

<style src="../assets/GroupedCommands.css" scoped></style> 