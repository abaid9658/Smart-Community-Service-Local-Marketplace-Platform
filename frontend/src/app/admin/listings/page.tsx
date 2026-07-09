'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { adminAPI, productAPI, serviceAPI } from '@/lib/api';
import { Product, Service } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ShieldAlert, Check, X, RefreshCw, Eye, Package, Briefcase } from 'lucide-react';

export default function AdminListingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState<{ id: string; type: 'product' | 'service' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadPendingListings = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.pendingListings();
      setPendingProducts(data.data.products || []);
      setPendingServices(data.data.services || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') { router.push('/dashboard'); return; }
    loadPendingListings();
  }, [isAuthenticated, user, router]);

  const handleApprove = async (id: string, type: 'product' | 'service') => {
    if (!confirm("Are you sure you want to approve this listing? It will go live immediately.")) return;
    try {
      if (type === 'product') {
        await productAPI.moderate(id, 'approve');
      } else {
        await serviceAPI.moderate(id, 'approve');
      }
      loadPendingListings();
    } catch {
      alert("Failed to approve listing.");
    }
  };

  const triggerReject = (id: string, type: 'product' | 'service') => {
    setRejectingItem({ id, type });
    setRejectionReason('');
  };

  const submitRejection = async () => {
    if (!rejectingItem) return;
    setSubmittingAction(true);
    try {
      if (rejectingItem.type === 'product') {
        await productAPI.moderate(rejectingItem.id, 'reject', rejectionReason);
      } else {
        await serviceAPI.moderate(rejectingItem.id, 'reject', rejectionReason);
      }
      setRejectingItem(null);
      loadPendingListings();
    } catch {
      alert("Failed to reject listing.");
    }
    setSubmittingAction(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} variant="admin" />
      <div className="page-with-sidebar">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="max-w-[1024px] py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <ShieldAlert size={24} className="text-[#007261]" /> Listing Approvals
              </h1>
              <p className="text-gray-500 mt-1">Moderate pending marketplace product and service listings</p>
            </div>
            <button onClick={loadPendingListings} className="btn btn-outline btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl animate-pulse" />)}
            </div>
          ) : pendingProducts.length === 0 && pendingServices.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <Check size={48} className="mx-auto mb-4 text-[#007261]" />
              <p className="font-semibold">All caught up!</p>
              <p className="text-sm mt-1">No pending listings require approval at the moment.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Products Section */}
              {pendingProducts.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Package size={18} className="text-[#007261]" /> Products ({pendingProducts.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {pendingProducts.map(prod => (
                      <div key={prod.id} className="card p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex gap-4 mb-4">
                            {prod.images?.[0]?.url ? (
                              <img src={prod.images[0].url} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt="prod" />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Package size={24} className="text-gray-300" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm truncate">{prod.title}</h4>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{prod.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-3 mb-4">
                            <div>
                              <p className="text-gray-400">Seller</p>
                              <p className="font-semibold mt-0.5">{prod.seller?.profile?.fullName || '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400">Price</p>
                              <p className="font-bold text-[#007261] mt-0.5">{formatPrice(prod.price)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/products/${prod.id}`} className="btn btn-outline btn-sm flex-1">
                            <Eye size={12} /> View Details
                          </Link>
                          <button onClick={() => triggerReject(prod.id, 'product')} className="btn btn-danger btn-sm px-3">
                            <X size={14} /> Reject
                          </button>
                          <button onClick={() => handleApprove(prod.id, 'product')} className="btn btn-primary btn-sm px-3">
                            <Check size={14} /> Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Section */}
              {pendingServices.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Briefcase size={18} className="text-[#007261]" /> Services ({pendingServices.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {pendingServices.map(svc => (
                      <div key={svc.id} className="card p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex gap-4 mb-4">
                            {svc.images?.[0]?.url ? (
                              <img src={svc.images[0].url} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt="svc" />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Briefcase size={24} className="text-gray-300" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm truncate">{svc.title}</h4>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{svc.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-3 mb-4">
                            <div>
                              <p className="text-gray-400">Provider</p>
                              <p className="font-semibold mt-0.5">{svc.provider?.profile?.fullName || '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400">Price</p>
                              <p className="font-bold text-[#007261] mt-0.5">{formatPrice(svc.price)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/services/${svc.id}`} className="btn btn-outline btn-sm flex-1">
                            <Eye size={12} /> View Details
                          </Link>
                          <button onClick={() => triggerReject(svc.id, 'service')} className="btn btn-danger btn-sm px-3">
                            <X size={14} /> Reject
                          </button>
                          <button onClick={() => handleApprove(svc.id, 'service')} className="btn btn-primary btn-sm px-3">
                            <Check size={14} /> Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-4">
              <X size={20} />
              <h3>Reject Listing</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Provide a clear reason why this listing was rejected. The owner will be notified to correct the details.
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Inappropriate images, incorrect category, or placeholder description."
              className="input text-sm p-3 mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button
                disabled={submittingAction}
                onClick={() => setRejectingItem(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                disabled={submittingAction || !rejectionReason.trim()}
                onClick={submitRejection}
                className="btn btn-danger btn-sm"
              >
                {submittingAction ? 'Rejecting...' : 'Reject Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
