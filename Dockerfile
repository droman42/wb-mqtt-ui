FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with reduced size for ARM deployment
RUN npm ci --production=false --no-optional

# Copy source code (excluding unnecessary files using .dockerignore)
COPY . .

# Build the app for production with optimizations
RUN npm run build && \
    rm -rf node_modules

# Production stage
FROM arm32v7/nginx:stable-alpine

# Label the image
LABEL maintainer="MQTT UI Team" \
      description="MQTT UI for Wirenboard 7"

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Create a non-root user to run nginx (security best practice)
RUN adduser -D -H -u 1000 -s /sbin/nologin nginx-user && \
    # Fix permissions
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Default environment variables
ENV API_HOST=localhost \
    API_PORT=8000 \
    API_PROTOCOL=http

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

# Start Nginx with reduced privileges
CMD ["nginx", "-g", "daemon off;"] 