'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { serviceAPI, favoriteAPI, messageAPI, bookingAPI, reviewAPI } from '@/lib/api';
import { Service, Review, ServiceImage, Favorite } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  MapPin, Eye, Heart,
  ChevronLeft, Star, Clock, RefreshCw, AlertCircle, Calendar, CheckCircle
} from 'lucide-react';
import StripePaymentModal from '@/components/payment/StripePaymentModal';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  
  // Package Selector
  const [activeTab, setActiveTab] = useState<'basic' | 'standard' | 'premium'>('standard');
  
  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Stripe state
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadService = useCallback(async () => {
    try {
      const { data } = await serviceAPI.get(serviceId);
      setService(data.data);
      setReviews(data.data.reviews || []);
      if (data.data.images?.length > 0) {
        const primary = data.data.images.find((img: ServiceImage) => img.isPrimary)?.url || data.data.images[0].url;
        setActiveImage(primary);
      }
      
      if (isAuthenticated) {
        const favRes = await favoriteAPI.list();
        const exists = favRes.data.data?.some((f: Favorite) => f.serviceId === data.data.id);
        setIsFavorited(exists);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [serviceId, isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadService();
  }, [loadService]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      await favoriteAPI.toggle({ serviceId: service?.id });
      setIsFavorited(!isFavorited);
    } catch {}
  };

  const handleContactProvider = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (service?.providerId === user?.id) {
      alert("This is your service listing!");
      return;
    }
    try {
      await messageAPI.getOrCreate(service!.providerId);
      router.push('/dashboard/messages');
    } catch {
      alert("Failed to start chat.");
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push('/login'); return; }
    if (service?.providerId === user?.id) { setBookingError('You cannot book your own service.'); return; }
    if (!bookingDate) { setBookingError('Please select a date.'); return; }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(false);

    try {
      const { data } = await bookingAPI.create({
        serviceId: service!.id,
        scheduledDate: bookingDate,
        scheduledTime: bookingTime,
        notes: bookingNotes,
        packageName: currentPkg?.name,
      });
      const booking = data.data;
      setCreatedBookingId(booking.id || booking._id);
      setPaymentAmount(booking.totalPrice ?? currentPkg?.price ?? service!.price);
      setIsStripeOpen(true);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setBookingError(error?.response?.data?.message || 'Failed to create booking.');
    }
    setBookingLoading(false);
  };

  const handlePaymentSuccess = (_piId: string) => {
    setIsStripeOpen(false);
    setBookingSuccess(true);
    setBookingNotes('');
    setBookingDate('');
  };

  const handleStripeClose = () => {
    setIsStripeOpen(false);
    setBookingSuccess(true); // Booking exists even if payment skipped
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
        revieweeId: service!.providerId,
        serviceId: service!.id,
        rating,
        comment,
      });
      setReviews(prev => [data.data, ...prev]);
      setComment('');
      setRating(5);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setReviewError(error?.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9FD]">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="skeleton aspect-video rounded-2xl" />
            <div className="space-y-6">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/4 rounded" />
              <div className="skeleton h-12 w-1/3 rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#FAF9FD] flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-24 text-gray-500">
          <AlertCircle size={64} className="mx-auto mb-4 text-[#007261] opacity-50" />
          <h2 className="text-2xl font-bold">Service Not Found</h2>
          <p className="mt-2">This service listing may have been removed or deactivated.</p>
          <Link href="/services" className="btn btn-primary mt-6">Back to Services</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine Package Details
  const basicPkg = service.packages?.[0] || { name: 'Basic', description: 'Basic setup and configuration', price: service.price * 0.7, deliveryDays: Math.max(1, service.deliveryDays - 2) };
  const standardPkg = service.packages?.[1] || { name: 'Standard', description: service.description, price: service.price, deliveryDays: service.deliveryDays };
  const premiumPkg = service.packages?.[2] || { name: 'Premium', description: 'Advanced implementation with source files & priority support', price: service.price * 1.5, deliveryDays: service.deliveryDays + 3 };

  const currentPkg = activeTab === 'basic' ? basicPkg : activeTab === 'premium' ? premiumPkg : standardPkg;

  return (
    <div className="min-h-screen bg-[#FAF9FD]">
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-[#007261] font-semibold hover:underline mb-8">
          <ChevronLeft size={16} /> Back to Services
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* ── Left & Middle Column: Image, Package & Details ── */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              {/* Category */}
              {service.category && (
                <span className="badge badge-accent text-xs px-3 py-1 font-semibold">{service.category.name}</span>
              )}
              <h1 className="text-3xl font-black mt-4 mb-2 leading-tight text-gray-900">{service.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {service.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={15} /> {service.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye size={15} /> {service.viewsCount} views
                </span>
                <span>Created {formatDate(service.createdAt)}</span>
              </div>
            </div>

            {/* Gallery Image */}
            <div className="card-flat overflow-hidden bg-white aspect-video relative">
              {activeImage ? (
                <img src={activeImage} alt={service.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 gradient-primary">
                  <Clock size={64} className="text-white/40" />
                </div>
              )}
            </div>

            {/* Thumbnail Selection */}
            {service.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {service.images.map((img: ServiceImage) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-white ${
                      activeImage === img.url ? 'border-[#007261]' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}

            {/* Service Details */}
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-3">Service Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{service.description}</p>
            </div>

            {service.faq && service.faq.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-lg mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {service.faq.map((f, i) => (
                    <div key={i} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <p className="font-semibold text-sm text-gray-800">Q: {f.question}</p>
                      <p className="text-sm text-gray-500 mt-1 pl-4">A: {f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Package Selector & Booking Form ── */}
          <div className="space-y-6">
            {/* Package details */}
            <div className="card overflow-hidden">
              {/* Tabs */}
              <div className="flex bg-gray-50 border-b border-gray-100">
                {(['basic', 'standard', 'premium'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === tab
                        ? 'border-[#007261] text-[#007261] bg-white'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Package Content */}
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-4">
                  <h4 className="font-black text-xl">{currentPkg.name}</h4>
                  <span className="font-black text-2xl text-[#007261]">
                    {formatPrice(currentPkg.price)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">{currentPkg.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-gray-600 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-[#007261]" /> {currentPkg.deliveryDays} Days Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw size={14} className="text-[#007261]" /> {service.revisions} Revisions
                  </span>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleContactProvider} className="flex-1 btn btn-outline btn-sm">
                    Contact Provider
                  </button>
                  <button
                    onClick={handleFavorite}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                      isFavorited ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>

            {/* Booking appointment block */}
            <div className="card p-6 bg-white">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-[#007261]" /> Book this Service
              </h3>

              {bookingSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500 w-4 h-4 flex-shrink-0" />
                  Booking created! Check My Bookings page for status updates.
                </div>
              )}

              {bookingError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" /> {bookingError}
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="input text-xs py-2 h-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Preferred Time</label>
                  <select
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    className="input text-xs py-2 h-10"
                  >
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Requirements / Notes</label>
                  <textarea
                    placeholder="Specify any details, dimensions, or specific requests..."
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    rows={3}
                    className="input text-xs p-2.5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full btn btn-primary font-semibold text-sm py-2.5 shadow-lg shadow-[#007261]/25"
                >
                  {bookingLoading ? 'Processing...' : `Confirm Booking — ${formatPrice(currentPkg.price)}`}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Provider details card ── */}
        {service.provider && (
          <div className="card p-6 mb-12">
            <h3 className="font-bold text-base mb-4">About the Service Provider</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {service.provider.profile?.avatarUrl ? (
                  <img src={service.provider.profile.avatarUrl} className="avatar avatar-lg" alt="avatar" />
                ) : (
                  <div className="avatar avatar-lg gradient-primary text-white text-xl">
                    {service.provider.profile?.fullName?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg">{service.provider.profile?.fullName || service.provider.username}</h4>
                    {service.provider.profile?.isVerified && (
                      <span className="badge badge-accent text-[10px]">Verified Pro</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">@{service.provider.username}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <Star size={14} fill="#F59E0B" className="text-amber-400" />
                    <span className="font-semibold">{service.provider.profile?.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-400">({service.provider.profile?.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/profile/${service.provider.username}`} className="btn btn-outline btn-sm">
                  View Profile
                </Link>
                <button onClick={handleContactProvider} className="btn btn-primary btn-sm">
                  Chat
                </button>
              </div>
            </div>
            {service.provider.profile?.bio && (
              <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">{service.provider.profile.bio}</p>
            )}
          </div>
        )}

        {/* ── Reviews section ── */}
        <div className="card p-6">
          <h2 className="text-xl font-black mb-6">Provider Reviews & Ratings</h2>

          {isAuthenticated && user?.id !== service.providerId && (
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

          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No reviews yet for this service listing.</p>
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

      {service && (
        <StripePaymentModal
          isOpen={isStripeOpen}
          onClose={handleStripeClose}
          bookingId={createdBookingId}
          amount={paymentAmount}
          description={`${service.title} — ${currentPkg?.name || 'Standard'} Package`}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
