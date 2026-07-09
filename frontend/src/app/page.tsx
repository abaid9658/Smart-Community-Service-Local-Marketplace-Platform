'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/cards/ProductCard';
import ServiceCard from '@/components/cards/ServiceCard';
import { productAPI, serviceAPI, categoryAPI } from '@/lib/api';
import { Product, Service, Category } from '@/types';
import {
  ArrowRight, Zap, Shield, Clock, Star,
  Users, Package, Briefcase, ChevronRight, Search,
  TrendingUp, CheckCircle
} from 'lucide-react';

const stats = [
  { label: 'Active Listings', value: '12,000+', icon: Package },
  { label: 'Service Providers', value: '3,500+', icon: Briefcase },
  { label: 'Happy Customers', value: '28,000+', icon: Users },
  { label: 'Cities Covered', value: '50+', icon: TrendingUp },
];

const features = [
  { icon: Zap, title: 'Instant Connections', desc: 'Real-time messaging connects you with sellers and providers instantly.' },
  { icon: Shield, title: 'Verified Listings', desc: 'Every listing is reviewed before going live. Shop with confidence.' },
  { icon: Clock, title: 'Fast Booking', desc: 'Book services in seconds. Get confirmation within minutes.' },
  { icon: Star, title: 'Trusted Reviews', desc: 'Only verified buyers and clients can leave reviews.' },
];

const howItWorks = [
  { step: '01', title: 'Find what you need', desc: 'Browse thousands of products and professional services.' },
  { step: '02', title: 'Connect & negotiate', desc: 'Chat directly with sellers or providers in real time.' },
  { step: '03', title: 'Buy or book', desc: 'Make purchases or schedule service appointments easily.' },
  { step: '04', title: 'Leave a review', desc: 'Share your experience to help the community.' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSearch, setHeroSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, svcRes, catRes] = await Promise.all([
          productAPI.list({ limit: 6, sort: 'popular' }),
          serviceAPI.list({ limit: 6, sort: 'popular' }),
          categoryAPI.list(),
        ]);
        setFeaturedProducts(prodRes.data.data?.products || []);
        setFeaturedServices(svcRes.data.data?.services || []);
        setCategories(catRes.data.data?.slice(0, 8) || []);
      } catch {}
      setLoading(false);
    };
    loadData();
  }, []);

  const categoryIcons: Record<string, string> = {
    'electronics': '💻', 'fashion': '👗', 'home-garden': '🏡',
    'sports': '⚽', 'web-development': '🌐', 'graphic-design': '🎨',
    'writing-translation': '✍️', 'photography': '📸', 'marketing': '📈', 'tutoring': '📚',
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-hero min-h-[600px] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-40px] right-[10%] w-96 h-96 rounded-full bg-[#68FADD] opacity-10 blur-3xl" />
          <div className="absolute bottom-[-60px] left-[5%] w-72 h-72 rounded-full bg-white opacity-5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#005a4c] opacity-30 blur-3xl" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-6 py-20 w-full">
          <div className="max-w-[680px]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Zap size={14} className="text-[#68FADD]" />
              <span className="text-white/90 text-sm font-semibold">Pakistan's #1 Community Marketplace</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
              Buy, Sell &amp; Book
              <span className="block text-[#68FADD] mt-1">Local Services</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/75 mb-10 leading-relaxed max-w-lg">
              Connect with trusted sellers and professional service providers in your city. Everything your community needs, in one place.
            </p>

            {/* Hero Search */}
            <form
              onSubmit={(e) => { e.preventDefault(); if (heroSearch) window.location.href = `/search?q=${encodeURIComponent(heroSearch)}`; }}
              className="flex gap-2.5 mb-10 max-w-[520px]"
            >
              <div className="flex-1 relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={e => setHeroSearch(e.target.value)}
                  placeholder="Search products, services, categories..."
                  style={{ height: '52px' }}
                  className="input pl-12 text-base rounded-2xl shadow-lg border-0 w-full"
                />
              </div>
              <button type="submit" className="btn btn-accent font-bold shadow-xl rounded-2xl px-6 flex-shrink-0" style={{ height: '52px' }}>
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Link href="/marketplace" className="btn btn-accent btn-lg shadow-xl font-bold">
                Browse Products <ArrowRight size={16} />
              </Link>
              <Link href="/services" className="btn btn-lg font-bold" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '2px solid rgba(255,255,255,0.25)' }}>
                Find Services
              </Link>
            </div>

            {/* Inline stats */}
            <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/15">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={16} className="text-[#68FADD]" />
                  <span className="text-white font-black text-lg leading-none">{value}</span>
                  <span className="text-white/60 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar removed — now in hero inline */}

      {/* ── Categories ────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">Browse by Category</h2>
            <p className="text-gray-500 mt-1">Find exactly what you're looking for</p>
          </div>
          <Link href="/marketplace" className="btn btn-outline btn-sm">
            All Categories <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))
            : categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/marketplace?categoryId=${cat.id}`}
                  className="card-flat p-4 text-center hover:border-[#007261] hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="text-3xl mb-2">{categoryIcons[cat.slug] || '📦'}</div>
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-[#007261] transition-colors line-clamp-2">
                    {cat.name}
                  </p>
                  {cat._count && (
                    <p className="text-[10px] text-gray-400 mt-1">{cat._count.products + cat._count.services} listings</p>
                  )}
                </Link>
              ))
          }
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black">Featured Products</h2>
              <p className="text-gray-500 mt-1">Top picks from our trusted sellers</p>
            </div>
            <Link href="/marketplace" className="btn btn-outline btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton aspect-[4/3]" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                    <div className="skeleton h-8 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>No products yet. Be the first to list!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Services ─────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">Top Services</h2>
            <p className="text-gray-500 mt-1">Book skilled professionals in your area</p>
          </div>
          <Link href="/services" className="btn btn-outline btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton aspect-video" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-8 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
            <p>No services yet. Be the first to offer your skills!</p>
          </div>
        )}
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="bg-[#007261] py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">How LocalHub Works</h2>
            <p className="text-white/70">Getting started takes less than 2 minutes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map(({ step, title, desc }, i) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#68FADD] text-[#007261] font-black text-xl flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute mt-7 ml-32 text-white/30">
                    <ArrowRight size={20} />
                  </div>
                )}
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-white/70 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/register" className="btn btn-accent btn-lg shadow-xl font-bold">
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">Why Choose LocalHub?</h2>
          <p className="text-gray-500">Built for Pakistan's community with trust and safety in mind</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 text-center hover:border-[#007261]">
              <div className="w-14 h-14 rounded-2xl bg-[#e6f4f1] flex items-center justify-center mx-auto mb-4">
                <Icon size={24} className="text-[#007261]" />
              </div>
              <h3 className="font-bold text-base mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="mx-6 mb-16 rounded-3xl overflow-hidden relative gradient-hero">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-[#68FADD] blur-3xl" />
        </div>
        <div className="relative px-12 py-16 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to sell or offer your services?</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Join 3,500+ local sellers and service providers already earning on LocalHub.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register" className="btn btn-accent btn-lg font-bold shadow-xl">
              Start Selling <ArrowRight size={16} />
            </Link>
            <Link href="/register" className="btn btn-outline border-white text-white hover:bg-white/10 btn-lg">
              Offer a Service
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
