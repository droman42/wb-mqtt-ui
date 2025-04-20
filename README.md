# Device Testing UI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A dynamic web interface built with Vue.js 3 that allows full testing of devices via REST API, including MQTT operations. The UI provides a flexible and user-friendly interface for controlling devices and executing commands through a standardized API.

![Demo Screenshot](./docs/images/screenshot.png)

## Features

- Load device configurations from a backend system
- Control devices using REST API calls
- Support for MQTT publishing through REST API
- Real-time activity logs
- Dynamic UI generation based on device configuration
- Responsive design for desktop and mobile devices

## Tech Stack

- **Frontend Framework:** Vue.js 3 (Composition API)
- **State Management:** Pinia
- **HTTP Client:** Axios
- **Build Tool:** Vite

## Installation

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/wb-mqtt-ui.git
cd wb-mqtt-ui
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

```bash
cp .env.example .env
```

Edit `.env` to set your API URL if not using the proxy configuration.

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173/

## Production Build

Create a production build:

```bash
npm run build
```

The build files will be in the `dist` directory, which can be served by any static web server.

Preview the production build:

```bash
npm run preview
```

## Configuration

The application connects to a backend API and supports multiple configuration methods:

### Development Mode

You can configure the API endpoint in the `.env` file:

```
# For direct API access (no proxy)
VITE_API_BASE_URL=http://your-server-url:8000

# For development proxy configuration
VITE_API_TARGET=http://localhost:8000
```

By default, the application will use a proxy configuration in `vite.config.ts` to avoid CORS issues when connecting to a local API:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### Docker Deployment

For Docker deployment, you can configure the API connection using environment variables:

```bash
docker run -p 8080:80 \
  -e API_HOST=your-api-host \
  -e API_PORT=8000 \
  -e API_PROTOCOL=http \
  mqtt-ui
```

Or using docker-compose:

```yaml
version: '3'
services:
  mqtt-ui:
    image: mqtt-ui:latest
    ports:
      - "8080:80"
    environment:
      - API_HOST=api-server
      - API_PORT=8000
      - API_PROTOCOL=http
```

The Docker container uses an entrypoint script that generates a runtime configuration based on these environment variables.

## Usage

1. Start the development server
2. Open the application in your browser
3. Select a device from the dropdown
4. Use the generated command buttons to control the device
   - For commands with MQTT topics, you can toggle between using direct action or MQTT
5. View results in the activity logs panel

## REST API Endpoints

The application uses the following REST API endpoints:

- `GET /system` - Get the list of available devices
- `GET /config/device/{device_id}` - Get the configuration for a specific device
- `POST /device/{device_id}/action?action={action}` - Execute a device action
- `POST /publish?topic={topic}` - Publish a message to an MQTT topic

## Implementation Details

The application is organized into several components:

- **DeviceSelector:** For selecting which device to control
- **DeviceRemote:** Displays all available commands for the selected device
- **CommandButton:** Individual command buttons with REST/MQTT toggle
- **LogsPanel:** Display of command execution results

State management is handled through Pinia store, with API services for communication.

### SVG Button Support

The application supports SVG-based buttons for a modern, customizable UI. Command buttons can automatically render as SVG icons based on their action names. The following SVG element types are supported:

- **paths**: Both simple string paths and object paths with attributes 
- **rects**: Single rectangle or multiple rectangles (as array)
- **polygons**: For complex shapes
- **circles**: Single circle or multiple circles (as array)
- **text**: For text-based buttons

SVG buttons are defined in the `svgMapping.ts` file and mapped to command actions. To add new SVG icons, simply extend the mapping with new entries following the established pattern.

Example of a complex SVG mapping with multiple element types:
```javascript
menu_ok: {
  viewBox: "0 0 100 100",
  circle: {
    cx: 50,
    cy: 50,
    r: 45,
    fill: "#cfd2d6",
    stroke: "#666",
    "stroke-width": 2
  },
  text: {
    x: 50,
    y: 55,
    "font-family": "Arial,Helvetica,sans-serif",
    "font-size": 28,
    "font-weight": 700,
    fill: "#000",
    "text-anchor": "middle",
    content: "OK"
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
