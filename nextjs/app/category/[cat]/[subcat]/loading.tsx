export default function SubcategoryLoading() {
    return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
            <div className="bg-gray-200 h-7" />
            <div className="bg-white border-b border-gray-200 h-16" />
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <div className="flex gap-2">
                    <div className="h-3 bg-gray-200 rounded w-12" />
                    <div className="h-3 bg-gray-200 rounded w-4" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-4" />
                    <div className="h-3 bg-gray-200 rounded w-28" />
                </div>
                <div className="h-9 bg-gray-200 rounded w-64" />
                <div className="space-y-10">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-7 bg-gray-200 rounded w-40" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} className="h-20 bg-white border border-gray-100 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
