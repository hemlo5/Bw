import { Metadata } from 'next'
import Layout from '@/components/Layout'

export const metadata: Metadata = {
  title: 'Contact Us | Boards Wallah',
  description: 'Contact Boards Wallah for any queries, suggestions, or feedback regarding CBSE Board Exam materials and resources.',
  alternates: {
    canonical: 'https://boardswallah.com/contact/',
  },
}

export default function ContactPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
        
        <div className="prose prose-lg text-gray-600 space-y-4">
          <p>
            Have questions, suggestions, or feedback? We would love to hear from you. 
            Reach out to us and we will get back to you as soon as possible.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Get in Touch</h2>
            <p className="text-blue-800">
              Email: support@boardswallah.com
            </p>
          </div>
          
          <p className="mt-8">
            We typically respond within 24-48 hours during business days.
          </p>
        </div>
      </div>
    </Layout>
  )
}
