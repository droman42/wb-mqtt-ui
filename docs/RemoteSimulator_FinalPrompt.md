# 🔥 Project Methodology Update: Critical Review First

Before starting coding for the Remote Simulator widget (or any new module), the process must begin with a **critical review and audit** of the existing app:

- **Audit components, structure, and styles**.
- **Identify if anything worth preserving** exists; otherwise **prepare to drop old components**.
- **Rebuild fresh** if needed to ensure a clean, modular, scalable, and maintainable foundation.
- **SVG icons**: make sure, you reuse current SVG icons from svgMapping.ts for respective buttons.

---

# 👇 Full Project Scope

## ✨ Project Goal

Create a **dynamic Universal Remote Control App** with Scenario Management, built in Vue 3 + PrimeVue (optional) + PrimeFlex.

The app consists of two primary views:
1. **Main Page**: Universal remote and scenario selectors (currently - views/DevicePage.vue).
2. **Settings Page**: Settings and logs management.

---

## 🌟 Main View: Universal Remote + Scenario Manager

### Layout Structure

- **General**: PrimeFlex grid layout.
- **Title** (above the grid): Text TBD.
- **First Grid Row**:
  - **Device Selector**: Dropdown populated from a Pinia store (device map).
  - **Scenario Selector**: empty placeholder for now.
  - **Empty cell** for spacing (can have variable width).
  - **Settings Button**: A nicely styled SVG Button, resembling a traditional "settings" icon. Clicking navigates to Settings View.
  - ✨ Note: The first two selectors must occupy about **80%** of the row width.
- **Second Grid Row**:
  - **Full-width information panel**: Displays information about the selected device or scenario, occupies entire row.
- **Starting from Third Grid Row**:
  - **Dynamic Remote Simulator** (described in detail below).

### Behavior

- **Selectors**:
  - Load names and data from the store.
  - Display device names in the selector, use deviceId for actions.
  - On change:
    - Re-render the information panel.
    - Re-render the Remote Simulator widget.
- **Dynamic Resilience**:
  - Empty selectors / loading state must be handled gracefully.
  - If no device or scenario is selected, simulator area should stay empty.

### iPad Portrait Optimization

- Layout optimized for vertical iPad orientation (~768px wide).
- Primary scrolling direction: **Vertical**.
- Grid elements adjust responsively for easy touch interaction.
- Button sizing, spacing, and selectors should prioritize readability and usability on tablets.

---

## 💡 Dynamic Remote Simulator Widget (Full Details)

### Features and Functional Requirements

#### 1. Dynamic Grid Layout (General Buttons)
- Standard layout uses a **4-column grid**.
- Cells are referenced by IDs: `A0`, `A1`, `A2`, etc. Where `A0` stands for the first cell of the row, where the widget begins.
- Rows and columns are dynamically generated based on configuration.
- **Empty cells are allowed** for spacing and centering adjustments. If not all cells in the row are referenced by a position attribute, unreferenced cells are treated as empty cells.
- Normal buttons maintain **equal size** unless specific overrides are configured.

#### 2. Button Groups
- Buttons are grouped under **named sections**:
  - Visually **bordered with rounded corners**.
  - Group name centered at the top inside the border.
  - Buttons arranged dynamically inside the group based on their position attribute.
- Groups can define **layout override properties**:
  - Example: `layout: 'vertical'` stacks buttons vertically.

#### 3. Special Groups (Full Row Occupation)

Special groups behave differently:
- **Occupy full rows** exclusively.
- No other group's buttons can share those rows.
- Examples of special groups: `Menu`, `Touchpad` (will be addressed later).
- Special groups can define their own internal layout behaviors.
- Empty cells inside special groups are allowed for centering and alignment adjustments.

##### Special Group: `Menu`
- Cross-layout navigation + OK button.
- Anchored at a specific starting cell (e.g., `B0`).
- Entire row reserved.

##### Special Group: `Touchpad`
- Touch-sensitive surface simulation.
- Anchored at a configurable starting cell (e.g., `F0`).
- Entire row reserved.

#### 4. Config-Driven Layout

- **NO hardcoded layouts inside components**.

- New widget:
  - Receives `deviceId` as a prop.
  - Looks up the corresponding config (commands, sorted by group) from the store.
  - Renders UI dynamically.

#### 5. Button Interaction and API Communication

- Clicking a button triggers an **axios POST** request (as it does now).
- Use the platform's global axios setup.
- Proper error handling and feedback mechanisms are expected.

#### 6. Visual and Layout Details

- PrimeFlex grid and flex utilities.
- Mobile- and tablet-friendly responsiveness.
- Uniform button sizing unless overridden.
- Special groups manage independent layout rules.

---

## 🛠 Settings View

### Layout Structure

- **Title** (above all content): Text TBD.
- **Back Button** (top left of the page):
  - Styled as a classic **left arrow**.
  - Navigates back to Main View.

- **First Grid Row** (4 checkboxes in one horizontal line):
  - **Theme Checkbox**: Switches between day and night UI themes.
  - **Button Text Checkbox**: If active, device buttons on Main View display their "description" centered at the bottom inside button.
  - **MQTT Checkbox**: If active, only buttons with a "topic" in config are active; others are grayed out.
  - **Debug Checkbox**: If active, REST API requests/responses are logged into the Logs panel.

- **Logs Panel**:
  - Scrollable table.
  - **Two columns**:
    - **Timestamp column** (format: `HH:MM:SS DD:MM:YY`) with fixed width.
    - **Message column**: Autofitted; wraps lines but keeps timestamp attached to first line.
  - Scrollbar appears on the right if needed.
  - New logs are appended.

### Behavior

- Theme, MQTT, Button Text changes affect Main View dynamically.
- Debug mode outputs all API request/response payloads in real-time.
- State managed via Pinia store or reactive global state.
- Back Button navigates safely to Main View.
