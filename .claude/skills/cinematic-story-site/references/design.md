# Design process

## Token plan (write this before code)
- **Colour**: 5–7 named hex values drawn from the subject (filament spools, sindoor/haldi/genda,
  parchment/moss/soil). One dominant background, one ink, one accent family, one "dark card" gradient.
- **Type**: one display family with character (serif w/ italics for editorial; chunky rounded for playful;
  Devanagari display like Rozha One for Indian), one quiet body family. Set a scale with `clamp()`.
- **Layout**: describe the rhythm in one sentence + ASCII wireframe. Decide alignment per section.
- **Principles**: 3 bullets that make *this* site distinct.

## Anti-generic checklist (revise any "yes")
- Cream bg + serif + terracotta accent by default? (only if the brief asks)
- Near-black bg + one acid accent?
- Every section = identical rounded cards with soft grey shadow + gradient wash?
- ALL-CAPS eyebrow above every heading; "A · B · C" meta strings; `→` on every button?
- Fade-and-slide-up on every section (instead of one orchestrated moment)?
- Numbered 01/02/03 markers on content that isn't a sequence?

## Using a reference site (inspiration, never a blueprint)
A reference the user shares sets the **quality bar and mood** — it is not a layout to reproduce.
- Take only abstract qualities: level of craft, restraint, how confidently product UI is shown,
  how much whitespace, how motion supports the story.
- Do **not** reuse its section order, headline formula, nav shape, card rows or signature components.
- Build the concept from the client's own world (their customers, materials, daily work), then say
  explicitly what you took from the reference (qualities) and what is original.
- If unsure, offer 2–3 original directions and let the user pick before building.

## Enterprise B2B (when buyers are established companies)

Rejected once as "AI slop… a regular template with a theme": a seedling-tray metaphor with Caveat
handwriting, rotated seed-packet cards and plant-tag testimonials, for nursery SaaS sold to large growers.
What works for that audience instead:
- **Hero = the product.** A high-fidelity HTML/CSS app window (sidebar, location switcher, KPI tiles,
  tables, status pills) using the real app's information architecture and labelled "sample data".
  Restrained live motion: numbers settle, a row updates, a toast reports an event.
- **Sober system.** One crisp grotesk + a mono for data; neutral off-white surfaces, hairline borders,
  one brand colour, semantic success/warning/danger. Left-aligned headings, 12-column grid, 8px rhythm.
  No emoji bullets, gradient text, glass blobs, tilted cards or cursor gimmicks.
- **Buyer's questions as sections.** Platform tour (ARIA tabs, one UI per module) → end-to-end workflow
  → AI with human-in-the-loop → by role (owner, production head, accounts) → access control,
  multi-location, integrations → pricing → FAQ → demo-request form.
- **Proof must be verifiable.** No unverifiable totals or testimonials; facts about the product
  (accuracy, stages, GST components) are better than inflated traction. Leave a marked slot for a
  customer story that needs sign-off.

## Copy
- Use the client's real copy and numbers; tighten, don't fabricate.
- Buttons say what happens ("Start free trial", "Save the date", "Open in Maps").
- Local register matters: Indian-English invitation phrasing ("cordially invite", "solicit your gracious
  presence"), Hindi kept exactly as printed (don't "correct" spellings without asking).
- Sentence case, plain verbs, no filler.

## One signature moment — examples
| Subject | Moment |
|---|---|
| 3D-print shop | keychain prints layer by layer (clip plane + hot band), pops off, swings |
| Wedding invite | carved doors open with marigold toran + petal burst; the day plays sunrise→dusk |
| Nursery software | a seed sprouts and grows through the 6 growth stages as the hero loads |
