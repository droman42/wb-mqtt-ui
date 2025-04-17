import axios from 'axios';

// Always use the Vite proxy to bypass CORS
const API_BASE_URL = '/api';

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

// Add type definitions
interface DeviceCommand {
  name?: string;
  action?: string;
  topic?: string;
  description?: string;
  [key: string]: any;
}

interface MqttPublishRequest {
  topic: string;
  payload: string;
}

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
  }
}; 