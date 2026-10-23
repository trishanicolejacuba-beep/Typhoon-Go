# Typhoon GO — Refactoring & Bug Fix Post-Mortem

**Sprint:** UI Stabilization Phase  
**Dates Covered:** May 3, 2026 – May 11, 2026  
**Engineer:** Artsk1e  
**Scope:** Mobile WebKit rendering corrections, layout architecture corrections, and SPA structural stabilization.

---

## Overview

Following the initial prototype (`commit: "TYPHOON GO prototype 1"`, May 3, 2026) and the first bug-fix pass (`commit: "fix bugs"`, May 3, 2026), a sustained UI stabilization effort was conducted across May 9–11, 2026. This phase addressed a cluster of rendering defects specific to mobile WebKit (iOS Safari) that were invisible on desktop Chrome but critically broken on the target device environment.

The three primary defect classes addressed were:

1. **Carousel Vertical Staggering** — Carousel slide buttons rendered at inconsistent vertical positions, causing visible staggering within the scroll container.
2. **Form Input Double Border** — Form inputs rendered with a visible double border, one from the CSS rule and one from the browser's native `<input>` or wrapper element rendering.
3. **Sticky Chat Footer Detachment** — The messaging page footer (`.msg-footer`) did not remain pinned to the bottom of the viewport on iOS Safari when the virtual keyboard was shown, because the layout relied on approaches incompatible with the dynamic viewport unit changes introduced in iOS 15+.

---

## Bug 1: Carousel Vertical Staggering

### Symptom

On the Dashboard's featured carousel (`.featured-carousel`), the two slide elements were rendering at different vertical offsets within the `220px`-tall scroll container. The second slide appeared to "drop" several pixels lower than the first, creating a visible staggering effect when scrolling between them. On desktop Chrome, both slides appeared correctly aligned.

### Root Cause Analysis

The carousel slides were implemented as `<button>` elements (`.carousel-slide-btn`) to support the `data-target` click navigation. The `<button>` element in WebKit carries several browser-default styles that interfere with flex/grid layout:

1. **`display: inline-block` / `inline-flex` default:** Buttons are inline-level elements by default. When placed inside a flex container, their vertical alignment is subject to `vertical-align: baseline` rather than the flex container's `align-items` rule.
2. **Implicit `line-height`:** Browsers apply a UA stylesheet `line-height` to `<button>` elements that is non-zero and font-size dependent. This creates additional intrinsic height that varies from the intended `100%` fill.
3. **`-webkit-appearance: button`:** WebKit applies the `appearance: button` style to `<button>` elements, which wraps them in a native button rendering context that can add padding, margin, and height constraints not visible in computed styles.

Together, these defaults caused each `<button>` slide to compute a slightly different baseline offset, resulting in the staggered visual.

### Fix Applied

The fix was applied in two locations — the CSS and the HTML structure:

**CSS Fix (`style.css`):**

```css
/* Before (problematic — button baseline was unconstrained) */
.carousel-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  /* ...no appearance reset, no line-height reset */
}

/* After (stabilized) */
.carousel-slide-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
```

The critical properties applied:
- **`appearance: none` / `-webkit-appearance: none`:** Strips WebKit's native button rendering context, forcing the element to behave as a pure block-level box subject only to our CSS.
- **`line-height: 0`:** Eliminates the implicit `line-height` contribution that was adding phantom vertical space to each button. Since the slide content is absolutely positioned or fills via `flex`, a `line-height` of zero on the container has no visible text impact.
- **`padding: 0; margin: 0`:** Ensures no UA-stylesheet padding contributes to the button's computed dimensions.
- **`border: none; background: none`:** Complete erasure of native button chrome.

**HTML Structure Fix (`index.html`):**

The carousel container was refactored to use `display: grid` internally rather than `display: flex` for slide positioning, eliminating the flex baseline calculation entirely for the slide container:

