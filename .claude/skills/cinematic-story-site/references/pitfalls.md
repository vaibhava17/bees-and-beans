# Pitfalls we hit (and the fixes)

| Symptom | Cause | Fix |
|---|---|---|
| Pinned scene scrolls away on iPhone Safari (fine in Chrome) | `contain: layout paint` on the sticky element; `will-change` on huge layers; `overflow-x` on `<body>` | remove contain; no will-change on big layers; clip overflow per section, never on sticky ancestors |
| Gap under pinned scene when Safari toolbar collapses | `100svh` | `height:100vh;height:100svh;height:100dvh` (fallback chain) |
| Scroll lock "not sticking" on iPhone | `overflow:hidden` doesn't stop momentum | freeze body `position:fixed;top:-y` |
| Lock never triggers / user sees frozen scene | pixel-exact trigger; iOS coalesced scroll events; Reduce Motion path skipped the film | tolerance (top within 15% of viewport) + IntersectionObserver trigger; don't skip story on reduced motion |
| Escaping the lock immediately re-locks | thaw's `scrollTo` fires a scroll event that looks like "arrived" | ignore re-lock for ~900 ms |
| Garland/hero reappears during lock | freezing sets `scrollY` to 0 | scroll consumers ignore events while body is fixed |
| Page snapping/scroll-jacking felt terrible | custom pager + Lenis + CSS snap fought native scroll | delete it all; native scroll |
| Fast scroll makes the story "run" | progress mapped 1:1 to scroll | damped + speed-capped progress, or autoplay film |
| Steps feel uneven | fixed duration per step over unequal distances | duration ∝ distance (hours × sec/hour); no minimums that break the ratio |
| "Stuck after animation" on Mac trackpad | inertia keeps sending wheel events; new swipe not detected | detect new swipe on rising |delta| or quiet gap; cancel (don't queue) input during transitions |
| Cloud/element glitches in Safari | animating `left` + `filter: blur()`; rule accidentally inside a media query | transform-only keyframes; brace-balance check CSS after scripted edits |
| Whole rules vanish after scripted CSS edit | replace-by-substring matched the wrong (first) occurrence | anchor edits on unique strings; diff selector sets vs `git show HEAD~1:css/style.css` |
| iPhone shows a "Motion & Orientation" prompt on tap | `DeviceOrientationEvent.requestPermission()` | don't request it |
| Music silent on iPhone | Web Audio + silent switch; remembered "off" pref; relative vs absolute src compare reloading | `<audio>` element, start in tap, don't persist mute, compare absolute URLs |
| Returning to tab shows page mid-way under the intro | iOS reloads background tabs and restores scroll | `scrollRestoration='manual'` in `<head>`; scrollTo(0,0) on load/pageshow |
| Centre looks off | flex row centred as a group with unequal sides | 3-column grid `1fr auto 1fr`, sides justify toward centre |
| WhatsApp preview missing | relative OG URLs / wrong domain / cache | absolute URLs on the live domain; `?v=1` to bust cache; JPEG <300 KB |
| Safari serves old code while testing | module cache | `?v=Date.now()` / private tab |
