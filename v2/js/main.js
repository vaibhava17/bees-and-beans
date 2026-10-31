// v2: one fixed canvas + one long native scroll. Captions swap in place (words rise out of a mask),
// the story text fills in as you read, and the reply card appears at the very end.
import { gsap } from 'gsap';
import { BRAND, waLink } from '../../js/config.js';
import { SIGNATURES, FESTIVE, INTERESTS } from '../../js/data.js';
import { STATIONS, TOTAL, locate, startOf, initWorld } from './world.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const img = (n) => `../assets/img/${n}.webp`;

/* ---------- captions (one per station step) ---------- */
const go = (id, label, cls = 'btn-gold') => `<a class="btn ${cls}" href="#" data-go="${id}">${label}</a>`;
const C = {
  'hero:0': `<p class="kicker">Bees &amp; Beans · Handmade chocolates</p><p class="hi" lang="hi">मुँह मीठा कीजिए</p>
    <h1 class="split">The art of gifting, <em>made by hand.</em></h1>
    <p>Handcrafted chocolate assortments and hampers for Diwali, festive and corporate gifting — made in small batches, presented in our signature ribboned boxes.</p>
    <div class="ctas">${go('reply', 'Plan your gifting')}${go('ring', 'View the collection', 'btn-ghost')}</div>`,
  'pod:0': `<p class="kicker">I · Chosen with care</p><h2 class="split">It begins with <em>what goes in.</em></h2><p>Real chocolate, roasted nuts, ripe fruit and carefully chosen fillings. No shortcuts, no compromises.</p>`,
  'block:0': `<p class="kicker">II · The block</p><h2 class="split">It starts with <em>one kilogram.</em></h2><p>Every batch begins with 1 KG blocks of authentic chocolate — a base we trust for its flavour, gloss and clean snap.</p>`,
  'block:1': `<p class="kicker">II · The block</p><h2 class="split">Broken <em>by hand.</em></h2><p>Each block is broken along its grooves so it melts gently and evenly — never scorched, never rushed.</p>`,
  'block:2': `<p class="kicker">II · The block</p><h2 class="split">Melted <em>slowly.</em></h2><p>A little at a time, the pieces become a smooth, glossy pour.</p>`,
  'bowl:0': `<p class="kicker">III · Worked by hand</p><h2 class="split">Worked until <em>it shines.</em></h2><p>Stirred and worked by hand until glossy and smooth — the part no machine does quite as well.</p>`,
  'moulds:0': `<p class="kicker">IV · Small batches</p><h2 class="split">Poured a few <em>trays at a time.</em></h2><p>So every batch gets attention — and reaches you fresh, never from a warehouse shelf.</p>`,
  'truffle:0': `<p class="kicker">V · Finished</p><h2 class="split">Finished <em>one by one.</em></h2><p>Piped, checked and packed by hand, ready to be gifted, shared and remembered.</p>`,
  'scale:0': `<p class="kicker">Corporate &amp; family gifting</p><h2 class="split">Gifting at any scale, <em>handled personally.</em></h2>
    <p>Tell us what you're celebrating and how many people you're delighting. We'll suggest the chocolates, the packaging and the finishing touches.</p>
    <div class="chips">${['Corporate gifting', 'Assorted gift boxes', 'Festive hampers', 'Custom assortments', 'Personalised packaging'].map((c) => `<button type="button" class="chip" data-interest="${c}">${c}</button>`).join('')}</div>`,
  'why:0': `<p class="kicker">Why Bees &amp; Beans</p><h2 class="split">The difference is <em>in the making.</em></h2>
    <ul class="why">${[['Handmade in-house', 'Never outsourced, never mass-produced.'], ['Premium ingredients', 'The finest chocolate, nuts and fruit.'], ['Small batches', 'A few trays at a time, for freshness.'], ['Authentic chocolate', 'Made from 1 KG blocks of authentic chocolate.'], ['Personalised gifting', 'Your chocolates, notes and packaging.'], ['Bulk & corporate', 'For teams of ten or ten hundred.']].map(([a, b]) => `<li><b>${a}</b>${b}</li>`).join('')}</ul>`,
  'story:0': `<p class="kicker">Our story</p><blockquote class="split">“Chocolate is more than a sweet treat. It's <em>a memory, a language of love.”</em></blockquote>
    <p class="fill">The name says it all. The bees stand for the spirit we work with — tireless, purposeful and natural. The beans are the heart of every creation: rich cocoa, blended with carefully chosen fruits, nuts and fillings, made in small batches in Panipat.</p>`,
  'invite:0': `<p class="kicker">By invitation</p><h2 class="split">Let's make something <em>to remember.</em></h2><p>Share your occasion and quantity, and we'll come back with ideas, options and pricing — personally.</p>
    <div class="ctas">${go('reply', 'Write to us')}<a class="btn btn-ghost" data-wa="Hello Bees & Beans! I'd like to enquire about an order." href="#" target="_blank" rel="noopener">Chat on WhatsApp</a></div>`,
};
SIGNATURES.forEach((c, i) => {
  const [first, ...rest] = c.name.split(' ');
  C[`ring:${i}`] = `<p class="kicker">What we make · ${String(i + 1).padStart(2, '0')} / ${String(SIGNATURES.length).padStart(2, '0')}</p>
    <h2 class="split">${rest.length ? `${first} <em>${rest.join(' ')}</em>` : `<em>${first}</em>`}</h2><p>${c.line}</p>
    <p class="for"><span>Popular for</span>${c.goodFor.join(' · ')}</p>
    <a class="btn btn-gold" href="#" data-go="reply" data-interest="Bulk order" data-note="${c.name}">Enquire in bulk</a>`;
});
FESTIVE.forEach((f, i) => {
  C[`festive:${i}`] = `<p class="kicker">Festive · ${f.kicker}</p><p class="hi" lang="hi">${f.hi}</p><h2 class="split">${f.name}</h2>
    <p class="sub">${f.title}</p><p>${f.copy}</p>
    <a class="btn btn-gold" href="#" data-go="reply" data-occasion="${f.name}" data-interest="Festive hampers">Enquire for ${f.name}</a>`;
});
const capsEl = $('#captions');
capsEl.innerHTML = Object.entries(C).map(([k, html]) => `<div class="cap" data-key="${k}">${html}</div>`).join('');
// split headings into words so they can rise out of a mask
$$('.split').forEach((h) => {
  const walk = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((w) => frag.append(/\s+/.test(w) || !w ? document.createTextNode(w) : Object.assign(document.createElement('span'), { className: 'w', innerHTML: `<span>${w}</span>` })));
      n.replaceWith(frag);
    } else if (n.nodeType === 1) walk(n);
  });
  walk(h);
});
const fill = $('.fill');
fill.innerHTML = fill.textContent.split(/\s+/).map((w) => `<span>${w}</span>`).join(' ');
const fillWords = $$('span', fill);

