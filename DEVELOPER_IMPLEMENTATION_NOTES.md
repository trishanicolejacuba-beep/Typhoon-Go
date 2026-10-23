# Typhoon GO — Developer Implementation Notes

**Audience:** Engineers onboarding to the Typhoon GO codebase, or any developer extending or maintaining the application.  
**Purpose:** Documents the non-obvious architectural and design decisions embedded in the codebase — the "why" behind choices that might otherwise seem unorthodox.

---

## 1. Architectural Philosophy

Typhoon GO is built on a deliberate **zero-build, zero-framework constraint**. This is not a limitation — it is a design requirement. The application must be:

1. **Deployable without a build pipeline.** No `npm install`, no Webpack, no Babel transpilation. The three source files (`index.html`, `style.css`, `script.js`) are the production artifact.
2. **Operable in degraded network conditions.** In a typhoon scenario, mobile data is unreliable. The SPA model ensures all UI is delivered in a single initial page load with no subsequent navigation-triggered network requests. CDN assets (Leaflet, Font Awesome, Nunito) are the only network dependencies after first load, and they are cacheable.
3. **Maintainable by a single developer or small team.** The file structure is intentionally flat. Any developer with HTML/CSS/JS knowledge can open `index.html` in a browser and immediately understand the application structure.

The architectural pattern is **All-Pages-in-DOM SPA**: all pages exist simultaneously as `position: absolute` divs within `#app-wrapper`. Navigation is CSS `display` toggling, not URL routing. There is no history API integration, no hash routing, and no server-side rendering.

---

## 2. Why `box-shadow` Instead of `border` for Focus States

**The rule:** All focus/ring indicators in Typhoon GO use `box-shadow`, never `border`.

```css
/* Correct — does not affect layout */
.field-input:focus {
  box-shadow: 0 0 0 2.5px var(--red);
}

/* Incorrect — would cause layout jitter */
.field-input:focus {
  border: 2.5px solid var(--red);
}
```

**Why this matters:**

CSS `border` is part of the **box model**. Adding or changing a `border` on focus changes the element's computed size (unless `box-sizing: border-box` absorbs it perfectly, which requires the element to have a fixed height and no pre-existing border that changes).

When `.field-input` has `border: none` at rest and then receives `border: 2.5px solid` on focus, the browser must:
1. Recalculate the element's box model.
2. Reflow any adjacent elements affected by the size change.
3. Repaint the changed area.

On mobile with a list of form inputs stacked vertically, this reflow is visible as a micro-jitter — a subtle layout shift that degrades the polish of the interaction.

`box-shadow`, by contrast, is **painted outside the layout box**. It does not affect the element's computed width, height, or the position of any other element. The browser skips reflow entirely and only triggers a repaint — a dramatically cheaper operation.

The `0 0 0 2.5px` syntax is the standard inset-spread trick: `offset-x: 0, offset-y: 0, blur: 0, spread: 2.5px`. With zero blur, it renders as a precise solid ring — visually identical to a border, but layout-safe.

This pattern is used consistently:
- `.field-input:focus` — red focus ring
- `.sos-circle-outer` — expanding glow via box-shadow animation
- `.gobag-milestone-card` — card elevation shadow
- `.btn-add-contact` — red drop shadow and hover glow

---

## 3. The SPA Data-Attribute Routing System

Navigation in Typhoon GO is driven by a single `data-target` attribute convention and one global event listener.

### How It Works

**HTML Convention:**
Any element that should trigger navigation carries a `data-target` attribute set to the ID of the destination page:

```html
<button class="btn-back" data-target="page-login">&#8592;</button>
<button class="nav-btn" data-target="page-dashboard">Home</button>
<button class="carousel-slide-btn" data-target="page-typhoon-tips">...</button>
```

**JavaScript Wiring:**
A single loop registers click handlers on all `[data-target]` elements at script load time:

```javascript
document.querySelectorAll('[data-target]').forEach(el => {
  el.addEventListener('click', () => {
    const target = el.getAttribute('data-target');
    if (target) navigateTo(target);
  });
});
```

**`navigateTo()` Execution:**

