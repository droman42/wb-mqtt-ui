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
  [key: string]: any;
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
  }),
  
  getters: {
    currentDevice: (state) => 
      state.currentDeviceId ? state.deviceConfigs[state.currentDeviceId] : null,
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
     * Select a device and load its configuration
     */
    async selectDevice(deviceId: string) {
      if (this.currentDeviceId === deviceId) return;
      
      this.isLoading = true;
      try {
        if (!this.deviceConfigs[deviceId]) {
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
        this.isLoading = false;
      } catch (error: any) {
        // Create a minimal device config with empty commands
        this.deviceConfigs[deviceId] = {
          id: deviceId,
          name: deviceId,
          commands: []
        };
        
        this.currentDeviceId = deviceId;
        this.addLog(`Failed to load device configuration for ${deviceId}: ${error.message || error}`, false);
        this.isLoading = false;
      }
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
      const timestamp = new Date().toLocaleTimeString();
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
      this.currentDeviceId = null;
      
      // Reload
      await this.loadSystemConfig();
      this.addLog('System configuration reloaded', true);
    }
  }
}); 