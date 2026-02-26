'use client'

import Link from 'next/link'
import { GraduationCap, BookOpen, FileText, HelpCircle, Newspaper, Star } from 'lucide-react'

const subcategories = {
  'class-10': [
    { name: 'Question Papers', slug: 'question-papers', icon: FileText },
    { name: 'Answer Keys', slug: 'answer-keys', icon: BookOpen },
    { name: 'Important Questions', slug: 'important-questions', icon: HelpCircle },
    { name: 'Analysis', slug: 'analysis', icon: Newspaper },
    { name: 'Study Material', slug: 'study-material', icon: BookOpen },
    { name: 'Syllabus', slug: 'syllabus', icon: Star },
  ],
  'class-12': [
    { name: 'Question Papers', slug: 'question-papers', icon: FileText },
    { name: 'Answer Keys', slug: 'answer-keys', icon: BookOpen },
    { name: 'Important Questions', slug: 'important-questions', icon: HelpCircle },
    { name: 'Analysis', slug: 'analysis', icon: Newspaper },
    { name: 'Study Material', slug: 'study-material', icon: BookOpen },
    { name: 'Syllabus', slug: 'syllabus', icon: Star },
  ],
}

export default function ClassSelector() {
  return (
    <section className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-6">Choose Your Class</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Class 10 */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/category/class-10/"
              className="block h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Class 10</h3>
                  <p className="text-blue-100 text-xs">CBSE Board</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Class 12 */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/category/class-12/"
              className="block h-full bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Class 12</h3>
                  <p className="text-emerald-100 text-xs">CBSE Board</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <Link
              href="/archive/"
              className="flex items-center gap-2 bg-white border rounded-lg p-3 hover:border-blue-300 transition-colors"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Previous Papers</span>
            </Link>
            <Link
              href="/category/class-10/syllabus/"
              className="flex items-center gap-2 bg-white border rounded-lg p-3 hover:border-blue-300 transition-colors"
            >
              <Star className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Latest Syllabus</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