```javascript
function navigateTo(targetId) {
  const currentActive = document.querySelector('.page.active');
  const target = document.getElementById(targetId);

  if (!target || target === currentActive) return;

  if (currentActive) currentActive.classList.remove('active');

  target.classList.add('active');
  target.classList.add('slide-in');

  target.addEventListener('animationend', () => {
    target.classList.remove('slide-in');
  }, { once: true });

  target.scrollTop = 0;
  updateNavbarActive(targetId);

  if (targetId === 'page-safe-routes') {
    setTimeout(() => {
      if (!map) initFreeMap();
      else map.invalidateSize();
    }, 100);
  }
}
```

**What happens:**
1. The guard `if (!target || target === currentActive) return` prevents navigating to a non-existent page or re-navigating to the current page (which would reset scroll position unnecessarily).
2. `.active` is removed from the current page (`display: none` resets it visually immediately).
3. `.active` + `.slide-in` are added to the target — `display: flex` makes it visible, and `slideIn` keyframes (`translateX(100%) → translateX(0)`) animate it in from the right.
4. `{ once: true }` on the `animationend` listener ensures the cleanup callback fires exactly once and auto-removes itself from the listener queue.
5. `scrollTop = 0` resets the page scroll so users always enter a page at the top.

**Why not `history.pushState`?**

In a disaster scenario PWA, the browser back button could take users out of the application entirely if `pushState` is used naively. Without implementing a full history management strategy, it's safer to avoid the History API. The application's back navigation is handled entirely via explicit `btn-back` elements, giving the application full control over navigation flow.

**Why not hash routing?**

Hash routing (`#page-dashboard`) would allow users to bookmark or share deep links, but it also means browser navigation (forward/back) enters the picture. In the current stage of the application, deep linking is not a requirement, and the simpler data-attribute model is sufficient and more maintainable.

---

## 4. The `+63` Phone Number Prefix — JS-Only Approach

**The problem:** Emergency contact phone numbers in the Philippines universally use the `+63` country code. The application needs to store fully-qualified phone numbers, but requiring users to type `+63` manually is friction — especially in a stress scenario.

**The anti-pattern:** A common approach is to add a UI prefix wrapper — a non-editable `<span>` showing `+63` visually prepended to an `<input>`. This requires:
- Extra HTML wrapper markup
- CSS to visually merge the prefix with the input field
- Additional logic to prevent the user from inadvertently editing or interacting with the prefix

**The Typhoon GO approach:**

The `<input>` for phone number is a plain `.field-input` with `type="tel"` and no prefix UI:

```html
<input class="field-input" id="new-contact-phone" type="tel" placeholder="9XXXXXXXXX" />
```

The prefix is applied in the data layer at form submission time:

```javascript
addContactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const phone = document.getElementById('new-contact-phone').value.trim();

  const newContact = {
    name: name,
    phone: '+63' + phone,  // Prefix applied here, in JS
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
});
```

**Benefits:**
- **Zero UI complexity.** The input is a standard `.field-input` with no special styling or wrapper.
- **No CSS double-border risk.** No wrapper element means no potential for the double-border defect that was fixed in the form input bug (see `REFACTORING_SUMMARY.md`).
- **Clear data flow.** The raw phone number (local format) is in the UI layer; the fully-qualified number (`+63XXXXXXXXX`) is only constructed at the model layer during form submission. This separation is maintainable and testable.
- **Easy to extend.** If the application later supports international contacts, a dropdown country selector can replace the hardcoded `+63` constant without touching the input field design.

The `type="tel"` attribute on the input ensures mobile browsers render a numeric keypad, further reducing friction.

---

## 5. Lazy Map Initialization Pattern

The Leaflet map is expensive to initialize — it triggers HTTP tile requests, DOM mutations, and canvas or SVG rendering. Initializing it on app load (even if the Safe Routes page is not visible) would waste network and CPU resources, and could slow the initial paint of the Dashboard.

The solution is lazy initialization with a viewport stabilization guard:

```javascript
function navigateTo(targetId) {
  // ... navigation logic ...

  if (targetId === 'page-safe-routes') {
    setTimeout(() => {
      if (!map) {
        initFreeMap();
      } else {
        map.invalidateSize();
      }
    }, 100);
  }
}
```

**Why `setTimeout(..., 100)`?**

