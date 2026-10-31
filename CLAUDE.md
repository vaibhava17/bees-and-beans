# CLAUDE.md

Bees & Beans Handmade Chocolates (Panipat): a premium **bulk & festive gifting enquiry** website. It is not a shop. It's a static HTML look first; it may become Next.js later.

- **Skills:** `.claude/skills/bees-and-beans-site/` covers project rules, file map, photos, enquiry flow, 3D bar, verification and deploy. `.claude/skills/cinematic-story-site/` covers general motion, Safari-safe engineering and design process.
- **Stack:** `index.html` + `css/style.css` + ES modules in `js/` (GSAP 3.15 + ScrollTrigger; three r185 lazy-loaded for the 1 KG block) via a pinned CDN import map. No build. Run with `python3 -m http.server 5180`.
- **Content rules:** no prices, carts, ratings or shop grids. Keep a short curated range and enquiry CTAs everywhere. Don't invent customer counts, testimonials, prices or hamper contents.
- **1 KG = raw material.** Bees & Beans buys 1 KG blocks of authentic chocolate from a supplier and hand-makes everything from them. Never present a 1 KG bar as a Bees & Beans product, and don't brand the 3D block.
- **Business details** live only in `js/config.js`. Signature pieces, festive campaigns and enquiry options live in `js/data.js`.
- **Photography:** `assets/img/p-*.webp` are the brand's real product photos (cropped from their social posts in ~/Downloads/Scanned_20250926-*.jpg; low-res). The rest are Pexels placeholders. The strawberry and "Chocolate Bars" flyers were not used: they look like stock and one carries another site's watermark. The Google Drive folder is private and needs "anyone with the link" access or a local download.
- **Motion:** native scroll only (no Lenis, no snap). Animate transforms/opacity only. Respect `prefers-reduced-motion`. Pause 3D off-screen.
- **Git:** remote `git@github-personal:vaibhava17/bees-and-beans.git`, local user vaibhava17, GitHub Pages from `main`. Don't commit/push unless asked.
- **If ported to Next.js:** run `npm run lint` before and after changes; never `npm run build`.
- See `PLAN.md` for research, identity and open questions.
