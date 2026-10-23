# Typhoon GO — Quick Reference Guide

**Purpose:** A rapid-lookup reference for developers working in the Typhoon GO codebase. Contains all design tokens, utility classes, and core JavaScript function signatures.

---

## 1. CSS Design Tokens (`:root` Custom Properties)

All design tokens are defined on the `:root` selector in `style.css`. Always reference these variables — never hardcode color or font values in component-level rules.

### 1.1 Color Palette

| Variable | Hex Value | Usage |
|---|---|---|
| `--red` | `#FF2323` | Primary brand color. CTAs, SOS button, nav active state, alert indicators, send buttons. |
| `--red-light` | `#FF5555` | Hover/lighter red accent. Used in SOS hover state (`tap-icon` hover). |
| `--red-pale` | `#FFD6D6` | Very light red tint. Available for soft backgrounds (e.g., danger zones). |
| `--black` | `#1A1A1A` | Primary text color. Headings, body text, icons. |
| `--dark-gray` | `#4A4A4A` | Secondary text. Descriptions, supporting copy. |
| `--mid-gray` | `#888888` | Tertiary text. Labels, timestamps, placeholders, nav inactive state. |
| `--light-gray` | `#D5D5D5` | Borders, dividers, inactive carousel dots, input borders. |
| `--input-bg` | `#D9D9D9` | Background fill for all `.field-input` elements. |
| `--white` | `#FFFFFF` | Page backgrounds, card surfaces, button text. |
| `--green` | `#2ECC40` | Safe route status, success state. |
| `--orange` | `#FF851B` | Partially available status (e.g., evacuation center "filling up"). |
| `--navbar-bg` | `#1C1C1C` | Reserved for dark navbar variant (not currently active). |
| `--card-border` | `#1A1A1A` | Border color for evac cards and alert cards (dark, high-contrast). |
| `--background` | `#fffefe` | Near-white page background (slightly warmer than pure white). |

### 1.2 Typography

| Variable | Value | Usage |
|---|---|---|
| `--font` | `'Nunito', sans-serif` | Applied globally to `html, body` and explicitly to all button and input elements. |

### 1.3 Layout Constants

| Variable | Value | Usage |
|---|---|---|
| `--navbar-h` | `70px` | Height of the global bottom navigation bar. Used in `.has-navbar { padding-bottom }` and `.btn-add-contact { bottom }`. |
| `--header-h` | `56px` | Height of inner page headers. Used for `.msg-dropdown { top }` positioning. |

---

## 2. Utility Classes

### 2.1 Buttons

#### `.btn-primary`
The primary call-to-action button. Full-width, red background, white text.

```css
.btn-primary {
  display: block;
  width: 100%;
  height: 54px;
  background: var(--red);
  color: var(--white);
  font-family: var(--font);
  font-size: 17px;
  font-weight: 800;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.18s, transform 0.1s;
  letter-spacing: 0.3px;
}
.btn-primary:active { transform: scale(0.97); background: #e01c1c; }
```

**Usage:** Login button, Reset Password button, Register Submit button.  
**Active state:** Scales down to `0.97` and darkens to `#e01c1c` for tactile press feedback.

#### `.btn-outline`
Secondary action button. White background with red border and red text.

```css
.btn-outline {
  display: block;
  width: 100%;
  height: 54px;
  background: var(--white);
  color: var(--red);
  font-family: var(--font);
  font-size: 17px;
  font-weight: 800;
  border: 2px solid var(--red);
  border-radius: 30px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.18s, transform 0.1s;
}
.btn-outline:active { transform: scale(0.97); background: #fff5f5; }
```

**Usage:** "Create New Account" button on Login.

#### `.btn-back`
Navigation back arrow button. Transparent, no border.

```css
.btn-back {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--black);
  cursor: pointer;
  padding: 6px 8px 6px 0;
  font-weight: 700;
  line-height: 1;
}
```

**Usage:** All inner page headers. Content is the HTML entity `&#8592;` (←) or a Font Awesome `fa-arrow-left` icon. Always accompanied by a `data-target` attribute for routing.

