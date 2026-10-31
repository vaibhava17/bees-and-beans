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

/* ---------- render: what we make ---------- */
const index = $('#index');
index.innerHTML = SIGNATURES.map((c, i) => `
  <li class="row rv" data-img="${c.img}">
    <button class="row-head" type="button" aria-expanded="false" aria-controls="row-${c.id}" data-cursor="Open">
      <span class="row-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="row-name">${c.name}</span>
      <span class="row-line">${c.line}</span>
      <span class="row-plus" aria-hidden="true"></span>
    </button>
    <div class="row-body" id="row-${c.id}"><div>
      <div class="row-inner">
        <img class="row-img" src="${img(c.img, true)}" alt="" loading="lazy" />
        <p class="row-desc">${c.line}</p>
        <p class="items-label">Popular for</p>
        <ul class="items">${c.goodFor.map((g) => `<li>${g}</li>`).join('')}</ul>
        <a class="btn btn-line btn-sm" href="#enquire" data-interest="Bulk order" data-note="${c.name}">Enquire about ${c.name.toLowerCase()}</a>
      </div>
    </div></div>
  </li>`).join('');
$$('.row-head', index).forEach((b) => b.addEventListener('click', () => {
  const row = b.parentElement, open = !row.classList.contains('is-open');
  $$('.row.is-open', index).forEach((r) => { r.classList.remove('is-open'); $('.row-head', r).setAttribute('aria-expanded', 'false'); });
  row.classList.toggle('is-open', open);
  b.setAttribute('aria-expanded', open);
}));

/* hover peek: an arch-framed photo that trails the cursor over the index */
if (FINE && !REDUCED) {
  const peek = $('#peek'), peekImg = $('img', peek);
  const px = gsap.quickTo(peek, 'x', { duration: .6, ease: 'power3' }), py = gsap.quickTo(peek, 'y', { duration: .6, ease: 'power3' });
  index.addEventListener('pointermove', (e) => { px(e.clientX + 30); py(e.clientY - 180); });
  $$('.row', index).forEach((r) => r.addEventListener('pointerenter', () => {
    peekImg.src = img(r.dataset.img, true);
    gsap.to(peek, { opacity: 1, scale: 1, duration: .45, ease: 'power3.out' });
  }));
  index.addEventListener('pointerleave', () => gsap.to(peek, { opacity: 0, scale: .85, duration: .35 }));
}

/* ---------- render: festive ---------- */
$('#festivePanels').innerHTML = FESTIVE.map((f) => `
  <article class="fest fest-${f.id}" id="fest-${f.id}">
    <figure class="fest-img"><img src="${img(f.img, true)}" srcset="${img(f.img, true)} 900w, ${img(f.img)} 1800w" sizes="(max-width: 960px) 100vw, 50vw" alt="${f.name} gifting" loading="lazy" /></figure>
    <div class="fest-copy rv">
      <p class="kicker">${f.kicker}</p>
      <span class="fest-name">${f.name}</span>
      <h3>${f.title}</h3>
      <p>${f.copy}</p>
      <ul class="offers">${f.offers.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul>
      <a class="btn btn-gold" href="#enquire" data-occasion="${f.name}" data-interest="Festive hampers">Enquire for ${f.name}</a>
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

/* ---------- 1 KG bar ---------- */
const onekg = $('#onekg'), caps = $$('.cap'), prog = $('.onekg-progress');
let bar = null, barP = 0;
const CAP_AT = [0, .27, .52, .76];
ScrollTrigger.create({
  trigger: onekg, start: 'top top', end: 'bottom bottom',
  onUpdate: (st) => {
    barP = st.progress;
    prog.style.setProperty('--p', barP.toFixed(3));
    const k = CAP_AT.reduce((a, t, i) => (barP >= t - .001 ? i : a), 0);
    caps.forEach((c, i) => c.classList.toggle('is-on', i === k));
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
  // hero intro
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.fromTo('.arch-main', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.6 }, 0)
    .fromTo('.arch-main img', { scale: 1.35 }, { scale: 1.12, duration: 2.2 }, 0)
    .fromTo('.arch-small', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.3 }, .5)
    .fromTo('.hero-seal', { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: 1.2 }, .9)
    .to('.rv-h', { opacity: 1, y: 0, duration: 1.2, stagger: .12 }, .2);

  // gold flakes + cocoa nibs drifting through the hero
  const flakes = $('.hero-flakes');
  for (let i = 0; i < 18; i++) {
    const f = document.createElement('i'), nib = i % 3 === 0, s = nib ? 6 + Math.random() * 6 : 4 + Math.random() * 7;
    f.className = `flake${nib ? ' nib' : ''}`;
    Object.assign(f.style, { left: `${Math.random() * 100}%`, width: `${s}px`, height: `${s * (.6 + Math.random() * .6)}px`,
      animationDuration: `${14 + Math.random() * 16}s`, animationDelay: `${-Math.random() * 30}s` });
    f.style.setProperty('--dx', `${(Math.random() - .5) * 160}px`);
    f.style.setProperty('--r', `${(Math.random() - .5) * 900}deg`);
    flakes.appendChild(f);
  }
  new IntersectionObserver(([e]) => flakes.style.display = e.isIntersecting ? '' : 'none').observe($('#top'));

  // hero parallax (scroll) + gentle pointer drift
  $$('[data-depth]').forEach((el) => {
    const d = +el.dataset.depth;
    gsap.to(el, { yPercent: -d * 120, ease: 'none', scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true } });
  });
  if (FINE) {
    const movers = $$('[data-depth]').map((el) => [el, +el.dataset.depth, gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' })]);
    $('#top').addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - .5;
      movers.forEach(([, d, qx]) => qx(-nx * d * 90));
    });
  }

  // image parallax inside frames
  $$('.fest-img img, .story-img img').forEach((im) => gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.fest-img').forEach((f) => gsap.fromTo(f, { clipPath: 'inset(12% 8% 12% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'top 35%', scrub: true } }));

  // reveals
  const rv = $$('.sec-head, .why-grid li, .process li, .chips, .story-copy > *, .enq-side, .form, .index-note');
  rv.forEach((el) => el.classList.add('rv'));
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .08 }) });

  // cursor ring: grows with a label over interactive rows and CTAs
  if (FINE) {
    const cur = $('#cursor'), label = $('span', cur);
    const cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); cur.style.opacity = 1; }, { passive: true });
    document.addEventListener('pointerleave', () => (cur.style.opacity = 0));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], .fest-img');
      cur.classList.toggle('is-big', !!t);
      label.textContent = t ? (t.dataset.cursor || 'Gift') : '';
    });
  }
}
