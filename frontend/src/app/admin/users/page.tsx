'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Users, Search, Ban, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Suspend modal state
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.users({ search, role: roleFilter, page, limit: 10 });
      setUsersList(data.data?.users || []);
      setTotalPages(data.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') { router.push('/dashboard'); return; }
    loadUsers();
  }, [isAuthenticated, user, search, roleFilter, page, router]);

  const handleToggleSuspend = async (usr: User) => {
    if (usr.isSuspended) {
      // Unsuspend instantly
      if (!confirm(`Are you sure you want to unsuspend @${usr.username}?`)) return;
      try {
        await adminAPI.suspendUser(usr.id, false);
        loadUsers();
      } catch {
        alert("Failed to unsuspend user.");
      }
    } else {
      // Open suspend reason modal
      setSuspendingUser(usr);
      setSuspendReason('');
    }
  };

  const submitSuspend = async () => {
    if (!suspendingUser) return;
    setSubmittingAction(true);
    try {
      await adminAPI.suspendUser(suspendingUser.id, true, suspendReason);
      setSuspendingUser(null);
      loadUsers();
    } catch {
      alert("Failed to suspend user.");
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
                <Users size={24} className="text-[#007261]" /> Manage Users
              </h1>
              <p className="text-gray-500 mt-1">Suspend/unsuspend and view platforms users list</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, @username..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="input pl-10 h-10 text-sm"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                className="input text-sm h-10 w-44"
              >
                <option value="">All Roles</option>
                <option value="USER">User (Buyer)</option>
                <option value="SELLER">Seller</option>
                <option value="SERVICE_PROVIDER">Service Provider</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button onClick={loadUsers} className="btn btn-outline btn-sm h-10" aria-label="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4"><div className="skeleton h-10 w-40" /></td>
                        <td className="p-4"><div className="skeleton h-6 w-16" /></td>
                        <td className="p-4"><div className="skeleton h-6 w-24" /></td>
                        <td className="p-4"><div className="skeleton h-6 w-16" /></td>
                        <td className="p-4 text-right"><div className="skeleton h-8 w-20 ml-auto" /></td>
                      </tr>
                    ))
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        No users found matching query.
                      </td>
                    </tr>
                  ) : (
                    usersList.map(usr => (
                      <tr key={usr.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {usr.profile?.avatarUrl ? (
                              <img src={usr.profile.avatarUrl} className="avatar avatar-sm" alt="avatar" />
                            ) : (
                              <div className="avatar avatar-sm gradient-primary text-white text-xs">
                                {usr.profile?.fullName?.charAt(0) || '?'}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{usr.profile?.fullName || usr.username}</p>
                              <p className="text-xs text-gray-400">@{usr.username} • {usr.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="badge badge-accent text-[10px] uppercase font-bold">{usr.role}</span>
                        </td>
                        <td className="p-4 text-gray-500 text-xs">
                          {formatRelativeTime(usr.createdAt)}
                        </td>
                        <td className="p-4">
                          <span className={`badge text-[10px] ${usr.isSuspended ? 'badge-red' : 'badge-green'}`}>
                            {usr.isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleSuspend(usr)}
                            className={`btn btn-sm ${usr.isSuspended ? 'btn-outline' : 'btn-danger'}`}
                          >
                            {usr.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold ${
                    page === i + 1 ? 'bg-[#007261] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#007261]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suspend Reason Modal */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-4">
              <Ban size={20} />
              <h3>Suspend @{suspendingUser.username}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Please enter the suspension reason. The user will be notified of this reason upon logging in.
            </p>
            <textarea
              required
              rows={3}
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              placeholder="e.g. Terms of Service violation — posting fake listings"
              className="input text-sm p-3 mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button
                disabled={submittingAction}
                onClick={() => setSuspendingUser(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                disabled={submittingAction || !suspendReason.trim()}
                onClick={submitSuspend}
                className="btn btn-danger btn-sm"
              >
                {submittingAction ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
