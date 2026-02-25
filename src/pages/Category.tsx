import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { articles } from '../data/mockData';
import AdUnit from '../components/AdUnit';
import { FileText, ArrowRight } from 'lucide-react';

export default function CategoryPage() {
  const { cat } = useParams();
  // Simple filter logic - in real app would be more robust
  const categoryName = cat?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const filteredArticles = articles.filter(a => 
    a.category.toLowerCase().replace(' ', '-') === cat || 
    a.subject.toLowerCase() === cat
  );

  return (
    <>
      <Helmet>
        <title>{categoryName} Resources | BoardsWallah</title>
        <meta name="description" content={`Download latest ${categoryName} question papers, answer keys, study materials and notes. Updated daily for CBSE Board Exams 2026.`} />
        <link rel="canonical" href={`https://boardswallah.com/category/${cat}`} />
        <meta property="og:title" content={`${categoryName} Resources | BoardsWallah`} />
        <meta property="og:description" content={`Download latest ${categoryName} question papers, answer keys, and study materials.`} />
        <meta property="og:url" content={`https://boardswallah.com/category/${cat}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://boardswallah.com/logo.svg" />
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">{categoryName} Resources</h1>
          
          {filteredArticles.length > 0 ? (
            <div className="space-y-6">
              {filteredArticles.map(article => (
                <div key={article.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                  <div className="hidden sm:flex shrink-0 w-20 h-20 bg-gray-100 rounded-lg items-center justify-center text-gray-500">
                    <FileText size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-black bg-gray-100 px-2 py-1 rounded">{article.type}</span>
                      <span className="text-xs text-gray-500">{new Date(article.publishDate).toLocaleDateString()}</span>
                    </div>
                    <Link to={`/article/${article.slug}`}>
                      <h2 className="text-xl font-bold text-gray-900 hover:text-gray-600 mb-2">{article.title}</h2>
                    </Link>
                    <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No articles found in this category yet.</p>
              <Link to="/" className="text-black font-bold mt-2 inline-block hover:underline">Browse All</Link>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <AdUnit slot="sidebar" className="h-[250px] rounded-lg" />
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Popular Subjects</h3>
            <ul className="space-y-2">
              <li><Link to="/category/class-12" className="flex justify-between items-center text-gray-700 hover:text-black p-2 hover:bg-gray-50 rounded">Class 12 Physics <ArrowRight size={14} /></Link></li>
              <li><Link to="/category/class-12" className="flex justify-between items-center text-gray-700 hover:text-black p-2 hover:bg-gray-50 rounded">Class 12 Accountancy <ArrowRight size={14} /></Link></li>
              <li><Link to="/category/class-10" className="flex justify-between items-center text-gray-700 hover:text-black p-2 hover:bg-gray-50 rounded">Class 10 Science <ArrowRight size={14} /></Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
