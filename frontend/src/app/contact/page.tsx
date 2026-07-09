'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Mail, Phone, MapPin, Clock, MessageCircle,
  Briefcase, LifeBuoy, HelpCircle, Send, CheckCircle2,
} from 'lucide-react';

const contactChannels = [
  {
    icon: LifeBuoy,
    title: 'Customer Support',
    desc: 'Questions about an order, a booking, or your account.',
    value: 'support@localhub.pk',
    responseTime: 'Typically replies within 24 hours',
  },
  {
    icon: Briefcase,
    title: 'Business Inquiries',
    desc: 'Advertising, bulk listings, or business accounts.',
    value: 'business@localhub.pk',
    responseTime: 'Typically replies within 2 business days',
  },
  {
    icon: MessageCircle,
    title: 'Partnerships',
    desc: 'Collaborations, integrations, and city partnerships.',
    value: 'partners@localhub.pk',
    responseTime: 'Typically replies within 3 business days',
  },
  {
    icon: HelpCircle,
    title: 'Technical Support',
    desc: 'Bugs, broken pages, or trouble using the platform.',
    value: 'tech@localhub.pk',
    responseTime: 'Typically replies within 24 hours',
  },
];

const subjectOptions = [
  'General question',
  'Order or booking issue',
  'Report a listing or user',
  'Business inquiry',
  'Partnership',
  'Technical issue',
  'Something else',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: subjectOptions[0], message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-40px] right-[10%] w-96 h-96 rounded-full bg-[#68FADD] opacity-10 blur-3xl" />
        </div>
        <div className="relative max-w-[900px] mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] mb-5">
            We're here to <span className="text-[#68FADD]">help</span>
          </h1>
          <p className="text-lg text-white/75 leading-relaxed max-w-xl mx-auto">
            Whether it's a quick question or something that needs a closer look, the LocalHub team reads every message.
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="max-w-[1280px] mx-auto px-6 -mt-10 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactChannels.map(({ icon: Icon, title, desc, value, responseTime }) => (
            <div key={title} className="card p-6">
              <div className="w-11 h-11 rounded-2xl bg-[#e6f4f1] flex items-center justify-center mb-4">
                <Icon size={20} className="text-[#007261]" />
              </div>
              <h3 className="font-bold text-base mb-1.5">{title}</h3>
              <p className="text-gray-500 text-sm mb-3 leading-relaxed">{desc}</p>
              <p className="font-semibold text-[#007261] text-sm break-all">{value}</p>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                <Clock size={11} /> {responseTime}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + Office info */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3 card p-8">
            <h2 className="text-2xl font-black mb-2">Send us a message</h2>
            <p className="text-gray-500 mb-8">Fill out the form and our team will get back to you soon.</p>

            {submitted ? (
              <div className="py-14 text-center">
                <CheckCircle2 size={44} className="text-[#007261] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-1.5">Message sent</h3>
                <p className="text-gray-500 text-sm">Thanks for reaching out — we'll reply to your email shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full name</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Your name"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email address</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="you@example.com"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    className="input"
                  >
                    {subjectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    placeholder="Tell us what's going on..."
                    className="input"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full font-bold gap-2">
                  {submitting ? 'Sending...' : <>Send Message <Send size={16} /></>}
                </button>
              </form>
            )}
          </div>

          {/* Office / quick info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <div className="w-11 h-11 rounded-2xl bg-[#e6f4f1] flex items-center justify-center mb-4">
                <MapPin size={20} className="text-[#007261]" />
              </div>
              <h3 className="font-bold mb-1.5">Our Office</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                LocalHub HQ<br />
                Software Technology Park,<br />
                Sahiwal, Punjab, Pakistan
              </p>
            </div>

            <div className="card p-6">
              <div className="w-11 h-11 rounded-2xl bg-[#e6f4f1] flex items-center justify-center mb-4">
                <Phone size={20} className="text-[#007261]" />
              </div>
              <h3 className="font-bold mb-1.5">Call Us</h3>
              <p className="text-gray-500 text-sm">+92 300 0000000</p>
              <p className="text-xs text-gray-400 mt-1">Mon – Sat, 10am – 7pm PKT</p>
            </div>

            <div className="card p-6">
              <div className="w-11 h-11 rounded-2xl bg-[#e6f4f1] flex items-center justify-center mb-4">
                <Mail size={20} className="text-[#007261]" />
              </div>
              <h3 className="font-bold mb-1.5">Email Us</h3>
              <p className="text-gray-500 text-sm">hello@localhub.pk</p>
            </div>

            <div className="card p-6 bg-[#e6f4f1] border-none">
              <h3 className="font-bold mb-1.5 text-[#007261]">Looking for quick answers?</h3>
              <p className="text-gray-600 text-sm mb-3">Check our FAQ before reaching out — you might find what you need faster.</p>
              <Link href="/about#how-it-works" className="text-sm font-semibold text-[#007261] hover:underline">
                Visit Help Center →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
