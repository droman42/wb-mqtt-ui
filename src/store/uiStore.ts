import { defineStore } from 'pinia';

/**
 * Store to manage global UI configuration
 * These settings control the appearance and behavior of UI components
 */
export const useUiStore = defineStore('ui', {
  state: () => ({
    /**
     * Controls whether text descriptions are shown below SVG buttons
     * When true, button descriptions are displayed
     * When false, only the SVG icons are shown
     */
    showButtonText: true,

    /**
     * Controls the default MQTT mode for all command buttons
     * When true, commands will use MQTT topics by default
     * When false, commands will use standard actions by default
     */
    defaultUseMqtt: false,
  }),
  
  actions: {
    /**
     * Set whether button text should be displayed
     */
    setShowButtonText(value: boolean) {
      this.showButtonText = value;
      // Persist to localStorage
      this.saveSettings();
    },

    /**
     * Set whether to use MQTT by default
     */
    setDefaultUseMqtt(value: boolean) {
      this.defaultUseMqtt = value;
      // Persist to localStorage
      this.saveSettings();
    },
    
    /**
     * Save settings to localStorage for persistence
     */
    saveSettings() {
      try {
        localStorage.setItem('ui-settings', JSON.stringify({
          showButtonText: this.showButtonText,
          defaultUseMqtt: this.defaultUseMqtt,
        }));
      } catch (error) {
        console.error('Failed to save UI settings:', error);
      }
    },
    
    /**
     * Initialize settings from localStorage or default values
     * Call this on application startup
     */
    initializeSettings() {
      try {
        const savedSettings = localStorage.getItem('ui-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          this.showButtonText = settings.showButtonText ?? true;
          this.defaultUseMqtt = settings.defaultUseMqtt ?? false;
        }
      } catch (error) {
        console.error('Failed to load UI settings:', error);
        // Keep default values on error
      }
    }
  }
}); 