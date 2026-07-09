'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { adminAPI } from '@/lib/api';
import { AdminStats, User } from '@/types';
import { formatRelativeTime, getStatusBadge } from '@/lib/utils';
import {
  Users, Package, Briefcase, CalendarCheck, AlertCircle,
  TrendingUp, Clock, ArrowUpRight, Shield,
  BarChart3, Activity, DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const ROLE_COLORS = ['#007261', '#68FADD', '#1E40AF', '#7C3AED', '#DC2626'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.stats();
      setStats(data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') { router.push('/dashboard'); return; }
    loadStats();
  }, [isAuthenticated, user, router]);

  // Build monthly chart data from raw user timestamps
  const buildMonthlyData = (monthlyUsers: { createdAt: string }[]) => {
    const months: Record<string, number> = {};
    monthlyUsers.forEach(u => {
      const m = new Date(u.createdAt).toLocaleDateString('en', { month: 'short' });
      months[m] = (months[m] || 0) + 1;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600', change: '+12%' },
    { label: 'Products', value: stats.totalProducts.toLocaleString(), icon: Package, color: 'bg-green-50 text-green-600', change: '+8%' },
    { label: 'Services', value: stats.totalServices.toLocaleString(), icon: Briefcase, color: 'bg-purple-50 text-purple-600', change: '+15%' },
    { label: 'Total Bookings', value: stats.totalBookings.toLocaleString(), icon: CalendarCheck, color: 'bg-amber-50 text-amber-600', change: '+22%' },
    { label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', change: 'Live' },
    { label: 'Pending Approvals', value: stats.pendingApprovals.toLocaleString(), icon: Clock, color: 'bg-yellow-50 text-yellow-600', urgent: stats.pendingApprovals > 0 },
    { label: 'Pending Reports', value: stats.pendingReports.toLocaleString(), icon: AlertCircle, color: 'bg-red-50 text-red-600', urgent: stats.pendingReports > 0 },
  ] : [];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} variant="admin" />
      <div className="page-with-sidebar">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="max-w-[1024px] py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={20} className="text-[#007261]" />
                <h1 className="text-2xl font-black">Admin Dashboard</h1>
              </div>
              <p className="text-gray-500">Platform overview and management</p>
            </div>
            <div className="flex gap-3">
              {stats && stats.pendingApprovals > 0 && (
                <Link href="/admin/listings" className="btn btn-primary btn-sm gap-2">
                  <Clock size={14} />
                  {stats.pendingApprovals} Pending
                </Link>
              )}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)
              : statCards.map(({ label, value, icon: Icon, color, change, urgent }) => (
                  <div key={label} className={`card p-5 ${urgent ? 'border-orange-200' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon size={18} />
                      </div>
                      {urgent && (
                        <span className="badge badge-yellow text-[10px]">Action needed</span>
                      )}
                      {change && !urgent && (
                        <span className="text-xs font-medium text-green-600">{change}</span>
                      )}
                    </div>
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))
            }
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">User Growth</h3>
                  <p className="text-xs text-gray-400">New registrations — last 6 months</p>
                </div>
                <TrendingUp size={16} className="text-green-500" />
              </div>
              {loading ? (
                <div className="skeleton h-40 rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={buildMonthlyData(stats?.monthlyUsers || [])}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis hide />
                    <Tooltip formatter={(v: any) => [v, 'New Users']} />
                    <Bar dataKey="count" fill="#007261" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Monthly Revenue Chart */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">Monthly Revenue</h3>
                  <p className="text-xs text-gray-400">Completed payment revenue — last 6 months</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-600">${(stats?.totalRevenue || 0).toLocaleString()} total</span>
                  <DollarSign size={16} className="text-emerald-500" />
                </div>
              </div>
              {loading ? (
                <div className="skeleton h-40 rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats?.monthlyRevenue || []}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis hide />
                    <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Users by Role Pie */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">Users by Role</h3>
                  <p className="text-xs text-gray-400">Distribution across roles</p>
                </div>
                <BarChart3 size={16} className="text-[#007261]" />
              </div>
              {loading ? (
                <div className="skeleton h-40 rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={stats?.usersByRole?.map(r => ({ name: r.role.replace('_', ' '), value: r._count.role }))}
                      cx="50%" cy="50%" outerRadius={70} dataKey="value"
                    >
                      {stats?.usersByRole?.map((_, i) => (
                        <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bookings by Status */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold">Bookings by Status</h3>
                  <p className="text-xs text-gray-400">Distribution of booking states</p>
                </div>
                <BarChart3 size={16} className="text-amber-500" />
              </div>
              {loading ? (
                <div className="skeleton h-40 rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={stats?.bookingsByStatus?.map((b: any) => ({ name: b.status, value: b._count.status }))}
                      cx="50%" cy="50%" outerRadius={70} dataKey="value"
                    >
                      {stats?.bookingsByStatus?.map((_: any, i: number) => (
                        <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold">Recent Users</h3>
                <Link href="/admin/users" className="text-xs text-[#007261] flex items-center gap-1 hover:underline">
                  View all <ArrowUpRight size={12} />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
              ) : (
                <div className="space-y-2">
                  {stats?.recentUsers?.map((u: User) => (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      {u.profile?.avatarUrl ? (
                        <img src={u.profile.avatarUrl} className="avatar avatar-xs" alt="avatar" />
                      ) : (
                        <div className="avatar avatar-xs gradient-primary text-white text-[9px]">
                          {u.profile?.fullName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.profile?.fullName || u.username}</p>
                        <p className="text-xs text-gray-400">{formatRelativeTime(u.createdAt)}</p>
                      </div>
                      <span className="badge badge-accent text-[10px]">{u.role.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold">Recent Bookings</h3>
                <Activity size={16} className="text-[#007261]" />
              </div>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
              ) : (
                <div className="space-y-2">
                  {stats?.recentBookings?.map((b: any) => {
                    const sb = getStatusBadge(b.status);
                    return (
                      <div key={b.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                          <CalendarCheck size={12} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{b.service?.title || 'Booking'}</p>
                          <p className="text-xs text-gray-400">{b.client?.profile?.fullName}</p>
                        </div>
                        <span className={`badge ${sb.class} text-[10px]`}>{sb.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
