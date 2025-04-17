import axios from 'axios';

// Use the Vite proxy by default to bypass CORS
// Set a custom API URL in .env if needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Configure axios defaults
axios.defaults.timeout = 10000; // 10 second timeout

// Create axios instance with custom config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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
      
      // If response doesn't have expected structure, transform it
      const config = response.data;
      if (!config.id && deviceId) {
        config.id = deviceId;
      }
      
      // If no commands array exists, create empty one
      if (!Array.isArray(config.commands)) {
        console.warn(`Device ${deviceId} has no commands array, creating empty one`);
        config.commands = [];
      }
      
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
      const response = await apiClient.post(`/device/${deviceId}/action`, null, {
        params: { action }
      });
      return `Success: Action '${action}' sent to device ${deviceId}`;
    } catch (error: any) {
      console.error('Error sending command:', error);
      return `Error: ${error.message}`;
    }
  },

  /**
   * Publish to MQTT
   */
  async publishToMqtt(topic: string): Promise<string> {
    try {
      const response = await apiClient.post('/publish', null, {
        params: { topic }
      });
      return `Success: Published to MQTT topic '${topic}'`;
    } catch (error: any) {
      console.error('Error publishing to MQTT:', error);
      return `Error: ${error.message}`;
    }
  }
}; 