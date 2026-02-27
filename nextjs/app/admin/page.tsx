'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import Layout from '@/components/Layout'
import {
  Sparkles, Copy, Check, Loader2, ExternalLink, Eye, EyeOff,
  FileText, ChevronDown, Trash2, AlertTriangle, RefreshCw, X,
  Send, CheckCircle, XCircle, Clock,
} from 'lucide-react'

const ADMIN_PASSWORD = 'bw@admin2026'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Types ────────────────────────────────────────────────────────────────────
type PublishStatus = 'idle' | 'publishing' | 'success' | 'error'

interface GeneratedArticle {
  slug: string; title: string; category: string; subject: string
  type: string; excerpt: string; content: string; tags: string[]
}

interface DBArticle {
  id: string; slug: string; title: string; type: string
  category: string; subject: string; publish_date: string; featured: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CONTENT_TYPES = [
  { id: 'answer-key', label: 'Answer Key', desc: 'Post-exam solutions for all sets', badge: 'bg-red-100 text-red-700' },
  { id: 'question-paper', label: 'Question Paper', desc: 'Paper PDF page with pattern details', badge: 'bg-blue-100 text-blue-700' },
  { id: 'important-questions', label: 'Important Questions', desc: 'Pre-exam chapter-wise must-do questions', badge: 'bg-green-100 text-green-700' },
  { id: 'analysis', label: 'Paper Analysis', desc: 'Difficulty review and student reactions', badge: 'bg-purple-100 text-purple-700' },
  { id: 'study-material', label: 'Study Material', desc: 'Notes, formulas and quick revision', badge: 'bg-yellow-100 text-yellow-700' },
]

const TYPE_COLORS: Record<string, string> = {
  'Answer Key': 'bg-red-100 text-red-700', 'Question Paper': 'bg-blue-100 text-blue-700',
  'Important Questions': 'bg-green-100 text-green-700', 'Analysis': 'bg-purple-100 text-purple-700',
  'Study Material': 'bg-yellow-100 text-yellow-700', 'News': 'bg-gray-100 text-gray-700',
}

const LENGTHS = [
  { id: 'small', label: 'Small', detail: '~500 words · 2-3 sections', color: 'text-green-600' },
  { id: 'medium', label: 'Medium', detail: '~1000 words · 4-6 sections', color: 'text-blue-600' },
  { id: 'large', label: 'Large', detail: '~2500 words · all sections + answers', color: 'text-purple-600' },
]

const SUBJECTS_12 = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science', 'English', 'Hindi', 'Computer Science', 'Physical Education']
const SUBJECTS_10 = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Computer Applications', 'Information Technology']

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'generator' | 'manage'>('generator')

