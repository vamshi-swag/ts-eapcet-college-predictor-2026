// TS-EAPCET 2026 — Authentication Module
// ──────────────────────────────────────────────────────────────
// Supports: Google Sign-In | Phone OTP (via Firebase)
// Demo Mode: works without Firebase config (localStorage only)
//
// To enable real authentication:
//   1. Create a project at https://console.firebase.google.com
//   2. Enable: Authentication → Sign-in methods → Google & Phone
//   3. Add your deployed domain under Authorized Domains
//   4. Replace the config values below with your project's config

const FIREBASE_CONFIG = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID'
};

const DEMO_MODE = FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY';

// ── Internal state ────────────────────────────────────────────
let _fbAuth       = null;
let _fb           = null;
let _recaptcha    = null;
let _otpConfirm   = null;
let _pendingFn    = null;
let _currentUser  = null;
let _resendTimer  = null;
const _listeners  = [];

// ── Public API ────────────────────────────────────────────────

/** Wrap any action: runs immediately if signed in, else shows the login modal first */
export function requireAuth(fn) {
  if (_currentUser) { fn(); return; }
  _pendingFn = fn;
  _openModal();
}

export function getUser() { return _currentUser; }

/** Subscribe to auth state changes. Callback fires immediately with current state. */
export function onUserChange(fn) {
  _listeners.push(fn);
  fn(_currentUser);
}

export async function googleSignIn() {
  _clearMsgs(); _setBusy(true);
  if (DEMO_MODE) {
    await _delay(700);
    _onSuccess({ uid: 'demo-g', displayName: 'Student', email: 'student@demo.com', photoURL: null });
    _setBusy(false);
    return;
  }
  try {
    await _initFb();
    const result = await _fb.signInWithPopup(_fbAuth, new _fb.GoogleAuthProvider());
    _onSuccess(result.user);
  } catch (e) {
    _msg('choose', _mapErr(e), true);
  } finally {
    _setBusy(false);
  }
}

export async function sendOtp() {
  const raw = (document.getElementById('auth-phone')?.value || '').replace(/\D/g, '');
  if (raw.length !== 10) {
    _msg('choose', 'Enter a valid 10-digit mobile number', true);
    return;
  }
  _clearMsgs(); _setBusy(true);

  if (DEMO_MODE) {
    await _delay(600);
    const sub = document.getElementById('auth-otp-sub');
    if (sub) sub.textContent = `Demo OTP sent to +91 ${raw} — enter any 6 digits`;
    _goStep('otp');
    _startCountdown();
    _setBusy(false);
    return;
  }
  try {
    await _initFb();
    if (!_recaptcha) {
      _recaptcha = new _fb.RecaptchaVerifier(_fbAuth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      });
    }
    _otpConfirm = await _fb.signInWithPhoneNumber(_fbAuth, `+91${raw}`, _recaptcha);
    const sub = document.getElementById('auth-otp-sub');
    if (sub) sub.textContent = `OTP sent to +91 ${raw}`;
    _goStep('otp');
    _startCountdown();
  } catch (e) {
    _msg('choose', _mapErr(e), true);
    if (_recaptcha) { try { _recaptcha.clear(); } catch (_) {} _recaptcha = null; }
  } finally {
    _setBusy(false);
  }
}

export async function verifyOtp() {
  const code = [...document.querySelectorAll('.otp-box')].map(b => b.value).join('');
  if (code.length !== 6) { _msg('otp', 'Enter all 6 digits', true); return; }
  _clearMsgs(); _setBusy(true);

  if (DEMO_MODE) {
    await _delay(600);
    _onSuccess({
      uid: 'demo-p',
      displayName: 'Student',
      phoneNumber: '+91' + (document.getElementById('auth-phone')?.value || ''),
      photoURL: null
    });
    _setBusy(false);
    return;
  }
  try {
    const result = await _otpConfirm.confirm(code);
    _onSuccess(result.user);
  } catch (e) {
    _msg('otp', _mapErr(e), true);
  } finally {
    _setBusy(false);
  }
}

export async function signOut() {
  _clearCountdown();
  if (DEMO_MODE) {
    localStorage.removeItem('eapcet_user');
    _notify(null);
    return;
  }
  try {
    await _initFb();
    await _fb.signOut(_fbAuth);
  } catch (_) {}
}

export function openModal()  { _openModal(); }
export function closeModal() { _closeModal(); }

/** Initialize OTP input boxes (auto-advance, backspace, paste). Call after DOM is ready. */
export function initOtpBoxes() {
  const boxes = [...document.querySelectorAll('.otp-box')];
  boxes.forEach((box, i) => {
    box.addEventListener('input', e => {
      const v = e.target.value.replace(/\D/g, '');
      box.value = v.slice(-1);
      box.classList.toggle('filled', !!box.value);
      if (v && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) {
        boxes[i - 1].value = '';
        boxes[i - 1].classList.remove('filled');
        boxes[i - 1].focus();
      }
      if (e.key === 'Enter') verifyOtp();
    });
    box.addEventListener('paste', e => {
      e.preventDefault();
      const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
      boxes.forEach((b, j) => {
        b.value = digits[j] || '';
        b.classList.toggle('filled', !!b.value);
      });
      if (digits.length === 6) document.getElementById('auth-verify-btn')?.focus();
    });
    box.addEventListener('focus', () => box.select());
  });
}

