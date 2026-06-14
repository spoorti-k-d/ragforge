import { Link } from 'react-router-dom'
import {
  Zap, Database, Search, Brain, FileText, BarChart2, Shield,
  ArrowRight, CheckCircle2, ChevronRight, Sparkles,
  Clock, Lock
} from 'lucide-react'

const FEATURES = [
  { icon: FileText, title: 'Multi-Format Ingestion', desc: 'Upload PDF, DOCX, TXT, and HTML. Automatic text extraction, noise cleaning, and intelligent chunking with configurable overlap.', color: 'text-brand-indigo-light', bg: 'bg-brand-indigo-dim' },
  { icon: Search, title: 'Hybrid BM25 Retrieval', desc: 'Combines BM25 keyword scoring with TF-IDF and phrase proximity matching to surface the most relevant chunks instantly.', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
  { icon: Brain, title: 'Neural Re-Ranking', desc: 'A cross-encoder re-ranker rescores retrieved chunks for deep semantic relevance before sending context to the LLM.', color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  { icon: Shield, title: 'Grounded Answers Only', desc: 'Every answer is strictly grounded in your documents with source citations. No hallucinations — if context is missing, it says so.', color: 'text-brand-green', bg: 'bg-brand-green/10' },
  { icon: BarChart2, title: 'Full Pipeline Telemetry', desc: 'Track retrieval time, rerank time, LLM latency, confidence scores, and query history with a complete analytics dashboard.', color: 'text-brand-amber', bg: 'bg-brand-amber/10' },
  { icon: Zap, title: 'Streaming Responses', desc: 'Token-by-token LLM streaming via Server-Sent Events delivers instant feedback, powered by Groq LPU inference.', color: 'text-brand-indigo-light', bg: 'bg-brand-indigo-dim' },
]

const PIPELINE_STEPS = [
  { label: 'Query', icon: Search, color: 'bg-brand-indigo', desc: 'Natural language question' },
  { label: 'Retrieve', icon: Database, color: 'bg-brand-cyan', desc: 'BM25 Top-K chunks' },
  { label: 'Re-Rank', icon: Brain, color: 'bg-brand-purple', desc: 'Semantic re-scoring' },
  { label: 'Synthesize', icon: Sparkles, color: 'bg-brand-amber', desc: 'LLM with citations' },
  { label: 'Answer', icon: Shield, color: 'bg-brand-green', desc: 'Grounded response' },
]

const STATS = [
  { value: '100+', label: 'Page PDFs' },
  { value: '<2s', label: 'Response Time' },
  { value: '4 Formats', label: 'PDF · DOCX · TXT · HTML' },
  { value: '100%', label: 'Source-Grounded' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-bg-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-brand-indigo flex items-center justify-center shadow-glow-indigo flex-shrink-0">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="font-bold text-base md:text-lg tracking-tight">RAG Forge</span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full">Enterprise</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/login" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors px-3 md:px-4 py-2 rounded-lg hover:bg-bg-hover">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm px-4 md:px-5 py-2 flex items-center gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 md:pt-24 pb-14 md:pb-20 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[400px] md:h-[600px] bg-brand-indigo/10 rounded-full blur-[80px] md:blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-indigo/10 border border-brand-indigo/20 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-brand-indigo-light font-semibold mb-6 md:mb-8">
            <div className="w-2 h-2 rounded-full bg-brand-green status-pulse" />
            Powered by Groq LPU · LLaMA 3 · BM25 Retrieval
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5 md:mb-6">
            Enterprise{' '}
            <span className="bg-gradient-to-r from-brand-indigo-light via-brand-purple to-brand-cyan bg-clip-text text-transparent">
              RAG System
            </span>
            <br className="hidden sm:block" />
            {' '}with Neural Re-Ranking
          </h1>

          <p className="text-text-secondary text-base md:text-xl max-w-3xl mx-auto leading-relaxed mb-8 md:mb-10">
            Ingest your document libraries, retrieve with BM25 hybrid search, re-rank for semantic relevance,
            and get grounded, cited answers from your private knowledge base.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
            <Link to="/register" className="btn-primary px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold flex items-center gap-2 shadow-glow-indigo w-full sm:w-auto justify-center">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" /> Initialize Your Knowledge Base <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-semibold text-text-secondary border border-bg-border rounded-xl hover:border-text-muted hover:text-text-primary transition-all flex items-center gap-2 w-full sm:w-auto justify-center bg-bg-secondary">
              <Lock className="w-4 h-4" /> Sign In
            </Link>
          </div>

          {/* Hero terminal mockup */}
          <div className="mt-10 md:mt-16 relative max-w-4xl mx-auto">
            <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-brand-indigo/20 via-brand-purple/20 to-brand-cyan/20 rounded-2xl md:rounded-3xl blur-xl" />
            <div className="relative bg-bg-secondary border border-bg-border rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 border-b border-bg-border bg-bg-primary/50">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-brand-red/60" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-brand-amber/60" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-brand-green/60" />
                <span className="ml-2 md:ml-3 text-[10px] md:text-xs font-mono text-text-muted">RAG Forge — Ask AI</span>
              </div>
              <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="flex gap-2 md:gap-3 justify-end">
                  <div className="bg-brand-indigo px-3 md:px-4 py-2 md:py-2.5 rounded-xl rounded-tr-sm text-xs md:text-sm text-white max-w-[80%]">
                    What is the maternity leave policy duration?
                  </div>
                </div>
                <div className="flex gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                  </div>
                  <div className="bg-bg-card border border-bg-border/60 rounded-xl rounded-tl-sm px-3 md:px-5 py-3 md:py-4 flex-1 space-y-2 md:space-y-3">
                    <p className="text-xs md:text-sm text-text-primary leading-relaxed">
                      According to <span className="text-brand-cyan font-semibold">Source 1 (Policy.pdf)</span>, maternity leave is <strong>26 weeks</strong> at full pay, extendable by 4 weeks unpaid. Eligibility requires 6 months of service. [Policy.pdf | Chunk 184]
                    </p>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      <span className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 rounded bg-brand-green/10 text-brand-green border border-brand-green/20 font-mono font-bold">CONF 94%</span>
                      <span className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 font-mono">87ms</span>
                      <span className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 rounded bg-brand-purple/10 text-brand-purple border border-brand-purple/20 font-mono">12ms rerank</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-bg-border bg-bg-secondary/50 py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-indigo-light to-brand-cyan bg-clip-text text-transparent mb-1 md:mb-2">{value}</div>
              <div className="text-text-muted text-xs md:text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline — vertical on mobile, horizontal on desktop */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-3 md:mb-4">The RAG Pipeline</h2>
            <p className="text-text-secondary text-sm md:text-lg max-w-2xl mx-auto">Every query flows through a 5-stage pipeline engineered for precision.</p>
          </div>

          {/* Mobile: vertical steps */}
          <div className="flex flex-col gap-3 md:hidden">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-4 bg-bg-secondary border border-bg-border rounded-2xl p-4">
                <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-text-primary text-sm">{step.label}</div>
                  <div className="text-text-muted text-xs">{step.desc}</div>
                </div>
                <div className="ml-auto w-6 h-6 rounded-full bg-bg-border flex items-center justify-center text-xs font-bold text-text-muted">{i + 1}</div>
              </div>
            ))}
          </div>

          {/* Desktop: horizontal steps */}
          <div className="hidden md:flex items-stretch gap-0">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="flex flex-row items-center flex-1">
                <div className="flex flex-col items-center flex-1 p-5 md:p-6 bg-bg-secondary border border-bg-border rounded-2xl relative hover:border-brand-indigo/40 transition-all">
                  <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-3`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-bold text-text-primary text-sm mb-1">{step.label}</div>
                  <div className="text-text-muted text-xs text-center">{step.desc}</div>
                  <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-bg-border flex items-center justify-center text-xs font-bold text-text-muted">{i + 1}</div>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="flex items-center justify-center w-8 flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-text-muted" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-3 md:mb-4">Everything You Need</h2>
            <p className="text-text-secondary text-sm md:text-lg max-w-2xl mx-auto">A complete enterprise RAG stack, fully running in your environment.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card hover:border-brand-indigo/30 transition-all duration-300">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 md:mb-5`}>
                  <f.icon className={`w-5 h-5 md:w-6 md:h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-text-primary text-sm md:text-base mb-2">{f.title}</h3>
                <p className="text-text-secondary text-xs md:text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-r from-brand-indigo/15 via-brand-purple/15 to-brand-cyan/15 rounded-3xl blur-2xl" />
            <div className="relative bg-bg-secondary border border-bg-border rounded-2xl md:rounded-3xl p-8 md:p-12">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center mx-auto mb-5 md:mb-6 shadow-glow-indigo">
                <Zap className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold mb-3 md:mb-4">Ready to forge your knowledge base?</h2>
              <p className="text-text-secondary text-sm md:text-lg mb-6 md:mb-8 leading-relaxed">
                Create an account, upload your documents, and start getting grounded AI answers in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link to="/register" className="btn-primary px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold flex items-center justify-center gap-2 shadow-glow-indigo">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" /> Create Free Account
                </Link>
                <Link to="/login" className="px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-semibold text-text-secondary border border-bg-border rounded-xl hover:border-text-muted hover:text-text-primary transition-all flex items-center justify-center bg-bg-primary">
                  Sign In
                </Link>
              </div>
              <div className="mt-6 md:mt-8 flex flex-wrap gap-4 md:gap-6 justify-center">
                {['No credit card required', 'Local & private', 'Open architecture'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-text-muted text-xs md:text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-green" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-border py-6 md:py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-brand-indigo flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <span className="font-bold text-text-secondary text-xs md:text-sm">RAG Forge</span>
            <span className="text-text-muted text-xs hidden sm:inline">— Enterprise AI Knowledge Base</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-text-muted text-[10px] md:text-xs">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> JWT Auth</span>
            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> SQLite + BM25</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Groq LPU</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
