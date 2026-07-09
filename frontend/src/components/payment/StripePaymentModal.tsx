'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

// Initialize Stripe outside of component render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  description: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

export default function StripePaymentModal({
  isOpen,
  onClose,
  bookingId,
  amount,
  description,
  onPaymentSuccess,
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && bookingId && amount > 0) {
      initiatePayment();
    }
  }, [isOpen, bookingId, amount]);

  const initiatePayment = async () => {
    setLoading(true);
    setErrorMsg('');
    setClientSecret('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/payments/create-intent`,
        { amount, bookingId, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data?.success) {
        setClientSecret(response.data.data.clientSecret);
        setPaymentIntentId(response.data.data.paymentIntentId);
      } else {
        setErrorMsg('Failed to initialize payment gateway.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error connecting to payment gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBackend = async (piId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/payments/confirm`,
        { paymentIntentId: piId, bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data?.success) {
        onPaymentSuccess(piId);
      } else {
        setErrorMsg('Payment verification failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Verification error.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-[100] flex items-center justify-center p-4">
      <div className="card w-full max-w-[480px] p-6 relative overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">Secure Payment</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body content */}
        {loading && !clientSecret ? (
          <div className="py-16 text-center space-y-4">
            <Loader2 size={40} className="text-[#007261] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-600">Contacting Stripe secure servers...</p>
          </div>
        ) : errorMsg ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl">⚠️</div>
            <p className="text-sm font-semibold text-red-600">{errorMsg}</p>
            <button onClick={initiatePayment} className="btn btn-primary btn-sm">Try Again</button>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              paymentIntentId={paymentIntentId}
              amount={amount}
              description={description}
              bookingId={bookingId}
              onSuccess={(piId) => handleConfirmBackend(piId)}
              onError={(msg) => setErrorMsg(msg)}
            />
          </Elements>
        ) : null}
      </div>
    </div>
  );
}
