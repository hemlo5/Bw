import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArticlePage from './pages/Article';
import StaticPage from './pages/StaticPage';
import CategoryPage from './pages/Category';
import ArchivePage from './pages/Archive';
import AdminPanel from './pages/Admin/AdminPanel';
import SubCategoryPage from './pages/SubCategory';

// Static Content Data
const aboutContent = `
  <p>Welcome to <strong>Boardswallah</strong>, your trusted companion for Board Exam preparation and analysis.</p>
  <p>We are a team of educators and tech enthusiasts dedicated to making exam resources accessible to every student in India. Our mission is to provide the fastest and most accurate updates on Question Papers, Answer Keys, and Exam Analysis.</p>
  <h3>What We Offer</h3>
  <ul>
    <li><strong>Instant Question Papers:</strong> High-quality PDF scans uploaded minutes after the exam.</li>
    <li><strong>Reliable Answer Keys:</strong> Solved by subject matter experts.</li>
    <li><strong>Unbiased Analysis:</strong> Real student reactions and difficulty level assessment.</li>
  </ul>
  <p><em>Note: We are an independent platform and not affiliated with CBSE, ICSE, or any government body.</em></p>
`;

const privacyContent = `
  <p><strong>Last Updated: March 2026</strong></p>
  <p>At Boardswallah, we take your privacy seriously. This policy outlines how we handle your data.</p>
  <h3>Information We Collect</h3>
  <p>We do not collect personal information unless you voluntarily subscribe to our newsletter. We use cookies for analytics and ad personalization (via Google AdSense).</p>
  <h3>Third-Party Services</h3>
  <p>We use third-party vendors like Google Analytics and Google AdSense. These vendors may use cookies to serve ads based on your prior visits to our website.</p>
`;

const contactContent = `
  <p>Have a question or want to share a question paper?</p>
  <p>Email us at: <strong>contact@boardswallah.in</strong></p>
  <h3>For DMCA / Copyright Issues</h3>
  <p>If you believe any content violates your copyright, please email us with the subject line "Copyright Takedown" and we will address it within 24 hours.</p>
`;

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            
            {/* Dynamic Category Routes */}
            <Route path="/category/:cat" element={<CategoryPage />} />
            <Route path="/category/:cat/:subcat" element={<SubCategoryPage />} />
            <Route path="/archive" element={<ArchivePage />} />

            {/* Admin Panel */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* Static Pages */}
            <Route path="/about" element={<StaticPage title="About Us" content={aboutContent} />} />
            <Route path="/privacy" element={<StaticPage title="Privacy Policy" content={privacyContent} />} />
            <Route path="/contact" element={<StaticPage title="Contact Us" content={contactContent} />} />
            <Route path="/disclaimer" element={<StaticPage title="Disclaimer" content={aboutContent} />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  );
}
