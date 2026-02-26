import { Metadata } from 'next'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { getArticles } from '@/lib/supabase'
import { ChevronRight, FileText } from 'lucide-react'

interface Props {
  params: Promise<{ cat: string; subcat: string }>
}

const subcategoryLabels: Record<string, string> = {
  'question-papers': 'Question Papers',
  'answer-keys': 'Answer Keys',
  'important-questions': 'Important Questions',
  'analysis': 'Analysis',
  'study-material': 'Study Material',
  'syllabus': 'Syllabus',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat, subcat } = await params
  const category = cat === 'class-10' ? 'Class 10' : 'Class 12'
  const subcategoryLabel = subcategoryLabels[subcat] || subcat

  return {
    title: `${category} ${subcategoryLabel} 2026 | CBSE Board`,
    description: `Get ${category} CBSE ${subcategoryLabel} for Board Exam 2026. Download all subjects ${subcategoryLabel.toLowerCase()} and study materials.`,
    alternates: {
      canonical: `https://boardswallah.com/category/${cat}/${subcat}/`,
    },
  }
}


export const revalidate = 3600

export default async function SubCategoryPage({ params }: Props) {
  const { cat, subcat } = await params
  const category = cat === 'class-10' ? 'Class 10' : 'Class 12'
  const typeLabel = subcategoryLabels[subcat] || subcat

  // Map URL slug to database type
  const typeMap: Record<string, string> = {
    'question-papers': 'Question Paper',
    'answer-keys': 'Answer Key',
    'important-questions': 'Important Questions',
    'analysis': 'Analysis',
    'study-material': 'Study Material',
    'syllabus': 'Syllabus',
  }

  const { data: articles } = await getArticles({
    category,
    type: typeMap[subcat]
  })

  // Group by subject
  const articlesBySubject = articles?.reduce((acc, article) => {
    const subject = article.subject
    if (!acc[subject]) acc[subject] = []
    acc[subject].push(article)
    return acc
  }, {} as Record<string, typeof articles>) || {}

  const subjects = Object.keys(articlesBySubject).sort()

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href={`/category/${cat}/`} className="hover:text-blue-600">{category}</Link></li>
            <li>/</li>
            <li className="text-gray-900">{typeLabel}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category} {typeLabel} 2026
          </h1>
          <p className="text-gray-600">
            Access {category} CBSE Board Exam {typeLabel.toLowerCase()} for all subjects.
          </p>
        </div>

        {/* Subject Sections */}
        <div className="space-y-12">
          {subjects.map((subject) => (
            <section key={subject}>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{subject}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articlesBySubject[subject]?.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}/`}
                    className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{article.title}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(article.publish_date).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No {typeLabel.toLowerCase()} found for {category}.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
