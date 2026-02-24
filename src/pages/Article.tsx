import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { articles } from '../data/mockData';
import AdUnit from '../components/AdUnit';
import { Calendar, User, Share2, Download, AlertTriangle } from 'lucide-react';

export default function ArticlePage() {
  const { slug } = useParams();
  const article = articles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900">Article Not Found</h1>
        <Link to="/" className="text-blue-600 hover:underline mt-4 block">Go Home</Link>
      </div>
    );
  }

  // Schema Markup for Article
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": ["https://picsum.photos/1200/675"], // Placeholder
    "datePublished": article.publishDate,
    "dateModified": article.publishDate,
    "author": [{
      "@type": "Person",
      "name": article.author,
      "url": "https://boardswallah.in/author/team"
    }]
  };

  return (
    <>
      <Helmet>
        <title>{article.title} - Boardswallah</title>
        <meta name="description" content={article.excerpt} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${article.category.toLowerCase().replace(' ', '-')}`} className="hover:text-black">{article.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium truncate">{article.subject}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <article className="lg:col-span-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex gap-2 mb-4">
              <span className="px-2 py-1 bg-black text-white text-xs font-bold rounded uppercase tracking-wider">
                {article.type}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded uppercase tracking-wider">
                {article.subject}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-6">
              <span className="flex items-center gap-1">
                <User size={16} /> {article.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} /> {new Date(article.publishDate).toLocaleDateString()}
              </span>
              <button className="ml-auto flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-full transition-colors">
                <Share2 size={16} /> Share
              </button>
            </div>
          </header>

          {/* Ad Slot - Top of Content */}
          <AdUnit slot="in-article" className="mb-8 h-24 rounded" />

          {/* Article Content */}
          <div 
            className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:text-gray-900 prose-p:text-gray-700 prose-a:text-black hover:prose-a:text-gray-600"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <Link to={`/tag/${tag.toLowerCase()}`} key={tag} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Author Box */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl flex items-start gap-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
              B
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Boardswallah Expert Team</h4>
              <p className="text-sm text-gray-600 mt-1">Our team consists of experienced teachers and board exam analysts dedicated to providing accurate and timely resources for students.</p>
            </div>
          </div>

        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-24 space-y-8">
            <AdUnit slot="sidebar" className="h-[600px] rounded-lg" />
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-500" />
                Important Notice
              </h3>
              <p className="text-sm text-gray-600">
                We do not support or promote cheating. All papers are uploaded <strong>after</strong> the exam concludes for educational analysis only.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
