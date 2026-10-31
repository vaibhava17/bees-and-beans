# CLAUDE.md

Bees & Beans Handmade Chocolates (Panipat): a premium **bulk & festive gifting enquiry** website. It is not a shop. It's a static HTML look first; it may become Next.js later.

- **Skills:** `.claude/skills/bees-and-beans-site/` covers project rules, file map, photos, enquiry flow, 3D bar, verification and deploy. `.claude/skills/cinematic-story-site/` covers general motion, Safari-safe engineering and design process.
- **Stack:** `index.html` + `css/style.css` + ES modules in `js/` (GSAP 3.15 + ScrollTrigger; three r185 lazy-loaded for the 1 KG bar) via a pinned CDN import map. No build. Run with `python3 -m http.server 5180`.
- **Content rules:** no prices, carts, ratings or product grids. Keep a short curated range and enquiry CTAs everywhere. Don't invent customer counts, testimonials, prices, 1 KG specs or hamper contents.
- **Business details** live only in `js/config.js`. Signature pieces, festive campaigns and enquiry options live in `js/data.js`.
- **Photography:** `assets/img/*.webp` are Pexels placeholders until the brand's own photos arrive (the Google Drive folder is private; it needs "anyone with the link" access or a local download).
- **Motion:** native scroll only (no Lenis, no snap). Animate transforms/opacity only. Respect `prefers-reduced-motion`. Pause 3D off-screen.
- **Git:** remote `git@github-personal:vaibhava17/bees-and-beans.git`, local user vaibhava17, GitHub Pages from `main`. Don't commit/push unless asked.
- **If ported to Next.js:** run `npm run lint` before and after changes; never `npm run build`.
- See `PLAN.md` for research, identity and open questions.
