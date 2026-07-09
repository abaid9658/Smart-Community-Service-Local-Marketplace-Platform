'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Eye, EyeOff, Loader2, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscores only'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'SELLER', 'SERVICE_PROVIDER']),
  terms: z.boolean().refine(v => v, 'You must accept the terms'),
});

type FormData = z.infer<typeof schema>;

const roleOptions = [
  { value: 'USER', label: 'Buyer', desc: 'Browse and purchase products & services', icon: '🛒' },
  { value: 'SELLER', label: 'Seller', desc: 'List and sell physical products', icon: '📦' },
  { value: 'SERVICE_PROVIDER', label: 'Service Provider', desc: 'Offer professional services', icon: '💼' },
];

const stats = [
  { value: '12,000+', label: 'Products Listed' },
  { value: '3,500+', label: 'Service Providers' },
  { value: '28,000+', label: 'Happy Customers' },
  { value: '50+', label: 'Cities Active' },
];

const perks = [
  'Free to join — no hidden fees',
  'Reach thousands of local buyers',
  'Real-time chat with clients',
  'Verified community, zero spam',
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      const res = await authAPI.register(data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: '#FAF9FD' }}>
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] gradient-hero flex-col relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full bg-[#68FADD]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center">
              <span className="text-white font-black text-lg">LH</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">LocalHub</span>
          </Link>

          <div className="mt-16 mb-10">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-5">
              Join Pakistan's<br />
              <span className="text-[#68FADD]">Smartest Marketplace</span>
            </h1>
            <p className="text-white/70 text-base leading-relaxed mb-10 max-w-sm">
              Buy, sell, and hire local professionals — all in one trusted platform.
            </p>

            {/* Perks */}
            <div className="space-y-3 mb-10">
              {perks.map(p => (
                <div key={p} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#68FADD]/20 border border-[#68FADD]/40 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-[#68FADD]" />
                  </div>
                  <span className="text-white/80 text-sm">{p}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4">
                  <p className="text-2xl font-black text-[#68FADD] leading-none mb-1">{s.value}</p>
                  <p className="text-white/60 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs">© {new Date().getFullYear()} LocalHub · All rights reserved</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center py-10 px-5">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-black text-sm">LH</span>
            </div>
            <span className="font-bold text-[#007261] text-lg">LocalHub</span>
          </Link>

          <div className="mb-7">
            <h2 className="text-[30px] font-black text-gray-900 mb-1.5">Create Account</h2>
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#007261] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {apiError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-5">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-semibold mb-3 block text-gray-700">I want to...</label>
              <div className="grid grid-cols-1 gap-2.5">
                {roleOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedRole === opt.value
                        ? 'border-[#007261] bg-[#e6f4f1] shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input type="radio" value={opt.value} {...register('role')} className="hidden" />
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedRole === opt.value ? 'border-[#007261] bg-[#007261]' : 'border-gray-300'
                    }`}>
                      {selectedRole === opt.value && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('fullName')} placeholder="John Doe"
                  className={`input pl-11 h-12 ${errors.fullName ? 'input-error' : ''}`} />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1.5">{errors.fullName.message}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                <input {...register('username')} placeholder="johndoe"
                  className={`input pl-9 h-12 ${errors.username ? 'input-error' : ''}`} />
              </div>
              {errors.username && <p className="text-xs text-red-500 mt-1.5">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('email')} type="email" placeholder="john@example.com"
                  className={`input pl-11 h-12 ${errors.email ? 'input-error' : ''}`} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password')} type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={`input pl-11 pr-12 h-12 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" {...register('terms')} className="mt-0.5 w-4 h-4 accent-[#007261] cursor-pointer" />
              <span className="text-sm text-gray-600 leading-snug">
                I agree to the{' '}
                <Link href="/terms" className="text-[#007261] font-semibold hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#007261] font-semibold hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

            <button type="submit" disabled={isSubmitting}
              className="btn btn-primary w-full h-12 text-base font-bold rounded-2xl">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin-fast" /> Creating Account...</> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
