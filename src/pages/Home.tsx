import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AdUnit from '../components/AdUnit';
import ClassSelector from '../components/ClassSelector';
import { ArrowRight, FileText, Clock, TrendingUp } from 'lucide-react';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      });
  }, []);

  const featuredArticles = articles.slice(0, 4);

  return (
    <>
      <Helmet>
        <title>BoardsWallah - CBSE Board Exam Papers, Answer Keys & Analysis</title>
        <meta name="description" content="Download CBSE Class 10 & 12 Question Papers, Answer Keys, and Exam Analysis immediately after exams. Fast, reliable, and free for all students." />
        <link rel="canonical" href="https://boardswallah.com/" />
        <meta property="og:title" content="BoardsWallah - CBSE Board Exam Papers & Answer Keys" />
        <meta property="og:description" content="Download CBSE Class 10 & 12 Question Papers, Answer Keys, and Study Materials immediately after exams." />
        <meta property="og:url" content="https://boardswallah.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://boardswallah.com/logo.svg" />
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Class Selector - Beautiful Aesthetic Options */}
          <ClassSelector />

          {/* Hero Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp style={{ color: 'var(--color-primary)' }} size={20} />
                Latest Updates
              </h2>
              <span className="animate-pulse flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading updates...</div>
              ) : featuredArticles.length > 0 ? (
                featuredArticles.map((article) => (
                  <a href={`/article/${article.slug}`} target="_blank" rel="noopener noreferrer" key={article.id} className="block p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 mb-2 border border-gray-200">
                          {article.category}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-600 mb-2 leading-tight">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={14} /> {new Date(article.publishDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><FileText size={14} /> {article.type}</span>
                        </div>
                      </div>
                      <div className="hidden sm:block shrink-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <FileText size={32} />
                        </div>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No updates found.</div>
              )}
            </div>
          </section>

          <AdUnit slot="in-article" className="h-32 rounded-lg" />

          {/* Quick Links Grid */}
          <section className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--color-primary)' }}>10</span>
                Class 10 Resources
              </h3>
              <ul className="space-y-3">
                <li><Link to="/class/10" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm"><span>Science Question Papers</span> <ArrowRight size={14} /></Link></li>
                <li><Link to="/class/10" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm"><span>Maths Answer Keys</span> <ArrowRight size={14} /></Link></li>
                <li><Link to="/class/10" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm"><span>Social Science Notes</span> <ArrowRight size={14} /></Link></li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--color-primary)' }}>12</span>
                Class 12 Resources
              </h3>
              <ul className="space-y-3">
                <li><Link to="/class/12" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm"><span>Physics Answer Key</span> <ArrowRight size={14} /></Link></li>
                <li><Link to="/class/12" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm"><span>Accountancy Papers</span> <ArrowRight size={14} /></Link></li>
                <li><Link to="/class/12" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm"><span>Chemistry Analysis</span> <ArrowRight size={14} /></Link></li>
              </ul>
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <AdUnit slot="sidebar" className="h-[300px] rounded-lg" />
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Join Our Community</h3>
            <p className="text-sm text-gray-600 mb-4">Get instant notifications for Answer Keys via Telegram.</p>
            <button className="w-full text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>
              Join Telegram Channel
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Exam Schedule 2026</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <div className="flex-col flex items-center bg-gray-100 rounded p-1 min-w-[50px]">
                  <span className="text-xs font-bold text-gray-500">MAR</span>
                  <span className="text-lg font-bold text-gray-900">23</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Accountancy</p>
                  <p className="text-xs text-gray-500">Class 12 • 10:30 AM - 1:30 PM</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-col flex items-center bg-gray-100 rounded p-1 min-w-[50px]">
                  <span className="text-xs font-bold text-gray-500">MAR</span>
                  <span className="text-lg font-bold text-gray-900">25</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Business Studies</p>
                  <p className="text-xs text-gray-500">Class 12 • 10:30 AM - 1:30 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
