# Typhoon GO — File Index

**Project Root:** `/` (repository root)  
**Last Updated:** May 11, 2026

---

## Source Files

| File | Type | Responsibility |
|---|---|---|
| `index.html` | HTML5 | Single-file SPA shell. Contains all 10+ page sections as `<div class="page">` elements. Defines the app wrapper, all navigation structures, all static content (tips, first aid guide, evac centers, alert cards), all form markup, the carousel, the messaging interface, and the global navbar. This file is the complete application markup. |
| `style.css` | CSS3 | Complete visual layer. Defines all design tokens (`:root` custom properties), the page system (`.page`, `.page.active`, `.page.has-navbar`, `.page.slide-in`), all shared components (headers, buttons, forms), and all page-specific styles. Contains all keyframe animations. No preprocessor — raw CSS3 with custom properties. |
| `script.js` | JavaScript ES6+ | All interactive logic. Implements the SPA routing engine (`navigateTo`, `updateNavbarActive`), Leaflet map initialization (`initFreeMap`), the carousel (`showSlide`, `handleSwipe`, auto-rotate), the toast system (`showToast`), the contact add modal and `addContactToCarousel`, the Go-Bag Checklist gamification IIFE, the messaging system (`addMessage`, chat routing delegate), and all form validation handlers. |

---

## Asset Files (Expected — Not Tracked in Repo)

| File | Type | Used By | Notes |
|---|---|---|---|
| `weatherbanner.png` | Image | `index.html` `.weather-banner` | Dashboard weather banner image. `object-fit: cover`, `height: 150px`. |
| `userprofile.png` | Image | `index.html` `#page-account` | User profile photo on account page. Falls back to `.account-avatar-fallback` div if not found. |
| *(carousel images)* | Image | `.carousel-img` elements | Images for the featured dashboard carousel slides. `onerror` handler degrades to a gradient background if missing. |
| *(resource tile images)* | Image | `.resource-tile-img` elements | Images for the 2×2 dashboard resource grid. |
| *(banner images)* | Image | Typhoon Tips, First Aid, Go-Bag pages | `tips-banner-image`, `first-aid-banner-image`, `checklist-image` classes. Each uses `width: 105%` bleed effect. |

---

## External Dependencies (CDN)

| Resource | Provider | Version | URL |
|---|---|---|---|
| Leaflet CSS | unpkg | 1.9.4 | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css` |
| Leaflet JS | unpkg | 1.9.4 | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` |
| Font Awesome | cdnjs | 6.4.0 | `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css` |
| Nunito Font | Google Fonts | — | `https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900` |
| OpenStreetMap Tiles | OpenStreetMap | — | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` (served via Leaflet) |

---

## Documentation Files (This Set)

| File | Format | Responsibility |
|---|---|---|
| `PROJECT_COMPLETION.md` | Markdown | Executive summary, feature inventory, and technology stack documentation for stakeholders and incoming engineers. |
| `REFACTORING_SUMMARY.md` | Markdown | Technical post-mortem on the three major WebKit rendering bugs fixed during the UI stabilization phase: carousel staggering, form input double border, and sticky chat footer. |
| `QUICK_REFERENCE_GUIDE.md` | Markdown | Rapid-lookup reference for CSS design tokens, utility classes, and core JavaScript function signatures. The primary day-to-day reference for developers working in the codebase. |
| `DEVELOPER_IMPLEMENTATION_NOTES.md` | Markdown | In-depth explanations of architectural decisions: `box-shadow` vs `border` for focus states, the `data-target` SPA routing convention, the `+63` prefix JS-only pattern, lazy Leaflet initialization, event delegation for messaging, and IIFE scope isolation. |
| `FILE_INDEX.md` | Markdown | This document. Complete inventory of all source files, assets, external dependencies, and documentation files with their specific responsibilities. |
| `FINAL_VERIFICATION_CHECKLIST.md` | Markdown | Rigorous QA checklist covering UI responsiveness, animation correctness, form validation, SPA routing integrity, and feature completeness. To be completed before each release. |
| `COMPLETION_REPORT.txt` | Plain Text | Formal memorandum to project stakeholders announcing the completion of the core development lifecycle. |