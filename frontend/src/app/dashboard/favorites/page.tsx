'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { favoriteAPI } from '@/lib/api';
import { Favorite } from '@/types';
import ProductCard from '@/components/cards/ProductCard';
import ServiceCard from '@/components/cards/ServiceCard';
import { Heart, Package, Briefcase } from 'lucide-react';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');

  const loadFavorites = async () => {
    try {
      const { data } = await favoriteAPI.list();
      setFavorites(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadFavorites();
  }, [isAuthenticated, router]);

  const handleFavoriteToggle = async (id: string) => {
    // Optimistic delete from UI
    setFavorites(prev => prev.filter(f => f.productId !== id && f.serviceId !== id));
  };

  if (!isAuthenticated) return null;

  const productFavorites = favorites.filter(f => f.product);
  const serviceFavorites = favorites.filter(f => f.service);

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-with-sidebar">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="max-w-[1024px] py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Heart size={24} className="text-[#007261]" /> Saved Favorites
            </h1>
            <p className="text-gray-500 mt-1">Products and professional services you saved to review later</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 mb-8 bg-white p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'products' ? 'bg-[#007261] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package size={16} /> Products ({productFavorites.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'services' ? 'bg-[#007261] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase size={16} /> Services ({serviceFavorites.length})
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
            </div>
          ) : activeTab === 'products' ? (
            productFavorites.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Heart size={48} className="mx-auto mb-4 text-[#007261] opacity-50" />
                <p className="font-semibold text-gray-700">No favorited products</p>
                <p className="text-sm text-gray-400 mt-1">Browse the marketplace and tap the heart icon to save products.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productFavorites.map(fav => (
                  <ProductCard
                    key={fav.id}
                    product={fav.product!}
                    isFavorited={true}
                    onFavorite={() => handleFavoriteToggle(fav.product!.id)}
                  />
                ))}
              </div>
            )
          ) : serviceFavorites.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Heart size={48} className="mx-auto mb-4 text-[#007261] opacity-50" />
              <p className="font-semibold text-gray-700">No favorited services</p>
              <p className="text-sm text-gray-400 mt-1">Browse services directory and tap the heart icon to save services.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceFavorites.map(fav => (
                <ServiceCard
                  key={fav.id}
                  service={fav.service!}
                  isFavorited={true}
                  onFavorite={() => handleFavoriteToggle(fav.service!.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
