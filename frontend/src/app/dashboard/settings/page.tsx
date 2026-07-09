'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { userAPI } from '@/lib/api';
import { User, Shield, Briefcase, Camera, Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form profile state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Pakistan');
  
  // Custom links / portfolio
  const [website, setWebsite] = useState('');
  
  // Submitting status
  const [submitting, setSubmitting] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Role upgrades
  const [upgradingRole, setUpgradingRole] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.profile) {
      setFullName(user.profile.fullName || '');
      setBio(user.profile.bio || '');
      setPhone(user.profile.phone || '');
      setCity(user.profile.city || '');
      setAddress(user.profile.address || '');
      setCountry(user.profile.country || 'Pakistan');
      const links = user.profile.socialLinks as Record<string, string> | null | undefined;
      setWebsite(links?.website || '');
    }
  }, [isAuthenticated, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { data } = await userAPI.updateProfile({
        fullName,
        bio,
        phone,
        city,
        address,
        country,
        socialLinks: { website },
      });
      
      // Update global store
      const updatedUser = { ...user!, profile: data.data };
      setUser(updatedUser);
      setSuccessMsg('Profile updated successfully!');
    } catch {
      setErrorMsg('Failed to update profile settings.');
    }
    setSubmitting(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setAvatarLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('avatar', e.target.files[0]);

    try {
      const { data } = await userAPI.uploadAvatar(formData);
      const updatedUser = { ...user!, profile: data.data };
      setUser(updatedUser);
      setSuccessMsg('Profile avatar updated successfully!');
    } catch {
      setErrorMsg('Failed to upload profile avatar.');
    }
    setAvatarLoading(false);
  };

  const handleUpgradeRole = async (targetRole: 'SELLER' | 'SERVICE_PROVIDER') => {
    if (!confirm(`Are you sure you want to change your account type to ${targetRole.replace('_', ' ').toLowerCase()}?`)) return;
    setUpgradingRole(true);
    try {
      await userAPI.updateRole(targetRole);
      
      // Fetch full profile info to update store
      const { data } = await userAPI.profile(user!.username);
      setUser(data.data);
      setSuccessMsg('Account upgraded! Please log out and back in if details do not show up.');
      router.push('/dashboard');
    } catch {
      setErrorMsg('Failed to upgrade account role.');
    }
    setUpgradingRole(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-with-sidebar">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="max-w-[800px] py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black">Account Settings</h1>
            <p className="text-gray-500 mt-1">Configure profile details, location, bio info, and roles</p>
          </div>

          {successMsg && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl mb-6">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-6">
              {errorMsg}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left: Avatar Upload card */}
            <div className="md:col-span-1 space-y-6">
              <div className="card p-6 text-center flex flex-col items-center">
                <div className="relative group mb-4">
                  {user?.profile?.avatarUrl ? (
                    <img src={user.profile.avatarUrl} className="avatar avatar-xl" alt="avatar" />
                  ) : (
                    <div className="avatar avatar-xl gradient-primary text-white text-3xl font-black">
                      {user?.profile?.fullName?.charAt(0) || '?'}
                    </div>
                  )}

                  {/* Upload overlay */}
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    {avatarLoading ? (
                      <Loader2 className="text-white animate-spin" />
                    ) : (
                      <Camera className="text-white" size={24} />
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
                
                <h3 className="font-bold text-sm leading-snug">{user?.profile?.fullName}</h3>
                <p className="text-xs text-gray-400 mt-1">@{user?.username}</p>
                <span className="badge badge-accent mt-3 text-[10px]">{user?.role}</span>
              </div>

              {/* Upgrade account block */}
              {user?.role === 'USER' && (
                <div className="card p-5 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Become Partner</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Upgrade your account to list physical items on the marketplace or offer professional services.
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      disabled={upgradingRole}
                      onClick={() => handleUpgradeRole('SELLER')}
                      className="w-full btn btn-outline btn-sm font-semibold gap-1.5"
                    >
                      Become a Seller
                    </button>
                    <button
                      disabled={upgradingRole}
                      onClick={() => handleUpgradeRole('SERVICE_PROVIDER')}
                      className="w-full btn btn-primary btn-sm font-semibold gap-1.5"
                    >
                      <Briefcase size={12} /> Become a Provider
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Form fields */}
            <div className="md:col-span-2">
              <form onSubmit={handleProfileSubmit} className="card p-6 space-y-4">
                <h3 className="font-bold text-base border-b border-gray-50 pb-2 mb-2">Edit Public Profile</h3>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Bio / Profile Description</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="input text-sm p-3"
                    placeholder="Describe your background, skills, or what you buy/sell..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Street Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Website / Portfolio Link</label>
                  <input
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="input text-sm"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn btn-primary font-bold h-11 shadow-lg shadow-[#007261]/25 flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={16} /> Save Changes</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
