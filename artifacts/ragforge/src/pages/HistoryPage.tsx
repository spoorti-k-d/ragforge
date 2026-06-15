import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { History, ChevronDown, ChevronRight, Clock, Zap, Database, Download, Search, Filter } from 'lucide-react'
import { ragApi } from '@/api/rag'
import { collectionsApi } from '@/api/collections'
import { PageHeader, EmptyState, SkeletonRows, ConfidenceBar, formatMs } from '@/components/ui'
import { formatLocalTime } from '@/utils/date'
import clsx from 'clsx'
import type { Citation } from '@/types'

function exportCSV(logs: any[], collections: any[]) {
  const collMap: Record<string, string> = {}
  collections.forEach((c) => { collMap[c.id] = c.name })

  const headers = [
    'Question',
    'Answer',
    'Collection',
    'Confidence (%)',
    'Retrieval (ms)',
    'Rerank (ms)',
    'LLM (ms)',
    'Total (ms)',
    'Re-ranked',
    'Date',
  ]
  const rows = logs.map((l) => [
    `"${(l.question || '').replace(/"/g, '""')}"`,
    `"${(l.answer || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    `"${collMap[l.collection_id] || l.collection_id || ''}"`,
    l.confidence_score != null ? l.confidence_score.toFixed(1) : '',
    l.retrieval_time_ms ?? 0,
    l.rerank_time_ms ?? 0,
    l.llm_time_ms ?? 0,
    l.total_time_ms ?? 0,
    l.used_reranker ? 'yes' : 'no',
    l.created_at || '',
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ragforge-history-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const CONFIDENCE_RANGES = [
  { label: 'All confidence', min: 0, max: 100 },
  { label: '≥ 70% (High)', min: 70, max: 100 },
  { label: '40–70% (Medium)', min: 40, max: 70 },
  { label: '< 40% (Low)', min: 0, max: 40 },
]

export default function HistoryPage() {
  const [collectionFilter, setCollectionFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [confRange, setConfRange] = useState(0)
  const [rerankerFilter, setRerankerFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.list,
  })

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['query-logs', collectionFilter],
    queryFn: () => ragApi.getLogs(collectionFilter || undefined, 0, 200),
    refetchInterval: 30_000,
  })

  const { data: logDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['log-detail', expandedId],
    queryFn: () => ragApi.getLogDetail(expandedId!),
    enabled: !!expandedId,
  })

  const range = CONFIDENCE_RANGES[confRange]
  const filtered = logs.filter((l) => {
    if (searchQuery.trim() && !l.question.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (l.confidence_score != null && (l.confidence_score < range.min || l.confidence_score > range.max)) return false
    if (rerankerFilter === 'yes' && !l.used_reranker) return false
    if (rerankerFilter === 'no' && l.used_reranker) return false
    return true
  })

  const collMap: Record<string, string> = {}
  collections.forEach((c) => { collMap[c.id] = c.name })

  const activeFilters = (confRange > 0 ? 1 : 0) + (rerankerFilter !== 'all' ? 1 : 0)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Query History"
        subtitle={`${filtered.length} of ${logs.length} queries`}
        action={
          <button
            onClick={() => exportCSV(filtered, collections)}
            disabled={filtered.length === 0}
            className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Export CSV ({filtered.length})
          </button>
        }
      />

      {/* Search + Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            className="input pl-9 w-full"
            placeholder="Search questions…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setExpandedId(null) }}
          />
        </div>
        <select
          className="input w-full sm:w-52 text-sm"
          value={collectionFilter}
          onChange={(e) => { setCollectionFilter(e.target.value); setExpandedId(null) }}
        >
          <option value="">All collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            'btn-secondary flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap',
            activeFilters > 0 && 'border-brand-indigo/50 text-brand-indigo-light'
          )}
        >
          <Filter className="w-4 h-4" />
          Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="card mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label mb-2">Confidence range</label>
              <div className="flex flex-wrap gap-2">
                {CONFIDENCE_RANGES.map((r, i) => (
                  <button
                    key={r.label}
                    onClick={() => setConfRange(i)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                      confRange === i
                        ? 'bg-brand-indigo text-white border-brand-indigo'
                        : 'bg-bg-secondary text-text-secondary border-bg-border hover:border-text-muted'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label mb-2">Re-ranker used</label>
              <div className="flex gap-2">
                {(['all', 'yes', 'no'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setRerankerFilter(v)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize',
                      rerankerFilter === v
                        ? 'bg-brand-indigo text-white border-brand-indigo'
                        : 'bg-bg-secondary text-text-secondary border-bg-border hover:border-text-muted'
                    )}
                  >
                    {v === 'all' ? 'Any' : v === 'yes' ? 'With Re-ranker' : 'Without Re-ranker'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => { setConfRange(0); setRerankerFilter('all') }}
              className="mt-4 text-xs text-brand-indigo-light hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <SkeletonRows rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title={searchQuery || activeFilters > 0 ? 'No matching queries' : 'No queries yet'}
          description={
            searchQuery || activeFilters > 0
              ? 'Try adjusting your search or filters.'
              : "Ask questions about your documents and they'll appear here with full metadata."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => {
            const isExpanded = expandedId === log.id
            const collName = collMap[log.collection_id] || log.collection_id
            return (
              <div key={log.id} className={clsx('card transition-all duration-300', isExpanded && 'border-brand-indigo/40 shadow-glow-indigo')}>
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors', isExpanded ? 'bg-brand-indigo text-white' : 'bg-brand-indigo-dim text-brand-indigo-light')}>
                      <Zap className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-text-primary font-semibold text-sm leading-snug">{log.question}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-text-muted text-xs flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {formatLocalTime(log.created_at)}
                        </span>
                        {log.total_time_ms != null && (
                          <span className="text-text-muted text-xs font-mono">{formatMs(log.total_time_ms)}</span>
                        )}
                        {collName && (
                          <span className="badge bg-bg-secondary border border-bg-border text-text-muted text-xs py-0.5 px-2">
                            {collName}
                          </span>
                        )}
                        {log.used_reranker && (
                          <span className="badge bg-brand-cyan-dim text-brand-cyan border border-brand-cyan/20 text-xs">reranked</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0 pt-1">
                      {log.confidence_score != null && (
                        <div className="w-24 hidden md:block">
                          <ConfidenceBar score={log.confidence_score} />
                        </div>
                      )}
                      <div className={clsx('p-1.5 rounded-md transition-colors', isExpanded ? 'bg-bg-hover' : 'hover:bg-bg-hover')}>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-text-primary" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-bg-border space-y-5 animate-in fade-in slide-in-from-top-2">
                    {detailLoading ? (
                      <SkeletonRows rows={3} />
                    ) : logDetail ? (
                      <>
                        <div>
                          <p className="text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Generated Answer</p>
                          <div className="bg-bg-secondary border border-bg-border rounded-xl p-5 text-text-primary text-sm leading-relaxed shadow-inner whitespace-pre-wrap">
                            {logDetail.answer || <span className="text-text-muted italic">No answer recorded</span>}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Pipeline Telemetry</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: 'Retrieval', value: logDetail.retrieval_time_ms },
                              { label: 'Rerank', value: logDetail.rerank_time_ms },
                              { label: 'LLM Synthesis', value: logDetail.llm_time_ms },
                              { label: 'Total Latency', value: logDetail.total_time_ms },
                            ].map(({ label, value }) => (
                              <div key={label} className="bg-bg-secondary border border-bg-border rounded-xl px-4 py-3 text-center transition-colors hover:border-brand-indigo/30">
                                <div className="text-brand-indigo-light font-mono font-bold text-lg">
                                  {value != null ? formatMs(value) : '—'}
                                </div>
                                <div className="text-text-muted text-xs mt-1 font-medium">{label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {logDetail.citations?.length > 0 && (
                          <div>
                            <p className="text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                              Citations ({logDetail.citations.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {logDetail.citations.map((c: Citation, i: number) => (
                                <span key={i} className="badge bg-bg-secondary border border-bg-border text-text-secondary text-xs py-1.5 px-3">
                                  <Database className="w-3 h-3 text-brand-indigo-light mr-1.5" />
                                  {c.document_name} <span className="text-text-muted ml-1">· chunk_{c.chunk_index}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {logDetail.confidence_score != null && (
                          <div>
                            <p className="text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Confidence Score</p>
                            <div className="max-w-xs">
                              <ConfidenceBar score={logDetail.confidence_score} />
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
