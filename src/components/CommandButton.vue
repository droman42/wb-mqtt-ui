<template>
  <div class="command-button">
    <div class="command-info">
      <button 
        @click="executeCommand" 
        :disabled="isExecuting"
        :class="{ 'is-executing': isExecuting }"
        :title="getCommandInfo"
      >
        {{ getCommandLabel }}
      </button>
      
      <div v-if="showDetails" class="details">
        <pre>{{ JSON.stringify(command, null, 2) }}</pre>
        <button @click="showDetails = false" class="details-toggle">Hide</button>
      </div>
      <button v-else @click="showDetails = true" class="details-toggle">Info</button>
    </div>
    
    <div v-if="command.topic" class="execution-mode">
      <label>
        <input 
          type="checkbox" 
          v-model="useMqtt" 
        />
        Use MQTT
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDeviceStore } from '../store/deviceStore';

interface Command {
  name?: string;
  action?: string;
  actions?: string[];
  topic?: string;
  [key: string]: any;
}

const props = defineProps<{
  command: Command;
}>();

const deviceStore = useDeviceStore();
const isExecuting = ref(false);
const useMqtt = ref(false);
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
  
  return parts.join('\n');
});

const executeCommand = async () => {
  isExecuting.value = true;
  
  try {
    const command = { ...props.command };
    
    // If MQTT is toggled on and there's a topic, only use the topic
    if (useMqtt.value && command.topic) {
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

<style scoped>
.command-button {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
}

.command-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  background-color: #2c3e50;
  color: white;
  cursor: pointer;
  min-width: 150px;
  font-weight: bold;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #1c2e40;
}

button:active {
  background-color: #0c1e30;
}

button.is-executing {
  background-color: #95a5a6;
  cursor: wait;
}

.details-toggle {
  background-color: #6c757d;
  color: white;
  padding: 2px 8px;
  font-size: 12px;
  margin-top: 5px;
  min-width: auto;
  align-self: flex-start;
}

.details {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin-top: 5px;
  font-size: 12px;
  overflow-x: auto;
  width: 100%;
}

.details pre {
  margin: 0 0 5px 0;
  white-space: pre-wrap;
  font-family: monospace;
}

.execution-mode {
  margin-left: 10px;
  display: flex;
  align-items: center;
}

label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

input[type="checkbox"] {
  margin-right: 5px;
}
</style> 