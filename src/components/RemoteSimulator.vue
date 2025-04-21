<template>
  <div class="remote-simulator mt-3">
    <div v-if="deviceStore.currentDevice">
      <!-- Grid layout for buttons based on position -->
      <div class="remote-grid" :class="{ 'debug-grid': uiStore.debugMode }">
        <!-- Group overlays using grid areas for precise positioning -->
        <template v-for="groupName in Object.keys(groupBounds)" :key="groupName">
          <div v-if="groupName !== 'none'"
               class="group-overlay" 
               :class="{ 'debug-overlay': uiStore.debugMode }"
               :style="getGroupStyle(groupBounds[groupName])">
            <span class="group-name" :class="{ 'debug-label': uiStore.debugMode }">{{ groupName }}</span>
          </div>
        </template>
        
        <!-- Create grid cells for each possible position -->
        <template v-for="row in rowLetters" :key="row">
          <template v-for="col in 4" :key="`${row}${col-1}`">
            <div class="remote-cell" :class="{ 'debug-cell': uiStore.debugMode }" :data-position="`${row}${col-1}`">
              <!-- Find and render the command at this position -->
              <template v-if="getCommandAtPosition(`${row}${col-1}`)">
                <div class="button-wrapper">
                  <CommandButton 
                    :command="getCommandAtPosition(`${row}${col-1}`)"
                    :key="generateCommandKey(getCommandAtPosition(`${row}${col-1}`))"
                    :data-group="getGroupForPosition(`${row}${col-1}`)"
                  />
                </div>
              </template>
            </div>
          </template>
        </template>
      </div>
      
      <!-- Message if no commands -->
      <div v-if="positionedCommands.length === 0" class="grid">
        <div class="col-12">
          <div class="empty-message">
            No commands available for this device
          </div>
        </div>
      </div>
    </div>
    
    <!-- Message if no device selected -->
    <div v-else class="grid">
      <div class="col-12">
        <div class="empty-message">
          Please select a device
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDeviceStore } from '../store/deviceStore';
import { useUiStore } from '../store/uiStore';
import CommandButton from './CommandButton.vue';
import { 
  getCommandAtPosition as getCommandByPosition, 
  getGroupCellPositions,
  calculateGroupBounds,
  generateCommandKey
} from '../utils/gridHelpers';

const deviceStore = useDeviceStore();
const uiStore = useUiStore();

// Get all commands with positions
const positionedCommands = computed(() => {
  if (!deviceStore.currentDevice || !deviceStore.currentDevice.commands) {
    return [];
  }
  
  // Filter commands that have position attributes
  return deviceStore.currentDevice.commands.filter(cmd => cmd.position);
});

// Get unique row letters from positions
const rowLetters = computed(() => {
  const rows = new Set<string>();
  
  positionedCommands.value.forEach(cmd => {
    if (cmd.position) {
      const match = cmd.position.match(/^([A-Z])/i);
      if (match) {
        rows.add(match[1].toUpperCase());
      }
    }
  });
  
  return Array.from(rows).sort();
});

// Get group positions
const groupPositions = computed(() => {
  return getGroupCellPositions(positionedCommands.value);
});

// Calculate group bounds
const groupBounds = computed(() => {
  return calculateGroupBounds(groupPositions.value);
});

// Get the command at a specific position
function getCommandAtPosition(position: string): any {
  return getCommandByPosition(positionedCommands.value, position);
}

// Get the group name for a command at a specific position
function getGroupForPosition(position: string): string | null {
  const command = getCommandAtPosition(position);
  return command ? command.group || null : null;
}

// Generate CSS styles for group overlays
function getGroupStyle(bounds: { 
  gridArea: string;
  extraStyles: {
    margin: string;
    padding: string;
  };
}) {
  return {
    gridArea: bounds.gridArea,
    margin: bounds.extraStyles.margin,
    padding: bounds.extraStyles.padding
  };
}
</script>

<style>
.remote-simulator {
  margin-top: 2rem;
  position: relative;
}

.remote-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(60px, auto);
  gap: 0.5rem;
  position: relative;
  padding: 0.5rem;
}

.remote-cell {
  padding: 0.25rem;
  position: relative;
  min-height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10; /* Make cells appear above group overlays */
}

/* Debug mode styling */
.debug-grid {
  background-color: rgba(255, 0, 0, 0.05);
}

.debug-cell {
  outline: 1px solid red !important;
}

.debug-overlay {
  border: 1px dashed red !important;
  background-color: rgba(255, 0, 0, 0.1);
}

.debug-label {
  background-color: #ffeeee !important;
  color: red !important;
}

/* Explicitly set grid position for each cell */
.remote-cell[data-position^="A"] { grid-row: 1; }
.remote-cell[data-position^="B"] { grid-row: 2; }
.remote-cell[data-position^="C"] { grid-row: 3; }
.remote-cell[data-position^="D"] { grid-row: 4; }
.remote-cell[data-position^="E"] { grid-row: 5; }
.remote-cell[data-position^="F"] { grid-row: 6; }
.remote-cell[data-position^="G"] { grid-row: 7; }
.remote-cell[data-position^="H"] { grid-row: 8; }

.remote-cell[data-position$="0"] { grid-column: 1; }
.remote-cell[data-position$="1"] { grid-column: 2; }
.remote-cell[data-position$="2"] { grid-column: 3; }
.remote-cell[data-position$="3"] { grid-column: 4; }

.button-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

/* Group overlay styling */
.group-overlay {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: transparent;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
}

.group-name {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 0 8px;
  font-size: 0.75rem;
  border-radius: 4px;
  z-index: 5;
  font-weight: bold;
  color: #666;
  white-space: nowrap;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  background-color: #f0f0f0;
  border-radius: 8px;
  color: #666;
  font-style: italic;
}

/* Dark theme styles */
.dark-theme .group-name {
  background-color: #1e1e1e;
  color: #aaa;
}

.dark-theme .group-overlay {
  border-color: #444;
}

.dark-theme .empty-message {
  background-color: #333;
  color: #adb5bd;
}

/* Responsive styles to make buttons smaller on different screen sizes */
@media (max-width: 768px) {
  .remote-cell {
    min-height: 50px;
  }
  
  .remote-cell {
    padding: 0.2rem;
  }
}
</style> 