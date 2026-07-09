'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { serviceAPI } from '@/lib/api';
import { Service } from '@/types';
import { formatPrice, getStatusBadge } from '@/lib/utils';
import { Briefcase, Plus, Trash2, Eye, Clock, RefreshCw } from 'lucide-react';

export default function MyServicesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    try {
      const { data } = await serviceAPI.my();
      setServices(data.data?.services || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadServices();
  }, [isAuthenticated, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service listing? This action is permanent.")) return;
    try {
      await serviceAPI.delete(id);
      loadServices();
    } catch {
      alert("Failed to delete service.");
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
                <Briefcase size={24} className="text-[#007261]" /> My Services
              </h1>
              <p className="text-gray-500 mt-1">Manage and edit your professional service offerings</p>
            </div>
            <Link href="/dashboard/my-services/new" className="btn btn-primary btn-sm gap-2">
              <Plus size={16} /> New Service
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-4 space-y-4 animate-pulse">
                  <div className="skeleton aspect-video rounded-xl" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
              <Briefcase size={48} className="mx-auto mb-4 text-[#007261] opacity-50" />
              <p className="font-semibold text-gray-700">No services created yet</p>
              <p className="text-sm text-gray-400 mt-1">Offer your professional skills and start booking appointments today.</p>
              <Link href="/dashboard/my-services/new" className="btn btn-primary btn-sm mt-6">
                Create First Service
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(item => {
                const sb = getStatusBadge(item.status);
                const image = item.images?.[0]?.url;
                return (
                  <div key={item.id} className="card overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Image Preview */}
                      <div className="aspect-video bg-gray-100 relative">
                        {image ? (
                          <img src={image} className="w-full h-full object-cover" alt={item.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 gradient-primary">
                            <Briefcase size={36} className="text-white/40" />
                          </div>
                        )}
                        <span className={`absolute top-3 left-3 badge ${sb.class} text-[10px]`}>
                          {sb.label}
                        </span>
                      </div>

                      <div className="p-4">
                        <h4 className="font-bold text-sm truncate">{item.title}</h4>
                        <p className="font-bold text-base text-[#007261] mt-1">Starting from {formatPrice(item.price)}</p>
                        
                        <div className="flex gap-4 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                          <span className="flex items-center gap-1"><Clock size={12} /> {item.deliveryDays}d delivery</span>
                          <span className="flex items-center gap-1"><RefreshCw size={12} /> {item.revisions} revs</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 border-t border-gray-100 p-2 bg-gray-50">
                      <Link href={`/services/${item.id}`} className="btn btn-ghost btn-xs flex-1 gap-1.5 text-xs text-gray-600">
                        <Eye size={12} /> View Listing
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
