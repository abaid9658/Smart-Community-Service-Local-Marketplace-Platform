'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard, Package, Briefcase, ShoppingBag,
  CalendarCheck, Heart, MessageCircle, Bell, Settings,
  Users, Shield, BarChart3, FileText, X, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'dashboard' | 'admin';
}

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
  description?: string;
}

const dashboardNav: NavItem[] = [
  { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview', description: 'Your dashboard' },
  { href: '/dashboard/my-listings', icon: <Package size={18} />, label: 'My Listings', roles: ['SELLER', 'ADMIN', 'SUPER_ADMIN'], description: 'Manage products' },
  { href: '/dashboard/my-services', icon: <Briefcase size={18} />, label: 'My Services', roles: ['SERVICE_PROVIDER', 'ADMIN', 'SUPER_ADMIN'], description: 'Manage services' },
  { href: '/dashboard/my-bookings', icon: <CalendarCheck size={18} />, label: 'Bookings', description: 'Appointments' },
  { href: '/dashboard/messages', icon: <MessageCircle size={18} />, label: 'Messages', description: 'Chat' },
  { href: '/dashboard/favorites', icon: <Heart size={18} />, label: 'Favorites', description: 'Saved items' },
  { href: '/dashboard/notifications', icon: <Bell size={18} />, label: 'Notifications', description: 'Alerts' },
  { href: '/dashboard/settings', icon: <Settings size={18} />, label: 'Settings', description: 'Account' },
];

const adminNav: NavItem[] = [
  { href: '/admin', icon: <BarChart3 size={18} />, label: 'Dashboard' },
  { href: '/admin/users', icon: <Users size={18} />, label: 'Users' },
  { href: '/admin/listings', icon: <Package size={18} />, label: 'Listings' },
  { href: '/admin/reports', icon: <FileText size={18} />, label: 'Reports' },
];

export default function Sidebar({ isOpen = false, onClose, variant = 'dashboard' }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const navItems = variant === 'admin' ? adminNav : dashboardNav;

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || '');
  });

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">LH</span>
            </div>
            <div>
              <p className="font-black text-[#007261] leading-none text-[15px]">LocalHub</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                {variant === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon btn-sm lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80">
            {user?.profile?.avatarUrl ? (
              <img src={user.profile.avatarUrl} alt="avatar" className="avatar avatar-md flex-shrink-0" />
            ) : (
              <div className="avatar avatar-md gradient-primary text-white text-sm font-bold flex-shrink-0">
                {user?.profile?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-gray-900">{user?.profile?.fullName || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
              <span className="badge badge-accent text-[10px] px-2 py-0.5 mt-1">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {filteredItems.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group relative
                  ${active
                    ? 'bg-[#007261] text-white shadow-md shadow-green-900/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#007261]'
                  }
                `}
              >
                <span className={`flex-shrink-0 transition-transform ${active ? 'scale-105' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {active && (
                  <ChevronRight size={14} className="text-white/60 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin section */}
        {variant === 'dashboard' && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <Shield size={18} />
              Admin Panel
              <ChevronRight size={14} className="ml-auto opacity-60" />
            </Link>
          </div>
        )}

        {/* Browse links */}
        <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Browse</p>
          <div className="space-y-0.5">
            {[
              { href: '/marketplace', icon: <ShoppingBag size={16} />, label: 'Marketplace' },
              { href: '/services', icon: <Briefcase size={16} />, label: 'Services' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-[#007261] transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <p className="text-[11px] text-gray-400 text-center">LocalHub © {new Date().getFullYear()}</p>
        </div>
      </aside>
    </>
  );
}
