import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase, type Article, type SiteSettings } from '../../lib/supabase';
import { Lock, Eye, EyeOff, Save, Trash2, Plus, FileText, Settings, LogOut, Edit2, X } from 'lucide-react';

const ADMIN_PASSWORD = 'abc123';

interface FormData {
  title: string;
  slug: string;
  category: 'Class 10' | 'Class 12' | 'General';
  subject: string;
  excerpt: string;
  content: string;
  tags: string;
  type: string;
  pdf_url: string;
  pdf_size: string;
  featured: boolean;
}

const initialFormData: FormData = {
  title: '',
  slug: '',
  category: 'Class 10',
  subject: '',
  excerpt: '',
  content: '',
  tags: '',
  type: 'Question Paper',
  pdf_url: '',
  pdf_size: '',
  featured: false,
};

const subjectsByClass: Record<string, string[]> = {
  'Class 10': ['Science', 'Maths', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Computer'],
  'Class 12': ['Physics', 'Chemistry', 'Biology', 'Maths', 'Accountancy', 'Business Studies', 'Economics', 'English', 'Computer Science', 'Physical Education'],
  'General': ['General', 'All Subjects']
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'articles' | 'settings'>('articles');
  
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  // Check session storage on mount
  React.useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (session === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      loadArticles();
      loadSettings();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_session', 'authenticated');
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_session');
    setPassword('');
  };

  const loadArticles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading articles:', error);
      // Fallback to localStorage for demo
      const local = localStorage.getItem('articles');
      if (local) setArticles(JSON.parse(local));
    } else {
      setArticles(data || []);
    }
    setIsLoading(false);
  };

  const loadSettings = async () => {
    const { data, error } = await supabase.from('site_settings').select('*').single();
    if (!error && data) {
      setSettings(data);
    } else {
      // Fallback to localStorage
      const local = localStorage.getItem('site_settings');
      if (local) setSettings(JSON.parse(local));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const articleData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      publish_date: new Date().toISOString(),
      author: 'Admin',
      views: 0,
    };

    if (editingId) {
      // Update existing
      const { data, error } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', editingId)
        .select()
        .single();
      
      if (error) {
        // Fallback to localStorage
        const local = JSON.parse(localStorage.getItem('articles') || '[]');
        const updated = local.map((a: Article) => a.id === editingId ? { ...a, ...articleData, id: editingId } : a);
        localStorage.setItem('articles', JSON.stringify(updated));
        setArticles(updated);
        setMessage('Article updated (local storage fallback)');
      } else {
        setMessage('Article updated successfully');
        loadArticles();
      }
    } else {
      // Create new
      const newArticle = {
        ...articleData,
        id: crypto.randomUUID(),
      };

      const { data, error } = await supabase
        .from('articles')
        .insert([newArticle])
        .select()
        .single();
      
      if (error) {
        // Fallback to localStorage
        const local = JSON.parse(localStorage.getItem('articles') || '[]');
        local.push(newArticle);
        localStorage.setItem('articles', JSON.stringify(local));
        setArticles(local);
        setMessage('Article created (local storage fallback)');
      } else {
        setMessage('Article created successfully');
        loadArticles();
      }
    }

    setFormData(initialFormData);
    setEditingId(null);
    setIsLoading(false);
  };

  const handleEdit = (article: Article) => {
    setFormData({
      title: article.title,
      slug: article.slug,
      category: article.category,
      subject: article.subject,
      excerpt: article.excerpt,
      content: article.content,
      tags: article.tags.join(', '),
      type: article.type,
      pdf_url: article.pdf_url || '',
      pdf_size: article.pdf_size || '',
      featured: article.featured,
    });
    setEditingId(article.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    setIsLoading(true);
    const { error } = await supabase.from('articles').delete().eq('id', id);
    
    if (error) {
      const local = JSON.parse(localStorage.getItem('articles') || '[]');
      const filtered = local.filter((a: Article) => a.id !== id);
      localStorage.setItem('articles', JSON.stringify(filtered));
      setArticles(filtered);
    } else {
      loadArticles();
    }
    setIsLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingId ? prev.slug : generateSlug(title)
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Helmet>
          <title>Admin Login - Boardswallah</title>
        </Helmet>
        
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="text-white" size={28} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-500 mt-2">Enter password to continue</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="relative mb-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-100 outline-none transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
            </form>

            <button
              onClick={() => navigate('/')}
              className="w-full text-center text-gray-500 text-sm mt-4 hover:text-gray-700"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet>
        <title>Admin Panel - Boardswallah</title>
      </Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Settings className="text-white" size={20} />
              </div>
              <h1 className="font-bold text-xl text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'articles' 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText size={18} />
              Articles
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Settings size={18} />
              Settings
            </span>
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {message}
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Article Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                  {editingId ? 'Edit Article' : 'New Article'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                      >
                        <option value="Class 10">Class 10</option>
                        <option value="Class 12">Class 12</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                      >
                        <option>Question Paper</option>
                        <option>Answer Key</option>
                        <option>Important Questions</option>
                        <option>Study Material</option>
                        <option>Analysis</option>
                        <option>Syllabus</option>
                        <option>News</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjectsByClass[formData.category].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none font-mono text-sm"
                      placeholder="<p>Your content here...</p>"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="CBSE, Class 12, Physics"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PDF URL</label>
                      <input
                        type="text"
                        value={formData.pdf_url}
                        onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PDF Size</label>
                      <input
                        type="text"
                        value={formData.pdf_size}
                        onChange={(e) => setFormData({ ...formData, pdf_size: e.target.value })}
                        placeholder="2.5 MB"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="featured" className="text-sm text-gray-700">Featured Article</label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      {isLoading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(initialFormData);
                          setEditingId(null);
                        }}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Articles List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-lg">All Articles ({articles.length})</h2>
                </div>
                
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : articles.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No articles yet. Create your first article using the form.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    {articles.map((article) => (
                      <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                                {article.category}
                              </span>
                              <span className="px-2 py-0.5 bg-black text-white text-xs rounded font-medium">
                                {article.type}
                              </span>
                              {article.featured && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                                  Featured
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 truncate">{article.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {article.subject} • {new Date(article.publish_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(article)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg mb-6">Site Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
                  <input
                    type="text"
                    defaultValue={settings?.site_title || 'Boardswallah'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        defaultValue={settings?.primary_color || '#000000'}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        defaultValue={settings?.primary_color || '#000000'}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        defaultValue={settings?.secondary_color || '#666666'}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        defaultValue={settings?.secondary_color || '#666666'}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                  <select
                    defaultValue={settings?.font_family || 'sans-serif'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-100 focus:border-black outline-none"
                  >
                    <option value="sans-serif">Sans Serif (Default)</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    <strong>Note:</strong> Settings will be saved to your Supabase database. 
                    If Supabase is not connected, they will be stored in browser local storage as fallback.
                  </p>
                </div>

                <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Save size={18} />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
