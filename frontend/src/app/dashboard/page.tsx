'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { bookingAPI, productAPI, serviceAPI, authAPI } from '@/lib/api';
import { formatPrice, formatRelativeTime, getStatusBadge } from '@/lib/utils';
import {
  Package, Briefcase, CalendarCheck, TrendingUp,
  Star, Eye, ArrowUpRight, Bell, BarChart2,
  Clock, CheckCircle2, AlertCircle, Loader2, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentBookings, setRecentBookings] = useState<Record<string, unknown>[]>([]);
  const [myProducts, setMyProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      // Sync latest user profile and viewsCount
      authAPI.me().then(({ data }) => {
        if (data?.data) setUser(data.data);
      }).catch(() => {});

      const promises: Promise<unknown>[] = [bookingAPI.my({ limit: 5 })];

      if (user?.role === 'SELLER' || user?.role === 'SERVICE_PROVIDER') {
        promises.push(
          user.role === 'SELLER' ? productAPI.my({ limit: 5 }) : serviceAPI.my({ limit: 5 })
        );
      }

      const results = await Promise.all(promises) as Array<{ data?: { data?: unknown } }>;

      // bookingAPI.my returns { bookings: [...], total, page }
      const bookingsPayload = results[0]?.data?.data as Record<string, unknown> | undefined;
      setRecentBookings((bookingsPayload?.bookings as Record<string, unknown>[]) || []);

      // productAPI.my → { products: [...] } | serviceAPI.my → { services: [...] }
      if (results[1]) {
        const payload = results[1]?.data?.data as Record<string, unknown> | undefined;
        setMyProducts(((payload?.products || payload?.services) as Record<string, unknown>[]) || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadDashboard();
  }, [isAuthenticated]);

  // Dynamic chart data from recentBookings for the last 7 days
  const earningsData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toDateString(),
        day: days[d.getDay()],
        earnings: 0,
        bookings: 0,
      };
    });

    recentBookings.forEach((b: any) => {
      const bDate = new Date(b.createdAt).toDateString();
      const match = last7Days.find(day => day.dateStr === bDate);
      if (match) {
        match.bookings += 1;
        if (b.paymentStatus === 'PAID' || b.status === 'COMPLETED') {
          match.earnings += b.totalPrice || 0;
        }
      }
    });

    return last7Days.map(({ day, earnings, bookings }) => ({ day, earnings, bookings }));
  }, [recentBookings]);

  const activeListings = myProducts.filter((p: any) => p.status === 'ACTIVE').length;

  const quickStats = [
    {
      label: 'Total Bookings',
      value: recentBookings.length.toString(),
      icon: CalendarCheck,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: recentBookings.length > 0 ? `+${recentBookings.length}` : '0',
      positive: recentBookings.length > 0,
    },
    {
      label: 'Active Listings',
      value: activeListings.toString(),
      icon: user?.role === 'SERVICE_PROVIDER' ? Briefcase : Package,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: activeListings > 0 ? `+${activeListings}` : '0',
      positive: activeListings > 0,
    },
    {
      label: 'Avg. Rating',
      value: user?.profile?.averageRating?.toFixed(1) || '—',
      icon: Star,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      change: 'Stable',
      positive: false,
    },
    {
      label: 'Profile Views',
      value: user?.viewsCount?.toString() || '0',
      icon: Eye,
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      change: user?.viewsCount && user.viewsCount > 0 ? `+${user.viewsCount}` : '0',
      positive: user?.viewsCount && user.viewsCount > 0 ? true : false,
    },
  ];

  if (!isAuthenticated) return null;

  const firstName = user?.profile?.fullName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen" style={{ background: '#FAF9FD' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="page-with-sidebar">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="max-w-[1100px] mx-auto py-8 animate-fade-in">

          {/* ── Welcome Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {greeting}, {firstName}! 👋
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Here's what's happening with your account today.</p>
            </div>
            <div className="flex gap-2.5">
              {user?.role === 'SELLER' && (
                <Link href="/dashboard/my-listings/new" className="btn btn-primary btn-sm gap-1.5">
                  <Plus size={15} /> New Listing
                </Link>
              )}
              {user?.role === 'SERVICE_PROVIDER' && (
                <Link href="/dashboard/my-services/new" className="btn btn-primary btn-sm gap-1.5">
                  <Plus size={15} /> New Service
                </Link>
              )}
            </div>
          </div>

          {/* ── Quick Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-5">
                  <div className="skeleton h-10 w-10 rounded-xl mb-3" />
                  <div className="skeleton h-6 w-16 rounded mb-1.5" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
              ))
            ) : (
              quickStats.map(({ label, value, icon: Icon, bg, iconColor, change, positive }) => (
                <div key={label} className="card p-5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center`}>
                      <Icon size={20} className={iconColor} />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      positive ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-50'
                    }`}>
                      {change}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                </div>
              ))
            )}
          </div>

          {/* ── Charts & Bookings Row ── */}
          <div className="grid lg:grid-cols-5 gap-6 mb-8">

            {/* Earnings Chart */}
            <div className="card p-6 lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">Weekly Overview</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Bookings & earnings this week</p>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">
                  <TrendingUp size={14} />
                  +18%
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={earningsData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007261" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#007261" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v: any) => [formatPrice(v), 'Earnings']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E8E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#007261"
                    strokeWidth={2.5}
                    fill="url(#colorEarnings)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#007261', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Bookings */}
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-sm">Recent Bookings</h3>
                <Link href="/dashboard/my-bookings" className="text-xs text-[#007261] hover:underline flex items-center gap-1 font-semibold">
                  View all <ArrowUpRight size={12} />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-14 rounded-xl" />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <CalendarCheck size={36} className="mb-2 opacity-30" />
                  <p className="text-sm font-medium">No bookings yet</p>
                  <p className="text-xs mt-1">Book a service to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentBookings.slice(0, 5).map((booking: any) => {
                    const sb = getStatusBadge(booking.status);
                    return (
                      <Link
                        key={booking.id}
                        href={`/dashboard/my-bookings`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                          <CalendarCheck size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate text-gray-900">
                            {(booking.service as any)?.title || 'Service Booking'}
                          </p>
                          <p className="text-[11px] text-gray-400">{formatRelativeTime(booking.createdAt as string)}</p>
                        </div>
                        <span className={`badge ${sb.class} text-[10px] px-2 py-0.5 flex-shrink-0`}>
                          {sb.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── My Listings / Services ── */}
          {(user?.role === 'SELLER' || user?.role === 'SERVICE_PROVIDER') && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">
                    My {user.role === 'SELLER' ? 'Products' : 'Services'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {myProducts.length} listing{myProducts.length !== 1 ? 's' : ''} total
                  </p>
                </div>
                <Link
                  href={user.role === 'SELLER' ? '/dashboard/my-listings' : '/dashboard/my-services'}
                  className="text-xs text-[#007261] hover:underline flex items-center gap-1 font-semibold"
                >
                  View all <ArrowUpRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-2xl" />
                  ))}
                </div>
              ) : myProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold text-gray-600">No listings yet</p>
                  <p className="text-xs mt-1">Create your first listing to start selling</p>
                  <Link
                    href={user.role === 'SELLER' ? '/dashboard/my-listings/new' : '/dashboard/my-services/new'}
                    className="btn btn-primary btn-sm mt-4"
                  >
                    <Plus size={14} /> Create First Listing
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myProducts.map((item: any) => {
                    const sb = getStatusBadge(item.status);
                    return (
                      <div key={item.id} className="card-flat p-4 flex items-center gap-3.5 group hover:border-[#007261]/30">
                        {item.images?.[0]?.url ? (
                          <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate text-gray-900">{item.title}</p>
                          <p className="text-sm font-bold text-[#007261] mt-0.5">{formatPrice(item.price as number)}</p>
                          <span className={`badge ${sb.class} text-[10px] px-2 py-0.5 mt-1`}>{sb.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