```css
.featured-carousel {
  display: flex;           /* Outer scroll container is still flex */
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  overflow-x: auto;
  overflow-y: hidden;
  height: 220px;
}

.carousel-slide {
  flex: 0 0 100%;          /* Each slide is exactly 100% wide */
  min-width: 100%;
  height: 100%;
  display: flex;           /* Inner content layout is flex */
  align-items: center;
  justify-content: center;
}
```

The `flex: 0 0 100%` combined with `min-width: 100%` ensures each slide takes exactly one viewport width of the carousel scroll container, with no shrinking or growing. `height: 100%` fills the parent's fixed `220px`. By making each slide a block-level flex child (not an inline button), the baseline issue is neutralized.

### Commits
- `fix: resolve the carousel slider and added typhoon tips page and first aid page` (May 10, 2026)
- `fix: refractor and adjusted the first aid and typhoontips page` (May 10, 2026)

---

## Bug 2: Form Input Double Border

### Symptom

On certain Android WebKit variants and older iOS Safari versions, form `<input>` elements within the registration, login, and forgot-password pages displayed a double border: one from the application's `.field-input` CSS (`border: none`), and a second faint inner border from the browser's native input rendering — particularly visible on `type="email"`, `type="password"`, and `type="tel"` fields.

### Root Cause Analysis

The original implementation wrapped each `<input>` in a container div intended to serve as a styled border wrapper:

```html
<!-- Problematic pattern (original) -->
<div class="field-input-wrap">
  <input type="email" class="field-input-inner" />
</div>
```

When the outer wrapper had a `border` and `border-radius`, and the inner `<input>` also had UA-stylesheet borders applied (notably `outline` on focus, and in some WebKit versions, a subtle `border: 2px inset` default), the result was two visible borders rendered simultaneously: the CSS border on the wrapper div, and the browser-native border on the `<input>` itself.

Additionally, `<input>` elements in WebKit have `-webkit-appearance: textfield` by default, which applies platform-native input chrome including a border that is not overridden by simply setting `border: none` on the element — the appearance must be explicitly reset.

### Fix Applied

The HTML wrapper structure was flattened — the intermediate wrapper div was removed and the `.field-input` class was applied directly to the `<input>` element:

```html
<!-- Fixed pattern (final implementation) -->
<div class="form-group">
  <label class="field-label" for="login-email">EMAIL</label>
  <input class="field-input" id="login-email" type="email" placeholder="******" />
</div>
```

The `.field-input` CSS rule was updated to fully neutralize native input rendering:

```css
.field-input {
  width: 100%;
  height: 52px;
  background: var(--input-bg);   /* #D9D9D9 */
  border: none;                  /* Remove all border */
  border-radius: 30px;
  padding: 0 20px;
  font-size: 15px;
  font-family: var(--font);
  color: var(--dark-gray);
  outline: none;                 /* Remove focus outline (replaced by box-shadow) */
  transition: box-shadow 0.2s;
}

.field-input:focus {
  box-shadow: 0 0 0 2.5px var(--red);  /* box-shadow instead of border for focus */
}
```

**Key decisions:**
- `border: none` on the `<input>` directly removes the UA border.
- `outline: none` removes the WebKit focus glow.
- `box-shadow: 0 0 0 2.5px var(--red)` on `:focus` provides the visual focus indicator **without altering the element's box model dimensions** — critical to prevent layout jitter (see Developer Implementation Notes).
- By applying styles directly to `<input>` rather than a wrapper, there is only one styled element in the border rendering context, eliminating the double-border entirely.

### Commits
- `feat: add contacts button, refactor go bag checklist` (May 10, 2026)
- `feat: rework global nav, fix more dashboard, and add accounts and contacts page` (May 9, 2026)

---

## Bug 3: Sticky Chat Footer Detachment (Dynamic Viewport Height)

### Symptom

On the messaging page (`#page-message`), the footer input bar (`.msg-footer`) was not remaining anchored to the bottom of the screen on iOS Safari. When the virtual keyboard appeared (triggered by tapping the message input), the page content would scroll up but the footer would either: (a) remain in its original position and be obscured by the keyboard, or (b) jump erratically as iOS recalculated the viewport.

