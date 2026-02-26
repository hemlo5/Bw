// Global loading skeleton — shows INSTANTLY when any page is navigating
export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
            {/* Ticker skeleton */}
            <div className="bg-gray-200 h-7" />
            {/* Header skeleton */}
            <div className="bg-white border-b border-gray-200 h-16" />

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-40 bg-gray-200 rounded-2xl" />
                            <div className="h-40 bg-gray-200 rounded-2xl" />
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            <div className="h-14 bg-gray-100" />
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-14 border-t border-gray-100 px-5 flex items-center gap-3">
                                    <div className="w-4 h-4 bg-gray-200 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="h-[300px] bg-gray-200 rounded-lg" />
                        <div className="h-64 bg-gray-200 rounded-xl" />
                        <div className="h-64 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