/* ---------- business details ---------- */
$$('[data-tel]').forEach((a) => { a.href = `tel:${BRAND.phoneHref}`; a.textContent = BRAND.phone; });
$$('[data-mail]').forEach((a) => { a.href = `mailto:${BRAND.email}`; a.textContent = BRAND.email; });
$$('[data-addr]').forEach((s) => (s.textContent = BRAND.address));
$$('[data-wa]').forEach((a) => (a.href = waLink(a.dataset.wa)));
$('#year').textContent = new Date().getFullYear();

/* ---------- scroll length + navigation ---------- */
const scroller = $('#main');
scroller.style.height = `${TOTAL}vh`;
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
const progressOf = () => Math.min(1, Math.max(0, scrollY / maxScroll()));
function goTo(id) {
  const p = id === 'reply' ? 1 : startOf(id) + .002;
  scrollTo({ top: p * maxScroll(), behavior: REDUCED ? 'auto' : 'smooth' });
}

/* ---------- form (same logic as the classic site) ---------- */
const form = $('#enqForm'), status = $('#fStatus'), sel = form.elements.interest;
sel.insertAdjacentHTML('beforeend', INTERESTS.map((v) => `<option>${v}</option>`).join(''));
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-go], [data-interest], [data-occasion]');
  if (!t) return;
  if (t.dataset.interest) sel.value = t.dataset.interest;
  if (t.dataset.occasion) { const r = $$('input[name="occasion"]', form).find((x) => x.value === t.dataset.occasion); if (r) r.checked = true; }
  if (t.dataset.note && !form.elements.message.value) form.elements.message.value = `Interested in: ${t.dataset.note}. `;
  if (t.dataset.go || t.tagName === 'BUTTON') { e.preventDefault(); goTo(t.dataset.go || 'reply'); }
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
  const res = RULES[name](el.value ?? ''), msg = res === true ? '' : res;
  $('.err', field).textContent = msg; field.classList.toggle('bad', !!msg);
  return !msg;
}
let world = null;
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!Object.keys(RULES).map(check).every(Boolean)) { status.className = 'f-status bad'; status.textContent = 'Please check the highlighted fields.'; return; }
  const d = Object.fromEntries(new FormData(form)), via = e.submitter?.value || 'whatsapp';
  const text = [`Hello ${BRAND.name}! I'd like to enquire about an order.`, '', `Name: ${d.name}`, `Phone: ${d.phone}`, d.email && `Email: ${d.email}`, `Occasion: ${d.occasion}`, `Interested in: ${d.interest}`, d.quantity && `Quantity: ${d.quantity}`, d.message && `Message: ${d.message}`].filter(Boolean).join('\n');
  if (BRAND.formEndpoint) { try { await fetch(BRAND.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) }); } catch { /* WhatsApp/email still delivers */ } }
  const url = via === 'email' ? `mailto:${BRAND.email}?subject=${encodeURIComponent(`Enquiry — ${d.occasion} · ${d.interest}`)}&body=${encodeURIComponent(text)}` : waLink(text);
  if (via === 'email') location.href = url; else window.open(url, '_blank', 'noopener');
  status.className = 'f-status ok';
  status.innerHTML = `Thank you, ${d.name.split(' ')[0]}. ${via === 'email' ? 'Your email app should open with the enquiry ready.' : 'WhatsApp should open with your enquiry ready to send.'} <a href="${url}" target="_blank" rel="noopener">Open it again</a>.`;
  world?.celebrate();
});

