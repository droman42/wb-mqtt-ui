<template>
  <div class="command-button">
    <div class="command-info">
      <button 
        v-if="!svgData"
        @click="executeCommand" 
        :disabled="isExecuting"
        :class="{ 'is-executing': isExecuting }"
        :title="getCommandInfo"
      >
        {{ getCommandLabel }}
      </button>
      <div v-else class="svg-button" @click="executeCommand" :title="getCommandInfo">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect v-if="svgData.rect" v-bind="svgData.rect" />
          <path v-for="(path, index) in svgData.paths" :key="index" :d="path" />
          <text v-if="svgData.text" v-bind="svgData.text">{{ svgData.text.content }}</text>
        </svg>
        <span v-if="uiStore.showButtonText">{{ props.command.description || getCommandLabel }}</span>
      </div>
      
      <div v-if="showDetails" class="details">
        <pre>{{ JSON.stringify(command, null, 2) }}</pre>
        <button @click="showDetails = false" class="details-toggle">Hide</button>
      </div>
      <button v-else @click="showDetails = true" class="details-toggle">Info</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDeviceStore } from '../store/deviceStore';
import { useUiStore } from '../store/uiStore';
import { svgMapping } from '../utils/svgMapping';

interface Command {
  name?: string;
  action?: string;
  actions?: string[];
  topic?: string;
  description?: string;
  [key: string]: any;
}

const props = defineProps<{
  command: Command;
}>();

const deviceStore = useDeviceStore();
const uiStore = useUiStore();
const isExecuting = ref(false);
const showDetails = ref(false);

// Computed command label
const getCommandLabel = computed(() => {
  return props.command.name || 
         props.command.action || 
         props.command.topic || 
         'Unnamed Command';
});

// Computed command info for tooltip
const getCommandInfo = computed(() => {
  const parts = [];
  
  if (props.command.action) {
    parts.push(`Action: ${props.command.action}`);
  }
  
  if (props.command.topic) {
    parts.push(`MQTT Topic: ${props.command.topic}`);
  }
  
  if (props.command.actions && props.command.actions.length) {
    parts.push(`Actions: ${props.command.actions.join(', ')}`);
  }
  
  if (props.command.description) {
    parts.push(`Description: ${props.command.description}`);
  }
  
  return parts.join('\n');
});

// Computed property to determine SVG data based on command action
const svgData = computed(() => {
  if (props.command.action && svgMapping[props.command.action]) {
    return svgMapping[props.command.action];
  }
  return null;
});

const executeCommand = async () => {
  isExecuting.value = true;
  
  try {
    const command = { ...props.command };
    
    // Use the global MQTT setting to determine execution mode
    if (uiStore.defaultUseMqtt && command.topic) {
      // Create a command that only has the topic property
      await deviceStore.executeCommand({ topic: command.topic });
    } else {
      // Use the regular command (which might have action or actions)
      await deviceStore.executeCommand(command);
    }
  } catch (error) {
    console.error('Error executing command:', error);
  } finally {
    isExecuting.value = false;
  }
};
</script>

<style src="../assets/CommandButton.css" scoped></style> 