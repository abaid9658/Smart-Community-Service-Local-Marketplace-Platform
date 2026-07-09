'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle, Zap } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

const demoAccounts = [
  { label: 'User', email: 'user@localhub.com', pass: 'User@12345', color: 'bg-blue-500' },
  { label: 'Seller', email: 'seller@localhub.com', pass: 'Seller@12345', color: 'bg-emerald-500' },
  { label: 'Provider', email: 'provider@localhub.com', pass: 'Provider@12345', color: 'bg-violet-500' },
  { label: 'Admin', email: 'admin@localhub.com', pass: 'Admin@12345', color: 'bg-amber-500' },
];

const features = [
  'Browse 12,000+ local products',
  'Book professional services instantly',
  'Real-time messaging with sellers',
  'Secure, verified community marketplace',
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      const res = await authAPI.login(data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const fillDemo = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: '#FAF9FD' }}>
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] gradient-hero flex-col relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full bg-[#68FADD]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/3 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center">
              <span className="text-white font-black text-lg">LH</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">LocalHub</span>
          </Link>

          {/* Main content */}
          <div className="mt-16 mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Zap size={14} className="text-[#68FADD]" />
              <span className="text-white/90 text-sm font-medium">Pakistan's #1 Community Marketplace</span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-5">
              Welcome<br />
              <span className="text-[#68FADD]">Back!</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-md">
              Sign in to continue buying, selling, and booking local professional services.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#68FADD]/20 border border-[#68FADD]/40 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-[#68FADD]" />
                  </div>
                  <span className="text-white/80 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo creds card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">🔑 Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <div key={acc.label} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${acc.color} flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-white/90 text-xs font-semibold">{acc.label}</p>
                    <p className="text-white/50 text-[11px] truncate">{acc.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-white/30 text-[11px] mt-3">Click a card on the right to auto-fill credentials</p>
          </div>

          <p className="text-white/30 text-xs mt-6">© {new Date().getFullYear()} LocalHub · All rights reserved</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center min-h-screen overflow-y-auto px-5 py-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-black text-sm">LH</span>
            </div>
            <span className="font-bold text-[#007261] text-lg">LocalHub</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-[32px] font-black text-gray-900 mb-1.5">Sign In</h2>
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#007261] font-semibold hover:underline">Create one free</Link>
            </p>
          </div>

          {apiError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`input pl-11 h-12 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#007261] hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  className={`input pl-11 pr-12 h-12 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full h-12 text-base font-bold rounded-2xl">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin-fast" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo quick login */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-4 font-medium uppercase tracking-wide">Quick demo access</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.pass)}
                  className="text-left p-3 rounded-xl border border-gray-200 hover:border-[#007261] hover:bg-[#e6f4f1] transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${acc.color}`} />
                    <span className="font-semibold text-[#007261] text-xs">{acc.label}</span>
                  </div>
                  <span className="text-gray-400 text-[11px] block truncate">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
