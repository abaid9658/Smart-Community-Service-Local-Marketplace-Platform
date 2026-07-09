'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  description: string;
  bookingId?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
}

export default function CheckoutForm({
  clientSecret,
  paymentIntentId,
  amount,
  description,
  bookingId,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?booking_id=${bookingId || ''}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        const msg = error.message || 'Payment failed. Please try again.';
        setErrorMsg(msg);
        onError(msg);
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch {
      const msg = 'An unexpected error occurred.';
      setErrorMsg(msg);
      onError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order Summary */}
      <div className="bg-[#e6f4f1] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#007261] font-medium uppercase tracking-wide">Paying for</p>
          <p className="font-semibold text-gray-800 mt-0.5">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Amount</p>
          <p className="text-2xl font-black text-[#007261]">PKR {amount.toLocaleString()}</p>
        </div>
      </div>

      {/* Stripe PaymentElement */}
      <div className="border border-gray-200 rounded-2xl p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-[#007261]" />
          <p className="text-sm font-semibold text-gray-700">Card Details</p>
        </div>
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: { billingDetails: { name: 'auto' } },
          }}
        />
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="btn btn-primary w-full h-12 text-base font-bold gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock size={16} />
            Pay PKR {amount.toLocaleString()}
          </>
        )}
      </button>

      {/* Security note */}
      <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
        <Lock size={11} />
        Secured by Stripe — 256-bit SSL encryption
      </p>
    </form>
  );
}