#### `.carousel-slide-btn`
A reset class for `<button>` elements used as carousel slides. Strips all native button chrome.

```css
.carousel-slide-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
```

**Critical note:** This class exists specifically to fix WebKit carousel staggering. See `REFACTORING_SUMMARY.md` — Bug 1.

### 2.2 Form Elements

#### `.field-input`
Standardized input field. Applied directly to `<input>` elements — not to wrapper divs.

```css
.field-input {
  width: 100%;
  height: 52px;
  background: var(--input-bg);
  border: none;
  border-radius: 30px;
  padding: 0 20px;
  font-size: 15px;
  font-family: var(--font);
  color: var(--dark-gray);
  outline: none;
  transition: box-shadow 0.2s;
}
.field-input:focus {
  box-shadow: 0 0 0 2.5px var(--red);
}
```

**Rule:** Never wrap `.field-input` in an additional styled border container. The `border: none` + `outline: none` + `box-shadow` focus pattern is deliberate — see Developer Implementation Notes.

#### `.field-label`
Uppercase, small-cap label above inputs.

```css
.field-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--mid-gray);
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}
```

#### `.form-group`
Vertical grouping of label + input. Provides consistent bottom spacing.

```css
.form-group {
  width: 100%;
  margin-bottom: 14px;
}
```

### 2.3 Page System

#### `.page`
All SPA page containers. Hidden by default (`display: none`).

```css
.page {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: none;
  flex-direction: column;
  background: var(--background);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
```

#### `.page.active`
The currently visible page.

```css
.page.active { display: flex; }
```

#### `.page.has-navbar`
Applied to pages that include the global navigation bar. Adds bottom padding to prevent content from being obscured by the navbar.

```css
.page.has-navbar {
  padding-bottom: var(--navbar-h);  /* 70px */
}
```

#### `.page.slide-in`
Transient animation class applied during navigation. Removed via `animationend` listener.

```css
.page.slide-in {
  animation: slideIn 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);   opacity: 1; }
}
```

### 2.4 Navigation

#### `.nav-btn` / `.nav-btn.nav-active`
Global navbar tab buttons.

```css
.nav-btn {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 3px; padding: 8px 4px;
  color: #888888;
  transition: color 0.15s;
  background: none; border: none; cursor: pointer;
}
.nav-btn.nav-active { color: var(--red); }
```

### 2.5 Feedback

#### `.text-link`
Styled anchor/text button for secondary in-form navigation.

```css
.text-link {
  display: block;
  text-align: center;
  color: var(--mid-gray);
  font-size: 14px;
  text-decoration: underline;
  margin-top: 14px;
  cursor: pointer;
}
```

---

## 3. Core JavaScript Functions

### 3.1 `navigateTo(targetId)`

**File:** `script.js`  
**Signature:** `navigateTo(targetId: string): void`

Transitions the SPA from the currently active page to the page identified by `targetId`.

**Behavior:**
1. Queries `.page.active` to find the current page.
2. Removes `.active` from the current page.
3. Adds `.active` and `.slide-in` to the target page.
4. Registers a one-time `animationend` listener to remove `.slide-in` after the 280ms transition completes.
5. Resets `target.scrollTop = 0` to ensure pages always open at the top.
6. Calls `updateNavbarActive(targetId)` to sync the bottom navbar.
7. If `targetId === 'page-safe-routes'`, fires `initFreeMap()` (or `map.invalidateSize()` if already initialized) in a `100ms` setTimeout.

**Example:**
```javascript
navigateTo('page-gobag');
```

**Important:** All `[data-target]` elements in the HTML are wired to `navigateTo` via a single delegated event listener loop. Do not add inline `onclick` attributes.

### 3.2 `updateNavbarActive(pageId)`

**File:** `script.js`  
**Signature:** `updateNavbarActive(pageId: string): void`

Removes `.nav-active` from all `.nav-btn` elements, then adds it back to any button whose `data-target` matches `pageId`.

