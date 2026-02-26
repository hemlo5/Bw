export default function CategoryLoading() {
    return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
            <div className="bg-gray-200 h-7" />
            <div className="bg-white border-b border-gray-200 h-16" />
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Breadcrumb */}
                <div className="flex gap-2">
                    <div className="h-3 bg-gray-200 rounded w-12" />
                    <div className="h-3 bg-gray-200 rounded w-4" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
                {/* Title */}
                <div className="h-9 bg-gray-200 rounded w-72" />
                {/* Subcategory grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded-lg" />
                    ))}
                </div>
                {/* Article list */}
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-white border border-gray-100 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    )
}
