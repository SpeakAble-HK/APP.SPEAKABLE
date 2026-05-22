# Landing page redesign — PiPi-first, kid-friendly

Pivot the public landing page from a cool/corporate look to a warm, playful, gamified entrance that still reads as trustworthy to parents. PiPi the parrot becomes the visual hero.

## Scope

Only the public landing surface (`/` → `src/pages/Index.tsx`) and its components:

- `LandingNav.tsx`
- `HeroSection.tsx`
- `FeaturePanel.tsx` + `FeatureIllustrations.tsx`
- `PremiumBanner.tsx`
- `ProductCards.tsx`
- `CTAFooter.tsx`

No changes to the in-app experience, routing, auth, or backend. Trilingual copy (zh-TW / zh-CN / en-GB) preserved via existing `t3()` helper.

## Visual direction

**Palette (light, warm, cheerful)** — anchored on existing brand tokens, no new dark surfaces.

- Page background: warm off-white (`cloud` / very light cream)
- Sunny yellow (`sunshine #FFCB4D`) — primary CTAs, highlights
- Soft sky blue (`sky-200/400`) — secondary surfaces, headers
- Playful mint (`mint #6FD4B3`) — accents, success
- Coral (`coral #FF8A5C`) — sparingly, for the big "Let's Play" CTA
- Remove: dark navy `PremiumBanner` gradient, "tech" radial blur fields, neon glows

**Shape language**

- All buttons → `rounded-full` (pill) or `rounded-2xl`
- Cards / image frames → `rounded-3xl` with soft shadow
- Add a reusable `shadow-soft` token (`0 12px 32px -8px rgba(26,37,65,0.12)`)
- Hover: `hover:scale-105 transition-transform` + gentle bob on mascot

**Typography**

- Keep brand-approved **Nunito** for display (already installed, rounded & friendly — matches the Fredoka/Quicksand vibe the brief asks for) and **Inter** for body.
- Bump display weight to bold/extrabold for hero, keep body at 400/500.
- Larger sizes across the board (hero H1 ~3rem on desktop, body 18px).

**Mascot & imagery**

- PiPi (`@/assets/pipi-mascot.png`) becomes the hero centerpiece, larger, with a soft sun/cloud halo behind.
- Replace the four `FeatureIllustrations` sci-fi SVGs with simple, flat, friendly cartoon scenes (PiPi holding a mic, PiPi with stars, PiPi on a learning path, PiPi with a big tap target) — drawn inline as SVG using the new palette.
- Add **wavy SVG section dividers** between every panel (cloud/wave shapes in alternating cream/sky/mint).
- Remove the dark `PremiumBanner` background entirely — repaint as a sunny sky scene with PiPi on an island.

**Copy / CTA**

- Primary hero CTA: **"Let's Play!" / 「一齊玩！」/「一起玩！」** — massive pill button, coral→sunshine gradient, large icon, scale-on-hover.
- Secondary CTA: "Meet PiPi" / 「識下 PiPi」/「认识 PiPi」.
- Nav CTA stays compact but recolored to sunshine.
- All existing institutional copy preserved — only the headline CTAs change tone.

## Brand-rule check (heads-up)

The SpeakAble HK brand kit (in `.cursor/rules/brand.mdc`) currently mandates:

- Nunito/Inter at weights **400/500 only** — the new design needs bolder display weights for the playful feel. Proposing to bump to 700/800 for hero only.
- **Sentence case** for buttons — "Let's Play!" is sentence case, fine. Exclamation marks are limited to one per family page — the hero will use one, footer none.
- B2B-first audience hierarchy — the homepage currently leads with PiPi cameo. Going full mascot-forward shifts it more toward Tier 3 (families). Flagging because this is intentional per the brief but reverses the brand kit's "cameo only" rule for the public homepage.

If you want to preserve the brand kit strictly, say so and I'll dial PiPi back to a large cameo rather than full hero takeover.

## Technical notes

- Add new design tokens to `tailwind.config.ts` (`shadow-soft`, extend `borderRadius` with `3xl`) and `index.css` (HSL vars for sunshine/coral/mint backgrounds) — keep semantic-token discipline, no hard-coded hex in components.
- Reusable `<WaveDivider variant="cream|sky|mint" flip />` component in `src/components/landing/WaveDivider.tsx`.
- Reusable `<PlayButton>` wrapper for the giant CTA so it can be reused in footer.
- Mascot bob already exists (`animate-pipi-bob`) — reuse.
- No new packages required.

## Files touched

- `tailwind.config.ts`, `src/index.css` — tokens
- `src/components/landing/LandingNav.tsx` — recolor, pill CTA
- `src/components/landing/HeroSection.tsx` — bigger PiPi, new CTAs, sun halo
- `src/components/landing/FeaturePanel.tsx` — rounded cards, wave dividers
- `src/components/landing/FeatureIllustrations.tsx` — replace 4 SVGs
- `src/components/landing/PremiumBanner.tsx` — repaint sky scene
- `src/components/landing/ProductCards.tsx` — pastel cards, pill buttons
- `src/components/landing/CTAFooter.tsx` — sunny background, "Let's Play" CTA
- `src/components/landing/WaveDivider.tsx` — new
- `src/pages/Index.tsx` — wire dividers between panels

## Out of scope

- In-app screens (Explorer dashboard, Quest, Bilabial games, settings)
- Auth / role selection flow
- New illustrations beyond inline SVG (no AI image generation unless you ask)