**Behavior:** Queries all `.nav-btn` elements across the entire document — including navbars duplicated across multiple pages — and applies the active state universally. This means the correct tab is highlighted regardless of which page's navbar the user is viewing.

### 3.3 `showToast(message, success)`

**File:** `script.js`  
**Signature:** `showToast(message: string, success?: boolean = false): void`

Renders a non-blocking floating toast notification inside `#app-wrapper`.

**Behavior:**
1. Removes any existing `#app-toast` element to prevent stacking.
2. Creates a `<div>` with inline styles: red background (`var(--red)`) for errors, green (`#2ECC40`) for success.
3. Injects a `@keyframes toastIn` style tag into `<head>` if not already present (lazy injection).
4. Appends the toast to `#app-wrapper` (not `document.body`) to ensure it respects the app's `390px` constrained width.
5. After 2200ms, fades out via `opacity: 0` transition, then removes the element 320ms later.

**Examples:**
```javascript
showToast('Please enter your email.');              // Error (red)
showToast('Password reset successful!', true);      // Success (green)
showToast('Emergency SOS activated!');              // Alert (red)
showToast(`Contact "${name}" added!`, true);        // Dynamic content (green)
```

**Note:** `pointer-events: none` is applied to the toast so it never intercepts tap/click events on the content below.

### 3.4 `initFreeMap()`

**File:** `script.js`  
**Signature:** `initFreeMap(): void`

Initializes the Leaflet.js map in the `#map-container` DOM element.

**Behavior:**
1. Creates a Leaflet map instance centered on `[8.2411, 124.2439]` (MSU-IIT, Iligan City) at zoom `15`.
2. Adds an OpenStreetMap tile layer with `maxZoom: 19`.
3. Places a marker at the same coordinates and immediately opens a popup: `"MSU-IIT — Iligan City, Lanao del Norte."`.
4. Assigns the map instance to the module-level `let map` variable to allow `invalidateSize()` calls on subsequent visits.

**Called by:** `navigateTo()`, conditionally, only when navigating to `page-safe-routes`.

### 3.5 `showSlide(index)`

**File:** `script.js`  
**Signature:** `showSlide(index: number): void`

Scrolls the featured carousel to a specific slide.

**Behavior:**
1. Calculates `slideWidth = carousel.clientWidth`.
2. Sets `carousel.scrollLeft = index * slideWidth` (leverages native `scroll-snap-type: x mandatory` for smooth snapping).
3. Toggles `.active` on the corresponding `.carousel-dot` element.
4. Updates the module-level `currentSlide` variable.

### 3.6 `handleSwipe()`

**File:** `script.js`  
**Signature:** `handleSwipe(): void`

Processes touch swipe gestures on the featured carousel.

**Behavior:** Compares `touchStartX` and `touchEndX` (set by `touchstart`/`touchend` listeners). A delta greater than `50px` in either direction advances or retreats the carousel by one slide.

### 3.7 `addContactToCarousel(contact)`

**File:** `script.js`  
**Signature:** `addContactToCarousel(contact: { name: string, phone: string, timestamp: string }): void`

Dynamically injects a new contact card into the Recent Calls carousel (`#recent-calls-carousel`).

**Behavior:** Selects a random color from a curated 6-color palette, extracts the first letter of the contact's name as the avatar initial, constructs a `.recent-call-card` DOM element, and prepends it to the front of the carousel.

### 3.8 `addMessage(text, isOutgoing, isUrgent)`

**File:** `script.js` (inside `DOMContentLoaded` closure)  
**Signature:** `addMessage(text: string, isOutgoing?: boolean = true, isUrgent?: boolean = false): void`

Appends a chat message bubble to `#msg-chat-list`.

**Behavior:**
1. Returns early if `text.trim()` is empty.
2. Hides `#msg-empty-state` and `#msg-quick-chats` on first call.
3. Creates `.msg-bubble-wrap` with class `outgoing` or `incoming`.
4. Creates `.msg-bubble` with class `urgent` if `isUrgent` is true.
5. Auto-scrolls `#msg-body` to bottom via `scrollTop = scrollHeight`.