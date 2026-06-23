// stats.js — Live Platform Usage Stats
// ──────────────────────────────────────────────────────────────
// Tracks: predictions, option forms, allotment simulations,
//         PDF downloads, shares, and unique student sessions.
//
// HOW IT WORKS
//   • Immediately: realistic base numbers that grow over time
//   • Per-session: increments stored in localStorage
//   • Optional real cross-user data via Firebase Realtime Database
//
// TO ENABLE REAL CROSS-USER STATS (takes ~5 minutes):
//   1. Go to https://console.firebase.google.com
//   2. Open your project (or create one) → Realtime Database → Create database
//   3. In Rules, paste:
//        { "rules": { "stats": { ".read": true, ".write": true } } }
//   4. Copy the database URL and paste it in RTDB_URL below
//
// Without config: each browser tracks its own usage against
//   a realistic baseline — numbers look authentic from day one.

const RTDB_URL = '';
// ↑ e.g., 'https://marsmate-eapcet-default-rtdb.firebaseio.com'

const IS_REALTIME = !!RTDB_URL;

// ── Baseline counts (tune to match your launch expectations) ──
// These are shown as the starting floor — local increments add on top.
// Growth simulation: adds ~daily_growth per day since BASE_DATE so numbers
// look live even if real users haven't contributed yet.
const BASE_DATE      = new Date('2026-01-10');
const DAILY_GROWTH   = { predictions: 0, optionForms: 0, simulations: 0, pdfDownloads: 0, shares: 0, students: 0 };
const BASE_FLOOR     = { predictions: 0, optionForms: 0, simulations: 0, pdfDownloads: 0, shares: 0, students: 0 };
const STAT_KEYS      = Object.keys(BASE_FLOOR);

// Compute time-grown base so numbers feel live
function _grownBase() {
  const days = Math.max(0, Math.floor((Date.now() - BASE_DATE) / 86400000));
  const base = {};
  STAT_KEYS.forEach(k => { base[k] = BASE_FLOOR[k] + days * (DAILY_GROWTH[k] || 0); });
  return base;
}

// ── Local session increments (what this browser contributed) ──
const STORE_KEY   = 'eapcet_stats_local';
const STORE_VER   = 'v2_zero'; // bump this to reset all browsers on next visit
let local = {};
try {
  if (localStorage.getItem('eapcet_stats_ver') !== STORE_VER) {
    localStorage.removeItem(STORE_KEY);
    localStorage.setItem('eapcet_stats_ver', STORE_VER);
  }
  local = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
} catch(_) {}
function _persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(local)); } catch(_) {} }

// ── Server snapshot (filled when RTDB is configured) ──────────
let server = {};

// ── Change subscribers ────────────────────────────────────────
const _listeners = [];
function _emit() { const s = snapshot(); _listeners.forEach(fn => fn(s)); }

/** Subscribe to stats changes. Fires immediately with current values. */
export function onStatsChange(fn) { _listeners.push(fn); fn(snapshot()); }

/** Get current stats synchronously */
export function snapshot() {
  const base = _grownBase();
  const out  = {};
  STAT_KEYS.forEach(k => {
    out[k] = Math.max(base[k], server[k] || 0) + (local[k] || 0);
  });
  return out;
}

// ── Track an event ────────────────────────────────────────────
/** Call this whenever a user performs a tracked action */
export async function track(event) {
  if (!STAT_KEYS.includes(event)) return;
  local[event] = (local[event] || 0) + 1;
  _persist();
  _emit();

  if (IS_REALTIME) {
    _rtdbIncrement(event).catch(() => {});
  }
}

// ── Firebase RTDB (lazy) ──────────────────────────────────────
let _db = null, _fb = null;

async function _ensureRtdb() {
  if (_db) return;
  const [appPkg, dbPkg] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js')
  ]);
  _fb = dbPkg;

  let fbApp;
  try { fbApp = appPkg.getApp('eapcet-stats'); }
  catch (_) { fbApp = appPkg.initializeApp({ databaseURL: RTDB_URL }, 'eapcet-stats'); }

  _db = dbPkg.getDatabase(fbApp);

  // Subscribe to live changes → update server snapshot
  dbPkg.onValue(dbPkg.ref(_db, 'stats'), snap => {
    if (snap.exists()) {
      const data = snap.val() || {};
      STAT_KEYS.forEach(k => { if (data[k] > 0) server[k] = data[k]; });
      _emit();
    }
  });
}

async function _rtdbIncrement(event) {
  await _ensureRtdb();
  await _fb.update(_fb.ref(_db, 'stats'), { [event]: _fb.increment(1) });
}

// ── Stats Bar renderer ────────────────────────────────────────
let _displayed = {};

/** Call once after DOM is ready — sets up the stats bar with count-up animation */
export function initStatsBar() {
  // Track a unique session as a student visit (once per session tab)
  if (!sessionStorage.getItem('eapcet_session')) {
    sessionStorage.setItem('eapcet_session', '1');
    track('students');
  }

  // Initial count-up animation
  const initial = snapshot();
  STAT_KEYS.forEach(key => {
    const from = Math.floor(initial[key] * 0.96);
    _displayed[key] = from;
    _animateCount(key, from, initial[key], 1600);
  });

  // Live updates on future changes
  onStatsChange(stats => {
    STAT_KEYS.forEach(key => {
      const cur = _displayed[key] || 0;
      if (stats[key] > cur) {
        _displayed[key] = stats[key];
        _flashUpdate(key, stats[key]);
      }
    });
  });

  // Connect RTDB for real-time if configured
  if (IS_REALTIME) {
    _ensureRtdb().catch(() => {});
  }
}

// ── Animated counter helpers ──────────────────────────────────
function _animateCount(key, from, to, duration) {
  const el = document.getElementById(`stat-${key}`);
  if (!el) return;
  const t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
    el.textContent = _fmt(Math.floor(from + (to - from) * eased));
    if (p < 1) requestAnimationFrame(step);
    else { el.textContent = _fmt(to); _displayed[key] = to; }
  }
  requestAnimationFrame(step);
}

function _flashUpdate(key, value) {
  const el = document.getElementById(`stat-${key}`);
  if (!el) return;
  el.textContent = _fmt(value);
  el.classList.remove('stat-pop');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add('stat-pop');
  setTimeout(() => el.classList.remove('stat-pop'), 600);
}

function _fmt(n) {
  if (n >= 100000) return (n / 1000).toFixed(0) + 'K+';
  if (n >= 10000)  return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString('en-IN');
}
