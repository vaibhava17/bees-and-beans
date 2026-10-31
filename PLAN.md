# Bees & Beans: premium site plan

## Research summary
- **Current site** (beesandbeanschocolates.com): a basic Next.js template. It has a yellow/brown palette, stock photos (the "logo" is a stock photo of white chocolate), 38 products in 8 categories with prices from ₹449 to ₹799, and placeholder-style reviews and testimonials.
- **Real business facts kept:** name, Panipat address, phone/WhatsApp +91 7018505301, email, the product categories and names, the story (bees = care and purpose, beans = cocoa), small batches, gifting, festive hampers.
- **Not used (unverified):** "500+ happy customers 4.9/5", review counts, testimonials, "Buy 2 Get 1 Free".
- **Brand references** (Aesop, Hotel Chocolat, Venchi, Compartés, Marcolini) are used for qualities only: restraint, big editorial type, product as hero, warm darkness. No layout is copied.

## Identity (current): "Mithai box"
Indian gifting language: toran, jharokha arches, block-print borders, brass thaalis, marigold petals, Hindi lines, Rozha One + Hind, jewel tones on khadi and cocoa. Replaced the earlier dark-gold look ("felt like cosmetics") and the drips version ("AI slop"). No weddings.

## Identity (first draft, superseded): "Hive & Cacao"
- **Idea:** the name already holds the story. A subtle hexagon (the bees) recurs in bullets, the seal and patterns. The logo icon is the cocoa pod from their own ribbon and sticker.
- **Palette:** cocoa night #160d09, ganache #241510, cocoa #5b3a28, caramel #b8763a, champagne gold #d6b77e, cream #efe3cf, ivory #f8f2e7.
- **Type:** Bodoni Moda (display, high contrast, italic accents) + Jost (body). Labels are small caps with letter-spacing.
- **Photography:** dark, moody, free-licensed Pexels photos, kept to one consistent grade. These are temporary until the brand shoots its own product photos.

## Sections (order: hero, craft, what we make, 1 KG, festive, bulk, why, story, enquire)
1. Nav: wordmark, links, Enquire, WhatsApp.
2. Hero: "Crafted by hand. Made to be remembered." Layered parallax photo, floating gold flakes and cocoa nibs, two CTAs.
3. Craft: sticky photo stack plus 4 steps (select, temper, pour, finish).
4. What we make: 5 signature pieces as an editorial index. Hovering shows a photo preview. No prices; each piece shows what it's "popular for" plus an Enquire button. **Bulk-first, not a shop** (owner feedback 31 Oct).
5. **From the block (signature moment):** a procedural three.js 1 KG block of authentic chocolate with a plain wrapper that slides off as you scroll. The story runs block → melted by hand → products → packed. **The 1 KG blocks are the bought-in raw material, not a product** (owner, 31 Oct).
6. Festive: Diwali, Christmas and New Year panels. Each has its own palette and photo, 3 offerings, and an enquiry pre-filled with that occasion.
7. Why us: 6 points.
8. Custom & bulk: enquiry-type chips that pre-fill the form, plus a 4-step process.
9. Story: their real story, rewritten in an editorial voice.
10. Enquiry form: validated. It sends via WhatsApp (pre-filled message) or email. A Formspree endpoint can be added in config.
11. Footer, plus a floating WhatsApp button.

## Engineering
- Static HTML + CSS + ES modules, CDN import map (GSAP 3.15 + ScrollTrigger, three r185 lazy-loaded). No build step. Served by GitHub Pages.
- Native scroll only. Transform/opacity animations. `prefers-reduced-motion` shows end states. Safari-safe sticky (`100svh/100dvh`). 3D pauses when off screen; DPR capped at 2.
- All business info lives in `js/config.js`. Categories, products and festive data live in `js/data.js`.
- Verify in headless Chrome at 1440 and 390 width, then push to `vaibhava17/bees-and-beans` with Pages.

## Unresolved questions
- Real product photos / logo?
- OK to name the chocolate supplier/brand of the 1 KG blocks?
- Higher-res originals of the product photos (and strawberries/bars, if they're yours)?
- Festive hamper contents and prices?
- Do you have a Formspree / email endpoint?
- Real testimonials?
- Drive photo folder: share as "anyone with the link", or download it locally?
