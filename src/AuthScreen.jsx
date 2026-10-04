import { useState } from 'react'
import { ArrowRight, Globe2, LoaderCircle, ShieldCheck } from 'lucide-react'
import { supabase } from './supabase.js'
import './AuthScreen.css'

function AuthScreen({ configurationMissing = false }) {
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setMessage('')
    setError('')
    try {
      if (mode === 'sign-up') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (signUpError) throw signUpError
        if (!data.session) setMessage('Check your email to confirm your account, then sign in.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <a className="auth-brand" href="/" aria-label="Job Atlas home">
          <span className="auth-brand-icon"><Globe2 size={19} /></span>
          <span>job atlas<span>.</span></span>
        </a>
        <div className="auth-kicker"><span /> PRIVATE CAREER WORKSPACE</div>
        <h1>{configurationMissing ? 'Connect your workspace.' : mode === 'sign-in' ? 'Welcome back.' : 'Create your workspace.'}</h1>
        <p className="auth-intro">{configurationMissing ? 'Supabase client settings are missing from this deployment.' : 'Sign in to keep your saved roles and applications private.'}</p>

        {configurationMissing ? (
          <div className="auth-config-message">Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in the local environment and restart the app.</div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <label>Email address<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
            <label>Password<input autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
            {error && <p className="auth-message auth-error" role="alert">{error}</p>}
            {message && <p className="auth-message auth-success" role="status">{message}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="auth-spinner" size={16} /> : null}
              {busy ? 'Please wait' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
              {!busy && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        {!configurationMissing && <button className="auth-mode-toggle" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); setError('') }}>
          {mode === 'sign-in' ? 'New to Job Atlas? Create an account' : 'Already have an account? Sign in'}
        </button>}
        <div className="auth-privacy"><ShieldCheck size={15} /><span>Your application data is protected by Supabase row-level security.</span></div>
      </section>
      <div className="auth-side-note"><span>JOB ATLAS / GLOBAL OPPORTUNITY DESK</span><strong>A career is<br />a journey in motion.</strong><div className="auth-side-rule" /><small>Find the next place you can do your best work.</small></div>
    </main>
  )
}

export default AuthScreen