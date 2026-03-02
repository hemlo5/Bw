import { Metadata } from 'next'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { getArticlesByCategory } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { ChevronRight, FileText, BookOpen } from 'lucide-react'

interface Props {
  params: Promise<{ cat: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params
  const category = cat === 'class-10' ? 'Class 10' : 'Class 12'

  return {
    title: `${category} CBSE Board Papers 2026 | Question Papers & Answer Keys`,
    description: `Get ${category} CBSE Board Exam Papers 2026. Download question papers, answer keys, analysis, and study materials for all subjects.`,
    keywords: `${category}, CBSE, Board Exam 2026, Question Papers, Answer Keys`,
    alternates: {
      canonical: `https://boardswallah.com/category/${cat}/`,
    },
  }
}


export const revalidate = 60

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params
  const category = cat === 'class-10' ? 'Class 10' : 'Class 12'
  const isClass10 = cat === 'class-10'

  // Fetch articles + PYQ count (parallel)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [{ data: articles }, { count: pyqCount }] = await Promise.all([
    getArticlesByCategory(category),
    isClass10
      ? supabase.from('pyq_papers').select('id', { count: 'exact', head: true }).eq('class', 'Class 10')
      : Promise.resolve({ count: 0 }),
  ])

  // Group articles by type
  const articlesByType = articles?.reduce((acc, article) => {
    const type = article.type
    if (!acc[type]) acc[type] = []
    acc[type].push(article)
    return acc
  }, {} as Record<string, typeof articles>) || {}

  const subcategories = [
    { name: 'Question Papers', slug: 'question-papers', count: articlesByType['Question Paper']?.length || 0 },
    { name: 'Answer Keys', slug: 'answer-keys', count: articlesByType['Answer Key']?.length || 0 },
    { name: 'Important Questions', slug: 'important-questions', count: articlesByType['Important Questions']?.length || 0 },
    { name: 'Analysis', slug: 'analysis', count: articlesByType['Analysis']?.length || 0 },
    { name: 'Study Material', slug: 'study-material', count: articlesByType['Study Material']?.length || 0 },
    { name: 'Syllabus', slug: 'syllabus', count: articlesByType['Syllabus']?.length || 0 },
  ]

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li className="text-gray-900">{category}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category} CBSE Board Papers 2026
          </h1>
          <p className="text-gray-600">
            Access {category} question papers, answer keys, and study materials for CBSE Board Exams 2026.
          </p>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">

          {/* PYQ Card — Class 10 only, shown first and highlighted */}
          {isClass10 && (
            <Link
              href="/cbse-class-10-previous-year-question-papers/"
              className="col-span-2 md:col-span-3 bg-gradient-to-r from-sky-600 to-cyan-500 rounded-xl shadow-lg p-5 hover:shadow-xl hover:from-sky-700 hover:to-cyan-600 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Previous Year Question Papers (PYQ)</h3>
                    <p className="text-sky-100 text-sm mt-0.5">
                      {pyqCount ? `${pyqCount}+ papers` : 'All subjects'} · All sets · Free PDF download
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>
          )}

          {subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/category/${cat}/${sub.slug}/`}
              className="bg-white rounded-lg shadow-md border p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{sub.name}</h3>
                  <p className="text-sm text-gray-500">{sub.count} items</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Articles */}
        {articles && articles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Recent {category} Articles
            </h2>
            <div className="space-y-4">
              {articles.slice(0, 10).map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}/`}
                  className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {article.type}
                        </span>
                        <span className="text-xs text-gray-500">{article.subject}</span>
                      </div>
                      <h3 className="font-medium text-gray-900">{article.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{article.excerpt}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
