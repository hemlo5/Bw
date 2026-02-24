import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function StaticPage({ title, content }: { title: string, content: string }) {
  return (
    <>
      <Helmet>
        <title>{title} - Boardswallah</title>
      </Helmet>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
        <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </>
  );
}
