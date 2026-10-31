---
name: bees-and-beans-site
description: Work on the Bees & Beans handmade-chocolate website (this repo) — edit copy, business details, products or festive campaigns, swap in the brand's real photos, tune the 3D 1 KG block, verify and deploy to GitHub Pages. Use for any change to this site.
---

# Bees & Beans site

A premium **bulk & gifting enquiry** site for Bees & Beans Handmade Chocolates (Panipat). Not a shop.
For general motion/Safari rules see the `cinematic-story-site` skill in this repo.

## Non-negotiables

1. **Not e-commerce.** No prices, carts, product grids, stock counts, ratings or "Buy now". The range is a
   short curated list framed by how it's ordered in bulk ("Popular for: corporate boxes…"). Every CTA leads
   to an enquiry (form → WhatsApp/email).
2. **Bulk first.** Primary CTA = "Plan a bulk order" / "Bulk enquiry". Occasions: Diwali, Christmas, New Year
   (+ corporate). **No weddings** — they don't take wedding/shaadi orders. Keep enquiry actions visible in every section.
3. **No invented facts.** Don't add customer counts, reviews, testimonials, prices, hamper contents or
   delivery promises unless the owner confirms them.
   **1 KG blocks are raw material**: Bees & Beans buys 1 KG blocks of authentic chocolate and makes everything
   from them. Never sell or brand a "1 KG bar"; the 3D block's wrapper stays unbranded ("Pure Chocolate · 1 KG"). The current website's
   testimonials and "500+ customers" are not verified — don't reuse.
4. **Identity: "Heritage gifting": quiet Indian luxury for affluent families and corporate buyers.** Ivory
   muslin, deep emerald, oxblood and midnight, with antique gold. Libre Caslon Display (headings, gold italics) +
   Jost (body); Devanagari only as one refined line in Tiro Devanagari Hindi ("मुँह मीठा कीजिए", festive greetings).
   Ornament stays restrained: jharokha (lobed Mughal arch) photo frames drawn as one gold line, a lotus between gold
   rules as the section divider, a faint jaali lattice on emerald/dark grounds, thaali-style product plates with a
   thin gold ring. Logo icon = cocoa pod. Rejected and not to be revisited: dark-gold Bodoni ("cosmetics"), chocolate
   drips/stickers ("AI slop"), and the loud bazaar version (toran, petals, Hindi everywhere: "not high-class").

## Where things live

| Change | File |
|---|---|
| Phone, WhatsApp, email, address, form endpoint | `js/config.js` (`BRAND`) |
| Products (`SIGNATURES`), festive campaigns, enquiry "interested in" options | `js/data.js` |
| Static copy (hero, craft steps, "From the block" captions, why, bulk, story) | `index.html` |
| Tokens, section styles, festive themes (`.fest-diwali/-christmas/-newyear`) | `css/style.css` |
| Interactions, form validation, WhatsApp message | `js/main.js` |
| 3D 1 KG block (geometry, wrapper label, scroll keyframes `KEYS`) | `js/bar3d.js` |
| Galaxy: hero + craft as one 3D scroll journey (5 chapters, `travelOf(p)`) | `js/galaxy.js` |
| What we make: real photos as medallions on a 3D ring (`slotOf(p, n)`) | `js/showcase.js` |
| Festive seasons: gift box + per-festival worlds (`seasonOf(p)`) | `js/seasons.js` |
| Finale: box pyramid → gold seals → bee & bean → invitation card (`chapterOf(p)`) | `js/finale.js` |
| Night sky behind contact + footer; `celebrate()` on enquiry sent | `js/night.js` |
| Shared 3D chocolates + gift box (materials, truffle/rocher/mendiant/heart, `giftBox({ lid })`) | `js/choco3d.js` |

## Photos

- Brand product photos: `assets/img/p-*.webp` (+ `-sm`), cropped from their social posts (~400–500px). Ask for
  originals for better quality. Everything else is a free-licence Pexels placeholder (`name.webp` 1800w + `name-sm.webp` 900w).
- Don't use the strawberry / "Chocolate Bars" flyer images (likely stock; one is watermarked by another site).
- To add or replace photos: keep the same file names (or update `img:` keys in `data.js` and the
  `src`s in `index.html`), export both sizes as WebP (q≈74), dark/moody grade, then remove
  the "Mood photography: Pexels (placeholder)" credit from the footer once no Pexels images remain.
- Pillow is available at `/opt/homebrew/bin/python3.14` for resizing/converting.

## Enquiry flow

Form validates (name, Indian mobile, optional email, occasion, interest) → builds a message →
opens WhatsApp (`wa.me/<BRAND.whatsapp>`) or a pre-filled email. If `BRAND.formEndpoint` is set
(e.g. Formspree), it also POSTs JSON there. Buttons with `data-interest` / `data-occasion` / `data-note`
pre-fill the form from anywhere on the page.

## v2 — one journey

`/v2/` renders everything in ONE scene: `STATIONS` in `v2/js/world.js` (id, scroll length in vh, caption steps,
sky colour, builder). `locate(p)` → station, hold progress `lp` (80% of each span), flight `travel` (last 20%),
caption key `id:step`. Builders in `v2/js/stations.js` return `{ group, update(s), bg?(lp), celebrate? }`. Captions
(`C` in `v2/js/main.js`) use `.split` headings (word mask reveal) and `.fill` (words light up with scroll).

## Galaxy (hero + craft)

`#top` is 560vh with a sticky stage. `initGalaxy(canvas)` builds 5 chapter scenes spaced 30 units apart along -z:
0 gift box opens + chocolate orbit, 1 cacao pod + ingredients, 2 copper bowl + spatula, 3 mould tray filling,
4 truffle with animated piped cross + gold leaf. Scroll progress → `travelOf(p)` (each chapter holds, then the camera
flies on); the caption shown is `Math.round(travel)` so text matches where the camera is. Gold dust and bokeh fill
the whole path. Desktop scenes sit right of the copy; mobile above it. No WebGL → `.galaxy.no-gl` shows the box photo.

## 3D block

Procedural three.js r185 (lazy-loaded near the section), one object transformed in 5 stages (boundaries
`[0, .18, .38, .58, .78]`, mirrored in `CAP_AT` in main.js): wrapper lifts off → 24 instanced pieces break
apart → pieces drop into a rippling pool → 12 products (truffles milk/dark/white, rochers, mendiants, hearts)
rise from it → they settle into the gift box and the ribbon ties. Scroll progress → `setProgress(p)`; pose
from `KEYS` `[p, rotX, rotY, distance]`, smoothed with `1 - exp(-6·dt)`. Desktop block sits left
(captions right); mobile is centred higher with captions over a bottom gradient. No WebGL → `.no-gl` shows
`bar-close.webp`. Render loop = `gsap.ticker`, paused off-screen/hidden.

## Verify (before every push)

1. `python3 -m http.server 5180` in the repo root.
2. Headless Chrome with an isolated profile (`--remote-debugging-port=9333 --user-data-dir=<scratch>`) —
   never the user's own browser. Screenshot 1440×900 and 390×844, all sections; check
   `scrollWidth - innerWidth === 0` and no console errors.
3. Scrub the 1 KG section at p = 0, .3, .55, .8 — the bar must not cover the captions.
4. Form: empty submit shows 4 errors; valid submit opens a WhatsApp URL with every field.

## Deploy

Repo `vaibhava17/bees-and-beans` (remote uses the SSH alias `github-personal`, local git user vaibhava17).
GitHub Pages serves `main` from `/`. Only commit/push when the user asks.
