import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Settings, FileText, Plus, Trash2, Edit } from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('articles');
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, string>>({
    primaryColor: '#000000',
    fontFamily: 'Inter',
    topNotificationText: 'CBSE Class 12 Accountancy Answer Key Updated!',
    topNotificationLink: '/article/cbse-class-12-accountancy-answer-key-2026'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchArticles();
        fetchSettings();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  const fetchArticles = async () => {
    const res = await fetch('/api/articles');
    const data = await res.json();
    setArticles(data);
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(prev => ({ ...prev, ...data }));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      fetchArticles();
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingArticle.id ? 'PUT' : 'POST';
    const url = editingArticle.id ? `/api/articles/${editingArticle.id}` : '/api/articles';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editingArticle,
        tags: typeof editingArticle.tags === 'string' ? editingArticle.tags.split(',').map((t: string) => t.trim()) : editingArticle.tags
      })
    });
    
    setEditingArticle(null);
    fetchArticles();
  };

  const handleSaveSettings = async () => {
    for (const [key, value] of Object.entries(settings)) {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    }
    alert('Settings saved successfully! Refresh the page to see changes.');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Helmet><title>Admin Login - Boardswallah</title></Helmet>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none"
                style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                placeholder="Enter admin password"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full text-white py-2 rounded-lg font-bold transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Helmet><title>Admin Dashboard - Boardswallah</title></Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button onClick={() => setIsAuthenticated(false)} className="text-gray-500 hover:text-gray-900">Logout</button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4">
        <button 
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'articles' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          style={activeTab === 'articles' ? { backgroundColor: 'var(--color-primary)' } : {}}
        >
          <FileText size={18} /> Articles
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          style={activeTab === 'settings' ? { backgroundColor: 'var(--color-primary)' } : {}}
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      {activeTab === 'articles' && (
        <div>
          {editingArticle ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">{editingArticle.id ? 'Edit Article' : 'New Article'}</h2>
              <form onSubmit={handleSaveArticle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input required type="text" value={editingArticle.title || ''} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <input required type="text" value={editingArticle.slug || ''} onChange={e => setEditingArticle({...editingArticle, slug: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category (e.g., Class 10)</label>
                    <input required type="text" value={editingArticle.category || ''} onChange={e => setEditingArticle({...editingArticle, category: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <input required type="text" value={editingArticle.subject || ''} onChange={e => setEditingArticle({...editingArticle, subject: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type (e.g., Answer Key)</label>
                    <input required type="text" value={editingArticle.type || ''} onChange={e => setEditingArticle({...editingArticle, type: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Author</label>
                    <input required type="text" value={editingArticle.author || 'Boardswallah Team'} onChange={e => setEditingArticle({...editingArticle, author: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Excerpt</label>
                  <textarea required value={editingArticle.excerpt || ''} onChange={e => setEditingArticle({...editingArticle, excerpt: e.target.value})} className="w-full border p-2 rounded" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input required type="text" value={Array.isArray(editingArticle.tags) ? editingArticle.tags.join(', ') : editingArticle.tags || ''} onChange={e => setEditingArticle({...editingArticle, tags: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content (HTML)</label>
                  <textarea required value={editingArticle.content || ''} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} className="w-full border p-2 rounded font-mono text-sm" rows={10} />
                </div>
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="text-white px-6 py-2 rounded font-bold transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>Save</button>
                  <button type="button" onClick={() => setEditingArticle(null)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-bold">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-900">All Articles</h2>
                <button onClick={() => setEditingArticle({})} className="text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <Plus size={16} /> New Article
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                    <tr>
                      <th className="p-4 font-medium">Title</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {articles.map(article => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{article.title}</td>
                        <td className="p-4 text-gray-600">{article.category}</td>
                        <td className="p-4 text-gray-600">{new Date(article.publishDate).toLocaleDateString()}</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => setEditingArticle(article)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Site Settings</h2>
          <p className="text-gray-500 mb-6">Configure global site settings like colors and notifications.</p>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color</label>
              <div className="flex gap-2">
                <input type="color" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="h-10 w-10 border rounded cursor-pointer" />
                <input type="text" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="flex-1 border p-2 rounded" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Font Family</label>
              <select value={settings.fontFamily} onChange={e => setSettings({...settings, fontFamily: e.target.value})} className="w-full border p-2 rounded">
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Top Notification Text</label>
              <input type="text" value={settings.topNotificationText} onChange={e => setSettings({...settings, topNotificationText: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Top Notification Link</label>
              <input type="text" value={settings.topNotificationLink} onChange={e => setSettings({...settings, topNotificationLink: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <button onClick={handleSaveSettings} className="text-white px-6 py-2 rounded font-bold mt-4 transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>Save Settings</button>
          </div>
        </div>
      )}
    </div>
  );
}
