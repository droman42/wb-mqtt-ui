/**
 * API Configuration
 * 
 * This file centralizes API configuration settings for the application.
 * It allows the API base URL to be configurable through multiple methods:
 * 1. Runtime configuration (for Docker/production)
 * 2. Environment variables (for development)
 * 3. Default fallback to /api proxy
 */

// Add type definition for the window object
declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      API_BASE_URL: string;
      VERSION: string;
    }
  }
}

// Priority order for API Base URL:
// 1. Runtime config from window object (set by Docker entrypoint)
// 2. Environment variable from .env files
// 3. Default to /api which will be handled by the Vite dev server proxy
export const API_BASE_URL = 
  (window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.API_BASE_URL) ||
  import.meta.env.VITE_API_BASE_URL || 
  '/api';

// Default timeout for API requests in milliseconds
export const API_TIMEOUT = 10000;

// Common headers for API requests
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}; 