  // Generator state
  const [subject, setSubject] = useState('')
  const [classNum, setClassNum] = useState('12')
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0])
  const [examCode, setExamCode] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['answer-key', 'important-questions'])
  const [length, setLength] = useState('medium')
  const [generatedSQL, setGeneratedSQL] = useState('')
  const [generatedArticles, setGeneratedArticles] = useState<GeneratedArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [genError, setGenError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showSQL, setShowSQL] = useState(false)
  const [previewSlug, setPreviewSlug] = useState<string | null>(null)

  // Per-article publish state
  const [publishStatus, setPublishStatus] = useState<Record<string, PublishStatus>>({})
  const [publishErrors, setPublishErrors] = useState<Record<string, string>>({})

  // Manage articles state
  const [articles, setArticles] = useState<DBArticle[]>([])
  const [fetchingArticles, setFetchingArticles] = useState(false)
  const [filterType, setFilterType] = useState('All')
  const [filterCat, setFilterCat] = useState('All')
  const [searchQ, setSearchQ] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DBArticle | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { setIsAuthenticated(true); setLoginError('') }
    else setLoginError('Wrong password')
  }

  // ─── Fetch articles ────────────────────────────────────────────────────────
  const fetchArticles = useCallback(async () => {
    setFetchingArticles(true)
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, type, category, subject, publish_date, featured')
      .order('publish_date', { ascending: false })
    setArticles((data as DBArticle[]) || [])
    setFetchingArticles(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated && activeTab === 'manage') fetchArticles()
  }, [isAuthenticated, activeTab, fetchArticles])

  // ─── Generator ─────────────────────────────────────────────────────────────
  const toggleType = (id: string) =>
    setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const handleGenerate = async () => {
    if (!subject.trim()) { setGenError('Please enter or select the subject'); return }
    if (!selectedTypes.length) { setGenError('Select at least one content type'); return }
    setGenError(''); setLoading(true)
    setGeneratedSQL(''); setGeneratedArticles([])
    setPublishStatus({}); setPublishErrors({})
    setPreviewSlug(null)

    try {
      const res = await fetch('/api/generate-content/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, classNum, examDate, examCode, additionalContext, types: selectedTypes, length }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setGeneratedSQL(data.sql || '')
      setGeneratedArticles(data.articles || [])
      // Initialise all as idle
      const initStatus: Record<string, PublishStatus> = {}
        ; (data.articles || []).forEach((a: GeneratedArticle) => { initStatus[a.slug] = 'idle' })
      setPublishStatus(initStatus)
    } catch (err: any) { setGenError(err.message) }
    finally { setLoading(false) }
  }

  // ─── Publish single article ────────────────────────────────────────────────
  const publishArticle = async (article: GeneratedArticle) => {
    setPublishStatus(prev => ({ ...prev, [article.slug]: 'publishing' }))
    setPublishErrors(prev => { const n = { ...prev }; delete n[article.slug]; return n })
    try {
      const res = await fetch('/api/publish-articles/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publish failed')
      setPublishStatus(prev => ({ ...prev, [article.slug]: 'success' }))
    } catch (err: any) {
      setPublishStatus(prev => ({ ...prev, [article.slug]: 'error' }))
      setPublishErrors(prev => ({ ...prev, [article.slug]: err.message }))
    }
  }

  // Publish all sequentially
  const publishAll = async () => {
    for (const article of generatedArticles) {
      if (publishStatus[article.slug] !== 'success') {
        await publishArticle(article)
      }
    }
  }

  const publishedCount = Object.values(publishStatus).filter(s => s === 'success').length
  const allPublished = generatedArticles.length > 0 && publishedCount === generatedArticles.length

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true); setDeleteError('')
    try {
      const res = await fetch('/api/delete-article/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: deleteTarget.slug, password: deletePassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setArticles(prev => prev.filter(a => a.slug !== deleteTarget.slug))
      setDeleteTarget(null); setDeletePassword('')
    } catch (err: any) { setDeleteError(err.message) }
    finally { setDeleteLoading(false) }
  }

  const filtered = articles.filter(a => {
    const matchType = filterType === 'All' || a.type === filterType
    const matchCat = filterCat === 'All' || a.category === filterCat
    const matchQ = !searchQ || a.title.toLowerCase().includes(searchQ.toLowerCase()) || a.subject.toLowerCase().includes(searchQ.toLowerCase())
    return matchType && matchCat && matchQ
  })

  const allTypes = ['All', ...Array.from(new Set(articles.map(a => a.type)))]

  // ─── Login ─────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-sky-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-500 text-sm mt-1">BoardsWallah Control Center</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password" autoFocus
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm" />
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">Login</button>
            </form>
          </div>
        </div>
      </Layout>
    )
  }

  // ─── Main ──────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sky-400" />
              </span>
              Admin Panel
            </h1>
            <p className="text-gray-500 mt-1 text-sm">AI generates → Review → Publish directly or copy SQL</p>
          </div>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <ExternalLink className="w-4 h-4" /> Supabase
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {[
            { id: 'generator', label: 'AI Generator', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'manage', label: `Manage Articles${articles.length ? ` (${articles.length})` : ''}`, icon: <FileText className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ══ GENERATOR TAB ══ */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left config */}
            <div className="lg:col-span-2 space-y-4">

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Class</p>
                <div className="grid grid-cols-2 gap-2">
                  {['10', '12'].map(c => (
                    <button key={c} onClick={() => { setClassNum(c); setSubject('') }}
                      className={`py-2.5 rounded-lg font-bold text-sm transition-all ${classNum === c ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      Class {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Subject</p>
                <div className="relative mb-2">
                  <select value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 appearance-none pr-8">
                    <option value="">-- Select from list --</option>
                    {(classNum === '12' ? SUBJECTS_12 : SUBJECTS_10).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Or type custom subject..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Exam Date</p>
                  <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Subject Code <span className="text-gray-400 font-normal">(optional)</span></p>
                  <input type="text" value={examCode} onChange={e => setExamCode(e.target.value)}
                    placeholder="e.g. 043 for Chemistry"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Article Length</p>
                <div className="space-y-2">
                  {LENGTHS.map(l => (
                    <button key={l.id} onClick={() => setLength(l.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${length === l.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}>
                      <div>
                        <span className={`font-bold text-sm ${length === l.id ? l.color : 'text-gray-900'}`}>{l.label}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{l.detail}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${length === l.id ? 'bg-black border-black' : 'border-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-1">Exam Notes <span className="text-gray-400 font-normal">(optional)</span></p>
                <textarea value={additionalContext} onChange={e => setAdditionalContext(e.target.value)}
                  rows={3} placeholder="e.g. Set 1 code 56/1/1, moderate difficulty, organic tricky..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
              </div>
            </div>

            {/* Right panel */}
            <div className="lg:col-span-3 space-y-4">

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Pages to Generate <span className="text-gray-400 font-normal">({selectedTypes.length} selected)</span></p>
                <div className="space-y-2">
                  {CONTENT_TYPES.map(type => (
                    <button key={type.id} onClick={() => toggleType(type.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${selectedTypes.includes(type.id) ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${type.badge}`}>{type.label}</span>
                        <p className="text-xs text-gray-500">{type.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedTypes.includes(type.id) ? 'bg-black border-black' : 'border-gray-300'}`}>
                        {selectedTypes.includes(type.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {genError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{genError}</div>
              )}

              <button onClick={handleGenerate} disabled={loading || !subject}
                className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${loading || !subject ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 active:scale-95'}`}>
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Generating... (30-60 seconds)</>
                  : <><Sparkles className="w-5 h-5 text-sky-400" />Generate {selectedTypes.length} page{selectedTypes.length !== 1 ? 's' : ''} · {length}</>}
              </button>

              {/* ── Generated articles with publish buttons ── */}
              {generatedArticles.length > 0 && (
                <div className="space-y-3">

                  {/* Publish all bar */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {allPublished ? '✅ All Published!' : `${publishedCount}/${generatedArticles.length} published`}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Pages go live on site within 60 seconds</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setShowSQL(v => !v)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">
                          {showSQL ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {showSQL ? 'Hide' : 'Show'} SQL
                        </button>
                        {!allPublished && (
                          <button onClick={publishAll}
                            disabled={Object.values(publishStatus).some(s => s === 'publishing')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-bold hover:bg-sky-700 disabled:opacity-50 transition-colors">
                            <Send className="w-4 h-4" />
                            Publish All
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Per-article cards */}
                  {generatedArticles.map((article, i) => {
                    const status = publishStatus[article.slug] || 'idle'
                    const errMsg = publishErrors[article.slug]
                    const isPreview = previewSlug === article.slug

                    return (
                      <div key={article.slug} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${status === 'success' ? 'border-green-200' : status === 'error' ? 'border-red-200' : 'border-gray-100'}`}>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Status badge */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[article.type] || 'bg-gray-100 text-gray-700'}`}>
                                  {article.type}
                                </span>
                                {status === 'idle' && <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />Ready</span>}
                                {status === 'publishing' && <span className="flex items-center gap-1 text-xs text-blue-600"><Loader2 className="w-3 h-3 animate-spin" />Publishing...</span>}
                                {status === 'success' && <span className="flex items-center gap-1 text-xs text-green-600 font-semibold"><CheckCircle className="w-3 h-3" />Published!</span>}
                                {status === 'error' && <span className="flex items-center gap-1 text-xs text-red-600 font-semibold"><XCircle className="w-3 h-3" />Failed</span>}
                              </div>
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{article.title}</p>
                              <code className="text-xs text-sky-600 font-mono">boardswallah.com/article/{article.slug}/</code>
                              {errMsg && <p className="text-xs text-red-600 mt-1">{errMsg}</p>}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => setPreviewSlug(isPreview ? null : article.slug)}
                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Preview">
                                {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              {status === 'success' ? (
                                <a href={`/article/${article.slug}/`} target="_blank" rel="noopener noreferrer"
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View live page">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              ) : (
                                <button onClick={() => publishArticle(article)}
                                  disabled={status === 'publishing'}
                                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${status === 'publishing' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : status === 'error' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-black text-white hover:bg-gray-800'}`}>
                                  {status === 'publishing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                  {status === 'error' ? 'Retry' : 'Publish'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* HTML Preview */}
                        {isPreview && (
                          <div className="border-t border-gray-100">
                            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                              <p className="text-xs text-gray-500 font-medium">Article Preview</p>
                              <button onClick={() => setPreviewSlug(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="p-4 max-h-[400px] overflow-y-auto prose prose-sm max-w-none text-sm"
                              dangerouslySetInnerHTML={{ __html: article.content }} />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* SQL toggle */}
                  {showSQL && generatedSQL && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                        <p className="text-xs font-semibold text-gray-600">Raw SQL — paste in Supabase SQL Editor</p>
                        <button onClick={async () => { await navigator.clipboard.writeText(generatedSQL); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-black text-white hover:bg-gray-800'}`}>
                          {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy SQL</>}
                        </button>
                      </div>
                      <pre className="p-4 text-xs overflow-auto max-h-[350px] whitespace-pre-wrap font-mono bg-gray-950 text-green-400">{generatedSQL}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ MANAGE ARTICLES TAB ══ */}
        {activeTab === 'manage' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-wrap items-center gap-3">
                <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search by title or subject..."
                  className="flex-1 min-w-[180px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                  <option value="All">All Classes</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 12">Class 12</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                  {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={fetchArticles} disabled={fetchingArticles}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                  <RefreshCw className={`w-4 h-4 ${fetchingArticles ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <span className="text-sm text-gray-500 ml-auto">{filtered.length} articles</span>
              </div>
            </div>

            {fetchingArticles ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading articles...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No articles found. Generate and publish some above!</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Article</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Date</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(article => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 line-clamp-1">{article.title}</p>
                          <code className="text-xs text-gray-400 font-mono">{article.slug}</code>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[article.type] || 'bg-gray-100 text-gray-700'}`}>
                            {article.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                          {new Date(article.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <a href={`/article/${article.slug}/`} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-sky-600 transition-colors rounded" title="View">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button onClick={() => { setDeleteTarget(article); setDeletePassword(''); setDeleteError('') }}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Delete Modal ── */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Delete Article</h3>
                  <p className="text-sm text-gray-500 mt-0.5">This cannot be undone.</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-0.5">Deleting:</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{deleteTarget.title}</p>
                <code className="text-xs text-red-600 font-mono">{deleteTarget.slug}</code>
              </div>
              <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                placeholder="Enter admin password to confirm" onKeyDown={e => e.key === 'Enter' && handleDelete()}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-sm mb-3" />
              {deleteError && <p className="text-red-500 text-sm mb-3">{deleteError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={deleteLoading || !deletePassword}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${deleteLoading || !deletePassword ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                  {deleteLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
