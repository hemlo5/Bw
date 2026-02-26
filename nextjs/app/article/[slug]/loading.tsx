function SkeletonLine({ w = 'full' }: { w?: string }) {
    return <div className={`h-4 bg-gray-200 rounded w-${w}`} />
}

export default function ArticleLoading() {
    return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
            <div className="bg-gray-200 h-7" />
            <div className="bg-white border-b border-gray-200 h-16" />
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Breadcrumb */}
                <div className="flex gap-2">
                    <div className="h-3 bg-gray-200 rounded w-12" />
                    <div className="h-3 bg-gray-200 rounded w-4" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
                {/* Badges */}
                <div className="flex gap-2">
                    <div className="h-7 bg-gray-200 rounded-full w-28" />
                    <div className="h-7 bg-gray-200 rounded-full w-20" />
                </div>
                {/* Title */}
                <div className="space-y-3">
                    <div className="h-8 bg-gray-200 rounded w-full" />
                    <div className="h-8 bg-gray-200 rounded w-4/5" />
                </div>
                {/* Meta */}
                <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
                {/* PDF banner */}
                <div className="h-20 bg-gray-200 rounded-lg" />
                {/* Content lines */}
                <div className="space-y-3 pt-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className={`h-4 bg-gray-200 rounded ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`} />
                    ))}
                </div>
            </div>
        </div>
    )
}
