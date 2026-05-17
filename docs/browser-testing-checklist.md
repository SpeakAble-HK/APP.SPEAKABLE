# Browser testing checklist — SpeakAble HK

Use this checklist before any public release or pilot deployment.

---

## Target browsers

### Desktop
- [ ] Chrome (Windows / Mac / Linux) — latest stable
- [ ] Safari (Mac) — latest stable
- [ ] Firefox (Windows / Mac) — latest stable
- [ ] Edge (Windows / Mac) — latest stable

### Mobile
- [ ] iOS Safari — iPhone SE (375 px, small phone) and iPhone 14 Pro (393 px)
- [ ] Chrome on Android — Pixel 7 or Samsung Galaxy (360–412 px)
- [ ] Samsung Internet (Android) — latest stable

### Tablet
- [ ] iPad Safari (768 px portrait, 1024 px landscape)
- [ ] Android tablet Chrome (800–1280 px)

---

## Responsive breakpoints

| Breakpoint | Width    | Use                             |
|------------|----------|---------------------------------|
| `xs`       | 375 px   | Small phones (iPhone SE)        |
| `sm`       | 640 px   | Large phones / small tablets    |
| `md`       | 768 px   | Tablets / hamburger → full nav  |
| `lg`       | 1024 px  | Small laptops                   |
| `xl`       | 1280 px  | Desktop                         |
| `2xl`      | 1536 px  | Wide desktop                    |

---

## Test cases

### Navigation
- [ ] Logo links to homepage
- [ ] Desktop nav links scroll to correct sections
- [ ] Mobile hamburger opens / closes cleanly
- [ ] Mobile nav links scroll and close the menu
- [ ] "Book demo" and "Log in" CTAs visible and tappable on mobile
- [ ] Language selector dropdown opens and switches language
- [ ] Sticky header stays visible on scroll

### Public homepage (`/`)
- [ ] Hero headline and subtitle readable on all sizes
- [ ] PiPi image loads and displays correctly
- [ ] "Book school demo" CTA button is tappable (≥ 44 × 44 px)
- [ ] Trust bar logos visible
- [ ] Schools, Professionals, Families, Pilot sections render
- [ ] Section grids stack to single column on mobile
- [ ] Footer links work

### Role select (`/role-select`)
- [ ] All 3 cards display in a row on ≥ md, stack on mobile
- [ ] Back button navigates back
- [ ] PiPi image loads
- [ ] Cards are tappable and navigate correctly
- [ ] Language selector works

### Forms (when built)
- [ ] Input fields do not trigger zoom on iOS Safari (font-size ≥ 16 px)
- [ ] Buttons meet 44 × 44 px minimum tap target
- [ ] Form submission works cross-browser

---

## iOS Safari–specific
- [ ] No grey tap-highlight flash on buttons / links
- [ ] No auto-zoom on input focus
- [ ] Viewport height correct (no content behind browser chrome)
- [ ] Bottom safe-area inset respected on tab bar
- [ ] Momentum scroll smooth in scrollable containers
- [ ] `backdrop-filter` blur renders (supported in iOS 9+)

---

## Performance (Lighthouse / PageSpeed)
- [ ] First Contentful Paint < 2 s on 4G
- [ ] Time to Interactive < 4 s on 4G
- [ ] No Cumulative Layout Shift (CLS > 0.1 fails)
- [ ] Images have `loading="lazy"` (below fold)
- [ ] Hero images served at appropriate size (srcset when added)

---

## Accessibility
- [ ] Keyboard-only navigation works (Tab, Enter, Space, Escape)
- [ ] All interactive elements have visible focus rings (2 px sky-600)
- [ ] Color contrast passes WCAG 2.2 AA (4.5:1 text, 3:1 UI)
- [ ] Decorative images have `alt=""`, meaningful images have alt text
- [ ] `prefers-reduced-motion` respected — no autoplay animation
- [ ] Screen reader: headings, landmarks, and button labels make sense

---

## PWA / installability
- [ ] `manifest.json` loads without errors (DevTools > Application > Manifest)
- [ ] `theme-color` meta renders correct brand blue in Chrome Android
- [ ] App can be added to home screen on iOS Safari ("Add to Home Screen")
- [ ] App can be installed on Android Chrome

---

## Quick smoke-test script (DevTools)

```js
// Paste into DevTools console to spot common issues
const interactive = [...document.querySelectorAll('button, a, input, [role="button"]')];
const tooSmall = interactive.filter(el => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && (r.width < 44 || r.height < 44);
});
console.table(tooSmall.map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 40), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) })));
```
