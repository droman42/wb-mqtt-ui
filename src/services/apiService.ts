import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, API_HEADERS } from '../config/apiConfig';

// Configure axios defaults
axios.defaults.timeout = API_TIMEOUT;

// Create axios instance with custom config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: API_HEADERS
});

// Response interceptor for logging
apiClient.interceptors.response.use(
  response => {
    console.log(`API Response [${response.status}]:`, response.config.url);
    return response;
  },
  error => {
    console.error('API Error:', error.message, error.config?.url);
    return Promise.reject(error);
  }
);

export const apiService = {
  /**
   * Load system configuration
   */
  async loadSystemConfig(): Promise<any> {
    try {
      const response = await apiClient.get('/system');
      return response.data;
    } catch (error: any) {
      console.error('Error loading system config:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Load device configuration
   */
  async loadDeviceConfig(deviceId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/config/device/${deviceId}`);
      
      // Transform API response to expected format
      const rawConfig = response.data;
      const config: any = {
        id: rawConfig.device_id || deviceId,
        name: rawConfig.device_name || deviceId,
        commands: rawConfig.commands || []
      };
      
      // Add any additional properties from the response
      Object.entries(rawConfig).forEach(([key, value]) => {
        if (!['device_id', 'device_name'].includes(key)) {
          config[key] = value;
        }
      });
      
      return config;
    } catch (error: any) {
      console.error(`Error loading device config for ${deviceId}:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Send command to device
   */
  async sendCommand(deviceId: string, action: string): Promise<string> {
    try {
      console.log(`Sending action '${action}' to device ${deviceId}...`);
      
      // Send the action as a JSON body, not as a query parameter
      const response = await apiClient.post(`/devices/${deviceId}/action`, {
        action: action,
        params: null  // Optional params
      });
      
      console.log('Command response:', response.data);
      return `Success: Action '${action}' sent to device ${deviceId}`;
    } catch (error: any) {
      console.error('Error sending command:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return `Error: ${error.message}`;
    }
  },

  /**
   * Publish to MQTT
   */
  async publishToMqtt(topic: string, payload: string = '1'): Promise<string> {
    try {
      console.log(`Publishing to MQTT topic '${topic}' with payload '${payload}'...`);
      
      const response = await apiClient.post('/publish', {
        topic,
        payload
      });
      
      console.log('MQTT publish response:', response.data);
      return `Success: Published to MQTT topic '${topic}'`;
    } catch (error: any) {
      console.error('Error publishing to MQTT:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return `Error: ${error.message}`;
    }
  },

  /**
   * Get all command groups available in the system
   */
  async getCommandGroups(): Promise<any> {
    try {
      const response = await apiClient.get('/groups');
      console.log('Command groups:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error loading command groups:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Get device commands grouped by group
   */
  async getDeviceGroups(deviceId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/devices/${deviceId}/groups`);
      console.log(`Device groups for ${deviceId}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error loading device groups for ${deviceId}:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Get commands for a specific device and group
   */
  async getGroupActions(deviceId: string, groupId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/devices/${deviceId}/groups/${groupId}/actions`);
      console.log(`Actions for ${deviceId} group ${groupId}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error loading actions for ${deviceId} group ${groupId}:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
}; 