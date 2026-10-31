# Bees & Beans — Handmade Chocolates

Premium enquiry website for Bees & Beans (Panipat), built for **bulk orders, corporate gifting and festive
hampers** (Diwali, Christmas, New Year) and the signature **1 KG chocolate bar**. Not a shop — every path
leads to an enquiry on WhatsApp or email.

## Run locally

```bash
python3 -m http.server 5180
# open http://127.0.0.1:5180/
```

No build step or npm install. Libraries (GSAP 3.15 + ScrollTrigger, three.js r185) load from a pinned CDN
import map in `index.html`; three.js is only fetched when you scroll near the 1 KG section.

## Sections

| # | Section | Highlights |
|---|---|---|
| 1 | Hero — "Crafted by hand. Made to be remembered." | arch-framed layered photos, parallax (scroll + pointer), drifting gold flakes & cocoa nibs, rotating seal |
| 2 | Our craftsmanship | sticky photo frame that changes with four steps (mobile: photo per step) |
| 3 | What we make | five signature pieces as an editorial index — hover photo preview, "popular for" uses, enquire per piece. No prices. |
| 4 | The 1 KG bar | procedural 3D bar with honeycomb emboss; cream & gold sleeve slides off as you scroll; four captions |
| 5 | Festive collections | Diwali (maroon & marigold, arch), Christmas (pine & cranberry, offset frame), New Year (midnight & champagne, circle) |
| 6 | Custom & bulk orders | enquiry chips that pre-fill the form; 4-step process |
| 7 | Why Bees & Beans | six reasons |
| 8 | Our story | from the brand's own story — bees = care, beans = cocoa |
| 9 | Enquire | validated form → WhatsApp or email; optional Formspree endpoint |

## Edit content

- Business details: `js/config.js`
- Signature pieces, festive campaigns, enquiry options: `js/data.js`
- Everything else: `index.html`; styles in `css/style.css`
- Photos: `assets/img/` — currently Pexels placeholders (free licence). Replace with the brand's own
  photos using the same names (`name.webp` 1800w + `name-sm.webp` 900w).

## Deploy

GitHub Pages serves the `main` branch root. Before launch: set absolute `og:url`/`og:image`, confirm the
canonical domain, and (optionally) add a Formspree endpoint in `js/config.js`.

Project context for Claude Code: `CLAUDE.md` and `.claude/skills/`.
