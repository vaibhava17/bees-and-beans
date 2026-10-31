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
   (+ weddings/corporate). Keep enquiry actions visible in every section.
3. **No invented facts.** Don't add customer counts, reviews, testimonials, prices, hamper contents or
   delivery promises unless the owner confirms them.
   **1 KG blocks are raw material**: Bees & Beans buys 1 KG blocks of authentic chocolate and makes everything
   from them. Never sell or brand a "1 KG bar"; the 3D block's wrapper stays unbranded ("Pure Chocolate · 1 KG"). The current website's
   testimonials and "500+ customers" are not verified — don't reuse.
4. **Identity:** cocoa-night darks, ivory/cream lights, champagne gold `#d6b77e`; Bodoni Moda display (italic
   gold accents) + Jost body; hexagon = the bees (kicker bullets, seal, background patterns). Arches for
   photos. Logo icon = cocoa pod (matches their printed ribbon/sticker). Avoid generic gradients, emoji, stock e-com cards.

## Where things live

| Change | File |
|---|---|
| Phone, WhatsApp, email, address, form endpoint | `js/config.js` (`BRAND`) |
| Products (`SIGNATURES`), festive campaigns, enquiry "interested in" options | `js/data.js` |
| Static copy (hero, craft steps, "From the block" captions, why, bulk, story) | `index.html` |
| Tokens, section styles, festive themes (`.fest-diwali/-christmas/-newyear`) | `css/style.css` |
| Interactions, form validation, WhatsApp message | `js/main.js` |
| 3D 1 KG block (geometry, wrapper label, scroll keyframes `KEYS`) | `js/bar3d.js` |

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

## 3D block

Procedural three.js r185 (lazy-loaded near the section). Scroll progress → `setProgress(p)`; pose comes from
`KEYS` `[p, rotX, rotY, cameraZ, sleeveOut]`, smoothed with `1 - exp(-6·dt)`. Desktop block sits left
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
