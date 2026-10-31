// Bees & Beans — interactions. Native scroll + GSAP ScrollTrigger (scrubbed transforms only).
// prefers-reduced-motion: no intro, no flakes, no parallax; everything rendered in its end state.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { BRAND, waLink } from './config.js';
import { SIGNATURES, FESTIVE, INTERESTS } from './data.js';

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add('js');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const img = (n, sm) => `assets/img/${n}${sm ? '-sm' : ''}.webp`;

/* ---------- business details from config ---------- */
$$('[data-tel]').forEach((a) => { a.href = `tel:${BRAND.phoneHref}`; a.textContent = BRAND.phone; });
$$('[data-mail]').forEach((a) => { a.href = `mailto:${BRAND.email}`; a.textContent = BRAND.email; });
$$('[data-addr]').forEach((s) => (s.textContent = BRAND.address));
$('#year').textContent = new Date().getFullYear();
const bindWa = (root = document) => $$('[data-wa]', root).forEach((a) => (a.href = waLink(a.dataset.wa)));

/* ---------- render: what we make (real product photos, no prices) ---------- */
$('#range').innerHTML = SIGNATURES.map((c, i) => `
  <li class="piece rv">
    <figure class="piece-img"><img src="${img(c.img, true)}" srcset="${img(c.img, true)} 700w, ${img(c.img)} 1400w" sizes="(max-width: 640px) 100vw, 33vw" alt="${c.alt}" loading="lazy" /></figure>
    <div class="piece-copy">
      <span class="piece-n">${String(i + 1).padStart(2, '0')}</span>
      <h3>${c.name}</h3>
      <p>${c.line}</p>
      <p class="piece-for"><span>Popular for</span> ${c.goodFor.join(' · ')}</p>
      <a class="piece-cta" href="#enquire" data-interest="Bulk order" data-note="${c.name}">Enquire in bulk <svg><use href="#i-arrow"/></svg></a>
    </div>
  </li>`).join('');

/* ---------- render: festive ---------- */
$('#festivePanels').innerHTML = FESTIVE.map((f) => `
  <article class="fest fest-${f.id}" id="fest-${f.id}">
    <figure class="fest-img"><img src="${img(f.img, true)}" srcset="${img(f.img, true)} 900w, ${img(f.img)} 1800w" sizes="(max-width: 960px) 100vw, 50vw" alt="${f.name} gifting" loading="lazy" /></figure>
    <div class="fest-copy rv">
      <p class="kicker">${f.kicker}</p>
      <p class="fest-hi" lang="hi">${f.hi}</p>
      <span class="fest-name">${f.name}</span>
      <h3>${f.title}</h3>
      <p>${f.copy}</p>
      <ul class="offers">${f.offers.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul>
      <a class="btn btn-choc" href="#enquire" data-occasion="${f.name}" data-interest="Festive hampers">Enquire for ${f.name}</a>
    </div>
  </article>`).join('');

/* ---------- craft: mobile gets an image per step ---------- */
const frames = $$('.craft-frame img');
$$('.step').forEach((s, i) => s.insertAdjacentHTML('afterbegin', `<img class="step-img" src="${frames[i].getAttribute('src')}" alt="" loading="lazy" />`));

/* ---------- nav ---------- */
const nav = $('#nav'), menu = $('#menu');
let lastY = scrollY;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('is-solid', y > 40);
  if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > 600 && y > lastY + 4);
  if (y < lastY - 4) nav.classList.remove('is-hidden');
  lastY = y;
}, { passive: true });
const setMenu = (open) => {
  nav.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', open);
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.documentElement.style.overflow = open ? 'hidden' : '';
};
menu.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
$$('#navLinks a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

/* ---------- enquiry form ---------- */
const form = $('#enqForm'), status = $('#fStatus');
const sel = form.elements.interest;
sel.insertAdjacentHTML('beforeend', INTERESTS.map((v) => `<option>${v}</option>`).join(''));
function prefill({ interest, occasion, note }) {
  if (interest) sel.value = interest;
  if (occasion) { const r = $$('input[name="occasion"]', form).find((x) => x.value === occasion); if (r) r.checked = true; }
  if (note && !form.elements.message.value) form.elements.message.value = `Interested in: ${note}. `;
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-interest], [data-occasion]');
  if (!t) return;
  prefill({ interest: t.dataset.interest, occasion: t.dataset.occasion, note: t.dataset.note });
  if (t.tagName === 'BUTTON') { e.preventDefault(); $('#enquire').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); }
  setTimeout(() => form.elements.name.focus({ preventScroll: true }), 700);
});

