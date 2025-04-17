<script setup lang="ts">
import DevicePage from './views/DevicePage.vue'
</script>

<template>
  <DevicePage />
</template>

<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}

*, *::before, *::after {
  box-sizing: border-box;
}

button, select, input {
  font-family: inherit;
  font-size: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
