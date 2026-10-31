# Section patterns (copy-paste starting points)

## Import map (no build)
```html
<script>if ("scrollRestoration" in history) history.scrollRestoration = "manual";</script>
<script type="importmap">{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.185.0/examples/jsm/",
  "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.15.0/index.js",
  "gsap/": "https://cdn.jsdelivr.net/npm/gsap@3.15.0/" } }</script>
<script type="module" src="js/main.js"></script>
```
```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
gsap.registerPlugin(ScrollTrigger);
```

## i18n
```js
// elements: <h2 data-i18n="venue.name"></h2>, <p data-i18n="x" data-i18n-html></p>, data-i18n-attr="aria-label:key"
export function setLang(l) { document.documentElement.lang = l;
  document.querySelectorAll('[data-i18n]').forEach((el) => { const v = STRINGS[l][el.dataset.i18n];
    el.dataset.i18nHtml !== undefined ? (el.innerHTML = v) : (el.textContent = v); }); }
// initial: ?lang= → localStorage → default
```

## Hero intro (hidden behind gate, then choreographed)
```js
gsap.set(PARTS, { opacity: 0 });
function intro() { gsap.timeline({ delay: .35 })
  .fromTo('.name-a', { opacity: 0, x: -90, filter: 'blur(12px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power4.out' }, .3)
  .fromTo('.tiles > *', { opacity: 0, rotationX: -90, transformPerspective: 500 }, { opacity: 1, rotationX: 0, stagger: .09, ease: 'back.out(1.7)' }, 1.2); }
```
SVG line draw: `strokeDasharray = strokeDashoffset = path.getTotalLength()` → tween offset to 0.

## Damped, speed-capped scroll progress (pinned sticky stage)
```js
const s = { p: 0, target: 0 };
ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (st) => (s.target = st.progress) });
gsap.ticker.add((_, dtMs) => { const dt = Math.min(dtMs, 50) / 1000, d = s.target - s.p;
  if (Math.abs(d) < 5e-4) return; const e = d * (1 - Math.exp(-7 * dt));
  s.p += Math.sign(e) * Math.min(Math.abs(e), MAX_PER_SEC * dt); render(s.p); });
```
CSS: `.sec{height:400svh}` `.stage{position:sticky;top:0;height:100vh;height:100svh;height:100dvh;overflow:hidden}`.

## Autoplay film with watch-once gate (iOS-safe)
```js
let frozenY = 0;
function freeze(y){ frozenY=y; Object.assign(document.body.style,{position:'fixed',top:`-${y}px`,left:0,right:0,width:'100%'}); }
function thaw(){ Object.assign(document.body.style,{position:'',top:'',left:'',right:'',width:''}); scrollTo(0, frozenY); }
// lock when the section's top is within the upper 15% of the viewport (scroll event OR IntersectionObserver)
// block wheel(deltaY>0)/touchmove(down)/PageDown/Space while locked; upward input → unlock + scroll up a bit
// ignore re-lock for ~900 ms after thaw (restoring scroll fires a scroll event)
// while frozen, scroll consumers must ignore the jump to scrollY=0 (check body.style.position==='fixed')
const film = gsap.timeline({ paused: true, onComplete: () => { watched = true; unlock(); } })
  .to(state, { h: END, duration: 5, ease: 'none', onUpdate: render }); // constant pace, no stops
```

## Tap phases + auto-advance
```js
// goPhase(i) tweens a 0..1 progress (duration ∝ distance) and returns its duration
// scheduleAuto: setTimeout(next, transitionDur + 1500); pause 5 s after a tap; run only while IO-visible
// wrap last→first with an opacity fade instead of tweening back through the middle phase
```

## Phase crossfade without mush
`g = n + smoothstep(0.3, 0.7, f - n)` — each phase holds, then crossfades in the middle of the transition.

## Stage curtains (SVG paths from one openness value t)
Inner edge path `M top 0 C … tieX tieY C … bot S` mirrored for the right drape; tie-backs fade in at t>.55;
drive t from ScrollTrigger `start:'top 85%', end:'top top'` so it's fully open when the section hits the top.

## Live product mock-up (no screenshots)
HTML card with rows + a scanning beam (`translateY` loop) → fields fill with staggered text → success toast.
Count-ups: tween a number object, `toLocaleString('en-IN')` for ₹ lakhs formatting.

## Save the date
Android/desktop → Google Calendar template URL (`action=TEMPLATE&dates=…Z/…Z&ctz=Asia/Kolkata`);
iPhone/Mac → static `.ics` (CRLF line endings, VTIMEZONE, VALARM) via `location.href`.

## Music
Track via `<audio loop>`; `play()` inside the opening tap; fallback = generated ambience rendered offline
(OfflineAudioContext → WAV blob) so iPhone's silent switch doesn't mute it.
