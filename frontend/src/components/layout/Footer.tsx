'use client';

import Link from 'next/link';
import { X, Globe, MessageCircle, AtSign } from 'lucide-react';

const socialIcons = [Globe, X, MessageCircle, AtSign];

const footerLinks = {
  Marketplace: [
    { label: 'Browse Products', href: '/marketplace' },
    { label: 'Browse Services', href: '/services' },
    { label: 'Post a Listing', href: '/register' },
    { label: 'How it Works', href: '/about#how-it-works' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white mt-20">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">LH</span>
              </div>
              <span className="font-bold text-2xl">
                Local<span className="text-[#68FADD]">Hub</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Pakistan's smartest community marketplace — buy, sell, and book professional services in your city.
            </p>
            <div className="flex gap-3 mt-6">
              {socialIcons.map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#68FADD]/20 hover:text-[#68FADD] flex items-center justify-center transition-all"
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4 text-white">{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-[#68FADD] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} LocalHub. All rights reserved. Made with ❤️ in Pakistan.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
