import { Metadata } from 'next'
import Layout from '@/components/Layout'

export const metadata: Metadata = {
  title: 'About Us | Boards Wallah',
  description: 'Learn about Boards Wallah - your trusted source for CBSE Board Exam preparation materials, question papers, and study resources.',
  alternates: {
    canonical: 'https://boardswallah.com/about/',
  },
}

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Boards Wallah</h1>
        
        <div className="prose prose-lg text-gray-600 space-y-4">
          <p>
            Boards Wallah is a dedicated platform for CBSE students preparing for their Class 10 and Class 12 Board Examinations. 
            We provide comprehensive study materials including previous year question papers, answer keys, detailed analysis, 
            and important questions to help students excel in their exams.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p>
            Our mission is to make quality educational resources accessible to all CBSE students across India. 
            We believe that every student deserves access to the best preparation materials to achieve their academic goals.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">What We Offer</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Previous year question papers for all subjects</li>
            <li>Detailed answer keys and solutions</li>
            <li>Exam analysis and pattern insights</li>
            <li>Important questions for quick revision</li>
            <li>Latest syllabus updates</li>
            <li>Study materials and notes</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
          <p>
            Have questions or suggestions? Feel free to reach out to us through our <a href="/contact/" className="text-blue-600 hover:underline">contact page</a>.
          </p>
        </div>
      </div>
    </Layout>
  )
}
