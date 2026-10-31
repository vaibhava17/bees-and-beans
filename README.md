# Bees & Beans — Handmade Chocolates

Premium enquiry website for Bees & Beans (Panipat), built for **bulk orders, corporate gifting and festive
hampers** (Diwali, Christmas, New Year). Not a shop — every path leads to an enquiry on WhatsApp or email.
Identity: heritage Indian luxury for families and corporate gifting (Libre Caslon Display + Jost, ivory/emerald/oxblood/gold, jharokha frames, jaali lattice, lotus dividers).
No wedding orders. Everything is handmade from 1 KG blocks of authentic chocolate (bought in; the blocks are the raw material,
not a product).

## Run locally

```bash
python3 -m http.server 5180
# open http://127.0.0.1:5180/
```

No build step or npm install. Libraries (GSAP 3.15 + ScrollTrigger, three.js r185) load from a pinned CDN
import map in `index.html`; three.js is only fetched when you scroll near the "From the block" section.

## Sections

| # | Section | Highlights |
|---|---|---|
| 1 | Galaxy (hero + craft, `js/galaxy.js`) | one pinned 3D journey through an emerald night of gold dust: the ribboned gift box opens and chocolates float into orbit; scrolling flies the camera on to four craft chapters — cacao pod with orbiting ingredients, copper bowl of swirling chocolate, mould tray filling, a truffle having its cross piped with gold leaf drifting; captions and a chapter rail follow the camera |
| 3 | What we make | six real products (brand photos) in arch frames — truffles, rochers, mendiants, barks, fruit & nut hearts, assorted gift boxes; "popular for" + enquire. No prices. |
| 4 | From block to box | 5-step scroll story in procedural 3D — one 1 KG block of authentic chocolate unwraps, breaks along its grooves, melts into a glossy pool, rises as truffles/rochers/mendiants/hearts, and settles into the ribboned gift box; step numeral, step rail and captions per step |
| 5 | Festive collections | Diwali (maroon & marigold, arch), Christmas (pine & cranberry, offset frame), New Year (midnight & champagne, circle) |
| 6 | Custom & bulk orders | enquiry chips that pre-fill the form; 4-step process |
| 7 | Why Bees & Beans | six reasons |
| 8 | Our story | from the brand's own story — bees = care, beans = cocoa |
| 9 | Enquire | validated form → WhatsApp or email; optional Formspree endpoint |

## Edit content

- Business details: `js/config.js`
- Signature pieces, festive campaigns, enquiry options: `js/data.js`
- Everything else: `index.html`; styles in `css/style.css`
- Photos: `assets/img/p-*.webp` are the brand's own product photos (cropped from their posts, ~400–500px —
  replace with higher-resolution originals when available). Craft/festive/mood photos are Pexels placeholders.

## Deploy

GitHub Pages serves the `main` branch root. Before launch: set absolute `og:url`/`og:image`, confirm the
canonical domain, and (optionally) add a Formspree endpoint in `js/config.js`.

Project context for Claude Code: `CLAUDE.md` and `.claude/skills/`.
