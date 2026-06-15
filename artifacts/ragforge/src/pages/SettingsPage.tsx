import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { PageHeader } from '@/components/ui'
import {
  User, KeyRound, Server, Cpu, CheckCircle2, Info, Zap, Globe, Save, Eye, EyeOff
} from 'lucide-react'
import clsx from 'clsx'

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'pipeline' | 'system'>('profile')

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <PageHeader title="Platform Settings" subtitle="Manage your account, API configurations, and telemetry." />

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        <div className="w-full md:w-48 flex-shrink-0">
          <nav className="flex md:flex-col gap-2 md:gap-1 overflow-x-auto pb-4 md:pb-0 scrollbar-hide min-w-max">
            {[
              { id: 'profile', icon: User, label: 'Identity & Access' },
              { id: 'pipeline', icon: Cpu, label: 'RAG Pipeline' },
              { id: 'system', icon: Server, label: 'System Telemetry' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                  activeTab === id
                    ? 'bg-brand-indigo text-white shadow-glow-indigo'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover bg-bg-secondary md:bg-transparent'
                )}
              >
                <Icon className={clsx('w-4 h-4', activeTab === id ? 'text-white' : 'text-brand-indigo-light')} /> {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
          {activeTab === 'pipeline' && <PipelineSettings />}
          {activeTab === 'system' && <SystemInfo />}
        </div>
      </div>
    </div>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={clsx(
      'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border',
      type === 'success'
        ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
        : 'bg-red-500/10 text-red-400 border-red-500/20'
    )}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <Info className="w-4 h-4 flex-shrink-0" />}
      {message}
    </div>
  )
}

