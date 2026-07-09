'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { bookingAPI, messageAPI } from '@/lib/api';
import { Booking } from '@/types';
import { formatPrice, formatDate, getStatusBadge } from '@/lib/utils';
import { CalendarCheck, ShieldAlert, Check, X, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Bookings list
  const [clientBookings, setClientBookings] = useState<Booking[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'client' | 'provider'>('client');
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const clientRes = await bookingAPI.my();
      setClientBookings(clientRes.data.data?.bookings || []);
      
      if (user?.role === 'SERVICE_PROVIDER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        const providerRes = await bookingAPI.provider();
        setProviderBookings(providerRes.data.data?.bookings || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadBookings();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'SERVICE_PROVIDER') {
      setActiveTab('provider');
    }
  }, [user?.role]);

  const handleStatusChange = async (id: string, status: string, reason?: string) => {
    if (!confirm(`Are you sure you want to change the status to ${status.toLowerCase()}?`)) return;
    try {
      await bookingAPI.updateStatus(id, status, reason);
      setCancellingBooking(null);
      loadBookings();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || "Failed to update booking status.");
    }
  };

  const startCancelBooking = (booking: Booking) => {
    setCancellingBooking(booking);
    setCancellationReason('');
  };

  const handleContact = async (targetId: string) => {
    try {
      await messageAPI.getOrCreate(targetId);
      router.push('/dashboard/messages');
    } catch {
      alert("Failed to start chat.");
    }
  };

  if (!isAuthenticated) return null;

  const currentBookings = activeTab === 'client' ? clientBookings : providerBookings;

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-with-sidebar">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="max-w-[1024px] py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <CalendarCheck size={24} className="text-[#007261]" /> Bookings & Appointments
              </h1>
              <p className="text-gray-500 mt-1">Track and manage your scheduled community services</p>
            </div>
            <button onClick={loadBookings} className="btn btn-outline btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Toggle Tabs if Provider */}
          {(user?.role === 'SERVICE_PROVIDER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <div className="flex border-b border-gray-100 mb-6 bg-white rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('client')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'client' ? 'bg-[#007261] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Services I Booked
              </button>
              <button
                onClick={() => setActiveTab('provider')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'provider' ? 'bg-[#007261] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Client Bookings
              </button>
            </div>
          )}

          {/* Bookings List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl animate-pulse" />)}
            </div>
          ) : currentBookings.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
              <CalendarCheck size={48} className="mx-auto mb-4 text-[#007261] opacity-50" />
              <p className="font-semibold text-gray-700">No appointments scheduled</p>
              <p className="text-sm text-gray-400 mt-1">Book services through the directory or list your services to get booked.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentBookings.map(booking => {
                const sb = getStatusBadge(booking.status);
                const title = booking.service?.title || 'Professional Service';
                const clientName = booking.client?.profile?.fullName || booking.client?.username || 'Client';
                const providerName = booking.provider?.profile?.fullName || booking.provider?.username || 'Provider';
                
                return (
                  <div key={booking.id} className="card p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-50 mb-4">
                        <div>
                          <span className={`badge ${sb.class} text-[10px] mb-2`}>{sb.label}</span>
                          <h4 className="font-bold text-base text-gray-900">{title}</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {activeTab === 'client' ? `Provider: ${providerName}` : `Client: ${clientName}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Total Price</p>
                          <p className="font-bold text-[#007261] text-lg">{formatPrice(booking.totalPrice)}</p>
                        </div>
                      </div>

                      {/* Date & Location */}
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-4">
                        <div>
                          <p className="text-gray-400">Scheduled Date</p>
                          <p className="font-semibold mt-0.5">{formatDate(booking.scheduledDate)} at {booking.scheduledTime}</p>
                        </div>
                        {booking.notes && (
                          <div>
                            <p className="text-gray-400">User Requirements</p>
                            <p className="italic mt-0.5">&ldquo;{booking.notes}&rdquo;</p>
                          </div>
                        )}
                      </div>

                      {/* Rejection / Cancellation note */}
                      {booking.cancellationReason && (
                        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl mb-4">
                          <span className="font-bold">Reason:</span> &ldquo;{booking.cancellationReason}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-gray-50">
                      {/* Messaging */}
                      <button
                        onClick={() => handleContact(activeTab === 'client' ? booking.providerId : booking.clientId)}
                        className="btn btn-outline btn-sm gap-1.5"
                      >
                        <MessageSquare size={13} /> Chat
                      </button>

                      {/* Provider Controls */}
                      {activeTab === 'provider' && booking.status === 'PENDING' && (
                        <>
                          <button onClick={() => startCancelBooking(booking)} className="btn btn-danger btn-sm">
                            Reject
                          </button>
                          <button onClick={() => handleStatusChange(booking.id, 'ACCEPTED')} className="btn btn-primary btn-sm">
                            Accept
                          </button>
                        </>
                      )}

                      {activeTab === 'provider' && booking.status === 'ACCEPTED' && (
                        <button onClick={() => handleStatusChange(booking.id, 'IN_PROGRESS')} className="btn btn-primary btn-sm">
                          Start Work
                        </button>
                      )}

                      {activeTab === 'provider' && booking.status === 'IN_PROGRESS' && (
                        <button onClick={() => handleStatusChange(booking.id, 'COMPLETED')} className="btn btn-primary btn-sm">
                          Complete Appointment
                        </button>
                      )}

                      {/* Client Controls */}
                      {activeTab === 'client' && ['PENDING', 'ACCEPTED'].includes(booking.status) && (
                        <button onClick={() => startCancelBooking(booking)} className="btn btn-danger btn-sm">
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cancellation / Rejection Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-4">
              <X size={20} />
              <h3>Cancel Appointment</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Please enter the reason for this cancellation or rejection. This note will be sent directly to the other party.
            </p>
            <textarea
              required
              rows={3}
              value={cancellationReason}
              onChange={e => setCancellationReason(e.target.value)}
              placeholder="e.g. Unforeseen schedule conflict, or requirement cannot be met."
              className="input text-sm p-3 mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancellingBooking(null)}
                className="btn btn-ghost btn-sm"
              >
                Go Back
              </button>
              <button
                disabled={!cancellationReason.trim()}
                onClick={() => handleStatusChange(
                  cancellingBooking.id,
                  activeTab === 'provider' ? 'REJECTED' : 'CANCELLED',
                  cancellationReason
                )}
                className="btn btn-danger btn-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