// ── Modal control ─────────────────────────────────────────────
function _openModal() {
  const m = document.getElementById('auth-modal');
  if (!m) return;
  _goStep('choose');
  _clearMsgs();
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Reset OTP boxes
  document.querySelectorAll('.otp-box').forEach(b => { b.value = ''; b.classList.remove('filled'); });
  // Reset phone input
  const ph = document.getElementById('auth-phone');
  if (ph) ph.value = '';
  setTimeout(() => document.getElementById('auth-google-btn')?.focus(), 120);
}

function _closeModal() {
  const m = document.getElementById('auth-modal');
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
  _clearCountdown();
  // Reset to choose step after animation
  setTimeout(() => { _goStep('choose'); _clearMsgs(); }, 350);
  if (!_currentUser) _pendingFn = null;
}

function _goStep(step) {
  document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`auth-step-${step}`)?.classList.add('active');
}

function _onSuccess(user) {
  _goStep('success');
  _notify(user);
  const fn = _pendingFn;
  _pendingFn = null;
  setTimeout(() => {
    _closeModal();
    if (fn) setTimeout(fn, 200);
  }, 900);
  _toast(`Welcome${user.displayName ? ', ' + user.displayName.split(' ')[0] : ''}!`);
}

function _notify(user) {
  _currentUser = user;
  _listeners.forEach(fn => fn(user));
  if (user) {
    localStorage.setItem('eapcet_user', JSON.stringify({
      uid:   user.uid,
      name:  user.displayName  || null,
      email: user.email        || null,
      phone: user.phoneNumber  || null,
      photo: user.photoURL     || null
    }));
  } else {
    localStorage.removeItem('eapcet_user');
  }
}

// ── Resend countdown ──────────────────────────────────────────
function _startCountdown() {
  const btn = document.getElementById('auth-resend-btn');
  const lbl = document.getElementById('auth-resend-lbl');
  if (!btn) return;
  let s = 30;
  btn.disabled = true;
  if (lbl) lbl.textContent = `(${s}s)`;
  _clearCountdown();
  _resendTimer = setInterval(() => {
    s--;
    if (lbl) lbl.textContent = s > 0 ? `(${s}s)` : '';
    if (s <= 0) { _clearCountdown(); btn.disabled = false; }
  }, 1000);
}

function _clearCountdown() {
  if (_resendTimer) { clearInterval(_resendTimer); _resendTimer = null; }
}

// ── UI helpers ────────────────────────────────────────────────
function _setBusy(on) {
  document.querySelectorAll('#auth-modal .auth-btn-primary, #auth-modal .auth-google-btn')
    .forEach(b => { b.disabled = on; b.classList.toggle('loading', on); });
}

function _msg(step, text, isErr) {
  const el = document.getElementById(`auth-msg-${step}`);
  if (el) { el.textContent = text; el.className = `auth-msg ${isErr ? 'err' : 'ok'}`; }
}

function _clearMsgs() {
  ['choose', 'otp'].forEach(s => {
    const el = document.getElementById(`auth-msg-${s}`);
    if (el) { el.textContent = ''; el.className = 'auth-msg'; }
  });
}

function _mapErr(e) {
  const M = {
    'auth/popup-closed-by-user':      'Sign-in cancelled.',
    'auth/popup-blocked':              'Popups blocked — allow popups for this site.',
    'auth/network-request-failed':     'No internet connection.',
    'auth/invalid-phone-number':       'Enter a valid 10-digit Indian mobile number.',
    'auth/too-many-requests':          'Too many requests — please wait a moment.',
    'auth/invalid-verification-code':  'Incorrect OTP — check and try again.',
    'auth/code-expired':               'OTP expired — request a new one.',
    'auth/quota-exceeded':             'SMS limit reached — use Google sign-in instead.',
    'auth/captcha-check-failed':       'Security check failed — refresh and retry.',
    'auth/missing-phone-number':       'Phone number is required.',
  };
  return M[e?.code] || e?.message || 'Something went wrong. Try again.';
}

function _toast(msg) {
  const el = document.createElement('div');
  el.className = 'auth-toast';
  el.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" stroke="#fff" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"/></svg>${msg}`;
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3000);
}

function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Firebase lazy init ────────────────────────────────────────
async function _initFb() {
  if (_fbAuth) return;
  const [appPkg, authPkg] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js')
  ]);
  const fbApp = appPkg.initializeApp(FIREBASE_CONFIG);
  _fbAuth = authPkg.getAuth(fbApp);
  _fb = authPkg;
  authPkg.onAuthStateChanged(_fbAuth, user => _notify(user || null));
}

// ── Session restore on page load ──────────────────────────────
;(function restoreSession() {
  const saved = localStorage.getItem('eapcet_user');
  if (saved) {
    try { _currentUser = JSON.parse(saved); } catch (_) {}
  }
  if (!DEMO_MODE) {
    _initFb().catch(() => {});
  }
})();
