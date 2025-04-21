<template>
  <div class="logs-panel">
    <h3>Logs</h3>
    <div class="logs-container">
      <table class="logs-table">
        <thead>
          <tr>
            <th class="timestamp-col">Timestamp</th>
            <th class="message-col">Message</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in deviceStore.logs" :key="index" :class="{ 'error': !log.success }">
            <td class="timestamp-col">{{ formatTimestamp(log.timestamp) }}</td>
            <td class="message-col">{{ log.message }}</td>
          </tr>
          <tr v-if="deviceStore.logs.length === 0">
            <td colspan="2" class="empty-message">No logs available</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="logs-actions">
      <button @click="clearLogs" class="clear-logs-btn">Clear Logs</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDeviceStore } from '../store/deviceStore';

const deviceStore = useDeviceStore();

// Format timestamp to HH:MM:SS DD:MM:YY
const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return timestamp;
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  
  return `${hours}:${minutes}:${seconds} ${day}:${month}:${year}`;
};

// Clear all logs
const clearLogs = () => {
  deviceStore.logs = [];
};
</script>

<style>
.logs-panel {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.logs-panel h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.logs-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #fff;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th,
.logs-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.logs-table th {
  position: sticky;
  top: 0;
  background-color: #f1f3f5;
  z-index: 1;
  font-weight: bold;
}

.timestamp-col {
  width: 180px;
  white-space: nowrap;
}

.message-col {
  word-break: break-word;
}

.logs-table .error {
  background-color: #fff5f5;
  color: #e03131;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

.logs-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.clear-logs-btn {
  padding: 0.375rem 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
}

.clear-logs-btn:hover {
  background-color: #e9ecef;
}

/* Dark theme styles */
.dark-theme .logs-panel {
  background-color: #2a2a2a;
}

.dark-theme .logs-container {
  border-color: #444;
  background-color: #333;
}

.dark-theme .logs-table th {
  background-color: #444;
  color: #f1f1f1;
}

.dark-theme .logs-table td {
  border-color: #444;
  color: #f1f1f1;
}

.dark-theme .logs-table .error {
  background-color: #4b1113;
  color: #ff6b6b;
}

.dark-theme .empty-message {
  color: #adb5bd;
}

.dark-theme .clear-logs-btn {
  background-color: #444;
  border-color: #555;
  color: #f1f1f1;
}

.dark-theme .clear-logs-btn:hover {
  background-color: #555;
}
</style> 