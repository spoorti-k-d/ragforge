import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Brain, Search, Zap, Target, Clock, ChevronRight, Sparkles,
  Loader2, FileText, TrendingUp, Award
} from 'lucide-react'
import { collectionsApi } from '@/api/collections'
import { ragApi } from '@/api/rag'
import { PageHeader, ConfidenceBar, formatMs } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import type { AskResponse } from '@/types'

export default function ComparePage() {
  const { accessToken } = useAuthStore()
  const [collectionId, setCollectionId] = useState('')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [withRerank, setWithRerank] = useState<AskResponse | null>(null)
  const [withoutRerank, setWithoutRerank] = useState<AskResponse | null>(null)
  const [ran, setRan] = useState(false)

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.list,
  })

  const handleCompare = async () => {
    if (!question.trim() || !collectionId || loading) return
    setLoading(true)
    setRan(false)
    setWithRerank(null)
    setWithoutRerank(null)

    try {
      const base = { question, collection_id: collectionId, top_k: 15, rerank_top_n: 5, stream: false, max_tokens: 1024 }
      const [r1, r2] = await Promise.all([
        ragApi.ask({ ...base, use_reranker: true }),
        ragApi.ask({ ...base, use_reranker: false }),
      ])
      setWithRerank(r1)
      setWithoutRerank(r2)
      setRan(true)
    } catch (err: any) {
      toast.error(err?.message || 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  const delta = withRerank && withoutRerank
    ? withRerank.confidence_score - withoutRerank.confidence_score
    : null

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Re-Ranker Quality Comparison"
        subtitle="Run the same query with and without the neural re-ranker side-by-side to measure quality uplift."
      />

      {/* Query input */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            <label className="label">Collection</label>
            <select
              className="input"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
            >
              <option value="">Select collection…</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Question</label>
            <div className="flex gap-3">
              <input
                className="input flex-1"
                placeholder="Enter your question to compare retrieval quality…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                disabled={loading}
              />
              <button
                onClick={handleCompare}
                disabled={!question.trim() || !collectionId || loading}
                className="btn-primary px-6 flex items-center gap-2 flex-shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading ? 'Running…' : 'Compare'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-text-muted pt-3 border-t border-bg-border/50">
          <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-brand-purple" /> Left panel uses Neural Re-Ranker (cross-encoder rescoring)</span>
          <span className="flex items-center gap-1.5"><Search className="w-3.5 h-3.5 text-brand-cyan" /> Right panel uses raw BM25 ranking only</span>
        </div>
      </div>

      {/* Delta summary bar */}
      {ran && delta !== null && (
        <div className={clsx(
          'flex flex-wrap items-center gap-4 px-6 py-4 rounded-2xl border mb-8 animate-in fade-in slide-in-from-top-2',
          delta > 0
            ? 'bg-brand-green/5 border-brand-green/20'
            : delta < 0
              ? 'bg-brand-red/5 border-brand-red/20'
              : 'bg-bg-secondary border-bg-border'
        )}>
          <Award className={clsx('w-6 h-6 flex-shrink-0', delta > 0 ? 'text-brand-green' : delta < 0 ? 'text-brand-red' : 'text-text-muted')} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text-primary text-sm">
              {delta > 0
                ? `Re-Ranker improved confidence by +${delta.toFixed(1)}%`
                : delta < 0
                  ? `Re-Ranker changed confidence by ${delta.toFixed(1)}% (rare — try a broader query)`
                  : 'No difference in confidence score'}
            </p>
            <p className="text-text-muted text-xs mt-0.5">
              Time delta: {withRerank && withoutRerank
                ? `${withRerank.total_time_ms > withoutRerank.total_time_ms ? '+' : ''}${withRerank.total_time_ms - withoutRerank.total_time_ms}ms for re-ranking overhead`
                : '—'}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <div className="text-center">
              <div className={clsx('text-xl font-extrabold', delta > 0 ? 'text-brand-green' : delta < 0 ? 'text-brand-red' : 'text-text-muted')}>
                {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wide">Conf. Delta</div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResultPanel
          title="With Re-Ranker"
          subtitle="BM25 → Cross-Encoder Re-Score → Top-N"
          icon={Brain}
          iconColor="text-brand-purple"
          borderColor="border-brand-purple/30"
          glowClass="shadow-[0_0_20px_rgba(139,92,246,0.1)]"
          badge={{ label: 'RERANKED', color: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20' }}
          result={withRerank}
          loading={loading && ran === false}
        />
        <ResultPanel
          title="Without Re-Ranker"
          subtitle="BM25 Raw Ranking Only → Top-N"
          icon={Search}
          iconColor="text-brand-cyan"
          borderColor="border-bg-border"
          glowClass=""
          badge={{ label: 'RAW BM25', color: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20' }}
          result={withoutRerank}
          loading={loading && ran === false}
        />
      </div>

      {!ran && !loading && (
        <div className="text-center py-20 card border-dashed border-2 mt-0">
          <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-bg-border flex items-center justify-center mx-auto mb-5">
            <TrendingUp className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="font-bold text-text-primary text-xl mb-2">Compare retrieval quality</h3>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Select a collection, enter a question, and click Compare to see how the neural re-ranker
            improves answer quality and confidence scores over raw BM25 retrieval.
          </p>
        </div>
      )}
    </div>
  )
}

function ResultPanel({
  title, subtitle, icon: Icon, iconColor, borderColor, glowClass, badge, result, loading
}: {
  title: string
  subtitle: string
  icon: any
  iconColor: string
  borderColor: string
  glowClass: string
  badge: { label: string; color: string }
  result: AskResponse | null
  loading: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={clsx('card flex flex-col gap-5 transition-all duration-300', borderColor, glowClass)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-xl bg-bg-hover flex items-center justify-center')}>
            <Icon className={clsx('w-5 h-5', iconColor)} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm">{title}</h3>
            <p className="text-text-muted text-xs">{subtitle}</p>
          </div>
        </div>
        <span className={clsx('badge border text-[10px] font-bold uppercase tracking-wider px-2.5 py-1', badge.color)}>
          {badge.label}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-brand-indigo-light text-sm py-8 justify-center animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" /> Running pipeline…
        </div>
      ) : result ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-primary rounded-xl border border-bg-border p-3 text-center">
              <div className="text-xs text-text-muted mb-1 uppercase tracking-wide flex items-center justify-center gap-1">
                <Target className="w-3 h-3" /> Confidence
              </div>
              <ConfidenceBar score={result.confidence_score} />
            </div>
            <div className="bg-bg-primary rounded-xl border border-bg-border p-3 text-center">
              <div className="text-xs text-text-muted mb-1 uppercase tracking-wide flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Total Time
              </div>
              <div className="font-mono font-bold text-text-primary text-sm">{formatMs(result.total_time_ms)}</div>
            </div>
          </div>

          {/* Timing breakdown */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Retrieve', value: result.retrieval_time_ms, color: 'text-brand-cyan' },
              { label: 'Rerank', value: result.rerank_time_ms, color: 'text-brand-purple' },
              { label: 'LLM', value: result.llm_time_ms, color: 'text-brand-indigo-light' },
            ].map(({ label, value, color }) => (
              <span key={label} className="text-xs px-2 py-1 rounded-md bg-bg-secondary border border-bg-border font-mono">
                <span className="text-text-muted">{label}:</span>{' '}
                <span className={clsx('font-bold', color)}>{formatMs(value)}</span>
              </span>
            ))}
          </div>

          {/* Answer */}
          <div className="bg-bg-secondary border border-bg-border/60 rounded-xl p-4">
            <div className="prose prose-sm prose-invert max-w-none text-text-primary leading-relaxed text-sm">
              <ReactMarkdown>{result.answer}</ReactMarkdown>
            </div>
          </div>

          {/* Chunks */}
          {result.reranked_chunks.length > 0 && (
            <div className="bg-bg-primary border border-bg-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-2 text-text-secondary font-semibold">
                  <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                  {result.reranked_chunks.length} Grounding Chunks
                </div>
                <ChevronRight className={clsx('w-4 h-4 text-text-muted transition-transform', expanded && 'rotate-90')} />
              </button>
              {expanded && (
                <div className="border-t border-bg-border divide-y divide-bg-border/50">
                  {result.reranked_chunks.map((chunk, i) => {
                    const score = chunk.rerank_score ?? chunk.similarity_score ?? 0
                    const pct = Math.min(100, Math.max(0, score >= 1 ? score * 10 : score * 100))
                    return (
                      <div key={chunk.chunk_id} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-bg-hover text-text-muted text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-xs font-semibold text-text-secondary truncate">{chunk.document_name}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded border border-brand-green/20 flex-shrink-0 ml-2">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted font-mono leading-relaxed line-clamp-2">{chunk.text}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center py-12 text-text-muted text-sm">
          Results will appear here
        </div>
      )}
    </div>
  )
}
