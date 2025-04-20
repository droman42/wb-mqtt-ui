#!/bin/bash

# MQTT UI Docker Deployment Script
# Adapted for deployment on Wirenboard 7 controllers (ARMv7 architecture)

set -e

# Help message
show_help() {
    echo "MQTT UI Docker Deployment Script"
    echo
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  -b, --build       Rebuild containers"
    echo "  -d, --down        Stop and remove containers"
    echo "  -r, --restart     Restart containers"
    echo "  -c, --cross       Use cross-compilation for ARM (requires Docker Buildx)"
    echo "  -s, --save PATH   Save Docker images to PATH for transfer"
    echo "  -t, --transfer IP Transfer saved images to Wirenboard at IP"
    echo "  --target-dir DIR  Target directory on Wirenboard (default: /mnt/data/docker_exchange)"
    echo "  -h, --help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0 -b -c          Build container images for ARM using cross-compilation"
    echo "  $0 -s ./images    Save images to ./images directory"
    echo "  $0 -t 192.168.1.5 Transfer saved images to Wirenboard at 192.168.1.5"
    echo "  $0 -b -s ./images -t 192.168.1.5  Build, save, and transfer in one command"
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Error: Docker is not installed or not in PATH"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        echo "Error: Docker daemon is not running or you don't have permission to use Docker"
        echo "Please start Docker daemon or add your user to the docker group"
        exit 1
    fi
    
    echo "✓ Docker is installed and running"
}

# Set up cross-compilation environment
setup_buildx() {
    echo "Setting up Docker Buildx for ARM cross-compilation..."
    
    if ! docker buildx version > /dev/null 2>&1; then
        echo "Error: Docker Buildx is required for cross-platform builds but not available"
        echo "Please install Docker Buildx: https://docs.docker.com/buildx/working-with-buildx/"
        exit 1
    fi
    
    # Check if arm builder exists, create if it doesn't
    if docker buildx ls | grep -q "arm_builder"; then
        echo "Using existing arm_builder..."
        docker buildx use arm_builder
    else
        echo "Creating new arm_builder..."
        docker buildx create --name arm_builder --use
    fi
    
    # Bootstrap the builder
    docker buildx inspect --bootstrap
    
    echo "✓ ARM build environment is ready"
}

# Save Docker images for transfer
save_images() {
    local save_dir="$1"
    echo "Saving Docker images to $save_dir for transfer to Wirenboard 7..."
    
    mkdir -p "$save_dir"
    
    # Check if mqtt-ui image exists
    if ! docker image inspect mqtt-ui:latest >/dev/null 2>&1; then
        echo "Error: mqtt-ui:latest image not found. Build it first with './docker_deploy.sh -b -c'"
        echo "Continuing with other images..."
    else
        echo "Saving mqtt-ui image..."
        docker save mqtt-ui:latest | gzip > "$save_dir/mqtt-ui.tar.gz"
        echo "✓ Saved mqtt-ui:latest"
    fi
    
    # We only need Nginx for ARM since our UI is static files
    echo "Pulling and saving arm32v7/nginx image..."
    # Pull the image first before trying to save it
    if ! docker pull arm32v7/nginx:stable-alpine; then
        echo "Error: Failed to pull arm32v7/nginx:stable-alpine"
        echo "This may be because:"
        echo "1. You don't have internet connection"
        echo "2. The image doesn't exist or has been renamed"
        echo "3. Docker buildx emulation isn't properly configured"
        
        # Create an empty file as a placeholder
        touch "$save_dir/nginx-arm32v7.tar.gz"
        echo "Created empty placeholder file. You will need to manually transfer the nginx image."
    else
        docker save arm32v7/nginx:stable-alpine | gzip > "$save_dir/nginx-arm32v7.tar.gz"
        echo "✓ Saved arm32v7/nginx:stable-alpine"
    fi
    
    # Create a temporary directory for configuration files
    TMP_CONFIG_DIR=$(mktemp -d)
    
    # Copy configuration files to the temporary directory
    cp docker-compose.yml "$TMP_CONFIG_DIR/"
    cp nginx.conf "$TMP_CONFIG_DIR/"
    cp docker-entrypoint.sh "$TMP_CONFIG_DIR/"
    
    # Create a default .env file if it doesn't exist
    if [ -f .env ]; then
        cp .env "$TMP_CONFIG_DIR/"
    else
        echo "# Default environment configuration for MQTT UI" > "$TMP_CONFIG_DIR/.env"
        echo "API_HOST=localhost" >> "$TMP_CONFIG_DIR/.env"
        echo "API_PORT=8123" >> "$TMP_CONFIG_DIR/.env"
        echo "API_PROTOCOL=http" >> "$TMP_CONFIG_DIR/.env"
    fi
    
    # Tar and compress the configuration files
    tar -czf "$save_dir/mqtt-ui-config.tar.gz" -C "$TMP_CONFIG_DIR" .
    echo "✓ Saved configuration files"
    
    # Clean up the temporary directory
    rm -rf "$TMP_CONFIG_DIR"
    
    echo "Images and configuration saved to:"
    echo "  $save_dir/mqtt-ui.tar.gz"
    echo "  $save_dir/nginx-arm32v7.tar.gz"
    echo "  $save_dir/mqtt-ui-config.tar.gz"
    echo
    echo "Transfer these files to your Wirenboard 7 device and run:"
    echo "  docker load -i mqtt-ui.tar.gz"
    echo "  docker load -i nginx-arm32v7.tar.gz"
    echo "  mkdir -p config && tar -xzf mqtt-ui-config.tar.gz -C config"
    echo "  cd config && docker-compose up -d"
}

