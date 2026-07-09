'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { productAPI, categoryAPI } from '@/lib/api';
import { Category } from '@/types';
import { Loader2, ArrowLeft, Plus, Image, Trash2 } from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Image uploading state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      const { data } = await categoryAPI.list();
      setCategories(data.data || []);
    } catch {}
    setLoadingCats(false);
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadCategories();
  }, [isAuthenticated, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        setTags(prev => [...prev, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    if (discountPrice) formData.append('discountPrice', discountPrice);
    formData.append('stock', stock);
    formData.append('categoryId', categoryId);
    formData.append('city', city);
    formData.append('location', location);
    formData.append('tags', JSON.stringify(tags));

    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      await productAPI.create(formData);
      router.push('/dashboard/my-listings');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create listing.');
    }
    setSubmitting(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-with-sidebar">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="max-w-[800px] py-8">
          <Link href="/dashboard/my-listings" className="inline-flex items-center gap-2 text-sm text-[#007261] font-semibold hover:underline mb-6">
            <ArrowLeft size={14} /> Back to My Listings
          </Link>

          <h1 className="text-2xl font-black mb-1">Create Product Listing</h1>
          <p className="text-gray-500 mb-8">List a new physical item on the local marketplace. Every listing is reviewed by administrators.</p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Listing Details Card */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base border-b border-gray-50 pb-2 mb-2">Listing Details</h3>

              <div>
                <label className="text-sm font-semibold mb-1 block">Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Samsung Galaxy S23 Ultra - 256GB"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide details about condition, specifications, warranty, etc..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input text-sm p-3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Price (PKR)</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 150000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Discount Price (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 145000"
                    value={discountPrice}
                    onChange={e => setDiscountPrice(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Stock Quantity</label>
                  <input
                    required
                    type="number"
                    placeholder="1"
                    min="1"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Category</label>
                  <select
                    required
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="input text-sm h-11"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat =>
                      cat.children && cat.children.length > 0 ? (
                        <optgroup key={cat.id} label={cat.name}>
                          <option value={cat.id}>{cat.name} (General)</option>
                          {cat.children.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))}
                        </optgroup>
                      ) : (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">City</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Karachi"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Location / Area</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Clifton Block 5"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-semibold mb-1 block">Tags (Press Enter to add)</label>
                <input
                  type="text"
                  placeholder="e.g. phone, samsung, sale"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="input text-sm"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(tag => (
                      <span key={tag} className="badge badge-accent text-[10px] flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="font-bold hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Images Card */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base border-b border-gray-50 pb-2 mb-2">Upload Images</h3>
              
              <div className="flex flex-wrap gap-4 items-center">
                {previews.map((preview, index) => (
                  <div key={index} className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden relative">
                    <img src={preview} className="w-full h-full object-cover" alt="preview" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                
                {previews.length < 8 && (
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#007261] transition-colors flex flex-col items-center justify-center cursor-pointer text-gray-400">
                    <Image size={24} />
                    <span className="text-[10px] mt-1.5 font-semibold">Upload</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn btn-primary h-12 text-base font-bold shadow-lg shadow-[#007261]/25"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin-fast" /> Publishing listing...</>
              ) : 'Submit for Approval'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