const RULES = {
  name: (v) => v.trim().length >= 2 || 'Please tell us your name.',
  phone: (v) => /^(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(v.trim()) || 'Please enter a 10-digit mobile number.',
  email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'That email doesn’t look right.',
  occasion: () => !!form.querySelector('input[name="occasion"]:checked') || 'Choose an occasion.',
  interest: (v) => !!v || 'Choose what you’re interested in.',
};
function check(name) {
  const el = form.elements[name], field = (el.length ? el[0] : el).closest('.field');
  const res = RULES[name](el.value ?? '');
  const msg = res === true ? '' : res;
  $('.err', field).textContent = msg;
  field.classList.toggle('bad', !!msg);
  return !msg;
}
Object.keys(RULES).forEach((n) => {
  const el = form.elements[n];
  (el.length ? [...el] : [el]).forEach((x) => x.addEventListener(x.type === 'radio' ? 'change' : 'blur', () => check(n)));
});
function summary(d) {
  return [
    `Hello ${BRAND.name}! I'd like to enquire about an order.`, '',
    `Name: ${d.name}`, `Phone: ${d.phone}`, d.email && `Email: ${d.email}`,
    `Occasion: ${d.occasion}`, `Interested in: ${d.interest}`, d.quantity && `Quantity: ${d.quantity}`,
    d.message && `Message: ${d.message}`,
  ].filter((x) => x !== undefined && x !== '').join('\n');
}
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ok = Object.keys(RULES).map(check).every(Boolean);
  if (!ok) {
    status.className = 'f-status bad';
    status.textContent = 'Please check the highlighted fields.';
    form.querySelector('.field.bad input, .field.bad select')?.focus();
    return;
  }
  const d = Object.fromEntries(new FormData(form));
  const text = summary(d), via = e.submitter?.value || 'whatsapp';
  if (BRAND.formEndpoint) {
    try { await fetch(BRAND.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) }); } catch { /* WhatsApp/email below still delivers it */ }
  }
  const url = via === 'email'
    ? `mailto:${BRAND.email}?subject=${encodeURIComponent(`Enquiry — ${d.occasion} · ${d.interest}`)}&body=${encodeURIComponent(text)}`
    : waLink(text);
  if (via === 'email') location.href = url; else window.open(url, '_blank', 'noopener');
  status.className = 'f-status ok';
  status.innerHTML = via === 'email'
    ? `Thank you, ${d.name.split(' ')[0]}. Your email app should open with the enquiry ready to send. <a href="${url}">Open it again</a>.`
    : `Thank you, ${d.name.split(' ')[0]}. WhatsApp should open with your enquiry ready to send. <a href="${url}" target="_blank" rel="noopener">Open WhatsApp again</a>.`;
});

bindWa();

/* ---------- floating WhatsApp (after the hero) ---------- */
const waFloat = $('.wa-float');
new IntersectionObserver(([e]) => waFloat.classList.toggle('is-on', !e.isIntersecting && !document.querySelector('#enquire:hover')), { threshold: .2 }).observe($('#top'));

/* ---------- craft steps ---------- */
const steps = $$('.step'), craftNum = $('#craftNum');
let bigLoaded = false;
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  const i = +e.target.dataset.step;
  steps.forEach((s) => s.classList.toggle('is-on', s === e.target));
  frames.forEach((f, k) => f.classList.toggle('is-on', k === i));
  craftNum.textContent = String(i + 1).padStart(2, '0');
  if (!bigLoaded && innerWidth > 960) { bigLoaded = true; frames.forEach((f) => (f.src = f.dataset.src)); }
}), { rootMargin: '-45% 0px -45% 0px' });
steps.forEach((s) => io.observe(s));

/* ---------- from block to box (3D, five steps) ---------- */
const onekg = $('#onekg'), caps = $$('.cap'), prog = $('.onekg-progress'), rail = $$('.onekg-rail li'), stepNum = $('#stepNum');
let bar = null, barP = 0;
const CAP_AT = [0, .18, .38, .58, .78]; // same stage boundaries as js/bar3d.js
let stepNow = 0;
ScrollTrigger.create({
  trigger: onekg, start: 'top top', end: 'bottom bottom',
  onUpdate: (st) => {
    barP = st.progress;
    prog.style.setProperty('--p', barP.toFixed(3));
    const k = CAP_AT.reduce((a, t, i) => (barP >= t - .001 ? i : a), 0);
    if (k !== stepNow) {
      stepNow = k;
      caps.forEach((c, i) => c.classList.toggle('is-on', i === k));
      rail.forEach((r, i) => { r.classList.toggle('is-on', i === k); r.classList.toggle('is-done', i < k); });
      stepNum.textContent = String(k + 1).padStart(2, '0');
      if (!REDUCED) gsap.fromTo(stepNum, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'power3.out' });
    }
    bar?.setProgress(barP);
  },
});
new IntersectionObserver(async ([e], obs) => {
  if (!e.isIntersecting) return;
  obs.disconnect();
  try {
    const { initBar } = await import('./bar3d.js');
    bar = await initBar($('#barCanvas'), { reduced: REDUCED });
    bar.setProgress(barP);
  } catch (err) {
    console.warn('3D bar unavailable, showing photo', err);
    onekg.classList.add('no-gl');
  }
}, { rootMargin: '900px 0px' }).observe(onekg);

