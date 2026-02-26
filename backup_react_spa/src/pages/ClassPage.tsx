import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import AdUnit from '../components/AdUnit';
import { FileText, ArrowRight, Book, HelpCircle, CheckCircle } from 'lucide-react';
import { Article } from '../data/mockData';

export default function ClassPage() {
  const { classId } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data.filter((a: Article) => a.category === `Class ${classId}`));
        setLoading(false);
      });
  }, [classId]);

  const categories = [
    { name: 'Board Answer Keys', icon: <CheckCircle size={20} />, type: 'Answer Key' },
    { name: 'Important Questions', icon: <HelpCircle size={20} />, type: 'Important Questions' },
    { name: 'Study Materials', icon: <Book size={20} />, type: 'Study Material' },
    { name: 'Question Papers', icon: <FileText size={20} />, type: 'Question Paper' },
  ];

  return (
    <>
      <Helmet>
        <title>Class {classId} Board Exam Resources - Boardswallah</title>
        <meta name="description" content={`Download latest Class ${classId} question papers, answer keys, and study materials.`} />
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Class {classId} Resources</h1>
          
          {/* Resource Categories Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {categories.map(cat => (
              <div key={cat.name} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-black transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 text-white rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--color-primary)' }}>
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-gray-900">{cat.name}</h3>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Updates for Class {classId}</h2>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : articles.length > 0 ? (
            <div className="space-y-6">
              {articles.map(article => (
                <div key={article.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                  <div className="hidden sm:flex shrink-0 w-20 h-20 bg-gray-100 rounded-lg items-center justify-center text-gray-500">
                    <FileText size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-white px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-primary)' }}>{article.type}</span>
                      <span className="text-xs text-gray-500">{new Date(article.publishDate).toLocaleDateString()}</span>
                    </div>
                    {/* Open in new tab for SEO/Internet searchability */}
                    <a href={`/article/${article.slug}`} target="_blank" rel="noopener noreferrer">
                      <h2 className="text-xl font-bold text-gray-900 hover:text-gray-600 mb-2">{article.title}</h2>
                    </a>
                    <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No articles found in this category yet.</p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <AdUnit slot="sidebar" className="h-[250px] rounded-lg" />
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Popular Subjects</h3>
            <ul className="space-y-2">
              <li><Link to={`/category/class-${classId}`} className="flex justify-between items-center text-gray-700 hover:text-black p-2 hover:bg-gray-50 rounded">Science / Physics <ArrowRight size={14} /></Link></li>
              <li><Link to={`/category/class-${classId}`} className="flex justify-between items-center text-gray-700 hover:text-black p-2 hover:bg-gray-50 rounded">Mathematics <ArrowRight size={14} /></Link></li>
              <li><Link to={`/category/class-${classId}`} className="flex justify-between items-center text-gray-700 hover:text-black p-2 hover:bg-gray-50 rounded">Social Science <ArrowRight size={14} /></Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