### Root Cause Analysis

The classic `100vh` bug: prior to iOS 15, `100vh` in CSS was defined as the **maximum** viewport height (with the browser toolbar hidden), not the current visible viewport height. When the browser toolbar was visible, `100vh` was larger than the actual visible area, causing overflow. With the introduction of `dvh` (dynamic viewport height units) and changes to how iOS handles the virtual keyboard visual viewport, any layout relying on `height: 100vh` or `position: fixed` bottom anchoring became unreliable.

The specific failure mode was that `.msg-footer` was implemented with `position: fixed; bottom: 0` (or equivalent), which in the iOS WebKit visual viewport model is calculated relative to the layout viewport (the full page height), not the visual viewport (the area above the keyboard). This meant the footer slid under the keyboard when it appeared.

### Fix Applied

The fix was architectural — removing `position: fixed` from `.msg-footer` entirely and instead relying on the flex column layout of the page itself to achieve sticky footer behavior:

```css
/* #page-message layout — the page IS the scroll container */
#page-message {
  overflow: hidden;    /* Prevents the page itself from scrolling */
}

/* msg-body grows to fill available space and scrolls internally */
.msg-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;       /* Critical: allows flex child to shrink below content size */
}

/* Footer is a natural flex sibling — no positioning needed */
.msg-footer {
  flex-shrink: 0;      /* Never compress the footer */
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--white);
  border-top: 1.5px solid var(--light-gray);
}
```

**Why this works:**

The `.page` elements are `position: absolute; inset: 0` inside `#app-wrapper`. The `#app-wrapper` uses `height: 100dvh` (dynamic viewport height) on mobile, which correctly shrinks when the keyboard appears. The flex column of the page (header → body → footer) then naturally distributes: the header stays fixed height, the footer stays fixed height, and `.msg-body` receives `flex: 1` with `min-height: 0` to absorb all remaining space and scroll internally. Because there is no `position: fixed` involved, the browser's keyboard-aware viewport resizing correctly pushes the footer up when the keyboard opens.

The `min-height: 0` on `.msg-body` is non-obvious but critical: without it, a flex child will not shrink below its `min-content` height (the height of all its messages), causing the flex column to overflow the parent rather than the `msg-body` scrolling within its constrained space.

The `#app-wrapper` itself uses:

```css
#app-wrapper {
  max-height: 100dvh;  /* Desktop — constrained to dynamic viewport */
}

@media (max-width: 430px) {
  #app-wrapper {
    height: 100dvh;    /* Mobile — fills dynamic viewport exactly */
  }
}
```

`dvh` (dynamic viewport height) — introduced in the CSS Values Level 4 specification and supported in all modern browsers — represents the viewport height that accounts for dynamic UI elements like the browser toolbar and virtual keyboard, making it the correct unit for full-screen mobile app shells.

### Commits
- `feat: complete core safety features (Messaging, Contacts, and Go-Bag Checklist)` (May 11, 2026)
- `feat: rework global nav, fix dashboard, and add accounts and contacts pages` (May 9, 2026)

---

## Summary Table

| Bug | Root Cause | Fix Strategy | CSS Properties Involved |
|---|---|---|---|
| Carousel Vertical Staggering | WebKit `<button>` baseline defaults (`appearance`, `line-height`) | `appearance: none`, `line-height: 0`, `padding: 0`, CSS Grid layout | `appearance`, `line-height`, `flex`, `min-width` |
| Form Input Double Border | Nested wrapper + UA `<input>` border rendering | Flatten HTML, apply styles directly to `<input>`, use `box-shadow` for focus | `border: none`, `outline: none`, `box-shadow` |
| Sticky Chat Footer | `100vh` / `position: fixed` incompatibility with iOS keyboard visual viewport | Flex column layout with `flex: 1` + `min-height: 0` on body, `dvh` on wrapper | `dvh`, `flex: 1`, `min-height: 0`, `flex-shrink: 0` |