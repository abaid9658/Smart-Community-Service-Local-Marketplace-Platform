'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/cards/ProductCard';
import ServiceCard from '@/components/cards/ServiceCard';
import { userAPI, messageAPI } from '@/lib/api';
import { User, Product, Service } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';
import { Star, MapPin, Globe, Calendar, MessageSquare, Briefcase, Package } from 'lucide-react';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const username = params.username as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const { data } = await userAPI.profile(username);
      setUser(data.data);
      // Auto switch tab if products are empty but has services
      if ((data.data.products?.length || 0) === 0 && (data.data.services?.length || 0) > 0) {
        setActiveTab('services');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleContact = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.id === currentUser?.id) { alert("This is your profile!"); return; }
    try {
      await messageAPI.getOrCreate(user!.id);
      router.push('/dashboard/messages');
    } catch {
      alert("Failed to start chat.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9FD]">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-12 animate-pulse">
          <div className="skeleton h-48 rounded-2xl mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="skeleton h-60 rounded-2xl" />
            <div className="md:col-span-2 skeleton h-80 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9FD] flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-24 text-gray-500">
          <h2 className="text-2xl font-bold">User Profile Not Found</h2>
          <p className="mt-2">The user you are looking for does not exist or has been suspended.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const products = (user as any).products || [];
  const services = (user as any).services || [];
  const reviews = (user as any).reviewsReceived || [];

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Navbar />

      {/* Hero Header */}
      <div className="gradient-hero py-16 text-white relative">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row items-center gap-6">
          {user.profile?.avatarUrl ? (
            <img src={user.profile.avatarUrl} className="avatar avatar-xl border-4 border-white/20" alt="avatar" />
          ) : (
            <div className="avatar avatar-xl bg-white/20 border-4 border-white/20 text-white text-3xl font-black">
              {user.profile?.fullName?.charAt(0) || '?'}
            </div>
          )}
          
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-black">{user.profile?.fullName || user.username}</h1>
              {user.profile?.isVerified && (
                <span className="badge badge-accent text-[10px] text-[#007261]">✓ Verified Partner</span>
              )}
            </div>
            <p className="text-white/70 mt-1">@{user.username} • Partner since {formatDate(user.createdAt)}</p>
            
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-white/90">
              <div className="flex items-center gap-1.5">
                <Star size={15} fill="#F59E0B" className="text-amber-400" />
                <span className="font-bold">{user.profile?.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-white/60">({user.profile?.totalReviews || 0} reviews)</span>
              </div>
              {user.profile?.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={15} /> {user.profile.city}
                </span>
              )}
            </div>
          </div>

          <div className="sm:ml-auto">
            <button onClick={handleContact} className="btn btn-accent btn-lg font-bold shadow-lg">
              <MessageSquare size={16} /> Send Message
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Bio / details */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-base mb-3">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {user.profile?.bio || 'This user hasn\'t written a bio yet.'}
              </p>
              
              <div className="border-t border-gray-100 mt-5 pt-5 space-y-3 text-xs text-gray-500">
                {user.profile?.city && (
                  <p className="flex items-center gap-2">
                    <MapPin size={14} /> Location: <span className="font-semibold text-gray-800">{user.profile.city}, {user.profile.country || 'Pakistan'}</span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Calendar size={14} /> Joined: <span className="font-semibold text-gray-800">{formatDate(user.createdAt)}</span>
                </p>
                {(user.profile as any)?.socialLinks?.website && (
                  <p className="flex items-center gap-2">
                    <Globe size={14} /> Website: <a href={(user.profile as any).socialLinks.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#007261] hover:underline truncate">{(user.profile as any).socialLinks.website}</a>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Listings Tabs */}
          <div className="md:col-span-2 space-y-8">
            <div className="flex border-b border-gray-100 bg-white p-1 rounded-xl shadow-sm">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'products' ? 'bg-[#007261] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package size={16} /> Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'services' ? 'bg-[#007261] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Briefcase size={16} /> Services ({services.length})
              </button>
            </div>

            {/* List */}
            {activeTab === 'products' ? (
              products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
                  <Package size={48} className="mx-auto mb-3 opacity-40 text-[#007261]" />
                  <p className="font-semibold">No active product listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {products.map((p: Product) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )
            ) : services.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
                <Briefcase size={48} className="mx-auto mb-3 opacity-40 text-[#007261]" />
                <p className="font-semibold">No active services offered</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {services.map((s: Service) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            )}

            {/* Reviews list */}
            {reviews.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-base mb-6">Recent Customer Feedback</h3>
                <div className="space-y-6">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="avatar avatar-sm gradient-primary text-white text-xs">
                          {rev.reviewer?.profile?.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{rev.reviewer?.profile?.fullName || rev.reviewer?.username}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={10} fill={s <= rev.rating ? '#F59E0B' : 'none'} className="text-amber-400" />
                              ))}
                            </div>
                            <span className="text-gray-400">• {formatDate(rev.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 pl-11 leading-relaxed">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
