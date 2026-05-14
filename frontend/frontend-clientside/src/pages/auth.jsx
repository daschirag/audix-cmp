import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateLogin, validateSignup, validateLoginField, validateSignupField } from '../utils/validation';
import '../styles/auth.css';

const API = 'http://localhost:3001';

/* ─── SVG Icons ─────────────────────────────── */
const EyeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const GoogleSVG = () => (
  <svg className="google-icon" viewBox="0 0 18 18" fill="none">
    <path fill="#4285F4" d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 002.6-6.6z" />
    <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 01-8-2.9H1V13a9 9 0 008 5z" />
    <path fill="#FBBC05" d="M4 10.7a5.4 5.4 0 010-3.4V5H1a9 9 0 000 8l3-2.3z" />
    <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 001 5l3 2.4a5.4 5.4 0 015-3.8z" />
  </svg>
);

function Field({ label, error, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {error ? <span className="field-error">⚠ {error}</span> : null}
    </div>
  );
}

function validateSignupInline(name, value, allData) {
  if (name === 'name') {
    if (!value) return '';
    if (/\d/.test(value)) return 'Name cannot contain numbers';
    if (value.trim().length < 2) return 'Full name must be at least 2 characters';
  }
  if (name === 'email') {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return 'Enter a valid email address';
  }
  if (name === 'phone') {
    if (!value) return '';
    if (value.length > 0 && !/^[6-9]/.test(value)) return 'Mobile number must start with 6, 7, 8, or 9';
    if (value.length === 10 && !/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit number';
    if (value.length > 0 && value.length < 10) return `${10 - value.length} more digit${10 - value.length > 1 ? 's' : ''} needed`;
  }
  if (name === 'password') {
    if (!value) return '';
    if (value.length < 8) return `Password needs ${8 - value.length} more character${8 - value.length > 1 ? 's' : ''}`;
    if (!/[A-Z]/.test(value)) return 'Add at least one uppercase letter (A–Z)';
    if (!/[0-9]/.test(value)) return 'Add at least one number (0–9)';
  }
  if (name === 'confirmPassword') {
    if (!value) return '';
    if (value !== allData.password) return 'Passwords do not match';
  }
  return '';
}

function validateLoginInline(name, value) {
  if (name === 'identifier') {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    if (value.length >= 5 && !emailRegex.test(value.trim()) && !phoneRegex.test(value.trim()))
      return 'Enter a valid email address or 10-digit mobile number';
  }
  if (name === 'password') {
    if (!value) return '';
    if (value.length < 6) return `Password must be at least 6 characters`;
  }
  return '';
}

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [loginErr, setLoginErr] = useState({});

  const [signupData, setSignupData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [signupErr, setSignupErr] = useState({});

  function switchTab(t) {
    setTab(t);
    setLoginErr({});
    setSignupErr({});
    setApiError('');
    setShowPass(false);
    setShowConfirm(false);
  }

  function onLoginChange(e) {
    const { name, value } = e.target;
    setLoginData(p => ({ ...p, [name]: value }));
    const error = validateLoginInline(name, value);
    setLoginErr(p => ({ ...p, [name]: error }));
  }

  function onLoginBlur(e) {
    const { name, value } = e.target;
    const error = validateLoginField(name, value);
    setLoginErr(p => ({ ...p, [name]: error }));
  }

  function onSignupChange(e) {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      const newData = { ...signupData, phone: digits };
      setSignupData(newData);
      const error = validateSignupInline('phone', digits, newData);
      setSignupErr(p => ({ ...p, phone: error }));
      return;
    }
    const newData = { ...signupData, [name]: value };
    setSignupData(newData);
    const error = validateSignupInline(name, value, newData);
    setSignupErr(p => ({ ...p, [name]: error }));
    if (name === 'password' && signupData.confirmPassword) {
      const confirmError = validateSignupInline('confirmPassword', signupData.confirmPassword, newData);
      setSignupErr(p => ({ ...p, [name]: error, confirmPassword: confirmError }));
    }
  }

  function onSignupBlur(name, value) {
    const error = validateSignupField(name, value, signupData);
    setSignupErr(p => ({ ...p, [name]: error }));
  }

  /* ── login submit — calls real backend ── */
  async function handleLogin(e) {
    e.preventDefault();
    setApiError('');
    const errors = validateLogin(loginData.identifier, loginData.password);
    setLoginErr(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:    loginData.identifier,
          password: loginData.password
        })
      });

      const data = await res.json();

      if (!data.success) {
        setApiError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      // Store token in sessionStorage — never localStorage
      sessionStorage.setItem('accessToken', data.data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.data.user));
      setLoading(false);
      navigate('/dashboard');

    } catch (err) {
      setApiError('Cannot connect to server. Make sure backend is running on port 3001.');
      setLoading(false);
    }
  }

  /* ── signup submit — calls real backend ── */
  async function handleSignup(e) {
    e.preventDefault();
    setApiError('');
    const errors = validateSignup(signupData);
    setSignupErr(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:    signupData.email,
          password: signupData.password,
          mobile:   signupData.phone,
          role:     'USER'
        })
      });

      const data = await res.json();

      if (!data.success) {
        setApiError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      setLoading(false);
      setSignupData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setSignupErr({});
      switchTab('login');

    } catch (err) {
      setApiError('Cannot connect to server. Make sure backend is running on port 3001.');
      setLoading(false);
    }
  }

  /* ── google OAuth stub ── */
  async function handleGoogle() {
    try {
      const res = await fetch(`${API}/auth/oauth/google`);
      const data = await res.json();
      if (data.success) {
        window.location.href = data.data.url;
      }
    } catch (err) {
      setApiError('Google login unavailable. Try email login.');
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-card">

        <div className="auth-logo">
          <img src="/audix-logo.png" alt="Audix"
            onError={e => {
              e.target.style.display = 'none';
              const fb = e.target.nextSibling;
              if (fb) fb.style.display = 'flex';
            }}
          />
          <div className="auth-logo-fallback">A</div>
          <span className="auth-logo-name">Consent<span>Hub</span></span>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')} type="button">
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')} type="button">
            Create Account
          </button>
        </div>

        {/* API error banner */}
        {apiError && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            color: '#DC2626', borderRadius: 8, padding: '10px 14px',
            fontSize: 13, marginBottom: 12, textAlign: 'center'
          }}>
            {apiError}
          </div>
        )}

        {/* ══════════ LOGIN FORM ══════════ */}
        {tab === 'login' && (
          <>
            <button className="google-btn" type="button" onClick={handleGoogle}>
              <GoogleSVG />
              Continue with Google
            </button>
            <div className="auth-divider">
              <hr /><span>or sign in with email</span><hr />
            </div>
            <form onSubmit={handleLogin} noValidate>
              <Field label="Email or Phone" error={loginErr.identifier}>
                <div className="input-wrapper">
                  <span className="input-icon"><MailIcon /></span>
                  <input type="text" name="identifier"
                    placeholder="you@example.com or 9XXXXXXXXX"
                    value={loginData.identifier}
                    onChange={onLoginChange} onBlur={onLoginBlur}
                    className={loginErr.identifier ? 'input-error' : ''}
                    autoComplete="username" />
                </div>
              </Field>

              <Field label="Password" error={loginErr.password}>
                <div className="input-wrapper">
                  <span className="input-icon"><LockIcon /></span>
                  <input type={showPass ? 'text' : 'password'} name="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={onLoginChange} onBlur={onLoginBlur}
                    className={loginErr.password ? 'input-error' : ''}
                    autoComplete="current-password" />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </Field>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
              </button>
            </form>
          </>
        )}

        {/* ══════════ SIGNUP FORM ══════════ */}
        {tab === 'signup' && (
          <>
            <button className="google-btn" type="button" onClick={handleGoogle}>
              <GoogleSVG />
              Continue with Google
            </button>
            <div className="auth-divider">
              <hr /><span>or create with email</span><hr />
            </div>
            <form onSubmit={handleSignup} noValidate>

              <Field label="Full Name" error={signupErr.name}>
                <div className="input-wrapper">
                  <span className="input-icon"><UserIcon /></span>
                  <input type="text" name="name" placeholder="John Doe"
                    value={signupData.name}
                    onChange={onSignupChange}
                    onBlur={e => onSignupBlur('name', e.target.value)}
                    className={signupErr.name ? 'input-error' : ''}
                    autoComplete="name" />
                </div>
              </Field>

              <div className="form-row">
                <Field label="Email Address" error={signupErr.email}>
                  <div className="input-wrapper">
                    <span className="input-icon"><MailIcon /></span>
                    <input type="email" name="email" placeholder="you@example.com"
                      value={signupData.email}
                      onChange={onSignupChange}
                      onBlur={e => onSignupBlur('email', e.target.value)}
                      className={signupErr.email ? 'input-error' : ''}
                      autoComplete="email" />
                  </div>
                </Field>

                <Field label="Mobile Number" error={signupErr.phone}>
                  <div className="input-wrapper">
                    <span className="input-icon"><PhoneIcon /></span>
                    <input type="tel" name="phone" placeholder="9XXXXXXXXX"
                      value={signupData.phone}
                      onChange={onSignupChange}
                      onBlur={e => onSignupBlur('phone', e.target.value)}
                      className={signupErr.phone ? 'input-error' : ''}
                      autoComplete="tel" maxLength={10} inputMode="numeric" />
                  </div>
                </Field>
              </div>

              <Field label="Password" error={signupErr.password}>
                <div className="input-wrapper">
                  <span className="input-icon"><LockIcon /></span>
                  <input type={showPass ? 'text' : 'password'} name="password"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={signupData.password}
                    onChange={onSignupChange}
                    onBlur={e => onSignupBlur('password', e.target.value)}
                    className={signupErr.password ? 'input-error' : ''}
                    autoComplete="new-password" />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password" error={signupErr.confirmPassword}>
                <div className="input-wrapper">
                  <span className="input-icon"><LockIcon /></span>
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={signupData.confirmPassword}
                    onChange={onSignupChange}
                    onBlur={e => onSignupBlur('confirmPassword', e.target.value)}
                    className={signupErr.confirmPassword ? 'input-error' : ''}
                    autoComplete="new-password" />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </Field>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Creating account...</>
                  : 'Create Account'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer-note">
          By continuing, you agree to our{' '}
          <a href="#">Terms of Service</a> and{' '}
          <a href="#">Privacy Policy</a>.<br />
          Your data is protected under DPDPA 2023.
        </p>
      </div>
    </div>
  );
}