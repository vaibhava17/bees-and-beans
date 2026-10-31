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

/* ---------- galaxy: hero + craft as one 3D journey ---------- */
const galaxy = $('#top'), chaps = $$('.chap'), grail = $$('.galaxy-rail li');
const onHero = () => nav.classList.toggle('on-hero', scrollY < galaxy.offsetHeight - 80);
addEventListener('scroll', onHero, { passive: true }); onHero();
let galaxyChapter = 0;
import('./galaxy.js').then(async ({ initGalaxy, travelOf }) => {
  const g = await initGalaxy($('#galaxyCanvas'), { reduced: REDUCED });
  ScrollTrigger.create({
    trigger: galaxy, start: 'top top', end: 'bottom bottom',
    onUpdate: (st) => {
      g.setProgress(st.progress);
      const { chapter } = travelOf(st.progress);
      galaxy.classList.toggle('past-hero', st.progress > .04);
      if (chapter !== galaxyChapter) {
        galaxyChapter = chapter;
        chaps.forEach((c, i) => c.classList.toggle('is-on', i === chapter));
        grail.forEach((r, i) => r.classList.toggle('is-on', i === chapter));
      }
    },
  });
}).catch((err) => { console.warn('3D galaxy unavailable', err); galaxy.classList.add('no-gl'); });

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

/* ---------- motion ---------- */
if (!REDUCED) {
  // hero intro: the arch reveals the box, the thaalis settle, the gold line draws
  gsap.to('.rv-h', { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', stagger: .12, delay: .9 });

  // festive + story images
  $$('.fest-img img, .story-img img').forEach((im) => gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.fest-img').forEach((f) => gsap.fromTo(f, { clipPath: 'inset(14% 10% 14% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'top 45%', scrub: true } }));

  // reveals
  const rv = $$('.sec-head, .why-grid li, .process li, .chips, .story-copy > *, .enq-side, .form, .index-note');
  rv.forEach((el) => el.classList.add('rv'));
  ScrollTrigger.batch('.rv', {
    start: 'top 88%', once: true,
    onEnter: (els) => {
      // after a jump (nav link), anything already scrolled past appears at once; only what's on screen animates
      const past = els.filter((e) => e.getBoundingClientRect().bottom < 0);
      gsap.set(past, { opacity: 1, y: 0 });
      gsap.to(els.filter((e) => !past.includes(e)), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .08 });
    },
  });
}

// fonts and lazy images change section heights — recalculate trigger positions once they've settled
document.fonts?.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh());
