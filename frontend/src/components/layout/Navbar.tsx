'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { authAPI, notificationAPI } from '@/lib/api';
import {
  Search, Bell, Menu, Settings,
  LogOut, LayoutDashboard, Shield, Heart,
  MessageCircle, ChevronDown, Plus, X
} from 'lucide-react';

interface NavbarProps {
  onMenuToggle?: () => void;
}

function getNotificationRoute(notif: { type: string; link?: string }): string {
  const raw = notif.link || '';
  if (raw.startsWith('/dashboard/messages')) return '/dashboard/messages';
  if (raw.startsWith('/dashboard/bookings')) return '/dashboard/my-bookings';
  if (raw.startsWith('/dashboard/my-listings')) return '/dashboard/my-listings';
  if (raw.startsWith('/dashboard/my-services')) return '/dashboard/my-services';
  if (raw.startsWith('/dashboard/payments')) return '/dashboard/payments';

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

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { notifications, unreadCount, setNotifications } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      notificationAPI.list().then(({ data }) => {
        const d = data?.data;
        if (d) setNotifications(d.notifications || [], d.unreadCount || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    clearAuth();
    router.push('/');
  };

  const initials = user?.profile?.fullName
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const navLinks = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/services', label: 'Services' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-white/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

          {/* Mobile Menu Toggle */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="btn btn-ghost btn-icon lg:hidden flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">LH</span>
            </div>
            <span className="font-black text-lg hidden sm:block">
              <span className="text-[#007261]">Local</span>
              <span className="text-gray-900">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0.5 ml-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname.startsWith(link.href)
                    ? 'text-[#007261] bg-[#e6f4f1] font-semibold'
                    : 'text-gray-600 hover:text-[#007261] hover:bg-[#e6f4f1]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar — Desktop */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-3 hidden md:flex">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input pl-10 h-10 bg-gray-50/80 text-sm rounded-xl border-gray-200 focus:border-[#007261]"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="btn btn-ghost btn-icon md:hidden"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {!mounted ? (
              <div className="w-20 h-9 bg-gray-100 rounded-xl animate-pulse" />
            ) : isAuthenticated ? (
              <>
                {/* Create Listing Button */}
                {(user?.role === 'SELLER' || user?.role === 'SERVICE_PROVIDER') && (
                  <Link
                    href={user.role === 'SELLER' ? '/dashboard/my-listings/new' : '/dashboard/my-services/new'}
                    className="btn btn-primary btn-sm hidden sm:inline-flex gap-1.5"
                  >
                    <Plus size={15} />
                    <span className="hidden lg:inline">List</span>
                  </Link>
                )}

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                    className="btn btn-ghost btn-icon relative"
                    aria-label="Notifications"
                  >
                    <Bell size={19} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center leading-none px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 card animate-scale-in p-2 max-h-[400px] overflow-y-auto shadow-xl">
                      <div className="flex items-center justify-between px-3 py-2 mb-1">
                        <p className="font-bold text-sm">Notifications</p>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => notificationAPI.markAllRead()}
                            className="text-xs text-[#007261] font-semibold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <Bell size={28} className="mx-auto mb-2 opacity-40" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map(notif => (
                          <Link
                            key={notif.id}
                            href={getNotificationRoute(notif)}
                            onClick={() => {
                              setShowNotifications(false);
                              if (!notif.isRead) {
                                notificationAPI.markRead(notif.id).catch(() => {});
                              }
                            }}
                            className={`flex gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-[#e6f4f1]' : ''}`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.isRead ? 'bg-[#007261]' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold line-clamp-1">{notif.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </Link>
                        ))
                      )}
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="block text-center py-2.5 text-xs text-[#007261] font-semibold hover:underline border-t border-gray-100 mt-1"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div ref={userRef} className="relative">
                  <button
                    onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {user?.profile?.avatarUrl ? (
                      <img src={user.profile.avatarUrl} alt="avatar" className="avatar avatar-sm" />
                    ) : (
                      <div className="avatar avatar-sm gradient-primary text-white text-xs font-bold">
                        {initials}
                      </div>
                    )}
                    <ChevronDown size={14} className={`text-gray-400 hidden sm:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 card animate-scale-in py-1.5 shadow-xl">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-sm truncate">{user?.profile?.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
                        <span className="badge badge-accent mt-1.5 text-[10px]">
                          {user?.role?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="py-1">
                        {[
                          { href: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
                          { href: '/dashboard/messages', icon: <MessageCircle size={15} />, label: 'Messages' },
                          { href: '/dashboard/favorites', icon: <Heart size={15} />, label: 'Favorites' },
                          { href: '/dashboard/settings', icon: <Settings size={15} />, label: 'Settings' },
                          ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
                            ? [{ href: '/admin', icon: <Shield size={15} />, label: 'Admin Panel' }]
                            : []),
                        ].map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setShowUserMenu(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              pathname === item.href
                                ? 'text-[#007261] bg-[#e6f4f1] font-semibold'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-[#007261]'
                            }`}
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden px-4 pb-3 border-t border-gray-100">
            <form onSubmit={handleSearch} className="relative mt-2">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                autoFocus
                type="text"
                placeholder="Search products, services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input pl-10 h-10 text-sm w-full"
              />
            </form>
          </div>
        )}
      </nav>
    </>
  );
}
