import { apiService } from '../services/apiService';
import { API_BASE_URL } from '../config/apiConfig';

/**
 * Checks connectivity to the server
 */
export async function checkServerConnectivity(): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    console.log(`Checking server connectivity at ${API_BASE_URL}...`);
    
    // System endpoint is required for the app to function
    const data = await apiService.loadSystemConfig();
    
    return {
      success: true,
      message: 'Connected to server successfully',
      data
    };
  } catch (error: any) {
    console.error('Server connectivity check failed:', error);
    
    let message = `Could not connect to server at ${API_BASE_URL}`;
    if (error.response) {
      message += ` (Status: ${error.response.status})`;
    } else if (error.request) {
      message += ' (No response received)';
    } else {
      message += `: ${error.message}`;
    }
    
    return {
      success: false,
      message
    };
  }
} 