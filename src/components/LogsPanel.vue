<template>
  <div class="logs-panel">
    <h3>Activity Logs</h3>
    <div class="logs-container">
      <div 
        v-for="(log, index) in deviceStore.logs" 
        :key="index"
        class="log-entry"
        :class="{ 'success': log.success, 'error': !log.success }"
      >
        <span class="timestamp">{{ log.timestamp }}</span>
        <span class="message">{{ log.message }}</span>
      </div>
      <div v-if="deviceStore.logs.length === 0" class="empty-log">
        No activity logs yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDeviceStore } from '../store/deviceStore';

const deviceStore = useDeviceStore();
</script>

<style scoped>
.logs-panel {
  margin-top: 30px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
}

.log-entry {
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  display: flex;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.success {
  background-color: rgba(46, 204, 113, 0.1);
}

.log-entry.error {
  background-color: rgba(231, 76, 60, 0.1);
}

.timestamp {
  flex: 0 0 80px;
  color: #7f8c8d;
  margin-right: 10px;
}

.message {
  flex: 1;
}

.empty-log {
  color: #7f8c8d;
  font-style: italic;
  padding: 15px 0;
  text-align: center;
}
</style> 