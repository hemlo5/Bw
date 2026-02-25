import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, BookOpen } from 'lucide-react';
import { navLinks } from '../data/mockData';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [settings, setSettings] = useState<Record<string, string>>({
    primaryColor: '#000000',
    fontFamily: 'Inter',
    topNotificationText: 'CBSE Class 12 Accountancy Answer Key Updated!',
    topNotificationLink: '/article/cbse-class-12-accountancy-answer-key-2026'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
      })
      .catch(err => console.error('Failed to load settings', err));
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Apply dynamic styles
  const dynamicStyles = {
    '--color-primary': settings.primaryColor,
    fontFamily: settings.fontFamily,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900" style={dynamicStyles}>
      {/* Top Bar - Ad / Notice */}
      {settings.topNotificationText && (
        <div className="text-white text-xs py-1 px-4 text-center" style={{ backgroundColor: settings.primaryColor }}>
          <Link to={settings.topNotificationLink} className="hover:underline">
            <span className="font-medium">LIVE:</span> {settings.topNotificationText}
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-white p-1.5 rounded-lg" style={{ backgroundColor: settings.primaryColor }}>
              <BookOpen size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Boards<span style={{ color: settings.primaryColor }}>wallah</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  location.pathname === link.href ? "font-bold" : "text-gray-600 hover:text-gray-900"
                )}
                style={location.pathname === link.href ? { color: settings.primaryColor } : {}}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Search size={20} />
            </button>
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg">
            <nav className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-base font-medium py-2 border-b border-gray-50 last:border-0",
                    location.pathname === link.href ? "font-bold" : "text-gray-600"
                  )}
                  style={location.pathname === link.href ? { color: settings.primaryColor } : {}}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Class Selector Bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 flex justify-center gap-4 py-3">
          <Link
            to="/class/10"
            className={cn(
              "px-6 py-2 rounded-full font-bold text-sm transition-colors",
              location.pathname.startsWith('/class/10') 
                ? "text-white" 
                : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
            )}
            style={location.pathname.startsWith('/class/10') ? { backgroundColor: settings.primaryColor } : {}}
          >
            Class 10
          </Link>
          <Link
            to="/class/12"
            className={cn(
              "px-6 py-2 rounded-full font-bold text-sm transition-colors",
              location.pathname.startsWith('/class/12') 
                ? "text-white" 
                : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
            )}
            style={location.pathname.startsWith('/class/12') ? { backgroundColor: settings.primaryColor } : {}}
          >
            Class 12
          </Link>
        </div>
      </div>

      {/* Header Ad Slot (Desktop Only) */}
      <div className="hidden md:block container mx-auto px-4 py-4">
        <div className="bg-gray-50 border border-gray-200 h-[90px] flex items-center justify-center text-gray-400 text-xs uppercase tracking-widest rounded-lg">
          <span>Header Ad (728x90)</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-gray-300 py-12 border-t border-gray-800" style={{ backgroundColor: '#111' }}>
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <BookOpen size={24} />
              <span className="text-xl font-bold">Boardswallah</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-md">
              India's fastest growing education portal for Board Exam resources. 
              We provide question papers, answer keys, and analysis strictly for educational purposes.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">T</div>
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">F</div>
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">I</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/class/10" className="hover:text-white transition-colors">Class 10 Papers</Link></li>
              <li><Link to="/class/12" className="hover:text-white transition-colors">Class 12 Papers</Link></li>
              <li><Link to="/archive" className="hover:text-white transition-colors">Previous Year Papers</Link></li>
              <li><Link to="/results" className="hover:text-white transition-colors">Board Results</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div>
            <p>&copy; {new Date().getFullYear()} Boardswallah. All rights reserved.</p>
            <p className="mt-2">Disclaimer: We are not affiliated with CBSE, ICSE, or any state board. All papers are uploaded after the exam for analysis.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/admin" className="text-gray-600 hover:text-white transition-colors">Admin Panel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
