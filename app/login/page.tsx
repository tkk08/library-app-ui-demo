'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/'), 800);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        html,body{height:100%;margin:0;padding:0;overflow:hidden}
        .login-root{height:100vh;width:100vw;display:flex;background:#f5f0e8;font-family:'Jost',sans-serif;overflow:hidden}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .left-panel{flex:1;background:#1a1612;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:40px 52px;overflow:hidden;animation:slideInLeft 0.65s cubic-bezier(.22,1,.36,1) forwards}
        .shelf-line{position:absolute;left:0;right:0;height:1px;background:rgba(255,255,255,0.07)}
        .shelf-row{position:absolute;left:0;right:0;display:flex;align-items:flex-end;gap:3px;padding:0 52px}
        .book-spine{border-radius:2px 2px 0 0;opacity:0.16}
        .left-logo{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:600;color:#f5f0e8;letter-spacing:0.1em;text-transform:uppercase;display:flex;align-items:center;gap:11px;position:relative;z-index:2}
        .logo-icon{width:36px;height:36px;border:1px solid rgba(201,168,76,0.5);border-radius:6px;display:flex;align-items:center;justify-content:center}
        .accent-line{width:36px;height:2px;background:#c9a84c;margin-bottom:14px}
        .left-quote{font-family:'Cormorant Garamond',serif;font-size:clamp(1.6rem,2.2vw,2.3rem);font-style:italic;color:#f5f0e8;line-height:1.3;margin-bottom:14px;max-width:360px;position:relative;z-index:2}
        .left-quote span{color:#c9a84c}
        .left-attr{font-size:0.74rem;color:rgba(245,240,232,0.35);letter-spacing:0.12em;text-transform:uppercase;position:relative;z-index:2}
        .left-stats{display:flex;gap:32px;margin-top:28px;position:relative;z-index:2}
        .stat-num{font-family:'Cormorant Garamond',serif;font-size:1.9rem;font-weight:600;color:#c9a84c;line-height:1}
        .stat-label{font-size:0.68rem;color:rgba(245,240,232,0.38);text-transform:uppercase;letter-spacing:0.1em;margin-top:3px}
        .right-panel{width:440px;flex-shrink:0;background:#f5f0e8;display:flex;flex-direction:column;justify-content:center;padding:48px;position:relative;overflow:hidden;animation:slideInRight 0.65s cubic-bezier(.22,1,.36,1) 0.1s both}
        .right-panel::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,#c9a84c1e 1px,transparent 1px);background-size:26px 26px;pointer-events:none}
        .form-eyebrow{font-size:0.69rem;letter-spacing:0.16em;text-transform:uppercase;color:#c9a84c;font-weight:500;margin-bottom:8px;position:relative;z-index:1}
        .form-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,3vw,2.7rem);font-weight:600;color:#1a1612;line-height:1.08;margin-bottom:6px;position:relative;z-index:1}
        .form-subtitle{font-size:0.82rem;color:#8a8070;margin-bottom:28px;font-weight:300;position:relative;z-index:1}
        .field-group{margin-bottom:14px;position:relative;z-index:1}
        .field-label{font-size:0.69rem;letter-spacing:0.1em;text-transform:uppercase;color:#5a5248;font-weight:500;display:block;margin-bottom:6px}
        .field-wrap{position:relative}
        .field-input{width:100%;padding:11px 14px;background:#ede8de;border:1px solid #d8d0c2;border-radius:6px;font-family:'Jost',sans-serif;font-size:0.88rem;color:#1a1612;outline:none;transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;-webkit-appearance:none}
        .field-input::placeholder{color:#b0a898}
        .field-input:focus{border-color:#c9a84c;background:#f0ebe0;box-shadow:0 0 0 3px rgba(201,168,76,0.12)}
        .field-input.has-icon{padding-right:42px}
        .toggle-btn{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#a89e90;display:flex;align-items:center;padding:4px;transition:color 0.15s}
        .toggle-btn:hover{color:#5a5248}
        .error-box{background:rgba(180,60,60,0.08);border:1px solid rgba(180,60,60,0.25);color:#b43c3c;padding:9px 13px;border-radius:6px;font-size:0.8rem;margin-bottom:14px;display:flex;align-items:center;gap:8px;position:relative;z-index:1}
        .success-box{background:rgba(60,140,80,0.08);border:1px solid rgba(60,140,80,0.25);color:#2d7a45;padding:10px 13px;border-radius:6px;font-size:0.82rem;margin-bottom:14px;display:flex;align-items:center;gap:8px;position:relative;z-index:1;font-weight:500}
        .forgot-row{display:flex;justify-content:flex-end;margin-bottom:20px;position:relative;z-index:1}
        .forgot-link{font-size:0.76rem;color:#8a8070;text-decoration:none;border-bottom:1px solid transparent;transition:color 0.15s,border-color 0.15s}
        .forgot-link:hover{color:#c9a84c;border-bottom-color:#c9a84c}
        .btn-login{width:100%;padding:13px;background:#1a1612;color:#f5f0e8;border:none;border-radius:6px;font-family:'Jost',sans-serif;font-size:0.84rem;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;transition:background 0.2s,transform 0.15s;position:relative;overflow:hidden;z-index:1}
        .btn-login:hover:not(:disabled){background:#2d2822;transform:translateY(-1px)}
        .btn-login:active:not(:disabled){transform:translateY(0)}
        .btn-login:disabled{opacity:0.65;cursor:not-allowed}
        .btn-login::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.18),transparent);transform:translateX(-100%);transition:transform 0.5s}
        .btn-login:not(:disabled):hover::after{transform:translateX(100%)}
        .spinner{display:inline-block;width:12px;height:12px;border:2px solid rgba(245,240,232,0.3);border-top-color:#f5f0e8;border-radius:50%;animation:spin 0.7s linear infinite;margin-right:7px;vertical-align:middle}
        .divider{display:flex;align-items:center;gap:11px;margin:18px 0;color:#c0b8aa;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;position:relative;z-index:1}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:#d8d0c2}
        .creds-box{background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.22);border-radius:6px;padding:11px 13px;font-size:0.75rem;color:#7a6e50;line-height:1.8;position:relative;z-index:1}
        .creds-box strong{color:#5a4e30;font-weight:600}
        .creds-box code{background:rgba(201,168,76,0.14);padding:1px 5px;border-radius:3px;font-size:0.73rem}
        .bottom-note{margin-top:20px;font-size:0.7rem;color:#b0a898;text-align:center;position:relative;z-index:1}
        @media(max-width:768px){.left-panel{display:none}.right-panel{width:100%;padding:40px 28px}}
      `}</style>

      <div className="login-root">
        {/* Left panel */}
        <div className="left-panel">
          {[
            { top: 140, books: [22,14,18,20,16,24,15,19,21,17,23,14,20,16,18] },
            { top: 260, books: [18,20,14,22,16,19,15,21,17,23,14,20,18,16,22] },
            { top: 380, books: [20,16,22,14,18,24,17,21,15,19,22,16,18,20,14] },
            { top: 500, books: [16,22,18,20,14,19,21,17,23,15,20,18,16,22,14] },
          ].map((shelf, si) => {
            const colors = ['#2d4a3e','#3d2a1a','#1a2d4a','#3a2d1a','#2a1a3d','#4a3a2d','#1a3a2d','#3d1a2a'];
            return (
              <div key={si}>
                <div className="shelf-line" style={{ top: shelf.top }} />
                <div className="shelf-row" style={{ top: shelf.top - 82 }}>
                  {shelf.books.map((w, i) => (
                    <div key={i} className="book-spine" style={{ width: w, height: 48 + (i * 11) % 40, background: colors[(si * 3 + i) % colors.length] }} />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="left-logo">
            <div className="logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            Libris
          </div>
          <div>
            <div className="accent-line" />
            <div className="left-quote">"A library is not a luxury but one of the <span>necessities of life.</span>"</div>
            <div className="left-attr">— Henry Ward Beecher</div>
            <div className="left-stats">
              <div><div className="stat-num">12k+</div><div className="stat-label">Volumes</div></div>
              <div><div className="stat-num">840</div><div className="stat-label">Members</div></div>
              <div><div className="stat-num">99%</div><div className="stat-label">Satisfaction</div></div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="right-panel">
          <div className="form-eyebrow">Library Management System</div>
          <h1 className="form-title">Welcome<br />back.</h1>
          <p className="form-subtitle">Sign in to access your library dashboard...</p>

          <form onSubmit={handleLogin} noValidate>
            {error && (
              <div className="error-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            {success && (
              <div className="success-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Login successful! Taking you to the dashboard…
              </div>
            )}

            <div className="field-group">
              <label className="field-label" htmlFor="username">Username</label>
              <input id="username" className="field-input" type="text" placeholder="admin"
                value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" autoFocus />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-wrap">
                <input id="password" className="field-input has-icon" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                <button type="button" className="toggle-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <div className="forgot-row"><a href="#" className="forgot-link">Forgot password?</a></div>

            <button type="submit" className="btn-login" disabled={loading || success}>
              {loading ? <><span className="spinner"/>Signing in…</> : success ? '✓  Signed In' : 'Sign In'}
            </button>
          </form>

          <div className="bottom-note">© {new Date().getFullYear()} Libris · Library Management System</div>
        </div>
      </div>
    </>
  );
}
