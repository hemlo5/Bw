'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Sparkles, Copy, Check, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const ADMIN_PASSWORD = 'bw@admin2026'

const CONTENT_TYPES = [
  { id: 'answer-key', label: 'Answer Key', desc: 'Post-exam solutions for all sets', color: 'bg-red-50 border-red-200 text-red-800' },
  { id: 'question-paper', label: 'Question Paper', desc: 'Paper PDF page with pattern details', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { id: 'important-questions', label: 'Important Questions', desc: 'Pre-exam must-do questions by chapter', color: 'bg-green-50 border-green-200 text-green-800' },
  { id: 'analysis', label: 'Paper Analysis', desc: 'Difficulty review and student reactions', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { id: 'study-material', label: 'Study Material', desc: 'Notes, formulas, and quick revision', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
]

const SUBJECTS_12 = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science', 'English', 'Hindi', 'Computer Science', 'Physical Education']
const SUBJECTS_10 = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Computer Applications', 'Information Technology']

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [subject, setSubject] = useState('')
  const [classNum, setClassNum] = useState('12')
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0])
  const [examCode, setExamCode] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['answer-key', 'question-paper', 'important-questions', 'analysis'])
  const [generatedSQL, setGeneratedSQL] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showSQL, setShowSQL] = useState(true)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) setIsAuthenticated(true)
    else setError('Wrong password')
  }

  const toggleType = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    if (!subject.trim()) { setError('Please enter the subject'); return }
    if (!selectedTypes.length) { setError('Select at least one content type'); return }
    setError('')
    setLoading(true)
    setGeneratedSQL('')

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, classNum, examDate, examCode, additionalContext, types: selectedTypes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setGeneratedSQL(data.sql)
      setShowSQL(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ─── Login screen ─────────────────────────────────────────────────────────
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
              <p className="text-gray-500 text-sm mt-1">BoardsWallah Content Generator</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </Layout>
    )
  }

  // ─── Main admin UI ─────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sky-400" />
              </span>
              AI Content Generator
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Generate SEO-optimized SQL for Supabase using SiliconFlow AI</p>
          </div>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Supabase
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ─── Config panel (left) ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Class */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Class</label>
              <div className="grid grid-cols-2 gap-2">
                {['10', '12'].map(c => (
                  <button
                    key={c}
                    onClick={() => { setClassNum(c); setSubject('') }}
                    className={`py-2.5 rounded-lg font-bold text-sm transition-all ${classNum === c ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Class {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 mb-2"
              >
                <option value="">-- Select subject --</option>
                {(classNum === '12' ? SUBJECTS_12 : SUBJECTS_10).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Or type custom subject..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* Exam Date */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* Subject Code */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Subject Code <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={examCode}
                onChange={e => setExamCode(e.target.value)}
                placeholder="e.g. 043 for Chemistry"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* Additional Context */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Exam Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
                rows={3}
                placeholder="e.g. Paper was moderate difficulty, organic chemistry was tricky, sets 56/1/1 56/1/2 56/1/3"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
              />
            </div>
          </div>

          {/* ─── Content types + generate (right) ─── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Content types */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Pages to Generate <span className="text-gray-400 font-normal">({selectedTypes.length} selected)</span>
              </label>
              <div className="space-y-2">
                {CONTENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${selectedTypes.includes(type.id)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-100 hover:border-gray-300'
                      }`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selectedTypes.includes(type.id) ? 'bg-black border-black' : 'border-gray-300'
                      }`}>
                      {selectedTypes.includes(type.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !subject}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${loading || !subject
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 active:scale-95'
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating SQL... (30-60 seconds)
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  Generate SQL with AI ({selectedTypes.length} pages)
                </>
              )}
            </button>

            {/* Generated SQL output */}
            {generatedSQL && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="font-semibold text-sm text-gray-900">SQL Ready — Copy and run in Supabase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSQL(v => !v)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showSQL ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    >
                      {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy SQL</>}
                    </button>
                  </div>
                </div>

                {showSQL && (
                  <pre className="p-4 text-xs text-gray-800 overflow-auto max-h-[500px] whitespace-pre-wrap font-mono leading-relaxed bg-gray-950 text-green-400">
                    {generatedSQL}
                  </pre>
                )}

                <div className="p-4 bg-sky-50 border-t border-sky-100">
                  <p className="text-xs text-sky-800 font-medium">Next step:</p>
                  <ol className="text-xs text-sky-700 mt-1 space-y-0.5 list-decimal list-inside">
                    <li>Copy the SQL above</li>
                    <li>Open Supabase Dashboard → SQL Editor</li>
                    <li>Paste and click Run</li>
                    <li>Articles appear on your site within 60 seconds automatically</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
