import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  ArrowRight, ShieldCheck, MessageCircle, Star, Heart,
  MapPin, Users, Package, Briefcase, Sparkles, Target, Eye,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: "Learn how LocalHub connects buyers, sellers, and service providers in local communities across Pakistan — built on trust, verified profiles, and real-time communication.",
};

const stats = [
  { label: 'Active Listings', value: '12,000+', icon: Package },
  { label: 'Service Providers', value: '3,500+', icon: Briefcase },
  { label: 'Happy Customers', value: '28,000+', icon: Users },
  { label: 'Cities Covered', value: '50+', icon: MapPin },
];

const values = [
  {
    icon: ShieldCheck,
    title: 'Trust by design',
    desc: 'Every listing is reviewed before it goes live, and every provider builds a visible reputation through verified reviews. Trust is not a feature we bolt on — it is how LocalHub is built.',
  },
  {
    icon: MessageCircle,
    title: 'Real conversations',
    desc: 'No back-and-forth over third-party apps. Buyers and sellers message, negotiate, and confirm bookings directly inside LocalHub, in real time.',
  },
  {
    icon: Heart,
    title: 'Community first',
    desc: 'LocalHub is built city by city. We prioritize the people actually doing business in your neighborhood over faceless, nationwide listings.',
  },
  {
    icon: Star,
    title: 'Fairness for providers',
    desc: 'Sellers and freelancers keep control of their listings, pricing, and schedules. We built the tools; how you run your business is up to you.',
  },
];

const timeline = [
  { year: 'The problem', title: 'Local commerce was scattered', desc: 'Buying a used sofa meant one app. Hiring a plumber meant asking around. Booking a tutor meant a phone number passed between three people. Nothing connected, and nothing was verified.' },
  { year: 'The idea', title: 'One trusted place, per city', desc: 'LocalHub was built around a simple premise: your neighborhood already has everything you need — sellers, freelancers, professionals. They just needed a shared, trustworthy place to be found.' },
  { year: 'Today', title: 'A growing local marketplace', desc: 'Thousands of verified sellers and service providers now list products and services on LocalHub, with real-time chat, secure payments, and a review system that keeps everyone accountable.' },
  { year: "What's next", title: 'Deeper into every city', desc: 'More cities, more categories, and more tools that help local providers get discovered and local buyers book with confidence.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-40px] right-[10%] w-96 h-96 rounded-full bg-[#68FADD] opacity-10 blur-3xl" />
          <div className="absolute bottom-[-60px] left-[5%] w-72 h-72 rounded-full bg-white opacity-5 blur-3xl" />
        </div>
        <div className="relative max-w-[1000px] mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles size={14} className="text-[#68FADD]" />
            <span className="text-white/90 text-sm font-semibold">Built in Pakistan, for Pakistan's communities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
            Your neighborhood,
            <span className="block text-[#68FADD] mt-1">now online</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto">
            LocalHub is where local sellers, freelancers, and service providers meet the people looking for them — with verified profiles, real reviews, and direct messaging built in.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1280px] mx-auto px-6 -mt-10 relative z-10">
        <div className="card grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 p-0 overflow-hidden">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="p-6 text-center">
              <Icon size={20} className="text-[#007261] mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-8">
            <div className="w-12 h-12 rounded-2xl bg-[#e6f4f1] flex items-center justify-center mb-5">
              <Target size={22} className="text-[#007261]" />
            </div>
            <h2 className="text-2xl font-black mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To give every local seller and service provider in Pakistan a trusted, easy-to-use platform to reach customers — and to give every buyer a safe, verified way to shop and hire close to home.
            </p>
          </div>
          <div className="card p-8">
            <div className="w-12 h-12 rounded-2xl bg-[#e6f4f1] flex items-center justify-center mb-5">
              <Eye size={22} className="text-[#007261]" />
            </div>
            <h2 className="text-2xl font-black mb-3">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              A future where finding a reliable electrician, a secondhand laptop, or a freelance designer in your own city is as easy as opening an app — no guesswork, no cold calls, no uncertainty.
            </p>
          </div>
        </div>
      </section>

      {/* Why we exist / timeline */}
      <section className="bg-white py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">Why LocalHub exists</h2>
            <p className="text-gray-500">The short version of how we got here</p>
          </div>
          <div className="space-y-10">
            {timeline.map((item, i) => (
              <div key={item.title} className="flex gap-6">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#007261] text-white font-black text-xs flex items-center justify-center">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-2" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-bold text-[#007261] uppercase tracking-wide mb-1">{item.year}</p>
                  <h3 className="font-bold text-lg text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black mb-3">What we stand for</h2>
          <p className="text-gray-500">The principles behind every feature we build</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="w-12 h-12 rounded-2xl bg-[#e6f4f1] flex items-center justify-center mb-4">
                <Icon size={22} className="text-[#007261]" />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Safety commitment */}
      <section className="bg-[#007261] py-20">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <ShieldCheck size={36} className="text-[#68FADD] mx-auto mb-5" />
          <h2 className="text-3xl font-black text-white mb-4">Our commitment to trust & safety</h2>
          <p className="text-white/75 leading-relaxed max-w-2xl mx-auto">
            Listings go through moderation before they're visible. Reviews can only be left by verified buyers and clients. Reports are reviewed by our team, not ignored. And every payment runs through secure, encrypted channels. Building a marketplace people trust is an ongoing job — one we take seriously with every release.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1280px] mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black mb-4">Ready to be part of your local marketplace?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Whether you're buying, selling, or offering a service — LocalHub starts in your city.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/register" className="btn btn-primary btn-lg font-bold">
            Get Started <ArrowRight size={16} />
          </Link>
          <Link href="/contact" className="btn btn-outline btn-lg font-bold">
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
