import { Metadata } from 'next'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { ExamScheduleBox } from '@/components/ExamSchedule'
import { getArticles, getExamSchedules } from '@/lib/supabase'
import { TrendingUp, GraduationCap, ArrowRight, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Board Exam 2026 Papers & Answer Keys | BoardsWallah',
  description: 'Download Board Exam 2026 Question Papers & Answer Keys immediately after exams. Get CBSE Class 10 & 12 Board Paper 2026 with expert analysis. Fast & free!',
  keywords: 'Board Exam 2026, Board Paper 2026, CBSE, Class 10, Class 12, Question Papers, Answer Keys, Board Exams, Study Materials, NCERT',
  alternates: { canonical: 'https://boardswallah.com/' },
  openGraph: {
    type: 'website',
    url: 'https://boardswallah.com/',
    title: 'Board Exam 2026 Papers & Answer Keys | BoardsWallah',
    description: 'Download Board Paper 2026 & Answer Keys immediately after exams. CBSE Class 10 & 12 Board Exam 2026 resources with expert analysis.',
    images: [{ url: 'https://boardswallah.com/logo.svg' }],
    siteName: 'BoardsWallah',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Board Exam 2026 Papers & Answer Keys | BoardsWallah',
    description: 'Download Board Paper 2026 & Answer Keys immediately after exams.',
    images: ['https://boardswallah.com/logo.svg'],
  },
}

export const revalidate = 60 // re-render every 60s so new articles appear fast

export default async function HomePage() {
  // Fetch everything from Supabase in parallel
  const [
    { data: latestArticles },
    { data: class10Schedule },
    { data: class12Schedule },
    { data: class10Articles },
    { data: class12Articles },
  ] = await Promise.all([
    getArticles({ limit: 10 }),
    getExamSchedules('10'),
    getExamSchedules('12'),
    getArticles({ category: 'Class 10', limit: 3 }),
    getArticles({ category: 'Class 12', limit: 3 }),
  ])

  return (
    <Layout>
      {/* Desktop Ad Banner */}
      <div className="hidden md:block container mx-auto px-4 py-4 max-w-6xl">
        <div className="bg-gray-50 border border-gray-200 h-[90px] flex items-center justify-center text-gray-400 text-xs uppercase tracking-widest rounded-lg">
          <span>Advertisement (728×90)</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ─── Left Column (8 cols) ─── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Class Selector Cards */}
            <section>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/category/class-10/"
                  className="relative overflow-hidden rounded-2xl p-4 md:p-8 transition-all duration-300 border-2 bg-white border-gray-200 hover:border-sky-300 hover:shadow-md group"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white flex items-center justify-center mb-2 md:mb-4 shadow-lg group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-7 h-7 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 text-center">Class 10</h3>
                    <p className="hidden md:block text-sm text-gray-500 text-center">Board Exam Resources &amp; Study Materials</p>
                  </div>
                </Link>

                <Link
                  href="/category/class-12/"
                  className="relative overflow-hidden rounded-2xl p-4 md:p-8 transition-all duration-300 border-2 bg-white border-gray-200 hover:border-purple-300 hover:shadow-md group"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center mb-2 md:mb-4 shadow-lg group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-7 h-7 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 text-center">Class 12</h3>
                    <p className="hidden md:block text-sm text-gray-500 text-center">Board Exam Resources &amp; Study Materials</p>
                  </div>
                </Link>
              </div>
            </section>

            {/* Latest Updates — from Supabase */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-black" />
                  Latest Updates
                </h2>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {latestArticles && latestArticles.length > 0 ? (
                  latestArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}/`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs font-medium px-2 py-0.5 bg-sky-50 text-sky-700 rounded whitespace-nowrap">
                              {article.type}
                            </span>
                            <span className="text-xs text-gray-400">{article.subject}</span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-sky-600 transition-colors">
                            {article.title}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2 group-hover:text-sky-500 transition-colors" />
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No updates yet. Check back soon after exams!
                  </div>
                )}
              </div>
            </section>

            {/* In-article Ad */}
            <div className="bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs uppercase tracking-widest h-28 rounded-lg">
              <span>Advertisement (In-Article)</span>
            </div>

            {/* Quick Resource Links — driven by Supabase article counts */}
            <section className="grid sm:grid-cols-2 gap-4">
              {/* Class 10 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">10</span>
                  Class 10 Resources
                </h3>
                <ul className="space-y-3">
                  {class10Articles && class10Articles.length > 0 ? (
                    class10Articles.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={`/article/${article.slug}/`}
                          className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm group"
                        >
                          <span className="line-clamp-1">{article.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 flex-shrink-0 ml-2 transition-colors" />
                        </Link>
                      </li>
                    ))
                  ) : (
                    <>
                      <li><Link href="/category/class-10/question-papers/" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm group"><span>Science Question Papers</span><ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 transition-colors" /></Link></li>
                      <li><Link href="/category/class-10/answer-keys/" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm group"><span>Maths Answer Keys</span><ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 transition-colors" /></Link></li>
                      <li><Link href="/category/class-10/study-material/" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm group"><span>Social Science Notes</span><ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 transition-colors" /></Link></li>
                    </>
                  )}
                </ul>
              </div>

              {/* Class 12 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">12</span>
                  Class 12 Resources
                </h3>
                <ul className="space-y-3">
                  {class12Articles && class12Articles.length > 0 ? (
                    class12Articles.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={`/article/${article.slug}/`}
                          className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm group"
                        >
                          <span className="line-clamp-1">{article.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 flex-shrink-0 ml-2 transition-colors" />
                        </Link>
                      </li>
                    ))
                  ) : (
                    <>
                      <li><Link href="/category/class-12/answer-keys/" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm group"><span>Physics Answer Key</span><ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 transition-colors" /></Link></li>
                      <li><Link href="/category/class-12/question-papers/" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm group"><span>Accountancy Papers</span><ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 transition-colors" /></Link></li>
                      <li><Link href="/category/class-12/analysis/" className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm group"><span>Chemistry Analysis</span><ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-500 transition-colors" /></Link></li>
                    </>
                  )}
                </ul>
              </div>
            </section>
          </div>

          {/* ─── Right Sidebar (4 cols) ─── */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Sidebar Ad */}
            <div className="bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs uppercase tracking-widest h-[300px] rounded-lg">
              <span>Advertisement (Sidebar)</span>
            </div>

            {/* Exam Schedules from Supabase */}
            <ExamScheduleBox
              title="Class 10 Exam Schedule 2026"
              classNum="10"
              exams={class10Schedule || []}
            />
            <ExamScheduleBox
              title="Class 12 Exam Schedule 2026"
              classNum="12"
              exams={class12Schedule || []}
            />
          </aside>

        </div>
      </div>
    </Layout>
  )
}
