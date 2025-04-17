
# ✅ Complete Coding Specification: Device Testing UI

---

## 🎯 Goal

Build a dynamic web interface using **Vue.js** that allows full testing of devices configured via an access to an endpoint 'http://localhost:8000/system'. The response will contain a list of device ids, registered wuth the system.

Then, using the endpoint 'http://localhost:8000/config/device/{device_id}', the system will return the device configuration, including the list of commands, which can be triggered either through a FastAPI-based REST interface or MQTT (if a comand has a 'topic' field).
Each command can have a: 
- 'action' field, which can be used to call the endpoint 'http://localhost:8000/device/{device_id}/action' where the content of the 'action' field should be used as a value for the 'action' parameter in the POST request.
- 'actions' array, behaivour and the endpoint will be specified later.
- 'topic' field, which contains the topic to which the command should be published to using the endpoint 'http://localhost:8000/publish'. Content of the 'topic' field will be used as parameter 'topic' in the POST request.
For each device, render a dedicated control panel (remote control-style UI) exposing all defined commands, which can be triggered either through a FastAPI-based REST interface or MQTT.
All configuration data should be loaded at system startup, there is no need to physically store it. The interface should have a reload button to reload all configuraitons as at startup.

---

## 🧱 Technology Stack

- **Frontend Framework:** Vue.js 3 (Composition API)
- **State Management:** Pinia
- **HTTP Client:** Axios
- **MQTT Client:** MQTT.js
- **Build Tool:** Vite
- **Backend Interface:** REST API via FastAPI (no auth)
- **Command Transport:** REST (default), MQTT (optional per command)

---

## 📁 Folder Structure

```
project-root/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── DeviceSelector.vue
│   │   ├── DeviceRemote.vue
│   │   └── CommandButton.vue
│   ├── views/
│   │   └── DevicePage.vue
│   ├── store/
│   │   └── deviceStore.ts
│   ├── services/
│   │   ├── apiService.ts
│   │   └── mqttService.ts
│   ├── utils/
│   ├── App.vue
│   └── main.ts
└── vite.config.ts
```

---

## 🧠 State Management (`deviceStore.ts`)

State:
- `devices`: List of all devices
- `currentDevice`: Selected device object
- `logs`: List of log messages

Actions:
- `loadSystemConfig()`: Load `system.json` on app start
- `selectDevice(deviceId)`: Switch device
- `addLog(message: string)`: Append log entry

---

## 🧩 Components

### 🔘 `CommandButton.vue`
- Props:
  - `label`, `path`, `method`, `mqttTopic`, `executionMode`
- UI:
  - Display button with label
  - If MQTT topic exists, show a toggle to choose execution mode
- On click:
  - Call `apiService.sendCommand()` or `mqttService.publish()`
  - Report result to log store

---

### 📱 `DeviceRemote.vue`
- Fetches selected device from store
- Loops through `commands` to render a `CommandButton` for each

---

### 🎛️ `DeviceSelector.vue`
- Dropdown menu listing all device names
- On change → updates selected device in store

---

### 🧾 `LogsPanel.vue`
- Renders real-time logs from the `logs` state
- Each command result (success/fail + timestamp) gets appended

---

## 🔌 Services

### `apiService.ts`
```ts
function sendCommand(path: string, method: string): Promise<string> {
  return axios({
    url: path,
    method
  }).then(res => "Success").catch(err => "Error: " + err.message);
}
```

### `mqttService.ts`
- Reads MQTT credentials from current device config
- Uses MQTT.js to connect
- Handles publishing only (no need to subscribe yet)

```ts
function publish(topic: string): Promise<string> {
  return mqttClient.publish(topic, "")
    .then(() => "MQTT Success")
    .catch(err => "MQTT Error: " + err.message);
}
```

---

## 🧪 Testing & QA Tasks

| Test Scenario | Expected Result |
|---------------|-----------------|
| Load `system.json` | Devices appear in dropdown |
| Switch devices | Remote panel updates |
| Click command (REST) | API called, log displays success/fail |
| Click command (MQTT) | MQTT message sent, log displays result |
| Toggle execution mode | Changes between API and MQTT |
| No MQTT topic → no toggle shown | Only REST allowed |

---

## 🚀 Future Considerations

- Add support for MQTT payloads (from command config or input field)
- Save execution logs to backend or localStorage
- Add command parameter inputs (dynamic forms)
- Add MQTT response subscriptions if needed
- Group commands by category
