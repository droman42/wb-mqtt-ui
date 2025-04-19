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

<style src="../assets/LogsPanel.css" scoped></style> 