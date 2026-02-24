import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Zap, Smartphone, Search, Layout, Bell, Shield, Globe, Database, Share2 } from 'lucide-react';

export default function WebmasterDocs() {
  return (
    <>
      <Helmet>
        <title>Webmaster Strategy Guide - Boardswallah</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Webmaster Strategy & Implementation Guide</h1>
          <p className="text-lg text-gray-600">Comprehensive documentation for maintaining and growing the Boardswallah portal.</p>
        </header>

        <div className="space-y-12">
          
          {/* Section 1: Technical SEO */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Search className="text-black" />
              SEO & URL Structure
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">URL Structure Format</h3>
                <code className="block bg-black text-green-400 p-4 rounded-lg text-sm mb-2">
                  /class-12/subject/question-paper-2026-set-code<br/>
                  /class-10/subject/answer-key-2026
                </code>
                <p className="text-gray-600 text-sm">Keep URLs flat where possible, or strictly hierarchical by Class &gt; Subject. Avoid dates in URL structure (use them in slugs) to allow evergreen updates if needed, though for exam papers, specific years in slugs are better for long-tail search.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Schema Markup Strategy</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong>NewsArticle:</strong> For live updates and answer keys (triggers Top Stories).</li>
                  <li><strong>FAQPage:</strong> For "How to download" and "Exam difficulty" sections.</li>
                  <li><strong>BreadcrumbList:</strong> Essential for site hierarchy understanding.</li>
                  <li><strong>Organization:</strong> On the homepage for brand authority.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Internal Linking</h3>
                <p className="text-gray-600">Link "Question Paper" pages to "Answer Key" pages and vice-versa immediately in the first paragraph. Create "Hub Pages" for each subject (e.g., "Class 12 Accountancy Hub") that links to all years' papers.</p>
              </div>
            </div>
          </section>

          {/* Section 2: Performance */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Zap className="text-yellow-500" />
              Speed & Mobile Optimization
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Speed Checklist</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Cache static assets (PDFs) on CDN.</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Lazy load all images and ad units.</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Minify CSS/JS (Vite handles this).</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Use WebP for thumbnails.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Mobile First</h3>
                <p className="text-gray-600 text-sm">90% of traffic will be mobile. Ensure touch targets are 44px+. Ad units must not push content below the fold excessively (CLS penalty).</p>
              </div>
            </div>
          </section>

          {/* Section 3: Monetization & Growth */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Database className="text-green-600" />
              Monetization & Engagement
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Ad Placement Strategy</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong>Header:</strong> 728x90 (Desktop) / 320x50 (Mobile) - Sticky if possible.</li>
                  <li><strong>In-Article:</strong> After 1st paragraph (High CTR) and before Download button.</li>
                  <li><strong>Sidebar:</strong> 300x600 Sticky for desktop users.</li>
                  <li><strong>Anchor:</strong> Bottom sticky ad for mobile.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Push & Telegram Strategy</h3>
                <p className="text-gray-600 mb-2"><strong>Telegram:</strong> Create a channel "Boardswallah Official". Post PDF files directly there 1 hour after website upload (drive traffic to site first). Use a bot to auto-post links.</p>
                <p className="text-gray-600"><strong>Push Notifications:</strong> Use OneSignal. Send alerts only for: 1. Paper Released, 2. Answer Key Released, 3. Result Declared. Do not spam.</p>
              </div>
            </div>
          </section>

          {/* Section 4: Workflow */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Layout className="text-purple-600" />
              Live Exam Day Workflow
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <ol className="relative border-l border-gray-300 ml-3 space-y-8">
                <li className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-black rounded-full -left-3 ring-8 ring-white text-white text-xs">
                    1
                  </span>
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">10:00 AM - Pre-Exam Post</h3>
                  <p className="mb-4 text-base font-normal text-gray-500">Publish "Exam Analysis Live Updates" placeholder page. Index it immediately.</p>
                </li>
                <li className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-black rounded-full -left-3 ring-8 ring-white text-white text-xs">
                    2
                  </span>
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">1:30 PM - Exam Ends</h3>
                  <p className="mb-4 text-base font-normal text-gray-500">Collect student reactions via Twitter/Telegram. Update "Analysis" section of the page.</p>
                </li>
                <li className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-black rounded-full -left-3 ring-8 ring-white text-white text-xs">
                    3
                  </span>
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">2:00 PM - Paper Upload</h3>
                  <p className="mb-4 text-base font-normal text-gray-500">Scan paper (CamScanner/Adobe Scan). Compress PDF. Upload to site. Send Telegram Alert.</p>
                </li>
                <li className="ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-black rounded-full -left-3 ring-8 ring-white text-white text-xs">
                    4
                  </span>
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">3:00 PM - Answer Key</h3>
                  <p className="mb-4 text-base font-normal text-gray-500">Subject experts solve MCQs. Update table in real-time. Send Push Notification.</p>
                </li>
              </ol>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
