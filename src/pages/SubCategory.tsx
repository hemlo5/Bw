import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { articles as mockArticles } from '../data/mockData';
import { supabase, type Article } from '../lib/supabase';
import AdUnit from '../components/AdUnit';
import { FileText, Clock, ArrowRight, BookOpen, KeyRound, HelpCircle, BookMarked, FileCheck, GraduationCap } from 'lucide-react';

const subCategoryConfig: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  'question-papers': {
    title: 'Question Papers',
    description: 'Download previous year and current year board exam question papers',
    icon: <FileText size={24} />
  },
  'answer-keys': {
    title: 'Answer Keys',
    description: 'Official and unofficial solved answer keys for all subjects',
    icon: <KeyRound size={24} />
  },
  'important-questions': {
    title: 'Important Questions',
    description: 'Most likely questions that appear in board exams',
    icon: <HelpCircle size={24} />
  },
  'study-materials': {
    title: 'Study Materials',
    description: 'Notes, formulas, revision guides and reference materials',
    icon: <BookMarked size={24} />
  },
  'analysis': {
    title: 'Paper Analysis',
    description: 'Expert analysis of exam difficulty and question patterns',
    icon: <FileCheck size={24} />
  },
  'syllabus': {
    title: 'Syllabus',
    description: 'Latest CBSE syllabus and marking scheme',
    icon: <BookOpen size={24} />
  }
};

const subjectInfo: Record<string, { name: string; color: string }> = {
  'Science': { name: 'Science', color: 'bg-green-100 text-green-800' },
  'Maths': { name: 'Mathematics', color: 'bg-blue-100 text-blue-800' },
  'Social Science': { name: 'Social Science', color: 'bg-orange-100 text-orange-800' },
  'English': { name: 'English', color: 'bg-purple-100 text-purple-800' },
  'Hindi': { name: 'Hindi', color: 'bg-red-100 text-red-800' },
  'Sanskrit': { name: 'Sanskrit', color: 'bg-yellow-100 text-yellow-800' },
  'Computer': { name: 'Computer Science', color: 'bg-indigo-100 text-indigo-800' },
  'Physics': { name: 'Physics', color: 'bg-cyan-100 text-cyan-800' },
  'Chemistry': { name: 'Chemistry', color: 'bg-pink-100 text-pink-800' },
  'Biology': { name: 'Biology', color: 'bg-green-100 text-green-800' },
  'Accountancy': { name: 'Accountancy', color: 'bg-teal-100 text-teal-800' },
  'Business Studies': { name: 'Business Studies', color: 'bg-orange-100 text-orange-800' },
  'Economics': { name: 'Economics', color: 'bg-amber-100 text-amber-800' },
  'Computer Science': { name: 'Computer Science', color: 'bg-indigo-100 text-indigo-800' },
  'Physical Education': { name: 'Physical Education', color: 'bg-red-100 text-red-800' },
};

// Sample articles for new subcategories
const sampleArticles: Partial<Article>[] = [
  {
    id: 'sample-1',
    slug: 'cbse-class-10-science-important-questions-2026',
    title: 'CBSE Class 10 Science Important Questions 2026 - Chapterwise',
    category: 'Class 10',
    subject: 'Science',
    type: 'Important Questions',
    excerpt: 'Most important questions for CBSE Class 10 Science Board Exam 2026. Chemistry, Physics and Biology chapterwise questions with solutions.',
    content: '<p>Detailed content coming soon...</p>',
    tags: ['CBSE', 'Class 10', 'Science', 'Important Questions'],
    author: 'Boardswallah Team',
    publish_date: new Date().toISOString(),
    featured: true,
    views: 1250
  },
  {
    id: 'sample-2',
    slug: 'cbse-class-10-maths-study-material-notes',
    title: 'CBSE Class 10 Maths Quick Revision Notes & Formulas',
    category: 'Class 10',
    subject: 'Maths',
    type: 'Study Material',
    excerpt: 'Complete revision notes for Class 10 Maths including all formulas, theorems and quick reference guide.',
    content: '<p>Detailed content coming soon...</p>',
    tags: ['CBSE', 'Class 10', 'Maths', 'Study Material', 'Notes'],
    author: 'Boardswallah Team',
    publish_date: new Date().toISOString(),
    featured: false,
    views: 890
  },
  {
    id: 'sample-3',
    slug: 'cbse-class-12-physics-answer-key-2026',
    title: 'CBSE Class 12 Physics Answer Key 2026 - All Sets',
    category: 'Class 12',
    subject: 'Physics',
    type: 'Answer Key',
    excerpt: 'Unofficial answer key for CBSE Class 12 Physics 2026 exam. Set 1, 2, 3 solved by expert teachers.',
    content: '<p>Detailed content coming soon...</p>',
    tags: ['CBSE', 'Class 12', 'Physics', 'Answer Key'],
    author: 'Boardswallah Team',
    publish_date: new Date().toISOString(),
    featured: true,
    views: 2100
  },
  {
    id: 'sample-4',
    slug: 'cbse-class-12-accountancy-syllabus-2026',
    title: 'CBSE Class 12 Accountancy Syllabus 2026 - Download PDF',
    category: 'Class 12',
    subject: 'Accountancy',
    type: 'Syllabus',
    excerpt: 'Complete CBSE Class 12 Accountancy syllabus for 2026 with marking scheme and chapter weightage.',
    content: '<p>Detailed content coming soon...</p>',
    tags: ['CBSE', 'Class 12', 'Accountancy', 'Syllabus'],
    author: 'Boardswallah Team',
    publish_date: new Date().toISOString(),
    featured: false,
    views: 650
  },
  {
    id: 'sample-5',
    slug: 'cbse-class-12-chemistry-paper-analysis-2026',
    title: 'CBSE Class 12 Chemistry Paper Analysis 2026 - Difficulty Level',
    category: 'Class 12',
    subject: 'Chemistry',
    type: 'Analysis',
    excerpt: 'Complete analysis of CBSE Class 12 Chemistry 2026 paper. Student reactions, expert reviews and expected cutoff.',
    content: '<p>Detailed content coming soon...</p>',
    tags: ['CBSE', 'Class 12', 'Chemistry', 'Analysis'],
    author: 'Boardswallah Team',
    publish_date: new Date().toISOString(),
    featured: true,
    views: 1800
  }
];