/* ---------- the journey: captions, chapter label, progress ---------- */
const NAMES = { hero: 'The gift', pod: 'Chosen', block: 'The block', bowl: 'Worked', moulds: 'Poured', truffle: 'Finished', ring: 'What we make', festive: 'Festive', scale: 'At scale', why: 'Why us', story: 'Our story', invite: 'Invitation', reply: 'Reply' };
const caps = Object.fromEntries($$('.cap').map((c) => [c.dataset.key, c]));
const reply = $('#reply'), chNum = $('#chNum'), chName = $('#chName'), bar = $('#progress');
let current = null;
function show(key) {
  if (key === current) return;
  const prev = caps[current], next = caps[key];
  current = key;
  if (prev) { prev.classList.remove('is-on'); if (!REDUCED) gsap.to($$('.w > span', prev), { yPercent: -110, duration: .35, ease: 'power2.in', stagger: .01, overwrite: true }); }
  const isReply = key.startsWith('reply');
  reply.classList.toggle('is-on', isReply); reply.inert = !isReply;
  if (next) {
    next.classList.add('is-on');
    if (!REDUCED) {
      gsap.fromTo($$('.w > span', next), { yPercent: 110 }, { yPercent: 0, duration: .9, ease: 'power4.out', stagger: .045, delay: .12, overwrite: true });
      gsap.fromTo($$(':scope > :not(.split)', next), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .06, delay: .3, overwrite: true });
    }
  }
  if (isReply && !REDUCED) gsap.fromTo($$('.w > span', reply), { yPercent: 110 }, { yPercent: 0, duration: .9, ease: 'power4.out', stagger: .05, delay: .2 });
  const id = key.split(':')[0], idx = STATIONS.findIndex((s) => s.id === id);
  chNum.textContent = String(idx + 1).padStart(2, '0'); chName.textContent = NAMES[id];
}
function onScroll() {
  const p = progressOf(), L = locate(p);
  world?.setProgress(p);
  show(L.caption);
  bar.style.transform = `scaleX(${p})`;
  if (STATIONS[L.i].id === 'story') { const lit = Math.floor(L.lp * 1.3 * fillWords.length); fillWords.forEach((w, i) => w.classList.toggle('lit', i < lit)); }
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- start the world ---------- */
initWorld($('#world'), { reduced: REDUCED, images: SIGNATURES.map((c) => img(c.img)) })
  .then((w) => { world = w; onScroll(); document.documentElement.classList.add('ready'); })
  .catch((err) => { console.warn(err); document.documentElement.classList.add('no-gl'); });