# Transfer images to Wirenboard device
transfer_images() {
    local wb_ip="$1"
    local save_dir="$2"
    local target_dir="$3"
    
    if [ ! -f "$save_dir/mqtt-ui.tar.gz" ]; then
        echo "Error: mqtt-ui.tar.gz not found in $save_dir"
        echo "Run '$0 -b --save $save_dir' first to create the image files"
        exit 1
    fi
    
    echo "Transferring Docker images to Wirenboard 7 at $wb_ip..."
    echo "Target directory: $target_dir"
    
    # Create remote directory
    if ! ssh root@$wb_ip "mkdir -p $target_dir"; then
        echo "Error: Failed to connect to Wirenboard at $wb_ip or create directory $target_dir"
        echo "Please check:"
        echo "1. The IP address is correct"
        echo "2. SSH is enabled on the Wirenboard"
        echo "3. SSH keys are set up for passwordless login"
        exit 1
    fi
    
    # Transfer files
    echo "Transferring images and configuration (this may take a while)..."
    
    # Transfer the mqtt-ui image
    echo "Transferring mqtt-ui.tar.gz..."
    if ! scp "$save_dir/mqtt-ui.tar.gz" root@$wb_ip:"$target_dir/"; then
        echo "Error: Failed to transfer mqtt-ui.tar.gz"
        exit 1
    fi
    
    # Transfer the nginx image
    echo "Transferring nginx-arm32v7.tar.gz..."
    if ! scp "$save_dir/nginx-arm32v7.tar.gz" root@$wb_ip:"$target_dir/"; then
        echo "Error: Failed to transfer nginx-arm32v7.tar.gz"
        exit 1
    fi
    
    # Transfer configuration files
    echo "Transferring mqtt-ui-config.tar.gz..."
    if ! scp "$save_dir/mqtt-ui-config.tar.gz" root@$wb_ip:"$target_dir/"; then
        echo "Error: Failed to transfer mqtt-ui-config.tar.gz"
        exit 1
    fi
    
    echo "Setting up containers on Wirenboard 7..."
    
    # Build the command to execute on the Wirenboard
    SSH_COMMAND="cd $target_dir && \
                 docker load -i mqtt-ui.tar.gz && \
                 docker load -i nginx-arm32v7.tar.gz && \
                 mkdir -p config && \
                 tar -xzf mqtt-ui-config.tar.gz -C config && \
                 cd config"
    
    # Add the docker-compose up command
    SSH_COMMAND="$SSH_COMMAND && docker-compose up -d"
    
    # Execute the setup commands
    if ! ssh root@$wb_ip "$SSH_COMMAND"; then
        echo "Error: Failed to set up Docker containers on Wirenboard"
        echo "You may need to log in manually and complete the setup"
        exit 1
    fi
    
    echo "✓ Deployment to Wirenboard 7 complete."
    echo "Check status with: ssh root@$wb_ip 'cd $target_dir/config && docker-compose ps'"
}

