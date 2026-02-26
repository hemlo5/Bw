import { Metadata } from 'next'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { getArticles } from '@/lib/supabase'
import { Archive as ArchiveIcon, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Archive | Previous Year CBSE Board Papers',
  description: 'Access previous year CBSE Class 10 and Class 12 Board Exam Papers. Download old question papers, answer keys, and study materials.',
  alternates: {
    canonical: 'https://boardswallah.com/archive/',
  },
}

export const revalidate = 3600

export default async function ArchivePage() {
  const { data: articles } = await getArticles({ limit: 100 })

  // Group by year
  const articlesByYear = articles?.reduce((acc, article) => {
    const year = new Date(article.publish_date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(article)
    return acc
  }, {} as Record<number, typeof articles>) || {}

  const years = Object.keys(articlesByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li className="text-gray-900">Archive</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ArchiveIcon className="w-8 h-8 text-blue-600" />
            Archive
          </h1>
          <p className="text-gray-600">
            Browse previous year CBSE Board Exam papers and study materials.
          </p>
        </div>

        {/* Year Sections */}
        <div className="space-y-12">
          {years.map((year) => (
            <section key={year}>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{year}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articlesByYear[Number(year)]?.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}/`}
                    className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {article.category}
                          </span>
                          <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {article.type}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900">{article.title}</h3>
                        <p className="text-sm text-gray-500">{article.subject}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {years.length === 0 && (
          <div className="text-center py-12">
            <ArchiveIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No archived articles found.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
