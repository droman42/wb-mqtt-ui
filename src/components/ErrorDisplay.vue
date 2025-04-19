<template>
  <div class="error-display" :class="errorTypeClass" v-if="error">
    <h3>{{ error.title }}</h3>
    <p>{{ error.message }}</p>
    
    <div v-if="error.type === 'cors'" class="solution-box">
      <h4>Possible Solution (CORS Issue)</h4>
      <p>The server needs to enable CORS to allow this web application to access it.</p>
      <div class="code-block">
        <code>
          <pre>
// Node.js / Express
app.use(cors());

// Python / FastAPI
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  // Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
          </pre>
        </code>
      </div>
    </div>
    
    <div v-if="error.type === 'network'" class="solution-box">
      <h4>Possible Solutions (Network Issue)</h4>
      <ol>
        <li>Make sure the server is running</li>
        <li>Check the server URL in .env file (current: {{ apiBaseUrl }})</li>
        <li>Make sure the server is accessible from this browser</li>
        <li>Check server ports and firewall settings</li>
      </ol>
    </div>
    
    <div v-if="error.type === 'device'" class="solution-box">
      <h4>Possible Solutions (Device Configuration Issue)</h4>
      <ol>
        <li>Check that the device ID exists on the server</li>
        <li>Make sure the device has a proper configuration format</li>
        <li>The API endpoint should be: <code>/config/device/{deviceId}</code></li>
        <li>Expected format includes: <code>id</code>, <code>name</code>, and <code>commands</code> array</li>
      </ol>
      <div class="code-block">
        <code>
          <pre>
// Example device configuration
{
  "id": "device1",
  "name": "Living Room Light",
  "commands": [
    { "name": "Turn On", "action": "turn_on" },
    { "name": "Turn Off", "action": "turn_off" },
    { "name": "MQTT Command", "topic": "home/livingroom/light/command" }
  ]
}
          </pre>
        </code>
      </div>
    </div>
    
    <div v-if="error.type === 'server'" class="solution-box">
      <h4>Possible Solutions (Server Error)</h4>
      <ol>
        <li>Check that the server has access to the MQTT broker</li>
        <li>Verify MQTT broker credentials in the server configuration</li>
        <li>Make sure the MQTT topics exist and have correct permissions</li>
        <li>Check server logs for more detailed error information</li>
      </ol>
      <p>The application uses the server's REST API to perform MQTT operations:</p>
      <div class="code-block">
        <code>
          <pre>
// Endpoint for MQTT publishing
POST /publish?topic={topic}
          </pre>
        </code>
      </div>
    </div>
    
    <button @click="$emit('retry')" class="retry-button">Retry Connection</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  error: {
    title: string;
    message: string;
    type: 'cors' | 'network' | 'server' | 'device' | 'unknown';
  } | null;
}>();

defineEmits<{
  (e: 'retry'): void;
}>();

// Use a hardcoded value to avoid import.meta
const apiBaseUrl = computed(() => {
  return 'http://localhost:8000';
});

// Ensure props is used - use it for a helpful computed property
const errorTypeClass = computed(() => {
  return props.error ? `error-type-${props.error.type}` : '';
});
</script>

<style src="../assets/ErrorDisplay.css" scoped></style> 