import { Link } from 'react-router-dom'
import {
  Zap, Database, Search, Brain, FileText, BarChart2, Shield,
  ArrowRight, CheckCircle2, ChevronRight, Sparkles, Layers,
  Clock, Target, Github, Globe, Lock
} from 'lucide-react'

const FEATURES = [
  {
    icon: FileText,
    title: 'Multi-Format Ingestion',
    desc: 'Upload PDF, DOCX, TXT, and HTML documents. Automatic text extraction, noise cleaning, and intelligent chunking with configurable overlap.',
    color: 'text-brand-indigo-light',
    bg: 'bg-brand-indigo-dim',
  },
  {
    icon: Search,
    title: 'Hybrid BM25 Retrieval',
    desc: 'Combines BM25 keyword scoring with TF-IDF and phrase proximity matching to surface the most relevant chunks from your knowledge base.',
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10',
  },
  {
    icon: Brain,
    title: 'Neural Re-Ranking',
    desc: 'A cross-encoder re-ranker rescores retrieved chunks for deep semantic relevance before sending context to the LLM — dramatically improving answer quality.',
    color: 'text-brand-purple',
    bg: 'bg-brand-purple/10',
  },
  {
    icon: Shield,
    title: 'Grounded Answers Only',
    desc: 'Every answer is strictly grounded in your documents with source citations. If context is insufficient, it says so — no hallucinations.',
    color: 'text-brand-green',
    bg: 'bg-brand-green/10',
  },
  {
    icon: BarChart2,
    title: 'Full Pipeline Telemetry',
    desc: 'Track retrieval time, rerank time, LLM latency, confidence scores, and query history with a complete analytics dashboard.',
    color: 'text-brand-amber',
    bg: 'bg-brand-amber/10',
  },
  {
    icon: Zap,
    title: 'Streaming Responses',
    desc: 'Token-by-token LLM streaming via Server-Sent Events delivers instant feedback while the model generates, powered by Groq LPU inference.',
    color: 'text-brand-indigo-light',
    bg: 'bg-brand-indigo-dim',
  },
]

const PIPELINE_STEPS = [
  { label: 'Query', icon: Search, color: 'bg-brand-indigo', desc: 'Natural language question' },
  { label: 'Retrieve', icon: Database, color: 'bg-brand-cyan', desc: 'BM25 Top-K chunks' },
  { label: 'Re-Rank', icon: Brain, color: 'bg-brand-purple', desc: 'Semantic re-scoring' },
  { label: 'Synthesize', icon: Sparkles, color: 'bg-brand-amber', desc: 'LLM with citations' },
  { label: 'Answer', icon: Shield, color: 'bg-brand-green', desc: 'Grounded response' },
]

