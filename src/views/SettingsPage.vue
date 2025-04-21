<template>
  <div class="settings-page">
    <div class="grid">
      <div class="col-12">
        <h1>Settings</h1>
      </div>
      
      <div class="col-12">
        <button class="back-button" @click="goBack">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back
        </button>
      </div>
      
      <div class="col-12 settings-row">
        <div class="grid">
          <div class="col-3">
            <label class="setting-toggle">
              <input 
                type="checkbox" 
                v-model="uiStore.darkTheme"
                @change="uiStore.saveSettings"
              />
              Theme
            </label>
          </div>
          
          <div class="col-3">
            <label class="setting-toggle">
              <input 
                type="checkbox" 
                v-model="uiStore.showButtonText"
                @change="uiStore.saveSettings"
              />
              Button Text
            </label>
          </div>
          
          <div class="col-3">
            <label class="setting-toggle">
              <input 
                type="checkbox" 
                v-model="uiStore.defaultUseMqtt"
                @change="uiStore.saveSettings"
              />
              MQTT
            </label>
          </div>
          
          <div class="col-3">
            <label class="setting-toggle">
              <input 
                type="checkbox" 
                v-model="uiStore.debugMode"
                @change="uiStore.saveSettings"
              />
              Debug
            </label>
          </div>
        </div>
      </div>
      
      <div class="col-12">
        <LogsPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUiStore } from '../store/uiStore';
import LogsPanel from '../components/LogsPanel.vue';

const router = useRouter();
const uiStore = useUiStore();

function goBack() {
  router.push('/');
}
</script>

<style>
.settings-page {
  padding: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 2rem;
}

.back-button svg {
  fill: currentColor;
}

.settings-row {
  margin: 2rem 0;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  cursor: pointer;
}

.setting-toggle input {
  margin: 0;
}

/* Dark theme styles */
.dark-theme .settings-page {
  background-color: #1e1e1e;
  color: #f1f1f1;
}

.dark-theme .back-button {
  background-color: #333;
  color: #f1f1f1;
}

.dark-theme .settings-row {
  background-color: #2a2a2a;
}
</style> 