import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How LocalHub collects, uses, and protects your personal information, and the rights you have over your data.',
};

const sections = [
  { id: 'collect', title: '1. Information We Collect' },
  { id: 'use', title: '2. How We Use Your Data' },
  { id: 'cookies', title: '3. Cookies' },
  { id: 'auth', title: '4. Authentication & Security' },
  { id: 'payments', title: '5. Payment Information' },
  { id: 'third-party', title: '6. Third-Party Services' },
  { id: 'rights', title: '7. Your Rights' },
  { id: 'retention', title: '8. Data Retention' },
  { id: 'deletion', title: '9. Account Deletion' },
  { id: 'children', title: '10. Children\u2019s Privacy' },
  { id: 'contact', title: '11. Contact Information' },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-[#1A1A2E] py-16">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={24} className="text-[#68FADD]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Privacy Policy</h1>
          <p className="text-white/60 text-sm">Last updated: January 1, 2026</p>
        </div>
      </section>

      <section className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-4 gap-10">
          <aside className="lg:col-span-1">
            <div className="card p-5 lg:sticky lg:top-24">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">On this page</p>
              <nav className="space-y-1">
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`} className="block text-sm text-gray-600 hover:text-[#007261] py-1 transition-colors">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-12 text-gray-700 leading-relaxed">
            <p>
              This Privacy Policy explains how LocalHub ("we", "us", "our") collects, uses, discloses, and safeguards your information when you use our website, mobile experience, and related services (the "Platform"). We've written it in plain language, in the spirit of regulations like the GDPR, so you can understand exactly what happens with your data.
            </p>

            <div id="collect">
              <h2 className="text-xl font-black text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="mb-2">We collect information you provide directly and information generated through your use of the Platform:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account information:</strong> name, username, email address, phone number, and profile details.</li>
                <li><strong>Listing content:</strong> product/service descriptions, images, pricing, and location details you choose to share.</li>
                <li><strong>Transaction data:</strong> bookings, orders, and payment confirmations (not full card numbers).</li>
                <li><strong>Communications:</strong> messages sent through our in-platform chat, and support inquiries.</li>
                <li><strong>Usage data:</strong> pages visited, features used, device type, browser, and IP address.</li>
              </ul>
            </div>

            <div id="use">
              <h2 className="text-xl font-black text-gray-900 mb-3">2. How We Use Your Data</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To create and maintain your account, and to verify your identity where required.</li>
                <li>To operate core features: listings, bookings, real-time chat, reviews, and notifications.</li>
                <li>To process payments securely through our payment partners.</li>
                <li>To detect and prevent fraud, abuse, and violations of our Terms.</li>
                <li>To improve the Platform through aggregated, non-identifying usage analysis.</li>
                <li>To send service-related communications, such as booking confirmations and security alerts.</li>
              </ul>
            </div>

            <div id="cookies">
              <h2 className="text-xl font-black text-gray-900 mb-3">3. Cookies</h2>
              <p>
                We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how LocalHub is used. For full details on the types of cookies we use and how to manage them, see our{' '}
                <Link href="/cookies" className="font-semibold text-[#007261] hover:underline">Cookie Policy</Link>.
              </p>
            </div>

            <div id="auth">
              <h2 className="text-xl font-black text-gray-900 mb-3">4. Authentication & Security</h2>
              <p>
                Passwords are stored using industry-standard hashing and are never visible to our team in plain text. Access tokens used to keep you signed in are stored securely on your device. We use encryption in transit (HTTPS) across the Platform, and apply access controls internally so only authorized systems and personnel can access user data.
              </p>
            </div>

            <div id="payments">
              <h2 className="text-xl font-black text-gray-900 mb-3">5. Payment Information</h2>
              <p>
                Payments are processed by Stripe, a PCI-compliant third-party payment processor. LocalHub does not store your full card number, CVV, or other sensitive payment credentials on our servers — these are handled directly by our payment processor under their own security and privacy standards.
              </p>
            </div>

            <div id="third-party">
              <h2 className="text-xl font-black text-gray-900 mb-3">6. Third-Party Services</h2>
              <p className="mb-2">We rely on a small number of trusted third parties to operate LocalHub, including:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Stripe</strong> — payment processing.</li>
                <li><strong>Cloud infrastructure providers</strong> — hosting and file storage for listing images and profile media.</li>
                <li><strong>Email delivery services</strong> — sending transactional emails such as booking confirmations.</li>
              </ul>
              <p className="mt-3">These providers only receive the data necessary to perform their function and are contractually bound to protect it.</p>
            </div>

            <div id="rights">
              <h2 className="text-xl font-black text-gray-900 mb-3">7. Your Rights</h2>
              <p className="mb-2">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate or incomplete data.</li>
                <li>Request deletion of your personal data, subject to legal or contractual retention needs.</li>
                <li>Object to or restrict certain processing of your data.</li>
                <li>Request a copy of your data in a portable format.</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us via our{' '}
                <Link href="/contact" className="font-semibold text-[#007261] hover:underline">Contact page</Link>.
              </p>
            </div>

            <div id="retention">
              <h2 className="text-xl font-black text-gray-900 mb-3">8. Data Retention</h2>
              <p>
                We retain personal data for as long as your account remains active, and for a limited period afterward where required for legal, tax, fraud-prevention, or dispute-resolution purposes. Transaction records may be retained longer where required by applicable financial regulations.
              </p>
            </div>

            <div id="deletion">
              <h2 className="text-xl font-black text-gray-900 mb-3">9. Account Deletion</h2>
              <p>
                You may request deletion of your account at any time from your account settings or by contacting support. Upon deletion, your public profile, listings, and personally identifying information are removed from active systems, though some data may be retained where required by law (such as completed transaction records).
              </p>
            </div>

            <div id="children">
              <h2 className="text-xl font-black text-gray-900 mb-3">10. Children's Privacy</h2>
              <p>
                LocalHub is not directed at individuals under the age of 18, and we do not knowingly collect personal data from children. If we become aware that a minor has created an account, we will take steps to delete the associated data.
              </p>
            </div>

            <div id="contact" className="card p-6 bg-[#e6f4f1] border-none">
              <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                <Mail size={18} className="text-[#007261]" /> 11. Contact Information
              </h2>
              <p>
                For privacy-related questions or requests, reach us at{' '}
                <Link href="/contact" className="font-semibold text-[#007261] hover:underline">privacy@localhub.pk</Link> or through our{' '}
                <Link href="/contact" className="font-semibold text-[#007261] hover:underline">Contact page</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
