import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import { getArticleBySlug } from '@/lib/supabase'

interface Props {
  params: Promise<{ slug: string }>
}


// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: article } = await getArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: `${article.title} | Boards Wallah`,
    description: article.excerpt,
    keywords: `${article.subject}, ${article.type}, CBSE ${article.category}, Board Exam 2026`,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://boardswallah.com/article/${article.slug}/`,
      siteName: 'Boards Wallah',
      locale: 'en_IN',
      type: 'article',
      publishedTime: article.publish_date,
      images: [{
        url: 'https://boardswallah.com/logo.svg',
        width: 1200,
        height: 630,
        alt: article.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: ['https://boardswallah.com/logo.svg'],
    },
    alternates: {
      canonical: `https://boardswallah.com/article/${article.slug}/`,
    },
  }
}


export const revalidate = 3600

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const { data: article } = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  // JSON-LD: Article (tells Google it's a news/educational article)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: 'https://boardswallah.com/logo.svg',
    author: { '@type': 'Person', name: article.author },
    datePublished: article.publish_date,
    dateModified: article.updated_at || article.publish_date,
    publisher: {
      '@type': 'Organization',
      name: 'Boards Wallah',
      logo: { '@type': 'ImageObject', url: 'https://boardswallah.com/logo.svg' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://boardswallah.com/article/${article.slug}/`,
    },
  }

  // JSON-LD: Breadcrumbs (shows "Home > Class 12 > Article" under Google result)
  const categorySlug = article.category.toLowerCase().replace(' ', '-')
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://boardswallah.com/' },
      { '@type': 'ListItem', position: 2, name: article.category, item: `https://boardswallah.com/category/${categorySlug}/` },
      { '@type': 'ListItem', position: 3, name: article.title },
    ],
  }

  return (
    <Layout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:text-blue-600">Home</a></li>
            <li>/</li>
            <li><a href={`/category/${article.category.toLowerCase().replace(' ', '-')}/`} className="hover:text-blue-600">{article.category}</a></li>
            <li>/</li>
            <li className="text-gray-900">{article.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {article.type}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {article.subject}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>By {article.author}</span>
            <span>•</span>
            <time dateTime={article.publish_date}>
              {new Date(article.publish_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
            {article.views > 0 && (
              <>
                <span>•</span>
                <span>{article.views} views</span>
              </>
            )}
          </div>
        </header>

        {/* PDF Download */}
        {article.pdf_url && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Download PDF</h3>
                {article.pdf_size && (
                  <p className="text-sm text-blue-700">File size: {article.pdf_size}</p>
                )}
              </div>
              <a
                href={article.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </Layout>
  )
}
