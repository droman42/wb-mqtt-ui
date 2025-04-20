import { defineStore } from 'pinia';
import { apiService } from '../services/apiService';

interface SystemConfig {
  version: string;
  mqtt_broker?: {
    host: string;
    port: number;
    client_id: string;
    auth: {
      username: string;
      password: string;
    };
    keepalive: number;
  };
  devices: string[];
}

interface DeviceConfig {
  id: string;
  name: string;
  commands: Command[];
}

interface Command {
  name?: string;
  action?: string;
  actions?: string[];
  topic?: string;
  description?: string;
  [key: string]: any;
}

interface CommandGroup {
  group_id: string;
  group_name: string;
  actions: Command[];
  status: string;
}

interface LogEntry {
  message: string;
  timestamp: string;
  success: boolean;
}

export const useDeviceStore = defineStore('device', {
  state: () => ({
    systemConfig: null as SystemConfig | null,
    devices: [] as string[],
    deviceConfigs: {} as Record<string, DeviceConfig>,
    currentDeviceId: null as string | null,
    logs: [] as LogEntry[],
    isLoading: false,
    commandGroups: [] as { id: string, name: string }[],
    deviceGroups: {} as Record<string, CommandGroup[]>,
    currentGroupId: null as string | null,
  }),
  
  getters: {
    currentDevice: (state) => 
      state.currentDeviceId ? state.deviceConfigs[state.currentDeviceId] : null,
    
    deviceGroupsList: (state) => {
      if (!state.currentDeviceId) return [];
      return state.deviceGroups[state.currentDeviceId] || [];
    },
    
    sortedDeviceGroups: (state) => {
      if (!state.currentDeviceId) return [];
      const groups = [...(state.deviceGroups[state.currentDeviceId] || [])];
      
      // Sort groups with 'default' group last
      return groups.sort((a, b) => {
        if (a.group_id === 'default') return 1;
        if (b.group_id === 'default') return -1;
        return a.group_name.localeCompare(b.group_name);
      });
    },
    
    currentGroupCommands: (state) => {
      if (!state.currentDeviceId || !state.currentGroupId) return [];
      
      const groups = state.deviceGroups[state.currentDeviceId] || [];
      const currentGroup = groups.find(g => g.group_id === state.currentGroupId);
      
      return currentGroup?.actions || [];
    }
  },
  
  actions: {
    /**
     * Load system configuration
     */
    async loadSystemConfig() {
      this.isLoading = true;
      try {
        const response = await apiService.loadSystemConfig();
        const config = response as unknown as SystemConfig;
        this.systemConfig = config;
        this.devices = config.devices || [];
        this.isLoading = false;
      } catch (error) {
        this.addLog(`Failed to load system configuration: ${error}`, false);
        this.isLoading = false;
      }
    },
    
    /**
     * Load available command groups
     */
    async loadCommandGroups() {
      this.isLoading = true;
      try {
        const groups = await apiService.getCommandGroups();
        this.commandGroups = groups;
        this.isLoading = false;
        this.addLog('Loaded command groups', true);
      } catch (error) {
        // Just log the error but don't mark it as failed - the app can still work without groups
        console.error(`Failed to load command groups: ${error}`);
        // Set an empty array as fallback
        this.commandGroups = [];
        this.isLoading = false;
        // Don't add to logs to avoid triggering error display
      }
    },
    
    /**
     * Load device groups for a specific device
     */
    async loadDeviceGroups(deviceId: string) {
      this.isLoading = true;
      try {
        const response = await apiService.getDeviceGroups(deviceId);
        this.deviceGroups[deviceId] = response.groups || [];
        
        // Load actions for all groups immediately
        const groups = this.deviceGroups[deviceId] || [];
        
        // Create an array of promises for loading all group actions
        const loadPromises = groups.map(group => 
          this.loadGroupActions(deviceId, group.group_id)
        );
        
        // Wait for all groups to load their actions
        await Promise.all(loadPromises);
        
        this.isLoading = false;
        this.addLog(`Loaded groups for device: ${deviceId}`, true);
        
      } catch (error) {
        this.addLog(`Failed to load device groups for ${deviceId}: ${error}`, false);
        this.isLoading = false;
      }
    },
    
    /**
     * Load actions for a specific device and group
     */
    async loadGroupActions(deviceId: string, groupId: string) {
      this.isLoading = true;
      try {
        const response = await apiService.getGroupActions(deviceId, groupId);
        
        // Find the group in device groups and update its actions
        if (this.deviceGroups[deviceId]) {
          const groupIndex = this.deviceGroups[deviceId].findIndex(g => g.group_id === groupId);
          
          if (groupIndex >= 0) {
            this.deviceGroups[deviceId][groupIndex].actions = response.actions;
          }
        }
        
        this.isLoading = false;
        this.addLog(`Loaded actions for ${deviceId} group ${groupId}`, true);
      } catch (error) {
        this.addLog(`Failed to load actions for ${deviceId} group ${groupId}: ${error}`, false);
        this.isLoading = false;
      }
    },
    
    /**
     * Select a device and load its configuration
     */
    async selectDevice(deviceId: string) {
      if (this.currentDeviceId === deviceId) return;
      
      this.isLoading = true;
      this.currentGroupId = null; // Reset current group when changing devices
      
      try {
        if (!this.deviceConfigs[deviceId]) {
          // Try to load device config - this is required
          const config = await apiService.loadDeviceConfig(deviceId);
          
          // Ensure config has the necessary properties
          if (!config.id) config.id = deviceId;
          if (!config.name) {
            // Try to get name from device_name if it exists
            config.name = config.device_name || deviceId;
          }
          
          // Handle both array and object formats for commands
          if (!Array.isArray(config.commands)) {
            // If commands is an object, convert it to array
            if (config.commands && typeof config.commands === 'object') {
              const commandsArray: Command[] = [];
              
              // Convert each command entry to the expected format
              Object.entries(config.commands).forEach(([key, value]: [string, any]) => {
                commandsArray.push({
                  name: value.description || key,
                  action: value.action,
                  topic: value.topic,
                  ...value // Keep other properties if any
                });
              });
              
              config.commands = commandsArray;
            } else {
              // If no commands at all, create empty array
              config.commands = [];
            }
          }
          
          this.deviceConfigs[deviceId] = config;
          this.addLog(`Loaded configuration for device: ${deviceId}`, true);
        }
        
        this.currentDeviceId = deviceId;
        
        // Also load the groups for this device (optional enhancement)
        try {
          await this.loadDeviceGroups(deviceId);
        } catch (groupsError) {
          console.error(`Failed to load device groups for ${deviceId}: ${groupsError}`);
          // Don't add to logs as this is an optional feature
        }
        
        this.isLoading = false;
      } catch (error: any) {
        this.isLoading = false;
        this.addLog(`Failed to load device configuration for ${deviceId}: ${error.message || error}`, false);
        throw error; // Re-throw to indicate failure
      }
    },
    
    /**
     * Select a command group for the current device
     */
    async selectGroup(groupId: string) {
      if (!this.currentDeviceId) return;
      
      this.currentGroupId = groupId;
      
      // Check if we need to load the actions for this group
      const deviceGroups = this.deviceGroups[this.currentDeviceId] || [];
      const selectedGroup = deviceGroups.find(g => g.group_id === groupId);
      
      if (!selectedGroup || !selectedGroup.actions || selectedGroup.actions.length === 0) {
        await this.loadGroupActions(this.currentDeviceId, groupId);
      }
      
      this.addLog(`Selected group: ${groupId}`, true);
    },
    
    /**
     * Execute a command via REST API
     */
    async executeCommand(command: Command) {
      if (!this.currentDeviceId) return;
      
      let result = '';
      
      try {
        // For MQTT commands (only topic property is present or prioritized)
        if (command.topic && (!command.action || Object.keys(command).length === 1)) {
          // Use REST API to publish to MQTT topic
          result = await apiService.publishToMqtt(command.topic);
          this.addLog(`MQTT: ${result}`, !result.includes('Error'));
        } 
        // For regular REST commands
        else if (command.action) {
          result = await apiService.sendCommand(this.currentDeviceId, command.action);
          this.addLog(`REST: ${result}`, !result.includes('Error'));
        } 
        // For actions array commands (to be implemented)
        else if (command.actions) {
          // This will be implemented later
          this.addLog('Actions array not implemented yet', false);
        }
        // Fallback for commands with no recognizable properties
        else {
          this.addLog('Invalid command: No action or topic specified', false);
          return 'Error: Invalid command';
        }
      } catch (error: any) {
        this.addLog(`Error executing command: ${error.message}`, false);
      }
      
      return result;
    },
    
    /**
     * Add a log entry
     */
    addLog(message: string, success: boolean) {
      const now = new Date();
      // Format timestamp as HH:MM:SS for more consistent display
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      this.logs.unshift({ message, timestamp, success });
      
      // Keep logs to a reasonable size
      if (this.logs.length > 100) {
        this.logs.pop();
      }
    },
    
    /**
     * Reset all data and reload system configuration
     */
    async reloadAll() {
      // Clear state
      this.devices = [];
      this.deviceConfigs = {};
      this.deviceGroups = {};
      this.currentDeviceId = null;
      this.currentGroupId = null;
      
      // System configuration is required
      await this.loadSystemConfig();
      
      // Command groups are optional but desired
      try {
        await this.loadCommandGroups();
        this.addLog('Command groups loaded successfully', true);
      } catch (error) {
        console.error(`Failed to load command groups: ${error}`);
        // Don't add to logs to avoid triggering error display
      }
      
      this.addLog('System configuration reloaded', true);
    }
  }
}); 