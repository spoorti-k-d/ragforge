import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import {
  Upload, Trash2, RefreshCw, ChevronRight,
  Loader2, AlertCircle, Eye, FileUp, Database, Layers
} from 'lucide-react'
import { documentsApi } from '@/api/documents'
import { collectionsApi } from '@/api/collections'
import {
  PageHeader, StatusBadge, FileTypeIcon, Modal, SkeletonRows,
  formatBytes, formatNumber,
} from '@/components/ui'
import { formatLocalTime } from '@/utils/date'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { Chunk } from '@/types'

export default function DocumentsPage() {
  const { id: collectionId } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewChunksId, setViewChunksId] = useState<string | null>(null)
  const [droppedFiles, setDroppedFiles] = useState<File[]>([])

  const { data: collection } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => collectionsApi.get(collectionId!),
    enabled: !!collectionId,
  })

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', collectionId],
    queryFn: () => documentsApi.list(collectionId!),
    enabled: !!collectionId,
    refetchInterval: (queryOrData: any) => {
      const docs = Array.isArray(queryOrData) ? queryOrData : (queryOrData?.state?.data || [])
      return docs.some((d: any) => ['parsing', 'chunking', 'embedding', 'uploaded'].includes(d.status)) ? 3000 : false
    },
  })

  const { data: chunksData, isLoading: chunksLoading } = useQuery({
    queryKey: ['chunks', viewChunksId],
    queryFn: () => documentsApi.getChunks(viewChunksId!),
    enabled: !!viewChunksId,
  })

  const deleteMut = useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', collectionId] })
      qc.invalidateQueries({ queryKey: ['collection', collectionId] })
      setDeleteId(null)
      toast.success('Document removed')
    },
    onError: () => toast.error('Failed to delete document'),
  })

  const reindexMut = useMutation({
    mutationFn: documentsApi.reindex,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', collectionId] })
      toast.success('Re-indexing started')
    },
    onError: () => toast.error('Failed to start re-indexing'),
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setDroppedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name))
      return [...prev, ...acceptedFiles.filter((f) => !existingNames.has(f.name))]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/html': ['.html'],
    },
    multiple: true,
  })

  const handleUpload = async () => {
    if (!droppedFiles.length || !collectionId) return
    setUploading(true)
    setUploadProgress(0)
    try {
      await documentsApi.upload(collectionId, droppedFiles, setUploadProgress)
      qc.invalidateQueries({ queryKey: ['documents', collectionId] })
      qc.invalidateQueries({ queryKey: ['collection', collectionId] })
      setDroppedFiles([])
      toast.success(`${droppedFiles.length} file(s) uploaded — ingestion started`)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const removeDropped = (name: string) => setDroppedFiles((f) => f.filter((x) => x.name !== name))

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-text-muted mb-4 md:mb-6 flex-wrap">
        <Link to="/collections" className="hover:text-text-primary transition-colors">Collections</Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <Link to={`/collections/${collectionId}`} className="hover:text-text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px]">
          {collection?.name || collectionId}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-brand-indigo-light">Documents</span>
      </nav>

      <PageHeader
        title="Knowledge Documents"
        subtitle={`${documents.length} document${documents.length !== 1 ? 's' : ''} in this collection`}
      />

      {/* Upload zone */}
      <div className="card mb-6 md:mb-8">
        <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2 text-sm md:text-base">
          <FileUp className="w-4 h-4 md:w-5 md:h-5 text-brand-indigo-light" /> Upload Documents
        </h2>

        <div
          {...getRootProps()}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-6 md:p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden',
            isDragActive
              ? 'border-brand-indigo bg-brand-indigo/10'
              : 'border-bg-border hover:border-brand-indigo/50 hover:bg-brand-indigo/5'
          )}
        >
          <input {...getInputProps()} />
          <Upload className={clsx('w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 md:mb-4', isDragActive ? 'text-brand-indigo-light' : 'text-text-muted')} />
          <p className="text-text-primary font-semibold text-sm md:text-base">
            {isDragActive ? 'Drop files to upload' : 'Drag & drop files, or tap to browse'}
          </p>
          <p className="text-text-muted text-xs mt-2">PDF, DOCX, TXT, HTML · Max 100MB each</p>
        </div>

        {droppedFiles.length > 0 && (
          <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            {droppedFiles.map((f) => (
              <div key={f.name} className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl border border-bg-border">
                <FileTypeIcon type={f.name.split('.').pop() || 'txt'} />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-semibold truncate">{f.name}</p>
                  <p className="text-text-muted text-xs font-mono">{formatBytes(f.size)}</p>
                </div>
                <button onClick={() => removeDropped(f.name)} className="p-2 rounded-lg text-text-muted hover:text-brand-red hover:bg-brand-red/10 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {uploading && (
              <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                <div className="h-full bg-brand-indigo rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-bg-border/60">
              <button
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {uploadProgress}%</> : <><Upload className="w-4 h-4" /> Upload {droppedFiles.length} file{droppedFiles.length !== 1 ? 's' : ''}</>}
              </button>
              {!uploading && (
                <button className="btn-secondary sm:w-auto" onClick={() => setDroppedFiles([])}>Clear</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Documents list — mobile-card layout + desktop table */}
      <div className="card">
        <h2 className="font-semibold text-text-primary mb-4 md:mb-5 flex items-center gap-2 text-sm md:text-base">
          <Database className="w-4 h-4 md:w-5 md:h-5 text-brand-cyan" /> Indexed Documents
        </h2>

        {isLoading ? (
          <SkeletonRows rows={5} />
        ) : documents.length === 0 ? (
          <div className="py-10 md:py-12 text-center text-text-muted text-sm border-2 border-dashed border-bg-border rounded-xl">
            No documents yet. Upload files above to populate the knowledge base.
          </div>
        ) : (
          <>
            {/* Mobile card layout */}
            <div className="md:hidden space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-bg-secondary border border-bg-border rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <FileTypeIcon type={doc.file_type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-semibold text-sm truncate">{doc.original_name}</p>
                      <p className="text-text-muted text-xs font-mono mt-0.5">{formatBytes(doc.file_size)} · {doc.chunk_count > 0 ? `${doc.chunk_count} chunks` : 'processing'}</p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                  {doc.error_message && (
                    <p className="text-brand-red text-xs flex items-center gap-1 mb-3">
                      <AlertCircle className="w-3 h-3" /> {doc.error_message.slice(0, 60)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 justify-end">
                    {doc.status === 'ready' && (
                      <button onClick={() => setViewChunksId(doc.id)} className="p-2 rounded-lg text-text-muted hover:text-brand-cyan hover:bg-brand-cyan/10 transition-colors" title="View chunks">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => reindexMut.mutate(doc.id)} disabled={reindexMut.isPending} className="p-2 rounded-lg text-text-muted hover:text-brand-indigo-light hover:bg-brand-indigo-dim transition-colors" title="Re-index">
                      <RefreshCw className={clsx('w-4 h-4', reindexMut.isPending && 'animate-spin')} />
                    </button>
                    <button onClick={() => setDeleteId(doc.id)} className="p-2 rounded-lg text-text-muted hover:text-brand-red hover:bg-brand-red/10 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto scrollbar-hide">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="border-b border-bg-border">
                    {['Document', 'Format', 'Size', 'Chunks', 'Status', 'Indexed', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-text-secondary text-[10px] font-bold uppercase tracking-wider py-3 pr-4 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border/50">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-bg-hover/40 transition-colors group">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <FileTypeIcon type={doc.file_type} />
                          <div className="min-w-0">
                            <p className="text-text-primary font-semibold truncate max-w-[200px] lg:max-w-[260px]">{doc.original_name}</p>
                            {doc.error_message && (
                              <p className="text-brand-red text-[10px] flex items-center gap-1 mt-0.5">
                                <AlertCircle className="w-3 h-3" /> {doc.error_message.slice(0, 40)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="font-mono text-brand-indigo-light bg-brand-indigo-dim border border-brand-indigo/20 px-2 py-1 rounded text-[10px] uppercase font-bold">{doc.file_type}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-text-secondary font-mono text-xs">{formatBytes(doc.file_size)}</td>
                      <td className="py-3.5 pr-4">
                        <span className="text-text-primary text-xs font-mono bg-bg-secondary px-2 py-1 rounded border border-bg-border">{doc.chunk_count > 0 ? formatNumber(doc.chunk_count) : '—'}</span>
                      </td>
                      <td className="py-3.5 pr-4"><StatusBadge status={doc.status} /></td>
                      <td className="py-3.5 pr-4 text-text-muted text-xs font-mono">{doc.indexed_at ? formatLocalTime(doc.indexed_at, 'MMM d, h:mm a') : '—'}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          {doc.status === 'ready' && (
                            <button onClick={() => setViewChunksId(doc.id)} className="p-2 rounded-lg text-text-muted hover:text-brand-cyan hover:bg-brand-cyan/10 transition-colors" title="View chunks">
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => reindexMut.mutate(doc.id)} disabled={reindexMut.isPending} className="p-2 rounded-lg text-text-muted hover:text-brand-indigo-light hover:bg-brand-indigo-dim transition-colors" title="Re-index">
                            <RefreshCw className={clsx('w-4 h-4', reindexMut.isPending && 'animate-spin')} />
                          </button>
                          <button onClick={() => setDeleteId(doc.id)} className="p-2 rounded-lg text-text-muted hover:text-brand-red hover:bg-brand-red/10 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Delete modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Document">
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          This will permanently remove the document and all its chunks. <strong className="text-brand-red">Cannot be undone.</strong>
        </p>
        <div className="flex gap-3">
          <button className="btn-danger flex-1 flex items-center justify-center gap-2" onClick={() => deleteId && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>
            {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleteMut.isPending ? 'Deleting…' : 'Delete'}
          </button>
          <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
        </div>
      </Modal>

      {/* Chunks inspector modal */}
      <Modal
        open={!!viewChunksId}
        onClose={() => setViewChunksId(null)}
        title={chunksData ? `Chunks: ${chunksData.document_name}` : 'Chunk Inspector'}
        maxWidth="max-w-3xl"
      >
        {chunksLoading ? (
          <SkeletonRows rows={4} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-bg-border/60">
              <p className="text-text-muted text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-cyan" /> {chunksData?.total_chunks} chunks total
              </p>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
              {chunksData?.chunks.map((chunk: Chunk) => (
                <div key={chunk.id} className="bg-bg-secondary border border-bg-border rounded-xl p-4 hover:border-brand-indigo/30 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-1 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded text-[10px] font-bold font-mono uppercase">
                      Chunk #{chunk.chunk_index}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">{chunk.char_count} chars</span>
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed font-mono bg-bg-primary/50 p-3 rounded-lg border border-bg-border/50">{chunk.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