const STATS = [
  { value: '100+', label: 'Page PDFs Supported' },
  { value: '<2s', label: 'Avg. Response Time' },
  { value: '4 Formats', label: 'PDF · DOCX · TXT · HTML' },
  { value: '100%', label: 'Source-Grounded' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-bg-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-indigo flex items-center justify-center shadow-glow-indigo">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">RAG Forge</span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full ml-1">
              Enterprise
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors px-4 py-2 rounded-lg hover:bg-bg-hover">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-brand-indigo/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-brand-purple/8 rounded-full blur-[80px]" />
          <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-brand-cyan/8 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-indigo/10 border border-brand-indigo/20 rounded-full px-4 py-2 text-sm text-brand-indigo-light font-semibold mb-8">
            <div className="w-2 h-2 rounded-full bg-brand-green status-pulse" />
            Powered by Groq LPU · LLaMA 3 · BM25 Retrieval
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Enterprise{' '}
            <span className="bg-gradient-to-r from-brand-indigo-light via-brand-purple to-brand-cyan bg-clip-text text-transparent">
              RAG System
            </span>
            <br />with Neural Re-Ranking
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
            Ingest your document libraries, retrieve with BM25 hybrid search, re-rank for semantic relevance,
            and get grounded, cited answers from your private knowledge base — in under 2 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="btn-primary px-8 py-4 text-base font-bold flex items-center gap-2 shadow-glow-indigo w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-5 h-5" />
              Initialize Your Knowledge Base
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 text-base font-semibold text-text-secondary border border-bg-border rounded-xl hover:border-text-muted hover:text-text-primary transition-all flex items-center gap-2 w-full sm:w-auto justify-center bg-bg-secondary"
            >
              <Lock className="w-4 h-4" /> Sign In
            </Link>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-indigo/20 via-brand-purple/20 to-brand-cyan/20 rounded-3xl blur-xl" />
            <div className="relative bg-bg-secondary border border-bg-border rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-bg-border bg-bg-primary/50">
                <div className="w-3 h-3 rounded-full bg-brand-red/60" />
                <div className="w-3 h-3 rounded-full bg-brand-amber/60" />
                <div className="w-3 h-3 rounded-full bg-brand-green/60" />
                <span className="ml-3 text-xs font-mono text-text-muted">RAG Forge — Ask AI</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3 justify-end">
                  <div className="bg-brand-indigo px-4 py-2.5 rounded-xl rounded-tr-sm text-sm text-white max-w-xs">
                    What are the key findings from the Q3 financial report?
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-bg-card border border-bg-border flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-text-muted/40" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-bg-card border border-bg-border/60 rounded-xl rounded-tl-sm px-5 py-4 flex-1 space-y-3">
                    <p className="text-sm text-text-primary leading-relaxed">
                      According to <span className="text-brand-cyan font-semibold">Source 1 (Q3-Report.pdf)</span>, revenue grew 23% YoY to $4.2B, driven by cloud services (+41%). Operating margin expanded to 28.3%, and free cash flow reached $1.1B. Key risks cited include supply chain constraints and FX headwinds.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-brand-green/10 text-brand-green border border-brand-green/20 font-mono font-bold">CONF 94%</span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 font-mono">RETRIEVE 87ms</span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-brand-purple/10 text-brand-purple border border-brand-purple/20 font-mono">RERANK 12ms</span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-brand-indigo/10 text-brand-indigo-light border border-brand-indigo/20 font-mono">LLM 1.2s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-bg-border bg-bg-secondary/50 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-indigo-light to-brand-cyan bg-clip-text text-transparent mb-2">
                {value}
              </div>
              <div className="text-text-muted text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">The RAG Pipeline</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Every query flows through a 5-stage pipeline engineered for precision retrieval.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-0">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="flex flex-row md:flex-col items-center flex-1 gap-0">
                <div className="flex flex-col md:flex-row items-center flex-1 w-full">
                  <div className="flex flex-col items-center flex-1 p-4 md:p-6 bg-bg-secondary border border-bg-border rounded-2xl relative group hover:border-brand-indigo/40 transition-all">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-3 shadow-md`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-bold text-text-primary text-sm mb-1">{step.label}</div>
                    <div className="text-text-muted text-xs text-center">{step.desc}</div>
                    <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-bg-border border border-bg-border flex items-center justify-center text-xs font-bold text-text-muted">
                      {i + 1}
                    </div>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="hidden md:flex items-center justify-center w-8 flex-shrink-0">
                      <ChevronRight className="w-5 h-5 text-text-muted" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-6 bg-bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything You Need</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              A complete enterprise RAG stack, fully running in your environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card group hover:border-brand-indigo/30 hover:shadow-glow-indigo transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-text-primary text-base mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-brand-indigo/15 via-brand-purple/15 to-brand-cyan/15 rounded-3xl blur-2xl" />
            <div className="relative bg-bg-secondary border border-bg-border rounded-3xl p-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center mx-auto mb-6 shadow-glow-indigo">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Ready to forge your knowledge base?
              </h2>
              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                Create an account, upload your documents, and start getting grounded AI answers in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary px-8 py-4 text-base font-bold flex items-center justify-center gap-2 shadow-glow-indigo">
                  <Sparkles className="w-5 h-5" /> Create Free Account
                </Link>
                <Link to="/login" className="px-8 py-4 text-base font-semibold text-text-secondary border border-bg-border rounded-xl hover:border-text-muted hover:text-text-primary transition-all flex items-center justify-center gap-2 bg-bg-primary">
                  Sign In
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 justify-center">
                {['No credit card required', 'Local & private', 'Open architecture'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-text-muted text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-indigo flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-text-secondary text-sm">RAG Forge</span>
            <span className="text-text-muted text-xs">— Enterprise AI Knowledge Base</span>
          </div>
          <div className="flex items-center gap-6 text-text-muted text-xs">
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Secure JWT Auth</span>
            <span className="flex items-center gap-1.5"><Database className="w-3 h-3" /> SQLite + BM25</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Groq LPU</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
