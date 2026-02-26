'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, GraduationCap, Home, Archive, Search } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/category/class-10/', label: 'Class 10', icon: GraduationCap },
  { path: '/category/class-12/', label: 'Class 12', icon: GraduationCap },
  { path: '/archive/', label: 'Previous Papers', icon: Archive },
]

interface LayoutProps {
  children: React.ReactNode
  ticker?: { text: string; url: string }
}

export default function Layout({ children, ticker }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Default ticker — can be overridden by page-level data
  const activeTicker = ticker || {
    text: 'CBSE Board Exam 2026 Resources Now Live — Papers & Answer Keys Available!',
    url: '/archive/',
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

      {/* Live Ticker */}
      <div className="bg-black text-white text-xs py-1.5 px-4 text-center">
        <Link href={activeTicker.url} className="hover:underline">
          <span className="font-semibold text-sky-400">LIVE:</span>{' '}
          {activeTicker.text}
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Boards Wallah"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Boards <span className="text-black">Wallah</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors ${pathname === link.path
                    ? 'font-bold text-black'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Search + Mobile Menu */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-100 bg-white">
            <div className="container mx-auto px-4 py-2 space-y-1 max-w-6xl">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === link.path
                      ? 'bg-sky-50 text-sky-600 font-bold'
                      : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Page Content */}
      <div className="flex-1 bg-white">
        {children}
      </div>

      {/* Footer */}
      <footer className="text-gray-300 py-12 border-t border-gray-800" style={{ backgroundColor: 'rgb(17, 17, 17)' }}>
        <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-4 gap-8">

          {/* Brand — spans 2 cols */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 text-white">
              <Image
                src="/logo.svg"
                alt="Boards Wallah"
                width={28}
                height={28}
                className="rounded"
              />
              <span className="text-xl font-bold">Boards Wallah</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-md leading-relaxed">
              India's fastest growing education portal for Board Exam resources. We provide question
              papers, answer keys, and analysis strictly for educational purposes.
            </p>
            <div className="flex gap-3">
              {['T', 'F', 'I'].map((s) => (
                <div
                  key={s}
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer text-sm font-medium"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/class-10/" className="hover:text-white transition-colors">Class 10 Papers</Link></li>
              <li><Link href="/category/class-12/" className="hover:text-white transition-colors">Class 12 Papers</Link></li>
              <li><Link href="/archive/" className="hover:text-white transition-colors">Previous Year Papers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact/" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/admin/" className="text-gray-500 hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="container mx-auto px-4 max-w-6xl mt-10 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div>
            <p>© 2026 Boards Wallah. All rights reserved.</p>
            <p className="mt-1">
              Disclaimer: We are not affiliated with CBSE, ICSE, or any state board. All papers are
              uploaded after the exam for analysis.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/admin/" className="text-gray-600 hover:text-white transition-colors">
              Admin Panel
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
