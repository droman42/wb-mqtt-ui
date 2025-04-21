**Touchpad Widget Prompt for Coding Agent**

## ✨ Project Goal

Build a **Touchpad widget component** (`Touchpad.vue`) for a Vue 3 project using **PrimeVue** and **PrimeFlex**.

This widget should simulate a **touch area** like smart TV remotes or the Apple TV remote, inside the browser.

The widget must detect user interactions, show real-time visual feedback, and send movement/tap data to an external device over a REST API.

## 🌟 Detailed Feature Requirements

### 1. Touch & Mouse Event Handling

- Support **both** touch and mouse events.
- Track:
  - `mousedown`, `mousemove`, `mouseup`
  - `touchstart`, `touchmove`, `touchend`
- Correctly detect **movement** across X/Y axis.

### 2. Movement Tracking and Sending

- **Track deltas** (`deltaX`, `deltaY`) during movement.
- **Or track absolute positions** (`x`, `y`) if configured.

- **Introduce a config object** to control sending behavior:

```javascript
const deviceConfig = {
  sendDeltas: true,       // true = delta movement, false = absolute position
  apiUrl: 'https://mock-device-api.example.com/move'
};
```

- Movement data must be **sent via POST** to the configured `apiUrl`.

- Implement **throttling**: only send movement data **every 100ms** maximum (to avoid API spamming).

### 3. Visual Feedback (Pointer Simulation)

- Show a **visual pointer dot** inside the touchpad area.
- Dot must **move** along with touch/mouse movement.
- **Smooth transitions** are preferred (CSS transitions).

- **Tap feedback**:
  - When user taps/clicks, animate the dot (shrink, flash, or bounce briefly).

### 4. Tap and Double-Tap Detection

- Implement **tap** detection:
  - A short press without much movement triggers a "tap" event.

- Implement **double-tap** detection:
  - If two taps occur within ~300ms, trigger a "double-tap" event.

- For taps and double-taps:
  - Send a **separate API event** via POST to `apiUrl`.
    - Example payload for double-tap: `{ "event": "doubleTap" }`

### 5. Component Styling

- Use **PrimeFlex** utilities for layout and alignment:
  - Center the pointer visually.
  - Layout should be mobile-friendly (responsive touch area).
- Use **PrimeVue Surface utilities** for the touchpad background.

- The touchpad should be a **300x200px area** initially, but it must be easy to customize later (via props or styles).

### 6. Code Structure and Cleanliness

- Use **Vue 3 Composition API** (`<script setup>` syntax).
- Keep logic modular: splitting touch handling, API sending, pointer movement clearly.
- Code must be clean, readable, and maintainable.
- Minimize custom CSS by using PrimeFlex wherever possible.

## 🛠 Technical Hints

- Use axios instead of native `fetch()`.
- Assume an axios instance is already set up (with baseURL, interceptors if needed).
- No need to re-import axios multiple times if it’s globally managed.
- Implement your own simple `throttle()` function (or use `lodash.throttle` optionally).
- Use basic CSS transitions for dot movement and tap animations.
- Make `deviceConfig` easily adjustable inside the component.
- **Example movement** send using axios:

```javascript
await axios.post(deviceConfig.apiUrl, { deltaX, deltaY });
```


## 📆 Deliverables

- A clean `Touchpad.vue` file implementing all functionality.
- All movement and event sending wired and working.
- Small helper utilities if needed (e.g., `throttle()` function).

## 🧐 Example Behavior Summary

| Action | Expected Behavior |
|:------:|:------------------:|
| Drag across touchpad | Pointer moves, deltas (or absolute pos) sent to API |
| Tap | Pointer shows tap animation + tap event sent |
| Double-tap | Pointer shows special double-tap animation + event sent |
| No movement | No unnecessary API calls |

## ⚡ Bonus (Optional But Nice)

- If simple, add a **configurable sensitivity** for swipe distance scaling.
- Allow resizing the touchpad via props (`width`, `height`).

## 🚀 End of Prompt

