

## Plan: Combine Welcome + Home, Redesign Mobile Tab Bar, Move Language to Settings

### 1. Merge Welcome and Home into a single page (`/` route)

**Remove `WelcomePage.tsx`** and make `Index.tsx` the root route (`/`).

Redesign the hero section of `Index.tsx`:
- Top: Mascot + greeting text (from WelcomePage)
- Below: Two large mode-selection buttons side by side (left: **Game Mode**, right: **Speech Therapy Information**)
  - Desktop: horizontal row, equal width
  - Mobile: stack vertically or use a 2-column grid
- Below the buttons: the existing Echo Speech card, quick actions, stats bar, etc. remain

**Route changes in `App.tsx`:**
- `"/"` → `<Index />` (wrapped in `<AppLayout />`)
- Remove `/home` route and WelcomePage import
- Update all internal links from `/home` to `/`

### 2. Redesign mobile bottom tab bar

Change the 4 tabs to 5 tabs in this order:

| Position | Label | Icon | Route |
|----------|-------|------|-------|
| 1 | IPA Library | BookOpen | `/ipa` |
| 2 | Echo Speech | AudioLines | scroll to `#golden-speaker` on `/` |
| 3 | Home | Home | `/` |
| 4 | Speech Quest | Swords | `/speech-quest` |
| 5 | Settings | Settings (gear) | opens SettingsModal |

The center "Home" tab will be visually emphasized (larger icon or highlighted).

### 3. Move language switcher from header to Settings modal

- **Remove** `<LanguageSwitcher>` from the header in `AppLayout.tsx`
- **Add** a language selector row inside `SettingsModal.tsx` (item #5, using a simple select/dropdown for zh-TW, zh-CN, en-GB)
- Pass `handleLanguageChange` into SettingsModal (via props or by using the hooks directly inside the modal)

### Files to modify

| File | Change |
|------|--------|
| `src/App.tsx` | Remove WelcomePage, make Index the `/` route, remove `/home` |
| `src/pages/Index.tsx` | Add mascot hero + two side-by-side mode buttons at top |
| `src/pages/WelcomePage.tsx` | Delete |
| `src/components/AppLayout.tsx` | Update tabs to 5 items (IPA, Echo, Home, Quest, Settings), remove LanguageSwitcher from header, update all `/home` refs to `/` |
| `src/components/SettingsModal.tsx` | Add language preference selector |
| `src/components/AppSidebar.tsx` | Update `/home` links to `/` |
| Other pages with `/home` references | Update to `/` |

