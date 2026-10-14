// Shared helpers for the public Reeltors pages (bio link + listing pages).
const FN = 'https://avckdteyshfwxndzrgnc.supabase.co/functions/v1/listing-page';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2Y2tkdGV5c2hmd3huZHpyZ25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODcxODIsImV4cCI6MjEwNzU2MzE4Mn0.0CipJcXlctwghglZQN5EM84xPmxp23TBRwq37s5xPB0';
const APP_STORE = 'https://apps.apple.com/app/id6822852201';
const ICONS = 'https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => (n ? '$' + Math.round(n).toLocaleString('en-US') : '');
const safe = (u) => (/^https:\/\//i.test(u || '') ? u : null);
const load = (body) => fetch(FN, { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

/** Turns a handle or URL into a full https link for each network. */
function socialUrl(kind, v) {
  if (!v) return null;
  v = String(v).trim();
  if (/^https:\/\//i.test(v)) return v;
  if (/^http:\/\//i.test(v)) return null;
  const h = v.replace(/^@/, '').replace(/^(www\.)?(instagram|tiktok|facebook|x|twitter|youtube|linkedin)\.com\//i, '');
  switch (kind) {
    case 'instagram': return 'https://instagram.com/' + encodeURIComponent(h);
    case 'tiktok': return 'https://www.tiktok.com/@' + encodeURIComponent(h);
    case 'facebook': return 'https://facebook.com/' + encodeURIComponent(h);
    case 'x': return 'https://x.com/' + encodeURIComponent(h);
    case 'youtube': return 'https://youtube.com/@' + encodeURIComponent(h.replace(/^@/, ''));
    case 'linkedin': return 'https://www.linkedin.com/in/' + encodeURIComponent(h);
    case 'website': return 'https://' + v.replace(/^\/+/, '');
  }
  return null;
}

function socialButtons(a) {
  const items = [
    ['instagram', a.instagram, 'Instagram'], ['tiktok', a.tiktok, 'TikTok'], ['facebook', a.facebook, 'Facebook'],
    ['youtube', a.youtube, 'YouTube'], ['x', a.x_handle, 'X'], ['linkedin', a.linkedin, 'LinkedIn'],
  ];
  let html = '';
  for (const [k, v, label] of items) {
    const u = socialUrl(k, v);
    if (u) html += '<a class="soc" href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + label + '"><img src="' + ICONS + k + '.svg" alt=""></a>';
  }
  const web = socialUrl('website', a.website);
  if (web) html += '<a class="soc" href="' + esc(web) + '" target="_blank" rel="noopener" aria-label="Website"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg></a>';
  if (a.email) html += '<a class="soc" href="mailto:' + esc(a.email) + '" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 6 10-6"/></svg></a>';
  return html ? '<div class="socials">' + html + '</div>' : '';
}

function madeWith(cls) {
  return '<a class="made ' + (cls || '') + '" href="' + APP_STORE + '" target="_blank" rel="noopener"><span class="dot"></span>Made with <b>Reeltors</b></a>';
}

/** Email sign-up pill. target: { agent } or { listing }. */
function leadForm(target, a, title) {
  const id = 'lead' + Math.random().toString(36).slice(2, 7);
  setTimeout(() => {
    const f = document.getElementById(id);
    if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = f.querySelector('input');
      const btn = f.querySelector('button');
      const email = input.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { input.focus(); input.classList.add('bad'); return; }
      btn.disabled = true;
      const r = await fetch(FN, { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ lead: { ...target, email } }) }).catch(() => null);
      if (r && r.ok) f.outerHTML = '<div class="joined">You’re in. ' + esc((a && a.display_name) || 'They') + ' will be in touch.</div>';
      else { btn.disabled = false; btn.textContent = 'Try again'; }
    });
  });
  const avatar = a && a.headshot_url ? '<img src="' + esc(a.headshot_url) + '" alt="">' : '';
  return '<section class="join"><h3>' + esc(title) + '</h3><form class="pillform" id="' + id + '"><input type="email" inputmode="email" autocomplete="email" placeholder="your@email.com" aria-label="Your email" required><button type="submit">Connect' + (avatar ? ' with ' + avatar : '') + '</button></form><p class="fine">No spam. Just homes and updates from ' + esc((a && a.display_name) || 'this agent') + '.</p></section>';
}

function compliance(a) {
  if (!a) return '';
  return '<div class="legal">' +
    (a.license_number ? '<div>License ' + esc(a.license_number) + (a.broker_name ? ' · Broker: ' + esc(a.broker_name) : '') + '</div>' : '') +
    ((safe(a.iabs_url) || safe(a.consumer_protection_url)) ? '<div>' + (safe(a.iabs_url) ? '<a href="' + esc(a.iabs_url) + '">Information About Brokerage Services</a>' : '') + (safe(a.consumer_protection_url) ? ' · <a href="' + esc(a.consumer_protection_url) + '">Consumer Protection Notice</a>' : '') + '</div>' : '') +
    (a.disclosures ? '<div>' + esc(a.disclosures) + '</div>' : '') + (a.equal_housing ? '<div>Equal Housing Opportunity</div>' : '') + '</div>';
}

function accent(a) {
  if (a && a.primary_color && /^#[0-9a-f]{6}$/i.test(a.primary_color)) {
    document.documentElement.style.setProperty('--accent', a.primary_color);
    document.documentElement.style.setProperty('--terra', a.primary_color);
  }
}
