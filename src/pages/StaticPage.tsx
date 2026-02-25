import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// SEO descriptions for static pages
const pageDescriptions: Record<string, string> = {
  'About Us': 'Learn about BoardsWallah - Indias fastest growing education portal for CBSE Board Exam resources. Question papers, answer keys, and study materials.',
  'Privacy Policy': 'BoardsWallah Privacy Policy - How we handle your data, cookies, and third-party services. Your privacy is important to us.',
  'Contact Us': 'Contact BoardsWallah for questions, feedback, or DMCA requests. Email us at contact@boardswallah.in',
  'Disclaimer': 'BoardsWallah Disclaimer - We are not affiliated with CBSE, ICSE, or any government body. All papers are for educational analysis only.',
};

export default function StaticPage({ title, content }: { title: string, content: string }) {
  const location = useLocation();
  const canonicalUrl = `https://boardswallah.com${location.pathname}`;
  const description = pageDescriptions[title] || `${title} - BoardsWallah`;

  return (
    <>
      <Helmet>
        <title>{title} | BoardsWallah</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${title} | BoardsWallah`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
        <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </>
  );
}
