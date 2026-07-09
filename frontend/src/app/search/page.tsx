'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/cards/ProductCard';
import ServiceCard from '@/components/cards/ServiceCard';
import { productAPI, serviceAPI } from '@/lib/api';
import { Product, Service } from '@/types';
import { Search, Package, Briefcase, SlidersHorizontal } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const [prodRes, svcRes] = await Promise.all([
        productAPI.list({ search: query }),
        serviceAPI.list({ search: query }),
      ]);
      setProducts(prodRes.data.data?.products || []);
      setServices(svcRes.data.data?.services || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Search size={22} className="text-[#007261]" /> Search Results
          </h1>
          <p className="text-gray-500 mt-1">
            Showing results for <span className="font-semibold text-gray-900">"{query}"</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'border-[#007261] text-[#007261]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Package size={16} /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'services'
                ? 'border-[#007261] text-[#007261]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Briefcase size={16} /> Services ({services.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton aspect-square" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'products' ? (
          products.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <Package size={48} className="mx-auto mb-4 opacity-50 text-[#007261]" />
              <p className="font-semibold">No matching products found</p>
              <p className="text-sm mt-1">Try spelling differently or browse categories</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Briefcase size={48} className="mx-auto mb-4 opacity-50 text-[#007261]" />
            <p className="font-semibold">No matching services found</p>
            <p className="text-sm mt-1">Try booking different keywords</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF9FD]"><p className="text-gray-500 font-medium">Loading Search Results...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