# Parse command line arguments
BUILD=false
DOWN=false
RESTART=false
CROSS_COMPILE=false
SAVE_IMAGES=false
TRANSFER_IMAGES=false
SAVE_PATH="./wb_images"
WB_IP=""
TARGET_DIR="/mnt/data/docker_exchange"

while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--build)
            BUILD=true
            shift
            ;;
        -d|--down)
            DOWN=true
            shift
            ;;
        -r|--restart)
            RESTART=true
            shift
            ;;
        -c|--cross)
            CROSS_COMPILE=true
            shift
            ;;
        -s|--save)
            SAVE_IMAGES=true
            if [[ $2 && ! $2 =~ ^- ]]; then
                SAVE_PATH="$2"
                shift
            fi
            shift
            ;;
        -t|--transfer)
            TRANSFER_IMAGES=true
            if [[ $2 && ! $2 =~ ^- ]]; then
                WB_IP="$2"
                shift
            else
                echo "Error: --transfer requires an IP address"
                exit 1
            fi
            shift
            ;;
        --target-dir)
            if [[ $2 && ! $2 =~ ^- ]]; then
                TARGET_DIR="$2"
                shift
            else
                echo "Error: --target-dir requires a directory path"
                exit 1
            fi
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if Docker is installed and running
check_docker

# Stop and remove containers if requested
if [ "$DOWN" = true ]; then
    echo "Stopping and removing containers..."
    docker-compose down
    exit 0
fi

# Build and start containers
if [ "$BUILD" = true ]; then
    if [ "$CROSS_COMPILE" = true ]; then
        setup_buildx
        echo "Building with Docker Buildx for ARM architecture (Wirenboard 7)..."
        
        # Use buildx for cross-platform build
        export DOCKER_BUILDKIT=1
        BUILD_ARGS="--platform linux/arm/v7 --load"
        
        docker buildx build \
            $BUILD_ARGS \
            --tag mqtt-ui:latest \
            --file Dockerfile .
        
        echo "✓ Built mqtt-ui:latest for ARMv7"
        
        if [ "$SAVE_IMAGES" = false ] && [ "$TRANSFER_IMAGES" = false ]; then
            echo "Starting containers with docker-compose..."
            docker-compose up -d
        fi
    else
        echo "Building for host architecture..."
        export DOCKER_BUILDKIT=1
        docker-compose build
        
        if [ "$SAVE_IMAGES" = false ] && [ "$TRANSFER_IMAGES" = false ]; then
            echo "Starting containers with docker-compose..."
            docker-compose up -d
        fi
    fi
elif [ "$RESTART" = true ]; then
    echo "Restarting containers..."
    docker-compose restart
elif [ "$SAVE_IMAGES" = false ] && [ "$TRANSFER_IMAGES" = false ]; then
    echo "Starting containers..."
    docker-compose up -d
fi

# Save images if requested
if [ "$SAVE_IMAGES" = true ]; then
    save_images "$SAVE_PATH"
fi

# Transfer images if requested
if [ "$TRANSFER_IMAGES" = true ]; then
    if [ -z "$WB_IP" ]; then
        echo "Error: No IP address specified for transfer"
        echo "Use: $0 -t IP_ADDRESS"
        exit 1
    fi
    
    transfer_images "$WB_IP" "$SAVE_PATH" "$TARGET_DIR"
fi

# Show status
if [ "$SAVE_IMAGES" = false ] && [ "$TRANSFER_IMAGES" = false ] && [ "$DOWN" = false ]; then
    echo "Container status:"
    docker-compose ps
fi 