function ProfileSettings({ user, setUser }: { user: any; setUser: (u: any) => void }) {
  const [nameForm, setNameForm] = useState({ full_name: user?.full_name || '' })
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!nameForm.full_name.trim()) return
    setNameSaving(true)
    setNameMsg(null)
    try {
      const updated = await authApi.updateProfile(nameForm.full_name.trim())
      setUser({ ...user, full_name: updated.full_name })
      setNameMsg({ text: 'Profile updated successfully.', type: 'success' })
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to update profile.'
      setNameMsg({ text: detail, type: 'error' })
    } finally {
      setNameSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.new !== pwForm.confirm) {
      setPwMsg({ text: 'New passwords do not match.', type: 'error' })
      return
    }
    if (pwForm.new.length < 8) {
      setPwMsg({ text: 'New password must be at least 8 characters.', type: 'error' })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    try {
      await authApi.changePassword(pwForm.current, pwForm.new)
      setPwMsg({ text: 'Password changed successfully.', type: 'success' })
      setPwForm({ current: '', new: '', confirm: '' })
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to change password.'
      setPwMsg({ text: detail, type: 'error' })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <form onSubmit={handleSaveName}>
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-brand-indigo-light" />
            <h2 className="font-bold text-text-primary text-lg tracking-tight">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                value={nameForm.full_name}
                onChange={(e) => setNameForm({ full_name: e.target.value })}
                placeholder="Your display name"
                required
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input bg-bg-primary/50 text-text-muted" value={user?.email || ''} disabled />
              <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mt-2 flex items-center gap-1.5">
                <Info className="w-3 h-3" /> Email cannot be modified post-registration
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className={clsx('badge px-3 py-1.5', user?.is_admin ? 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20' : 'bg-bg-hover text-text-muted border border-bg-border')}>
                {user?.is_admin ? '✦ Administrator' : 'Standard User'}
              </div>
              <div className="badge px-3 py-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20">
                ● Active Account
              </div>
            </div>
            {nameMsg && <Toast message={nameMsg.text} type={nameMsg.type} />}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={nameSaving || !nameForm.full_name.trim()}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nameSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {nameSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <form onSubmit={handleChangePassword}>
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound className="w-5 h-5 text-brand-indigo-light" />
            <h2 className="font-bold text-text-primary text-lg tracking-tight">Change Password</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="input pr-10"
                  value={pwForm.current}
                  onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  className="input pr-10"
                  value={pwForm.new}
                  onChange={(e) => setPwForm((f) => ({ ...f, new: e.target.value }))}
                  placeholder="Min. 8 characters"
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input
                type="password"
                className={clsx('input', pwForm.confirm && pwForm.new !== pwForm.confirm ? 'border-red-500/50' : '')}
                value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat new password"
                required
              />
              {pwForm.confirm && pwForm.new !== pwForm.confirm && (
                <p className="text-red-400 text-xs mt-1.5">Passwords do not match</p>
              )}
            </div>
            {pwMsg && <Toast message={pwMsg.text} type={pwMsg.type} />}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={pwSaving || !pwForm.current || !pwForm.new || !pwForm.confirm}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function PipelineSettings() {
  const [settings, setSettings] = useState({
    embedding_model: 'bm25-hybrid',
    chunk_size: 512,
    chunk_overlap: 50,
    top_k: 15,
    rerank_top_n: 5,
    llm_provider: 'groq',
    llm_model: 'llama-3.3-70b-versatile',
  })

  const set = (k: keyof typeof settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setSettings((s) => ({ ...s, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Cpu className="w-5 h-5 text-brand-cyan" />
          <h2 className="font-bold text-text-primary text-lg tracking-tight">Retrieval Engine</h2>
        </div>
        <div className="space-y-5">
          <div>
            <label className="label">Retrieval Strategy</label>
            <select className="input cursor-pointer" value={settings.embedding_model} onChange={set('embedding_model')}>
              <option value="bm25-hybrid">BM25 Hybrid — Keyword + TF-IDF + Proximity (Active)</option>
              <option value="bm25-pure">BM25 Pure — Classic keyword frequency only</option>
            </select>
            <p className="text-brand-cyan text-[10px] uppercase font-bold tracking-widest mt-2 flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Hybrid search enabled by default — no vector DB required
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Chunk Size (chars)</label>
              <input type="number" className="input" value={settings.chunk_size} onChange={set('chunk_size')} min={128} max={2048} step={64} />
            </div>
            <div>
              <label className="label">Overlap (chars)</label>
              <input type="number" className="input" value={settings.chunk_overlap} onChange={set('chunk_overlap')} min={0} max={512} step={10} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-brand-purple" />
          <h2 className="font-bold text-text-primary text-lg tracking-tight">Retrieval Tuners</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label">BM25 Top-K Candidates</label>
            <input type="number" className="input" value={settings.top_k} onChange={set('top_k')} min={1} max={50} />
            <p className="text-text-muted text-[10px] mt-1.5">Higher K = broader recall, slower reranking</p>
          </div>
          <div>
            <label className="label">Re-Ranker Top-N (context)</label>
            <input type="number" className="input" value={settings.rerank_top_n} onChange={set('rerank_top_n')} min={1} max={20} />
            <p className="text-text-muted text-[10px] mt-1.5">Final chunks sent to LLM context window</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-brand-green" />
          <h2 className="font-bold text-text-primary text-lg tracking-tight">LLM Orchestration</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="label">Inference Provider</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {[
                { id: 'groq', label: 'Groq', desc: 'Cloud LPU · Sub-second inference' },
                { id: 'ollama', label: 'Ollama', desc: '100% Local & Private' },
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, llm_provider: id }))}
                  className={clsx(
                    'p-4 rounded-xl border text-left transition-all duration-200',
                    settings.llm_provider === id
                      ? 'border-brand-indigo bg-brand-indigo-dim shadow-[inset_0_0_20px_rgba(124,106,255,0.1)]'
                      : 'border-bg-border bg-bg-secondary hover:border-text-muted hover:bg-bg-hover'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={clsx('font-bold text-base tracking-tight', settings.llm_provider === id ? 'text-brand-indigo-light' : 'text-text-primary')}>{label}</span>
                    {settings.llm_provider === id && <CheckCircle2 className="w-4 h-4 text-brand-indigo-light ml-auto" />}
                  </div>
                  <span className="text-text-muted text-xs font-mono">{desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Active Model</label>
            <input className="input font-mono" value={settings.llm_model} onChange={set('llm_model')} placeholder="llama-3.3-70b-versatile" />
            <div className="mt-3 p-3 bg-bg-secondary/50 rounded-lg border border-bg-border/50 text-text-muted text-xs flex items-center gap-2">
              <TerminalIcon />
              {settings.llm_provider === 'ollama'
                ? <span className="font-mono">Local: <span className="text-text-primary">ollama pull {settings.llm_model}</span></span>
                : <span className="font-mono">Ensure <span className="text-text-primary">GROQ_API_KEY</span> is set in Replit Secrets</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SystemInfo() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { dashboardApi } = await import('@/api/dashboard')
      return dashboardApi.getStats()
    },
  })

  const items = [
    { label: 'Frontend Architecture', value: 'React 18 + Vite + TailwindCSS' },
    { label: 'Backend Architecture', value: 'FastAPI + SQLAlchemy + SQLite' },
    { label: 'Retrieval Engine', value: 'BM25 Hybrid (Keyword + TF-IDF + Proximity)' },
    { label: 'Re-Ranker', value: 'Cross-Encoder Score Simulation (Pure Python)' },
    { label: 'LLM Provider', value: 'Groq Cloud LPU (LLaMA 3.3 70B)' },
    { label: 'Auth', value: 'JWT (Access + Refresh) + OTP Reset' },
    { label: 'Your Documents', value: stats?.total_documents ?? '—' },
    { label: 'Your Chunks', value: stats?.total_chunks != null ? stats.total_chunks.toLocaleString() : '—' },
    { label: 'Your Collections', value: stats?.collections_count ?? '—' },
    { label: 'Your Query Logs', value: stats?.total_queries ?? '—' },
    { label: 'Avg. Confidence Score', value: stats?.avg_confidence_score != null ? `${stats.avg_confidence_score.toFixed(1)}%` : '—' },
  ]

  return (
    <div className="card animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-6 border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-brand-indigo-light" />
          <h2 className="font-bold text-text-primary text-lg tracking-tight">System Telemetry</h2>
        </div>
        <div className="badge bg-brand-green/10 text-brand-green border border-brand-green/20 px-3 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-green status-pulse" /> Operational
        </div>
      </div>
      <div className="divide-y divide-bg-border/50">
        {items.map(({ label, value }) => (
          <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-1">
            <span className="text-text-secondary text-sm font-semibold">{label}</span>
            <span className="text-text-primary text-xs sm:text-sm font-mono bg-bg-secondary px-2.5 py-1 rounded border border-bg-border w-fit">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TerminalIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  )
}
