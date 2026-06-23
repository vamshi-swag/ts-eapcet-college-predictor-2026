// analytics.js — MarsMate EAPCET lightweight event tracking
// Stores up to 500 events in localStorage with metadata.
// No backend required — works offline. Add Firebase RTDB URL to push cross-user.

const EVENTS_KEY  = 'eapcet_events_v1';
const SESSION_KEY = 'eapcet_sess_v1';
const MAX_EVENTS  = 500;

// ── Device Detection ──────────────────────────────────────────────
function detectDevice() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|android|iphone|ipod|windows phone/i.test(ua)) return 'Mobile';
  if (window.innerWidth < 768)  return 'Mobile';
  if (window.innerWidth < 1024) return 'Tablet';
  return 'Desktop';
}

// ── Session ───────────────────────────────────────────────────────
// One session = one browser tab lifecycle (sessionStorage)
function getSession() {
  try {
    const existing = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (existing) return existing;
    const s = {
      id:        Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      device:    detectDevice(),
      startedAt: new Date().toISOString()
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    return s;
  } catch {
    return { id: 'unknown', device: 'Desktop', startedAt: new Date().toISOString() };
  }
}

// ── Track Event ───────────────────────────────────────────────────
/**
 * Track a user event with optional metadata.
 *
 * @example
 *   trackEvent('college_searched', { query: 'CBIT' });
 *   trackEvent('simulation_run',   { optionCount: 45, rank: 8500 });
 */
export function trackEvent(eventName, metadata = {}) {
  try {
    const session = getSession();

    let userId = null, userEmail = null;
    try {
      const u = JSON.parse(localStorage.getItem('eapcet_user'));
      if (u) { userId = u.uid; userEmail = u.email || u.phone || null; }
    } catch {}

    const events = _load();
    events.push({
      id:        Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      event:     eventName,
      metadata,
      timestamp: new Date().toISOString(),
      session:   session.id,
      device:    session.device,
      userId,
      userEmail
    });

    // Cap to MAX_EVENTS — drop oldest
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    _save(events);
  } catch {}
}

// ── Queries ───────────────────────────────────────────────────────

/** Returns last N events, newest first */
export function getRecentEvents(limit = 50) {
  return _load().slice(-limit).reverse();
}

/** Returns computed metrics for the admin dashboard */
export function getAnalyticsStats() {
  const events = _load();
  const today  = new Date().toDateString();

  const allSessions   = new Set(events.map(e => e.session));
  const todaySessions = new Set(
    events.filter(e => new Date(e.timestamp).toDateString() === today).map(e => e.session)
  );

  const count = (name) => events.filter(e => e.event === name).length;

  return {
    totalSessions: allSessions.size,
    activeToday:   todaySessions.size,
    predictions:   count('predictor_opened'),
    comparisons:   count('compare_opened'),
    simulations:   count('simulation_run'),
    downloads:     count('pdf_downloaded'),
    searches:      count('college_searched'),
    optionsAdded:  count('option_added'),
    logins:        count('login'),
  };
}

/** Returns device breakdown as { Mobile: N, Tablet: N, Desktop: N } */
export function getDeviceBreakdown() {
  const events = _load();
  const map = {};
  const seen = new Set();
  for (const e of events) {
    if (!seen.has(e.session)) {
      seen.add(e.session);
      map[e.device] = (map[e.device] || 0) + 1;
    }
  }
  return map;
}

// ── Internal Storage ──────────────────────────────────────────────
function _load() {
  try   { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); }
  catch { return []; }
}

function _save(events) {
  try { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); }
  catch {}
}
