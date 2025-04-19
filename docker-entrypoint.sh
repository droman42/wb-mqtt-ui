#!/bin/sh
set -e

# Function to replace environment variables in the runtime config
configure_runtime() {
  # Create runtime-config.js with the provided environment variables
  echo "Creating runtime configuration..."
  
  # Default values
  API_HOST=${API_HOST:-localhost}
  API_PORT=${API_PORT:-8000}
  API_PROTOCOL=${API_PROTOCOL:-http}
  
  # Create the runtime config with the current environment values
  cat > /usr/share/nginx/html/runtime-config.js << EOF
window.RUNTIME_CONFIG = {
  API_BASE_URL: "${API_PROTOCOL}://${API_HOST}:${API_PORT}",
  VERSION: "${VERSION:-development}"
};
EOF

  echo "Runtime configuration created with API endpoint: ${API_PROTOCOL}://${API_HOST}:${API_PORT}"
}

# Configure the runtime environment
configure_runtime

# Execute the main container command
exec "$@" 