When `navigateTo` runs, the target page is set to `display: flex` and the slide animation begins — but the browser may not have completed its layout pass before the next synchronous JavaScript executes. Leaflet's `L.map()` calls `getBoundingClientRect()` on `#map-container` internally to determine the map's pixel dimensions. If this runs before the browser has painted the newly-activated page, it reads a width and height of `0` — resulting in a broken map that renders no tiles.

The 100ms timeout yields to the browser event loop, allowing the paint pass to complete before Leaflet measures the container. This is a pragmatic compromise between correctness and complexity — a `requestAnimationFrame` followed by another `requestAnimationFrame` would be technically more precise, but the 100ms timeout is reliable in practice on all target devices.

**Why `map.invalidateSize()`?**

If the user navigates to Safe Routes, then away, then back — the map DOM container still exists (pages are never destroyed, only hidden). The existing Leaflet instance is valid, but the container may have zero dimensions while hidden. `invalidateSize()` forces Leaflet to re-read the container's current dimensions and redraw tiles accordingly.

---

## 6. Event Delegation for Dynamic Contact Chat Routing

The messaging system uses a pattern of **event delegation with runtime DOM inspection** to handle navigation from multiple contexts (contact list row, recent call card) without duplicating event listener registrations.

```javascript
document.addEventListener('click', (e) => {
  const smsBtn  = e.target.closest('.contact-sms');
  const callCard = e.target.closest('.recent-call-card');

  let targetName   = null;
  let targetBgColor = 'var(--red)';

  if (smsBtn) {
    targetName    = smsBtn.getAttribute('data-contact');
    const row     = smsBtn.closest('.contact-row');
    if (row) {
      const avatar = row.querySelector('.contact-avatar');
      if (avatar) targetBgColor = avatar.style.backgroundColor || targetBgColor;
    }
  } else if (callCard) {
    targetName    = callCard.getAttribute('data-contact');
    const avatar  = callCard.querySelector('.recent-call-avatar');
    if (avatar) targetBgColor = avatar.style.backgroundColor || targetBgColor;
  }

  if (targetName) {
    document.getElementById('msg-header-name').textContent  = targetName;
    document.getElementById('msg-empty-name').textContent   = targetName;
    const initial = targetName.charAt(0).toUpperCase();
    document.getElementById('msg-header-avatar').textContent          = initial;
    document.getElementById('msg-header-avatar').style.backgroundColor = targetBgColor;
    document.getElementById('msg-empty-avatar').textContent           = initial;
    document.getElementById('msg-chat-list').innerHTML                = '';
    document.getElementById('msg-empty-state').style.display          = 'flex';
    document.getElementById('msg-quick-chats').style.display          = 'flex';
    navigateTo('page-message');
  }
});
```

This single listener on `document` handles clicks bubbling up from any SMS button or recent call card anywhere in the application — including cards dynamically injected by `addContactToCarousel()`. This is correct — dynamically added elements are automatically covered by delegation, unlike per-element `addEventListener` calls which would miss new elements.

The `e.target.closest()` call walks up the DOM tree from the actual clicked element to find the nearest ancestor matching the selector, safely handling clicks on child elements (e.g., clicking the icon inside a button).

---

## 7. IIFE Scope Isolation for the Go-Bag Checklist

The Go-Bag Checklist logic is wrapped in an **Immediately Invoked Function Expression (IIFE)**:

```javascript
(function initGoBagChecklist() {
  // All checklist variables and functions are scoped here
  const checkboxes   = document.querySelectorAll('.gobag-checkbox');
  // ...
})();
```

This pattern serves two purposes:

1. **Variable isolation:** All DOM references (`checkboxes`, `progressFill`, `overlay`, etc.) and state variables (`triggered` milestone map) are confined to the IIFE's scope. They cannot conflict with variables in the global script scope or other feature blocks.
2. **Self-documenting:** The named IIFE (`initGoBagChecklist`) makes it clear in call stacks (DevTools) and code reviews exactly what this block initializes, unlike an anonymous IIFE.

The guard at the top — `if (!checkboxes.length) return` — makes the IIFE safe to load even if `#page-gobag` is not present in the DOM (for future refactoring or page removal).