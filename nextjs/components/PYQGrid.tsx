'use client'

import { useState, useMemo } from 'react'
import { Search, Download, ChevronDown, ChevronUp, BookOpen, FileText } from 'lucide-react'

// ─── Label formatting ─────────────────────────────────────────────────────────
function formatSetLabel(raw: string): string {
    return raw
        .replace(/^Delhi\s·/, 'CBSE Main Exam ·')
        .replace(/^Outside Delhi \(Abroad\)\s·/, 'Extra Papers (Abroad) ·')
        .replace(/^Outside Delhi\s·/, 'Extra Papers ·')
        .replace(/^Compartment 1\s·/, 'Compartment Papers ·')
        .replace(/^Compartment 2\s·/, 'Compartment Papers II ·')
        .replace(/^Compartment \(Abroad\)\s·/, 'Compartment (Abroad) ·')
        .replace(/^Series (\d+)\s·/, 'Paper Series $1 ·')
}

function pdfViewerUrl(url: string, title: string, label: string): string {
    return `/pdf-viewer/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&label=${encodeURIComponent(label)}`
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PYQPaper {
    id: string
    subject: string
    subject_slug: string
    subject_code: string
    set_label: string
    zone_number: number | null
    set_number: number | null
    is_visually_impaired: boolean
    public_url: string
    paper_name: string
}

interface SubjectGroup {
    subject: string
    subject_slug: string
    subject_code: string
    papers: PYQPaper[]
    isCore: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CORE_SUBJECTS_10 = [
    'Science', 'Mathematics Standard', 'Mathematics Basic', 'Social Science',
    'English Language and Literature', 'Hindi Course A', 'Hindi Course B', 'English Communicative',
]

const CORE_SUBJECTS_12 = [
    'Physics', 'Chemistry', 'Biology', 'Mathematics',
    'English Core', 'Hindi Core',
    'Accountancy', 'Economics', 'Business Studies',
    'History', 'Geography', 'Political Science',
]

const SUBJECT_ICONS: Record<string, string> = {
    'Science': '🔬', 'Mathematics Standard': '📐', 'Mathematics Basic': '🔢',
    'Social Science': '🌍', 'English Language and Literature': '📖', 'English Communicative': '💬',
    'Hindi Course A': '🇮🇳', 'Hindi Course B': '📜', 'Sanskrit': '🕉️',
    'Sanskrit Communicative': '📿', 'French': '🇫🇷', 'German': '🇩🇪', 'Japanese': '🇯🇵',
    'Arabic': '📖', 'Assamese': '📝', 'Information Technology': '💻',
    'Artificial Intelligence': '🤖', 'Data Science': '📊', 'Agriculture': '🌱',
    'Home Science': '🏠', 'Physical Activity Trainer': '💪', 'Automotive': '🔧',
    'Apparel': '👗', 'Introduction to Financial Markets': '💹',
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function PYQPage({ papers, classLevel = '10' }: { papers: PYQPaper[], classLevel?: '10' | '12' }) {
    const [search, setSearch] = useState('')
    const [expandedSlug, setExpanded] = useState<string | null>(null)
    const [showAll, setShowAll] = useState(false)
    const CORE_SUBJECTS = classLevel === '12' ? CORE_SUBJECTS_12 : CORE_SUBJECTS_10

    const groups: SubjectGroup[] = useMemo(() => {
        const map: Record<string, PYQPaper[]> = {}
        papers.forEach(p => {
            if (!map[p.subject]) map[p.subject] = []
            map[p.subject].push(p)
        })
        return Object.entries(map)
            .map(([subject, pps]) => ({
                subject,
                subject_slug: pps[0].subject_slug,
                subject_code: pps[0].subject_code,
                papers: pps.sort((a, b) => {
                    if (a.is_visually_impaired) return 1
                    if (b.is_visually_impaired) return -1
                    if ((a.zone_number ?? 0) !== (b.zone_number ?? 0)) return (a.zone_number ?? 0) - (b.zone_number ?? 0)
                    return (a.set_number ?? 0) - (b.set_number ?? 0)
                }),
                isCore: CORE_SUBJECTS.includes(subject),
            }))
            .sort((a, b) => {
                const ai = CORE_SUBJECTS.indexOf(a.subject)
                const bi = CORE_SUBJECTS.indexOf(b.subject)
                if (ai !== -1 && bi !== -1) return ai - bi
                if (ai !== -1) return -1
                if (bi !== -1) return 1
                return a.subject.localeCompare(b.subject)
            })
    }, [papers])

    const filtered = groups.filter(g => g.subject.toLowerCase().includes(search.toLowerCase()))
    const coreGroups = filtered.filter(g => g.isCore)
    const otherGroups = filtered.filter(g => !g.isCore)
    const visibleOthers = showAll ? otherGroups : otherGroups.slice(0, 4)

    const toggle = (slug: string) => setExpanded(prev => prev === slug ? null : slug)

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero */}
            <div className="bg-black text-white py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-2 text-sky-400 text-sm font-medium mb-3">
                        <a href="/" className="hover:underline">Home</a>
                        <span>/</span>
                        <a href={`/category/class-${classLevel}/`} className="hover:underline">Class {classLevel}</a>
                        <span>/</span>
                        <a href={`/cbse-class-${classLevel}-previous-year-question-papers/`} className="hover:underline">Previous Year Papers</a>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                        CBSE Class {classLevel} Previous Year Question Papers
                    </h1>
                    <p className="text-gray-400 text-lg mb-6">
                        All sets and series for all subjects. View or download free PDFs.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="bg-white/10 rounded-full px-4 py-1.5">📄 {papers.length}+ Papers</span>
                        <span className="bg-white/10 rounded-full px-4 py-1.5">📚 {groups.length} Subjects</span>
                        <span className="bg-white/10 rounded-full px-4 py-1.5">✅ All Sets Included</span>
                        <span className="bg-white/10 rounded-full px-4 py-1.5">🆓 Free Download</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search subject (e.g. Science, Mathematics, Hindi...)"
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm"
                    />
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No subjects found for &ldquo;{search}&rdquo;</p>
                    </div>
                )}

                {/* Core Subjects */}
                {coreGroups.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs">★</span>
                            Core Subjects
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {coreGroups.map(group => (
                                <SubjectCard key={group.subject_slug} group={group}
                                    expanded={expandedSlug === group.subject_slug}
                                    onToggle={() => toggle(group.subject_slug)} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Other Subjects */}
                {otherGroups.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Other Subjects
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {visibleOthers.map(group => (
                                <SubjectCard key={group.subject_slug} group={group}
                                    expanded={expandedSlug === group.subject_slug}
                                    onToggle={() => toggle(group.subject_slug)} />
                            ))}
                        </div>
                        {otherGroups.length > 4 && (
                            <button onClick={() => setShowAll(v => !v)}
                                className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-medium hover:border-gray-400 hover:text-gray-700 transition-colors">
                                {showAll ? '↑ Show less' : `↓ Show ${otherGroups.length - 4} more subjects`}
                            </button>
                        )}
                    </section>
                )}

                {/* SEO text */}
                <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-600 space-y-2">
                    <h2 className="text-base font-bold text-gray-900">About CBSE Class {classLevel} PYQ Papers</h2>
                    <p>These are official CBSE Class {classLevel} Previous Year Question Papers for all subjects. CBSE Main Exam papers cover the standard sets, Extra Papers cover outside Delhi regions, and Compartment Papers are for supplementary exams. All papers are free to view and download.</p>
                    <p>Solving PYQs is the most effective way to prepare for CBSE board exams — they reveal the exam pattern, marks distribution, and most important topics.</p>
                </div>
            </div>
        </div>
    )
}

// ─── Subject Card ─────────────────────────────────────────────────────────────
function SubjectCard({ group, expanded, onToggle }: {
    group: SubjectGroup
    expanded: boolean
    onToggle: () => void
}) {
    const icon = SUBJECT_ICONS[group.subject] || '📄'
    const mainPapers = group.papers.filter(p => !p.is_visually_impaired)
    const viPapers = group.papers.filter(p => p.is_visually_impaired)
    const singlePaper = group.papers.length === 1

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${expanded ? 'border-sky-200' : 'border-gray-100'}`}>

            {/* Header */}
            <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">{group.subject}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {mainPapers.length} paper{mainPapers.length !== 1 ? 's' : ''}
                            {viPapers.length > 0 ? ` + ${viPapers.length} VI` : ''}
                            {group.subject_code ? ` · Code ${group.subject_code}` : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {singlePaper && (
                        <a href={pdfViewerUrl(group.papers[0].public_url, group.subject, 'Single Paper')}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors">
                            <Download className="w-3.5 h-3.5" /> View PDF
                        </a>
                    )}
                    {!singlePaper && (
                        expanded
                            ? <ChevronUp className="w-4 h-4 text-gray-400" />
                            : <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expanded papers list */}
            {expanded && !singlePaper && (
                <div className="border-t border-gray-100">
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {mainPapers.map(paper => (
                            <div key={paper.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                                <span className="text-xs text-gray-700">{formatSetLabel(paper.set_label)}</span>
                                <a href={pdfViewerUrl(paper.public_url, group.subject, formatSetLabel(paper.set_label))}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-medium hover:bg-sky-100 transition-colors ml-2 flex-shrink-0">
                                    <Download className="w-3 h-3" /> View
                                </a>
                            </div>
                        ))}

                        {viPapers.length > 0 && (
                            <div className="bg-orange-50 px-4 py-2">
                                <p className="text-xs font-semibold text-orange-700 pb-1.5">♿ Visually Impaired</p>
                                {viPapers.map(paper => (
                                    <div key={paper.id} className="flex items-center justify-between py-1.5">
                                        <span className="text-xs text-gray-700">{paper.set_label}</span>
                                        <a href={pdfViewerUrl(paper.public_url, `${group.subject} (VI)`, paper.set_label)}
                                            className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors flex-shrink-0">
                                            <Download className="w-3 h-3" /> View
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
