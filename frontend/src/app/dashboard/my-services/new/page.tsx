'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { serviceAPI, categoryAPI } from '@/lib/api';
import { Category } from '@/types';
import { Loader2, ArrowLeft, Plus, Image, Trash2 } from 'lucide-react';

export default function NewServicePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('3');
  const [revisions, setRevisions] = useState('3');
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Custom Packages (Basic, Standard, Premium)
  const [pkgBasicDesc, setPkgBasicDesc] = useState('');
  const [pkgBasicPrice, setPkgBasicPrice] = useState('');
  const [pkgBasicDays, setPkgBasicDays] = useState('2');

  const [pkgStandardDesc, setPkgStandardDesc] = useState('');
  const [pkgStandardPrice, setPkgStandardPrice] = useState('');
  const [pkgStandardDays, setPkgStandardDays] = useState('4');

  const [pkgPremiumDesc, setPkgPremiumDesc] = useState('');
  const [pkgPremiumPrice, setPkgPremiumPrice] = useState('');
  const [pkgPremiumDays, setPkgPremiumDays] = useState('7');

  // Custom FAQs
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');

  // Image files uploading state
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

  const handleAddFAQ = (e: React.MouseEvent) => {
    e.preventDefault();
    if (faqQ.trim() && faqA.trim()) {
      setFaqs(prev => [...prev, { question: faqQ.trim(), answer: faqA.trim() }]);
      setFaqQ('');
      setFaqA('');
    }
  };

  const handleRemoveFAQ = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('deliveryDays', deliveryDays);
    formData.append('revisions', revisions);
    formData.append('categoryId', categoryId);
    formData.append('city', city);
    formData.append('location', location);
    formData.append('tags', JSON.stringify(tags));
    formData.append('faq', JSON.stringify(faqs));

    // Construct packages structure
    const packages = [
      { name: 'Basic', description: pkgBasicDesc || 'Basic entry-level setup service', price: parseFloat(pkgBasicPrice) || parseFloat(price) * 0.7, deliveryDays: parseInt(pkgBasicDays) },
      { name: 'Standard', description: pkgStandardDesc || description, price: parseFloat(pkgStandardPrice) || parseFloat(price), deliveryDays: parseInt(pkgStandardDays) },
      { name: 'Premium', description: pkgPremiumDesc || 'Advanced implementation with premium files & priorities', price: parseFloat(pkgPremiumPrice) || parseFloat(price) * 1.5, deliveryDays: parseInt(pkgPremiumDays) },
    ];
    formData.append('packages', JSON.stringify(packages));

    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      await serviceAPI.create(formData);
      router.push('/dashboard/my-services');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create service listing.');
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
          <Link href="/dashboard/my-services" className="inline-flex items-center gap-2 text-sm text-[#007261] font-semibold hover:underline mb-6">
            <ArrowLeft size={14} /> Back to My Services
          </Link>

          <h1 className="text-2xl font-black mb-1">Create Service Offer</h1>
          <p className="text-gray-500 mb-8">Offer your professional skills, trade, or local service. Requires review from administrators.</p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service details Card */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base border-b border-gray-50 pb-2 mb-2">Service details</h3>

              <div>
                <label className="text-sm font-semibold mb-1 block">Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Professional plumbing, AC repair, website design"
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
                  placeholder="Specify full details of what services you provide, tools you use, etc..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input text-sm p-3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Base Price (PKR)</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 5000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Base Delivery (Days)</label>
                  <input
                    required
                    type="number"
                    value={deliveryDays}
                    onChange={e => setDeliveryDays(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Revisions Included</label>
                  <input
                    required
                    type="number"
                    value={revisions}
                    onChange={e => setRevisions(e.target.value)}
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
                    placeholder="e.g. Lahore"
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
                    placeholder="e.g. DHA Phase 6"
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
                  placeholder="e.g. repair, plumber, web"
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

            {/* Custom Packages Tabs/Fields */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base border-b border-gray-50 pb-2 mb-2">Service Packages</h3>
              
              <div className="space-y-6">
                {/* Basic package details */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Basic Package</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Basic Price (PKR)" value={pkgBasicPrice} onChange={e => setPkgBasicPrice(e.target.value)} className="input text-xs" />
                    <input type="number" placeholder="Basic Days" value={pkgBasicDays} onChange={e => setPkgBasicDays(e.target.value)} className="input text-xs" />
                  </div>
                  <input type="text" placeholder="Description of Basic Package" value={pkgBasicDesc} onChange={e => setPkgBasicDesc(e.target.value)} className="input text-xs" />
                </div>

                {/* Standard package details */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Standard Package</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Standard Price (PKR)" value={pkgStandardPrice} onChange={e => setPkgStandardPrice(e.target.value)} className="input text-xs" />
                    <input type="number" placeholder="Standard Days" value={pkgStandardDays} onChange={e => setPkgStandardDays(e.target.value)} className="input text-xs" />
                  </div>
                  <input type="text" placeholder="Description of Standard Package" value={pkgStandardDesc} onChange={e => setPkgStandardDesc(e.target.value)} className="input text-xs" />
                </div>

                {/* Premium package details */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Premium Package</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Premium Price (PKR)" value={pkgPremiumPrice} onChange={e => setPkgPremiumPrice(e.target.value)} className="input text-xs" />
                    <input type="number" placeholder="Premium Days" value={pkgPremiumDays} onChange={e => setPkgPremiumDays(e.target.value)} className="input text-xs" />
                  </div>
                  <input type="text" placeholder="Description of Premium Package" value={pkgPremiumDesc} onChange={e => setPkgPremiumDesc(e.target.value)} className="input text-xs" />
                </div>
              </div>
            </div>

            {/* Custom FAQs */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base border-b border-gray-50 pb-2 mb-2">FAQs (Frequently Asked Questions)</h3>
              
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-xs text-gray-700">Q: {faq.question}</p>
                      <p className="text-xs text-gray-500 mt-1">A: {faq.answer}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveFAQ(index)} className="text-red-500 hover:text-red-600 font-bold">×</button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-50 pt-3">
                <input
                  type="text"
                  placeholder="Question (e.g. Do you offer warranty?)"
                  value={faqQ}
                  onChange={e => setFaqQ(e.target.value)}
                  className="input text-xs"
                />
                <input
                  type="text"
                  placeholder="Answer (e.g. Yes, we provide 6 months warranty...)"
                  value={faqA}
                  onChange={e => setFaqA(e.target.value)}
                  className="input text-xs"
                />
                <button onClick={handleAddFAQ} className="btn btn-outline btn-sm w-full font-semibold">
                  Add FAQ
                </button>
              </div>
            </div>

            {/* Images Upload */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-base border-b border-gray-50 pb-2 mb-2">Upload Gallery Images</h3>
              
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
                <><Loader2 size={18} className="animate-spin-fast" /> Publishing service listing...</>
              ) : 'Submit for Approval'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
