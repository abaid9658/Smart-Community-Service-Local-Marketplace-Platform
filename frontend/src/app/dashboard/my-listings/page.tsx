'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { productAPI } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice, getStatusBadge } from '@/lib/utils';
import { Package, Plus, Trash2, Eye } from 'lucide-react';

export default function MyListingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    try {
      const { data } = await productAPI.my();
      setListings(data.data?.products || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadListings();
  }, [isAuthenticated, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action is permanent.")) return;
    try {
      await productAPI.delete(id);
      loadListings();
    } catch {
      alert("Failed to delete listing.");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-with-sidebar">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="max-w-[1024px] py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <Package size={24} className="text-[#007261]" /> My Listings
              </h1>
              <p className="text-gray-500 mt-1">Manage and edit your marketplace products</p>
            </div>
            <Link href="/dashboard/my-listings/new" className="btn btn-primary btn-sm gap-2">
              <Plus size={16} /> New Listing
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-4 space-y-4 animate-pulse">
                  <div className="skeleton aspect-[4/3] rounded-xl" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
              <Package size={48} className="mx-auto mb-4 text-[#007261] opacity-50" />
              <p className="font-semibold text-gray-700">No listings created yet</p>
              <p className="text-sm text-gray-400 mt-1">List your first product and start selling today.</p>
              <Link href="/dashboard/my-listings/new" className="btn btn-primary btn-sm mt-6">
                Create First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(item => {
                const sb = getStatusBadge(item.status);
                const image = item.images?.[0]?.url;
                return (
                  <div key={item.id} className="card overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Image Preview */}
                      <div className="aspect-[4/3] bg-gray-100 relative">
                        {image ? (
                          <img src={image} className="w-full h-full object-cover" alt={item.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={36} />
                          </div>
                        )}
                        <span className={`absolute top-3 left-3 badge ${sb.class} text-[10px]`}>
                          {sb.label}
                        </span>
                      </div>

                      <div className="p-4">
                        <h4 className="font-bold text-sm truncate">{item.title}</h4>
                        <p className="font-bold text-base text-[#007261] mt-1">{formatPrice(item.price)}</p>
                        <p className="text-xs text-gray-400 mt-1">Stock: {item.stock} left</p>
                      </div>
                    </div>

                    <div className="flex gap-1 border-t border-gray-100 p-2 bg-gray-50">
                      <Link href={`/products/${item.id}`} className="btn btn-ghost btn-xs flex-1 gap-1.5 text-xs text-gray-600">
                        <Eye size={12} /> View
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
