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
| 3 | What we make (`js/showcase.js`) | pinned, in the same emerald galaxy: the six real product photos as gold-rimmed medallions on a 3D ring; scroll turns each to the front while the panel shows its name, description, "popular for" and Enquire in bulk. No prices. Fallback grid if no WebGL |
| 4 | From block to box | 5-step scroll story in procedural 3D — one 1 KG block of authentic chocolate unwraps, breaks along its grooves, melts into a glossy pool, rises as truffles/rochers/mendiants/hearts, and settles into the ribboned gift box; step numeral, step rail and captions per step |
| 5 | Festive seasons (`js/seasons.js`) | pinned 3D scene: the gift box stays centre while the world changes per festival. Diwali: maroon night, flickering clay diyas, rising sky lanterns, sparks. Christmas: emerald, glossy baubles, falling snow. New Year: indigo, gold fireworks, champagne bubbles, confetti. Panel shows greeting, offers, pre-filled "Enquire for …"; tabs jump between them |
| 6 | Finale (`js/finale.js`) | one pinned 3D scene: ribboned gift boxes fly in and stack into a pyramid (corporate & family gifting, enquiry chips) → six gold seals orbit (why us) → a golden bee loops around a cocoa bean (our story) → **the exclusive end**: the gift box opens and a gold-edged invitation card with a wax seal rises — "Let's make something to remember" |
| 7 | Contact + footer (`js/night.js`) | one 3D night sky behind both: gold dust, drifting chocolates and mini gift boxes. The form is an ivory "reply card" (validated → WhatsApp/email); sending it bursts the sky with a gold flash. Footer: giant gold Bees & Beans wordmark over a glowing horizon |

## v2 — one continuous journey (`/v2/`)

A second version at `/v2/` where the whole site is **one motion**: one fixed canvas, one scene, one camera path and
one native scroll. Each chapter is a *station* along the path (`v2/js/world.js` → `STATIONS`), and scrolling flies the
camera between them while the sky colour blends (emerald → cocoa → maroon/emerald/indigo → night). A few chocolates
travel with the camera; captions swap in place, headings rise word by word, the story text fills in as you read, and
the reply card + footer appear at the end. Station builders: `v2/js/stations.js` (reuses `js/choco3d.js`,
`js/config.js`, `js/data.js`). The classic site stays at `/`.

Order: gift box opens → cacao pod → 1 KG block (unwrap, break, melt) → copper bowl → moulds → truffle → product ring
→ festive seasons → gifting at scale → why us → bee & bean → invitation → reply card.

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
