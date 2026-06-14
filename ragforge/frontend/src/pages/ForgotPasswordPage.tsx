import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Loader2, Mail, KeyRound, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'

type Step = 'email' | 'otp'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      toast.success('Security code sent to your inbox')
      setStep('otp')
    } catch {
      toast.error('Unable to send code. Check your email.')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.verifyOtp(email, otp, newPassword)
      toast.success('Authentication successful. Password reset!')
      setDone(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-indigo/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center mb-5 shadow-glow-indigo">
            {step === 'email' ? <KeyRound className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            {step === 'email' ? 'Account Recovery' : 'Verify Identity'}
          </h1>
          <p className="text-text-secondary text-sm mt-2 font-medium">
            {step === 'email' ? "We'll send a secure code to your email." : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        <div className="card shadow-2xl border-bg-border/50 backdrop-blur-xl">
          {done ? (
            <div className="text-center py-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-5 border border-brand-green/20">
                <CheckCircle2 className="w-8 h-8 text-brand-green" />
              </div>
              <p className="text-text-primary text-xl font-bold mb-2">Password Secured!</p>
              <p className="text-text-secondary text-sm mb-8">Your account has been successfully recovered.</p>
              <Link to="/login" className="btn-primary w-full flex justify-center items-center gap-2 py-3">
                <ArrowLeft className="w-4 h-4" /> Return to Login
              </Link>
            </div>
          ) : step === 'email' ? (
            <form onSubmit={sendOtp} className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="label">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    className="input pl-10 py-3"
                    placeholder="admin@enterprise.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-semibold" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {loading ? 'Initializing Protocol...' : 'Send Security Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="label text-center block w-full mb-3">Authentication Code</label>
                <input
                  type="text"
                  className="input font-mono tracking-[0.5em] text-center text-2xl py-4 bg-bg-secondary/50 border-brand-indigo/30 focus:border-brand-indigo shadow-inner"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                />
              </div>
              <div>
                <label className="label mt-6">New Password</label>
                <input
                  type="password"
                  className="input py-3"
                  placeholder="Must be at least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-semibold mt-2" disabled={loading || otp.length < 6}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {loading ? 'Verifying...' : 'Confirm & Reset'}
              </button>
              <button type="button" onClick={() => setStep('email')} className="btn-ghost w-full py-2 flex items-center justify-center gap-2 text-text-muted hover:text-text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" /> Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}