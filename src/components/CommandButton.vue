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
        <svg 
          :viewBox="dynamicViewBox" 
          aria-hidden="true"
          :class="{ 'text-based-svg': svgData.text }"
          preserveAspectRatio="xMidYMid meet"
        >
          <!-- Single rectangle -->
          <rect v-if="svgData.rect" v-bind="svgData.rect" />
          
          <!-- Multiple rectangles -->
          <rect v-for="(rect, index) in svgData.rects" :key="`rect-${index}`" v-bind="rect" />
          
          <!-- Handle both string and object paths, explicitly binding kebab-case attributes -->
          <path 
            v-for="(path, index) in svgData.paths" 
            :key="index" 
            :d="typeof path === 'string' ? path : path.d"
            :stroke="typeof path === 'object' ? path.stroke : null"
            :stroke-width="typeof path === 'object' ? path['stroke-width'] : null"
            :fill="typeof path === 'object' ? path.fill : null"
            :opacity="typeof path === 'object' ? path.opacity : null"
          />
          <text v-if="svgData.text" 
            :x="svgData.text.x" 
            :y="svgData.text.y" 
            :fill="svgData.text.fill" 
            :font-size="svgData.text['font-size'] || svgData.text.fontSize" 
            :font-weight="svgData.text['font-weight'] || svgData.text.fontWeight" 
            :font-family="svgData.text['font-family'] || svgData.text.fontFamily" 
            :text-anchor="svgData.text['text-anchor'] || svgData.text.textAnchor" 
            :dominant-baseline="svgData.text['dominant-baseline'] || svgData.text.dominantBaseline || 'central'"
            alignment-baseline="central"
          >{{ svgData.text.content }}</text>
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

// Computed property to determine if SVG viewBox should be adjusted for text length
const dynamicViewBox = computed(() => {
  // If a specific viewBox is defined, use it directly
  if (svgData.value?.viewBox) {
    return svgData.value.viewBox;
  }
  
  // Otherwise calculate a dynamic viewBox based on text content
  if (svgData.value && svgData.value.text) {
    const text = svgData.value.text.content;
    const fontSize = svgData.value.text.fontSize || 14;
    // Rough estimate: each character is about 0.6x the font size in width
    const estimatedWidth = Math.max(100, text.length * fontSize * 0.6);
    return `0 0 ${estimatedWidth} 24`;
  }
  
  // Default viewBox for regular icon SVGs
  return '0 0 24 24';
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