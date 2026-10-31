---
name: cinematic-story-site
description: Build a cinematic, illustrated, scroll-story website (product/marketing site, invitation, event or brand page) with one signature animated moment, hand-built SVG art, Hindi/English i18n, and mobile-Safari-safe motion. Use when the user wants a "wow" single-page site, a site template in a distinct visual style (editorial, festive Indian, playful 3D…), or to rebuild/redesign an existing site with animation. Includes the engineering rules learned the hard way on iPhone Safari.
---

# Cinematic story site

A method + rulebook for single-page sites that feel crafted, not templated: one memorable moment,
real subject vernacular, hand-made illustration, motion that answers the user, and zero jank on iPhone.
Proven on: a 3D-printing shop (three.js print-in hero), an Indian wedding invite (doors, toran, day-film),
and product-site templates.

## 0. Before designing

1. **Study the subject** — fetch the user's existing site/content (WebFetch + headless screenshots,
   see `references/verify.md`). Collect real copy, numbers, contact info, nav. Never invent stats,
   clients or testimonials; reuse theirs or leave clearly-marked placeholders.
2. **Study the reference** the user likes (screenshot sheet) for *quality and mood only* — never
   reproduce its layout, headline formula, nav or section structure (see `references/design.md`).
3. **Match the audience grade.** B2B software sold to established enterprises (crore-scale
   nurseries, seed companies, manufacturers) is not a whimsy brief: the product UI is the hero, type is
   sober, layout is a disciplined grid, motion only explains the product, CTA is "Book a demo", and the
   page answers procurement questions (roles & access, integrations, pricing, FAQ). Themed metaphors
   (handwriting, tilted cards, illustrated props) read as "a template with a theme". Save themed
   concepts for consumer, event and brand pages. See "Enterprise B2B" in `references/design.md`.
4. **Pick one signature moment** tied to the subject's vernacular (a seed that grows, doors that open,
   a part that 3D-prints, a day that passes). Everything else stays quiet and disciplined.
5. Write a compact token plan: 5–7 named colours, 2 type families (display + body), layout concept,
   3 principles. Check it against the generic-AI defaults in `references/design.md` and revise.

## 1. Stack (default — no build step)

- `index.html` + `css/style.css` + ES modules in `js/`; libraries via a pinned CDN **import map**
  (three, gsap + ScrollTrigger). Serve with `python3 -m http.server`. Static HTML for SEO; JS only for
  interaction. If the user's project is Next.js, port the same patterns (and run `npm run lint`).
- **No smooth-scroll libraries, no scroll-jacking, no CSS scroll-snap.** Native scroll is the only
  thing that feels right on iPhone. (We shipped and removed Lenis + snapping after real-device complaints.)
- All copy in one place (`js/i18n.js` with `data-i18n` attributes) when the site is bilingual.

## 2. Section patterns that work

See `references/patterns.md` for code. Summary:
- **Hero**: everything laid out behind the entrance, then a choreographed GSAP intro (not pop-in).
- **Pinned scene** (sticky stage, `100dvh`) driven by a *damped, speed-capped* progress value — slow
  scroll tracks, fast flick glides at constant pace.
- **Autoplay "film" with watch-once gate** when the story matters more than control (iOS-safe freeze).
- **Tap-to-switch phases** with auto-advance (rest N s, pause on tap, only while on screen).
- **Live product mock-ups** (HTML/CSS UI cards that animate: scanning, counting, rows filling) instead
  of screenshots.
- **Working widgets** (calculators, toggles) beat static claims.
- Hand-built **SVG illustration** functions (`js/illustrations.js`) returning strings; characters and
  props composed from small parts so they can animate (legs, flames, tilak, leaves).

## 3. Non-negotiable engineering rules

Read `references/pitfalls.md` before writing motion code. The short list:
1. Never `contain:` or `overflow` on a sticky element's ancestors; size sticky stages `100vh → 100svh → 100dvh`.
2. To lock scroll on iOS, freeze the body (`position:fixed; top:-y`) — `overflow:hidden` does not stop momentum.
3. Trigger scroll moments with **IntersectionObserver + scroll** (iOS coalesces scroll events) and a
   tolerance (start when the section is "mostly" on screen, not pixel-exact).
4. Animate **transform/opacity only**; no `left`/`top`/blur animations; no `will-change` on big layers.
5. Never read layout (`offsetWidth`, `getBoundingClientRect`) inside per-frame code — measure on resize.
6. One RAF (`gsap.ticker`); pause off-screen; pause on `visibilitychange`.
7. `prefers-reduced-motion`: soften (no petals/particles), but don't remove the story if it *is* the content.
8. Always start at the top behind an intro (`history.scrollRestoration='manual'` in `<head>`).
9. Audio: start inside the user's tap; use an `<audio>` element (Web Audio is muted by iPhone's silent switch).
10. Don't ask for device-motion permission on iOS unless essential (it shows a scary prompt).

## 4. Ship checklist

- Favicon (SVG + 32px + apple-touch 180) and a 1200×630 OG image (<300 KB JPEG) with **absolute** URLs
  matching the live domain; title/description; JSON-LD where useful (Event, Product, Organization).
- Verify desktop + 390×844 in headless Chrome **and** real Safari via safaridriver (`references/verify.md`).
  Measure, don't eyeball: centres, timings, overflow (`scrollWidth === innerWidth`), console errors.
- Bust caches when testing (`?v=…`, private tab). Ask the user to test on a real iPhone.
- Don't commit/push unless asked; public repos expose phone numbers/addresses — confirm first.

## References
- `references/design.md` — design process, token plan, anti-generic checklist, copy rules
- `references/patterns.md` — code for each section pattern
- `references/pitfalls.md` — every Safari/iOS bug we hit and the fix
- `references/verify.md` — headless Chrome CDP + safaridriver scripts, screenshot contact sheets