export default function SubCategoryPage() {
  const { cat, subcat } = useParams<{ cat: string; subcat: string }>();
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const className = cat?.replace('class-', 'Class ') || '';
  const subCategoryKey = subcat || '';
  const config = subCategoryConfig[subCategoryKey];

  React.useEffect(() => {
    loadArticles();
  }, [cat, subcat]);

  const loadArticles = async () => {
    setIsLoading(true);
    
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', className)
      .ilike('type', config?.title || '%')
      .order('publish_date', { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to mock data + sample articles
      const filteredMock = mockArticles.filter(a => 
        a.category === className && 
        (a.type.toLowerCase().includes(subCategoryKey.replace('-', ' ')) ||
         config?.title.toLowerCase().includes(a.type.toLowerCase()))
      );
      
      // Add relevant sample articles
      const relevantSamples = sampleArticles.filter(a => 
        a.category === className && 
        (a.type?.toLowerCase().replace(' ', '-') === subCategoryKey ||
         subCategoryKey.includes(a.type?.toLowerCase().replace(' ', '-') || ''))
      ) as Article[];
      
      // Try localStorage
      const local = localStorage.getItem('articles');
      let localArticles: Article[] = [];
      if (local) {
        try {
          const parsed = JSON.parse(local);
          localArticles = parsed.filter((a: Article) => 
            a.category === className && 
            (a.type.toLowerCase().replace(' ', '-') === subCategoryKey ||
             subCategoryKey.includes(a.type.toLowerCase().replace(' ', '-')))
          );
        } catch {}
      }
      
      setArticles([...filteredMock, ...relevantSamples, ...localArticles]);
    } else {
      setArticles(data);
    }
    
    setIsLoading(false);
  };

  if (!config) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900">Category Not Found</h1>
        <Link to="/" className="text-blue-600 hover:underline mt-4 block">Go Home</Link>
      </div>
    );
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "headline": `${config.title} - ${className}`,
    "description": config.description,
    "url": `https://boardswallah.com/category/${cat}/${subcat}`
  };

  return (
    <>
      <Helmet>
        <title>{config.title} - {className} | Boardswallah</title>
        <meta name="description" content={config.description} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${cat}`} className="hover:text-black">{className}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{config.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600">{className} Board Exam Resources</p>
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl">{config.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <AdUnit slot="in-article" className="h-32 rounded-lg" />

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600 mb-4">We're working on adding {config.title.toLowerCase()} for {className}.</p>
              <p className="text-sm text-gray-500">Check back soon or visit the admin panel to add content.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${subjectInfo[article.subject]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {article.subject}
                        </span>
                        <span className="px-2 py-1 bg-black text-white rounded text-xs font-semibold">
                          {article.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(article.publish_date || article.publishDate || Date.now()).toLocaleDateString()}
                        </span>
                        {article.views && (
                          <span>{article.views.toLocaleString()} views</span>
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:block shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-gray-200 transition-colors">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <AdUnit slot="in-article" className="h-32 rounded-lg" />
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <AdUnit slot="sidebar" className="h-[300px] rounded-lg" />

          {/* Quick Links */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Other Resources</h3>
            <ul className="space-y-3">
              {Object.entries(subCategoryConfig)
                .filter(([key]) => key !== subCategoryKey)
                .map(([key, value]) => (
                  <li key={key}>
                    <Link 
                      to={`/category/${cat}/${key}`}
                      className="flex items-center justify-between text-gray-700 hover:text-black font-medium text-sm py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {value.icon}
                        {value.title}
                      </span>
                      <ArrowRight size={14} />
                    </Link>
                  </li>
                ))
              }
            </ul>
          </div>

          {/* Related Subjects */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Browse by Subject</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(subjectInfo).map(([key, value]) => (
                <Link
                  key={key}
                  to={`/category/${cat}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${value.color} hover:opacity-80 transition-opacity`}
                >
                  {value.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Study Tips */}
          <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-xl">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <BookOpen size={20} />
              Study Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">1.</span>
                Practice previous year papers regularly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">2.</span>
                Focus on NCERT books first
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">3.</span>
                Revise formulas daily
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">4.</span>
                Take mock tests seriously
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
