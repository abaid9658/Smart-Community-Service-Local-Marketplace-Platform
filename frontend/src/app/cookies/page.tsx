import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Cookie, Settings2, BarChart3, Sparkles, Megaphone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How LocalHub uses cookies to keep you signed in, remember your preferences, and improve the platform — and how to manage them.',
};

const cookieTypes = [
  {
    icon: Settings2,
    title: 'Essential Cookies',
    badge: 'Always on',
    badgeClass: 'badge-green',
    desc: 'Required for LocalHub to function — keeping you signed in, remembering items in your session, and securing your account. The Platform cannot work properly without these.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Cookies',
    badge: 'Optional',
    badgeClass: 'badge-blue',
    desc: 'Help us understand how people use LocalHub — which pages are visited, which features are used, and where users run into friction — so we can improve the Platform.',
  },
  {
    icon: Sparkles,
    title: 'Preference Cookies',
    badge: 'Optional',
    badgeClass: 'badge-purple',
    desc: 'Remember choices like your preferred city, language, or display settings, so you don\u2019t have to reset them on every visit.',
  },
  {
    icon: Megaphone,
    title: 'Marketing Cookies',
    badge: 'Optional',
    badgeClass: 'badge-orange',
    desc: 'Used to measure the effectiveness of our own promotional campaigns. LocalHub does not sell cookie data to third-party advertisers.',
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-[#1A1A2E] py-16">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <Cookie size={24} className="text-[#68FADD]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Cookie Policy</h1>
          <p className="text-white/60 text-sm">Last updated: January 1, 2026</p>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-6 py-16 space-y-14 text-gray-700 leading-relaxed">
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3">What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They let the site remember information about your visit — like whether you're signed in, or what you searched for — so your next visit (or next page) can be faster and more convenient.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-5">The cookies we use</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {cookieTypes.map(({ icon: Icon, title, badge, badgeClass, desc }) => (
              <div key={title} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#e6f4f1] flex items-center justify-center">
                    <Icon size={20} className="text-[#007261]" />
                  </div>
                  <span className={`badge ${badgeClass} text-[10px]`}>{badge}</span>
                </div>
                <h3 className="font-bold mb-1.5">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3">Managing your cookie preferences</h2>
          <p className="mb-3">You can control non-essential cookies in a few ways:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use the cookie consent banner shown on your first visit to set your preferences.</li>
            <li>Update your choices anytime from your account's privacy settings.</li>
            <li>Adjust your browser settings to block or delete cookies — most browsers let you do this under "Privacy" or "Site settings."</li>
          </ul>
          <p className="mt-3">
            Note that blocking essential cookies may prevent parts of LocalHub — like staying signed in or completing a booking — from working correctly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3">Browser-level controls</h2>
          <p>
            Most browsers allow you to view, manage, and delete cookies through their settings menu. Because steps vary by browser, we recommend checking your browser's help documentation (Chrome, Safari, Firefox, or Edge) for the most current instructions.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3">Your consent</h2>
          <p>
            By continuing to use LocalHub after being shown our cookie banner, you consent to our use of essential cookies as described here. You may withdraw consent for optional cookies (analytics, preference, and marketing) at any time without affecting your ability to use core features of the Platform.
          </p>
        </div>

        <div className="card p-6 bg-[#e6f4f1] border-none">
          <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
            <Mail size={18} className="text-[#007261]" /> Questions about cookies?
          </h2>
          <p>
            Reach out via our{' '}
            <Link href="/contact" className="font-semibold text-[#007261] hover:underline">Contact page</Link>, or read our{' '}
            <Link href="/privacy" className="font-semibold text-[#007261] hover:underline">Privacy Policy</Link> for more on how we handle your data.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