/* ---------- toran: a marigold garland with mango leaves, hung across the hero ---------- */
function buildToran(el) {
  const W = 1440, H = 150, sag = 34, y0 = 10, step = 15;
  const at = (x) => y0 + sag * Math.sin(Math.PI * (x / W)); // the rope sags in the middle
  let flowers = '', leaves = '', strings = '';
  for (let x = 6; x < W; x += step) flowers += `<use href="#genda" x="${x - 11}" y="${at(x) - 11}" width="22" height="22"/>`;
  for (let x = 30, k = 0; x < W; x += 48, k++) {
    const y = at(x) + 6;
    leaves += `<g class="t-sway" style="transform-origin:${x}px ${y}px;animation-delay:${-(k % 7) * .45}s"><path d="M${x} ${y}c-9 10-10 28 0 42 10-14 9-32 0-42z" fill="${k % 2 ? '#2f7d32' : '#3f9a3c'}"/><path d="M${x} ${y + 3}v36" stroke="#1f5e22" stroke-width="1.2"/></g>`;
  }
  for (let x = 120, k = 0; x < W; x += 240, k++) { // longer hanging marigold strings (lari)
    const y = at(x); let beads = '';
    for (let j = 1; j <= 5; j++) beads += `<use href="#genda" x="${x - 9}" y="${y + j * 15 - 9}" width="18" height="18"/>`;
    strings += `<g class="t-sway" style="transform-origin:${x}px ${y}px;animation-delay:${-k * .6}s">${beads}<circle cx="${x}" cy="${y + 92}" r="5" fill="#c33a28"/></g>`;
  }
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice">
    <defs><symbol id="genda" viewBox="0 0 22 22">${Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return `<circle cx="${11 + Math.cos(a) * 6.5}" cy="${11 + Math.sin(a) * 6.5}" r="4.6" fill="${i % 2 ? '#f4a01c' : '#f7b733'}"/>`; }).join('')}<circle cx="11" cy="11" r="5" fill="#e8831a"/><circle cx="11" cy="11" r="2.2" fill="#c9650c"/></symbol></defs>
    ${strings}${leaves}<path d="M0 ${y0} Q${W / 2} ${y0 + sag * 2} ${W} ${y0}" stroke="#7a3f12" stroke-width="2" fill="none"/>${flowers}</svg>`;
}
buildToran($('#toran'));

/* ---------- motion ---------- */
if (!REDUCED) {
  // hero intro: the doorway opens, thaalis are set down, the stamp lands
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('.rv-h', { opacity: 1, y: 0, duration: 1.1, stagger: .1 }, .15)
    .fromTo('.jh-hero', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5 }, .1)
    .fromTo('.plate', { scale: 0, rotate: -20 }, { scale: 1, rotate: 0, duration: 1, ease: 'back.out(1.7)', stagger: .12 }, .6)
    .fromTo('.stamp', { scale: 1.8, opacity: 0, rotate: 0 }, { scale: 1, opacity: 1, rotate: -10, duration: .45, ease: 'power3.in' }, 1.2)
    .fromTo('.toran svg', { yPercent: -60 }, { yPercent: 0, duration: 1.4, ease: 'elastic.out(1, .55)' }, 0);

  // marigold petals drifting down
  const petals = $('.petals');
  for (let i = 0; i < 22; i++) {
    const b = document.createElement('i'), s = 8 + Math.random() * 9;
    b.className = 'petal';
    Object.assign(b.style, { left: `${Math.random() * 100}%`, width: `${s}px`, height: `${s * 1.4}px`, background: ['#f4a01c', '#f7b733', '#e8831a', '#c33a28'][i % 4],
      animationDuration: `${11 + Math.random() * 12}s`, animationDelay: `${-Math.random() * 24}s` });
    b.style.setProperty('--dx', `${(Math.random() - .5) * 220}px`);
    b.style.setProperty('--r', `${(Math.random() - .5) * 900}deg`);
    petals.appendChild(b);
  }
  new IntersectionObserver(([e]) => (petals.style.display = e.isIntersecting ? '' : 'none')).observe($('#top'));

  // hero parallax (scroll) + pointer drift
  $$('[data-depth]').forEach((el) => {
    const d = +el.dataset.depth;
    gsap.to(el, { yPercent: -d * 60, ease: 'none', scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true } });
  });
  if (FINE) {
    const movers = $$('[data-depth]').map((el) => [+el.dataset.depth, gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' })]);
    $('#top').addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - .5;
      movers.forEach(([d, qx]) => qx(-nx * d * 60));
    });
  }

  // festive + story images
  $$('.fest-img img, .story-img img').forEach((im) => gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.fest-img').forEach((f) => gsap.fromTo(f, { clipPath: 'inset(14% 10% 14% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'top 45%', scrub: true } }));

  // reveals
  const rv = $$('.sec-head, .why-grid li, .process li, .chips, .story-copy > *, .enq-side, .form, .index-note');
  rv.forEach((el) => el.classList.add('rv'));
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .08 }) });
}
