import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { articles } from '../data/mockData';
import { Archive, Download } from 'lucide-react';

export default function ArchivePage() {
  // Group by year (mock logic)
  const years = ['2025', '2024', '2023'];

  return (
    <>
      <Helmet>
        <title>Previous Year Question Papers Archive - Boardswallah</title>
        <meta name="description" content="Download CBSE Class 10 & 12 Previous Year Question Papers (2015-2025) PDF." />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Question Paper Archive</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Access the largest collection of previous year board exam papers. Practicing these is the best way to score 90%+ in your exams.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {years.map(year => (
            <div key={year} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 text-black rounded-lg flex items-center justify-center">
                  <Archive size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{year} Papers</h2>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link to={`/category/class-12`} className="flex items-center justify-between text-sm text-gray-700 hover:text-black group">
                    <span>Class 12 All Subjects</span>
                    <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link to={`/category/class-10`} className="flex items-center justify-between text-sm text-gray-700 hover:text-black group">
                    <span>Class 10 All Subjects</span>
                    <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 p-8 rounded-xl text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Need older papers?</h3>
          <p className="text-gray-600 mb-6">We have archives dating back to 2010 available on request.</p>
          <button className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800">Request Paper</button>
        </div>
      </div>
    </>
  );
}
