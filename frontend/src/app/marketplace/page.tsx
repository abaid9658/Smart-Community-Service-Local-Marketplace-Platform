'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/cards/ProductCard';
import { productAPI, categoryAPI, favoriteAPI } from '@/lib/api';
import { Product, Category } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { buildQueryString } from '@/lib/utils';
import {
  SlidersHorizontal, Search, ChevronDown,
  Package, X, Grid3X3, List, Loader2
} from 'lucide-react';

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter state from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    city: searchParams.get('city') || '',
    sort: searchParams.get('sort') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  useEffect(() => {
    categoryAPI.list().then(({ data }) => setCategories(data.data || []));
    if (isAuthenticated) {
      favoriteAPI.list().then(({ data }) => {
        const favs = data.data || [];
        const ids = new Set<string>(favs.filter((f: Record<string, any>) => f.productId).map((f: Record<string, any>) => f.productId as string));
        setFavorites(ids);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 12 };
      const { data } = await productAPI.list(params);
      const responseData = data.data || {};
      setProducts(responseData.products || []);
      setTotal(responseData.total || 0);
      setTotalPages(responseData.totalPages || 0);
    } catch {}
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key: string, value: unknown) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters as typeof filters);
    router.push(`/marketplace?${buildQueryString(newFilters)}`);
  };

  const clearFilters = () => {
    const reset = { search: '', categoryId: '', minPrice: '', maxPrice: '', city: '', sort: '', page: 1 };
    setFilters(reset);
    router.push('/marketplace');
  };

  const handleFavorite = async (productId: string) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    try {
      await favoriteAPI.toggle({ productId });
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId); else next.add(productId);
        return next;
      });
    } catch {}
  };

  const hasActiveFilters = filters.categoryId || filters.minPrice || filters.maxPrice || filters.city || filters.search;

  const filterFields = (isMobile: boolean) => (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-sm text-gray-800">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-5">
        <label className="text-xs font-bold text-gray-700 mb-2 block">Search</label>
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Keywords..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="input pl-9.5 py-2 text-sm h-10"
          />
        </div>
      </div>

      {/* Category */}
      <div className="mb-5">
        <label className="text-xs font-bold text-gray-700 mb-2 block">Category</label>
        <select
          value={filters.categoryId}
          onChange={e => updateFilter('categoryId', e.target.value)}
          className="input text-sm h-10"
        >
          <option value="">All Categories</option>
          {categories.map(cat =>
            cat.children && cat.children.length > 0 ? (
              <optgroup key={cat.id} label={cat.name}>
                <option value={cat.id}>{cat.name} (General)</option>
                {cat.children.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </optgroup>
            ) : (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            )
          )}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <label className="text-xs font-bold text-gray-700 mb-2 block">Price Range (PKR)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={e => updateFilter('minPrice', e.target.value)}
            className="input text-sm h-10"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e => updateFilter('maxPrice', e.target.value)}
            className="input text-sm h-10"
          />
        </div>
      </div>

      {/* City */}
      <div className="mb-5">
        <label className="text-xs font-bold text-gray-700 mb-2 block">City</label>
        <input
          type="text"
          placeholder="e.g. Lahore"
          value={filters.city}
          onChange={e => updateFilter('city', e.target.value)}
          className="input text-sm h-10"
        />
      </div>

      {isMobile && (
        <button
          onClick={() => setShowFilters(false)}
          className="btn btn-primary w-full h-11 mt-4 rounded-xl text-sm"
        >
          Apply Filters
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF9FD' }}>
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-[1280px] mx-auto px-6">
          <h1 className="text-3xl font-black mb-1.5 text-gray-900">Product Marketplace</h1>
          <p className="text-gray-500 text-sm">Discover {total.toLocaleString()}+ products from trusted local sellers</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity" onClick={() => setShowFilters(false)} />
              <aside className="relative w-80 max-w-full bg-white h-full p-6 overflow-y-auto flex flex-col z-10 shadow-2xl animate-fade-left">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-black text-gray-900">Filter Products</h2>
                  <button onClick={() => setShowFilters(false)} className="btn btn-ghost btn-icon btn-sm text-gray-500">
                    <X size={20} />
                  </button>
                </div>
                {filterFields(true)}
              </aside>
            </div>
          )}

          {/* Desktop Sidebar Filters */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="card-flat p-5 sticky top-24">
              {filterFields(false)}
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="btn btn-outline btn-sm lg:hidden gap-1.5 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>
                <span className="text-sm font-semibold text-gray-500">
                  {total.toLocaleString()} product{total !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={filters.sort}
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="input text-sm h-10 w-44 rounded-xl"
                >
                  <option value="">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>

                {/* View Toggle */}
                <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
                  {(['grid', 'list'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-2 text-sm transition-colors ${viewMode === mode ? 'bg-[#007261] text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                      aria-label={`${mode} view`}
                    >
                      {mode === 'grid' ? <Grid3X3 size={15} /> : <List size={15} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="skeleton aspect-[4/3] rounded-t-2xl" />
                    <div className="p-5 space-y-3">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-4 w-full rounded" />
                      <div className="skeleton h-8 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 px-6">
                <Package size={56} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-bold text-gray-800">No products found</p>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your keywords or clearing the active filters.</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn btn-outline btn-sm mt-5 rounded-xl">Clear All Filters</button>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorited={favorites.has(product.id)}
                    onFavorite={handleFavorite}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => updateFilter('page', p)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                        filters.page === p
                          ? 'bg-[#007261] text-white shadow-md shadow-green-950/20'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-[#007261] hover:text-[#007261]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF9FD]"><Loader2 className="animate-spin text-[#007261]" size={32} /></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
