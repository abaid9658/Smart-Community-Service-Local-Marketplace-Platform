'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { adminAPI } from '@/lib/api';
import { Report } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { CheckSquare, AlertOctagon, RefreshCw } from 'lucide-react';

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Resolve modal state
  const [resolvingReport, setResolvingReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.reports({ status: statusFilter });
      setReports(data.data?.reports || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') { router.push('/dashboard'); return; }
    loadReports();
  }, [isAuthenticated, user, statusFilter, router]);

  const handleUpdateStatus = async (report: Report, status: string) => {
    if (status === 'RESOLVED') {
      setResolvingReport(report);
      setAdminNote('');
    } else {
      if (!confirm(`Mark this report as ${status.toLowerCase()}?`)) return;
      try {
        await adminAPI.updateReport(report.id, { status });
        loadReports();
      } catch {
        alert("Failed to update report.");
      }
    }
  };

  const submitResolve = async () => {
    if (!resolvingReport) return;
    setSubmitting(true);
    try {
      await adminAPI.updateReport(resolvingReport.id, { status: 'RESOLVED', adminNote });
      setResolvingReport(null);
      loadReports();
    } catch {
      alert("Failed to resolve report.");
    }
    setSubmitting(false);
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
                <AlertOctagon size={24} className="text-[#007261]" /> Platform Reports
              </h1>
              <p className="text-gray-500 mt-1">Moderate spam, fraudulent listings, and user reports</p>
            </div>
            <button onClick={loadReports} className="btn btn-outline btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="card p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase mr-2">Filter by status:</span>
              {['', 'PENDING', 'RESOLVED', 'DISMISSED'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`btn btn-sm px-4 py-1.5 h-8 text-xs font-semibold rounded-xl transition-all ${
                    statusFilter === status
                      ? 'bg-[#007261] text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#007261]'
                  }`}
                >
                  {status === '' ? 'All Reports' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Report List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl animate-pulse" />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <CheckSquare size={48} className="mx-auto mb-4 text-[#007261]" />
              <p className="font-semibold">No reports to review</p>
              <p className="text-sm mt-1">Everything is clean and running smoothly.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map(report => (
                <div key={report.id} className="card p-6 flex flex-col justify-between">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pb-4 border-b border-gray-50">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge badge-red text-[10px] uppercase font-black">{report.reason}</span>
                        <span className={`badge text-[10px] ${
                          report.status === 'PENDING' ? 'badge-yellow' : report.status === 'RESOLVED' ? 'badge-green' : 'badge-gray'
                        }`}>{report.status}</span>
                      </div>
                      <h4 className="font-bold text-base text-gray-900">
                        Reported {report.product ? `Product: ${report.product.title}` : report.service ? `Service: ${report.service.title}` : 'User Account'}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Filed by <span className="font-semibold">@{report.reporter?.profile?.fullName || 'Anonymous'}</span> • {formatRelativeTime(report.createdAt)}
                      </p>
                    </div>

                    <div className="text-xs text-right">
                      {report.reportedUser && (
                        <p className="text-gray-500">Reported User: <span className="font-semibold text-gray-800">@{report.reportedUser.username}</span></p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl leading-relaxed italic border-l-4 border-red-400">
                    &ldquo;{report.description || 'No description provided.'}&rdquo;
                  </p>

                  {report.adminNote && (
                    <div className="text-xs text-gray-500 bg-[#e6f4f1] p-3 rounded-xl mb-4 border-l-4 border-[#007261]">
                      <span className="font-bold">Admin Resolution Note:</span> {report.adminNote}
                    </div>
                  )}

                  {report.status === 'PENDING' && (
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => handleUpdateStatus(report, 'DISMISSED')}
                        className="btn btn-outline btn-sm"
                      >
                        Dismiss Report
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report, 'RESOLVED')}
                        className="btn btn-primary btn-sm"
                      >
                        Resolve Report
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-2 text-[#007261] font-bold mb-4">
              <CheckSquare size={20} />
              <h3>Resolve Report</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Provide resolution notes. Specify any action taken (e.g., product removed, seller warned/suspended).
            </p>
            <textarea
              required
              rows={3}
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="e.g. Listing removed due to spam behavior. Seller account suspended."
              className="input text-sm p-3 mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button
                disabled={submitting}
                onClick={() => setResolvingReport(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                disabled={submitting || !adminNote.trim()}
                onClick={submitResolve}
                className="btn btn-primary btn-sm"
              >
                {submitting ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
