'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { productAPI, favoriteAPI, messageAPI, reviewAPI } from '@/lib/api';
import { Product, Review } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  MapPin, Eye, Heart, MessageSquare, ShieldCheck,
  ChevronLeft, Star, ShoppingCart, Tag, Send, AlertCircle
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  
  // Review input state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const { data } = await productAPI.get(productId);
      setProduct(data.data);
      setReviews(data.data.reviews || []);
      if (data.data.images?.length > 0) {
        const primary = data.data.images.find((img: any) => img.isPrimary)?.url || data.data.images[0].url;
        setActiveImage(primary);
      }
      
      // Check favorites
      if (isAuthenticated) {
        const favRes = await favoriteAPI.list();
        const exists = favRes.data.data?.some((f: any) => f.productId === data.data.id);
        setIsFavorited(exists);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      await favoriteAPI.toggle({ productId: product?.id });
      setIsFavorited(!isFavorited);
    } catch {}
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (product?.sellerId === user?.id) {
      alert("This is your listing!");
      return;
    }
    try {
      // Create chat conversation
      const { data } = await messageAPI.getOrCreate(product!.sellerId);
      router.push('/dashboard/messages');
    } catch (err) {
      alert("Failed to start chat.");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!comment.trim()) return;

    setSubmittingReview(true);
    setReviewError('');
    try {
      const { data } = await reviewAPI.create({
        revieweeId: product!.sellerId,
        productId: product!.id,
        rating,
        comment,
      });
      setReviews(prev => [data.data, ...prev]);
      setComment('');
      setRating(5);
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9FD]">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-6">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/4 rounded" />
              <div className="skeleton h-12 w-1/3 rounded" />
              <div className="skeleton h-32 w-full rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF9FD] flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-24 text-gray-500">
          <AlertCircle size={64} className="mx-auto mb-4 text-[#007261] opacity-50" />
          <h2 className="text-2xl font-bold">Listing Not Found</h2>
          <p className="mt-2">This listing may have been sold, removed, or rejected.</p>
          <Link href="/marketplace" className="btn btn-primary mt-6">Back to Marketplace</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Breadcrumbs / Back */}
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-[#007261] font-semibold hover:underline mb-8">
          <ChevronLeft size={16} /> Back to Marketplace
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* ── Left Column: Media Gallery ──────────────── */}
          <div>
            <div className="card-flat overflow-hidden bg-white aspect-square relative mb-4">
              {activeImage ? (
                <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Tag size={64} />
                </div>
              )}
              {discountPct && (
                <span className="absolute top-4 left-4 badge badge-red text-xs py-1 px-3">-{discountPct}% OFF</span>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-white ${
                      activeImage === img.url ? 'border-[#007261]' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Column: Details & Actions ─────────── */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category */}
              {product.category && (
                <span className="badge badge-accent text-xs px-3 py-1 font-semibold">{product.category.name}</span>
              )}

              <h1 className="text-3xl font-black mt-4 mb-2 leading-tight text-gray-900">{product.title}</h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                {product.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={15} /> {product.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye size={15} /> {product.viewsCount} views
                </span>
                <span className="text-gray-300">|</span>
                <span>Listed {formatDate(product.createdAt)}</span>
              </div>

              {/* Price Block */}
              <div className="bg-[#e6f4f1] p-5 rounded-2xl border border-[#007261]/10 mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#007261]">
                    {formatPrice(product.discountPrice || product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`badge ${product.stock > 0 ? 'badge-green' : 'badge-red'} text-[11px]`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {product.stock > 0 && (
                    <span className="text-xs text-gray-500">({product.stock} items left)</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-1 rounded-xl flex items-center gap-1">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex gap-4">
                <button
                  onClick={handleContactSeller}
                  className="flex-1 btn btn-primary h-12 text-base font-bold shadow-lg shadow-[#007261]/25"
                >
                  <MessageSquare size={18} /> Chat with Seller
                </button>
                <button
                  onClick={handleFavorite}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                    isFavorited
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'border-gray-200 hover:border-gray-300 text-gray-500'
                  }`}
                  aria-label="Favorite"
                >
                  <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck size={14} className="text-[#007261]" /> Verified Platform Transaction Support Included
              </div>
            </div>
          </div>
        </div>

        {/* ── Seller Details Card ────────────────────── */}
        {product.seller && (
          <div className="card p-6 mb-12">
            <h3 className="font-bold text-base mb-4">About the Seller</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {product.seller.profile?.avatarUrl ? (
                  <img src={product.seller.profile.avatarUrl} className="avatar avatar-lg" alt="avatar" />
                ) : (
                  <div className="avatar avatar-lg gradient-primary text-white text-xl">
                    {product.seller.profile?.fullName?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg">{product.seller.profile?.fullName || product.seller.username}</h4>
                    {product.seller.profile?.isVerified && (
                      <span className="badge badge-accent text-[10px]">Verified Seller</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">@{product.seller.username}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <Star size={14} fill="#F59E0B" className="text-amber-400" />
                    <span className="font-semibold">{product.seller.profile?.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-400">({product.seller.profile?.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/profile/${product.seller.username}`} className="btn btn-outline btn-sm">
                  View Profile
                </Link>
                <button onClick={handleContactSeller} className="btn btn-primary btn-sm">
                  Contact
                </button>
              </div>
            </div>
            {product.seller.profile?.bio && (
              <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">{product.seller.profile.bio}</p>
            )}
          </div>
        )}

        {/* ── Reviews Section ────────────────────────── */}
        <div className="card p-6">
          <h2 className="text-xl font-black mb-6">Reviews & Feedback</h2>

          {/* Review input */}
          {isAuthenticated && user?.id !== product.sellerId && (
            <form onSubmit={handleReviewSubmit} className="mb-8 border-b border-gray-100 pb-8">
              <h3 className="font-bold text-sm mb-3">Leave a Review</h3>
              
              {reviewError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle size={14} /> {reviewError}
                </div>
              )}

              <div className="flex items-center gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star size={24} fill={star <= rating ? '#F59E0B' : 'none'} className="text-amber-400" />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write your review here..."
                rows={3}
                required
                className="input text-sm p-3 mb-4"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="btn btn-primary btn-sm font-semibold"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Review list */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No reviews yet for this product listing.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map(rev => (
                <div key={rev.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {rev.reviewer?.profile?.avatarUrl ? (
                        <img src={rev.reviewer.profile.avatarUrl} className="avatar avatar-sm" alt="avatar" />
                      ) : (
                        <div className="avatar avatar-sm gradient-primary text-white text-xs">
                          {rev.reviewer?.profile?.fullName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-sm">{rev.reviewer?.profile?.fullName || rev.reviewer?.username}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={11} fill={s <= rev.rating ? '#F59E0B' : 'none'} className="text-amber-400" />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400">{formatDate(rev.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 pl-11">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
