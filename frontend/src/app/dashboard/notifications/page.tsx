'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { notificationAPI } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, Trash2, CheckSquare, Eye, RefreshCw, MailOpen, MessageSquare, CalendarCheck, Star, Package, CreditCard, User } from 'lucide-react';

// Map notification type → valid route
function getNotificationRoute(notif: { type: string; link?: string }): string {
  const raw = notif.link || '';
  // Already a valid dashboard route?
  if (raw.startsWith('/dashboard/messages')) return '/dashboard/messages';
  if (raw.startsWith('/dashboard/bookings')) return '/dashboard/my-bookings';
  if (raw.startsWith('/dashboard/my-listings')) return '/dashboard/my-listings';
  if (raw.startsWith('/dashboard/my-services')) return '/dashboard/my-services';
  if (raw.startsWith('/dashboard/payments')) return '/dashboard/payments';

  // Derive from type
  switch (notif.type) {
    case 'MESSAGE': return '/dashboard/messages';
    case 'BOOKING_REQUEST':
    case 'BOOKING_ACCEPTED':
    case 'BOOKING_REJECTED':
    case 'BOOKING_COMPLETED':
      return '/dashboard/my-bookings';
    case 'REVIEW': return '/dashboard/my-listings';
    case 'LISTING_APPROVED':
    case 'LISTING_REJECTED':
      return '/dashboard/my-listings';
    case 'PAYMENT': return '/dashboard/payments';
    case 'PROFILE_VIEW': return '/dashboard';
    default: return '/dashboard/notifications';
  }
}

function getNotifIcon(type: string) {
  switch (type) {
    case 'MESSAGE': return <MessageSquare size={15} className="text-blue-600" />;
    case 'BOOKING_REQUEST':
    case 'BOOKING_ACCEPTED':
    case 'BOOKING_REJECTED':
    case 'BOOKING_COMPLETED':
      return <CalendarCheck size={15} className="text-emerald-600" />;
    case 'REVIEW': return <Star size={15} className="text-amber-500" />;
    case 'LISTING_APPROVED':
    case 'LISTING_REJECTED':
      return <Package size={15} className="text-[#007261]" />;
    case 'PAYMENT': return <CreditCard size={15} className="text-purple-600" />;
    case 'PROFILE_VIEW': return <User size={15} className="text-indigo-600" />;
    default: return <Bell size={15} className="text-[#007261]" />;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, setNotifications, markRead, markAllRead, removeNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationAPI.list();
      setNotifications(data.data.notifications || [], data.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadNotifications();
  }, [isAuthenticated, router]);

  const handleMarkRead = async (id: string) => {
    try { await notificationAPI.markRead(id); markRead(id); } catch {}
  };

  const handleMarkAllRead = async () => {
    try { await notificationAPI.markAllRead(); markAllRead(); } catch {}
  };

  const handleDelete = async (id: string) => {
    try { await notificationAPI.delete(id); removeNotification(id); } catch {}
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.isRead) await handleMarkRead(notif.id);
    router.push(getNotificationRoute(notif));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-with-sidebar">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="max-w-[800px] py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <Bell size={24} className="text-[#007261]" /> Notifications
                {unreadCount > 0 && (
                  <span className="badge badge-primary text-xs px-2">{unreadCount}</span>
                )}
              </h1>
              <p className="text-gray-500 mt-1">Stay updated with messages, bookings, and listing approvals</p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="btn btn-outline btn-sm gap-1.5 h-10 text-xs">
                  <CheckSquare size={14} /> Mark all read
                </button>
              )}
              <button onClick={loadNotifications} className="btn btn-outline btn-sm h-10" aria-label="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl animate-pulse" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
              <Bell size={48} className="mx-auto mb-4 text-[#007261] opacity-50" />
              <p className="font-semibold text-gray-700">No notifications</p>
              <p className="text-sm text-gray-400 mt-1">We&apos;ll alert you when something happens on your account.</p>
            </div>
          ) : (
            <div className="card divide-y divide-gray-100 overflow-hidden">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`flex items-start justify-between gap-4 p-4 cursor-pointer hover:bg-gray-50/80 transition-colors ${
                    !notif.isRead ? 'bg-[#e6f4f1]/50 border-l-4 border-[#007261]' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0 flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getNotifIcon(notif.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{notif.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1.5 block">{formatRelativeTime(notif.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="btn btn-ghost btn-icon w-8 h-8 rounded-lg text-[#007261]"
                        aria-label="Mark read"
                      >
                        <MailOpen size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="btn btn-ghost btn-icon w-8 h-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
