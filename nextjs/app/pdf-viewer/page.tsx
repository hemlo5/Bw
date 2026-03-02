'use client'

// This page is intentionally excluded from search indexes (see robots.txt + metadata below)

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Download, ArrowLeft, Maximize2 } from 'lucide-react'

function PDFViewer() {
    const params = useSearchParams()
    const url = params.get('url') || ''
    const title = params.get('title') || 'PDF Document'
    const label = params.get('label') || ''

    if (!url) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                No PDF URL provided.
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-black text-white flex-shrink-0 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => window.history.back()}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold line-clamp-1">{title}</p>
                        {label && <p className="text-xs text-gray-400">{label}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={url} download target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Open in new tab">
                        <Maximize2 className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* PDF embed */}
            <div className="flex-1 overflow-hidden">
                <iframe
                    src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-0"
                    title={title}
                    allow="fullscreen"
                />
            </div>
        </div>
    )
}

export default function PDFViewerPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                Loading PDF...
            </div>
        }>
            <PDFViewer />
        </Suspense>
    )
}
