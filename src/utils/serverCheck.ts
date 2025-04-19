import { apiService } from '../services/apiService';

/**
 * Checks connectivity to the server
 */
export async function checkServerConnectivity(): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    console.log('Checking server connectivity...');
    
    // System endpoint is required for the app to function
    const data = await apiService.loadSystemConfig();
    
    return {
      success: true,
      message: 'Connected to server successfully',
      data
    };
  } catch (error: any) {
    console.error('Server connectivity check failed:', error);
    
    let message = 'Could not connect to server';
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