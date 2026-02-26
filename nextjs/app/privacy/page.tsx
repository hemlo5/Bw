import { Metadata } from 'next'
import Layout from '@/components/Layout'

export const metadata: Metadata = {
  title: 'Privacy Policy | Boards Wallah',
  description: 'Privacy Policy for Boards Wallah - Learn how we handle your data and protect your privacy.',
  alternates: {
    canonical: 'https://boardswallah.com/privacy/',
  },
}

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg text-gray-600 space-y-4">
          <p>
            At Boards Wallah, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, and protect your information when you use our website.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
          <p>
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Usage data (pages visited, time spent on site)</li>
            <li>Device and browser information</li>
            <li>IP address and location data (for analytics)</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
          <p>
            We use the collected information to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Improve our website and user experience</li>
            <li>Analyze traffic and usage patterns</li>
            <li>Provide relevant content and resources</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Third-Party Services</h2>
          <p>
            We may use third-party services such as Google Analytics and Google AdSense. 
            These services may collect information as governed by their own privacy policies.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page.
          </p>
          
          <p className="mt-8">
            Last updated: February 2026
          </p>
        </div>
      </div>
    </Layout>
  )
}
