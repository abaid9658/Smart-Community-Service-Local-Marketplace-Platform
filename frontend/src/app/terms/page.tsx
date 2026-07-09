import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FileText, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms that govern your use of LocalHub — covering accounts, buying and selling, bookings, payments, refunds, and your responsibilities as a member of our community.',
};

const sections = [
  { id: 'accounts', title: '1. User Accounts' },
  { id: 'platform-usage', title: '2. Platform Usage' },
  { id: 'buying-selling', title: '3. Buying & Selling Rules' },
  { id: 'bookings', title: '4. Service Booking Rules' },
  { id: 'responsibilities', title: '5. User Responsibilities' },
  { id: 'payments', title: '6. Payments' },
  { id: 'refunds', title: '7. Refunds & Cancellations' },
  { id: 'ip', title: '8. Intellectual Property' },
  { id: 'prohibited', title: '9. Prohibited Activities' },
  { id: 'suspension', title: '10. Account Suspension & Termination' },
  { id: 'content', title: '11. Content Ownership' },
  { id: 'liability', title: '12. Limitation of Liability' },
  { id: 'changes', title: '13. Changes to These Terms' },
  { id: 'law', title: '14. Governing Law' },
  { id: 'contact', title: '15. Contact Information' },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-[#1A1A2E] py-16">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <FileText size={24} className="text-[#68FADD]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Terms & Conditions</h1>
          <p className="text-white/60 text-sm">Last updated: January 1, 2026</p>
        </div>
      </section>

      <section className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-4 gap-10">
          {/* Table of contents */}
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

          {/* Content */}
          <div className="lg:col-span-3 space-y-12 text-gray-700 leading-relaxed">
            <p>
              These Terms & Conditions ("Terms") govern your access to and use of LocalHub, including our website, mobile experience, and related services (collectively, the "Platform"). By creating an account or using LocalHub in any way, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
            </p>

            <div id="accounts">
              <h2 className="text-xl font-black text-gray-900 mb-3">1. User Accounts</h2>
              <p className="mb-3">To buy, sell, or book services on LocalHub, you must create an account. You agree to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Keep your login credentials confidential and secure.</li>
                <li>Be at least 18 years old, or the age of majority in your jurisdiction, to register.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
              </ul>
              <p className="mt-3">You are responsible for all activity that occurs under your account.</p>
            </div>

            <div id="platform-usage">
              <h2 className="text-xl font-black text-gray-900 mb-3">2. Platform Usage</h2>
              <p>
                LocalHub provides a marketplace connecting buyers and sellers of products, and clients and providers of local services. LocalHub is not a party to transactions between users — we provide the platform, tools, and infrastructure that make those transactions possible, but the agreement to buy, sell, or provide a service is between the users involved.
              </p>
            </div>

            <div id="buying-selling">
              <h2 className="text-xl font-black text-gray-900 mb-3">3. Buying & Selling Rules</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Sellers must accurately describe products, including condition, price, and availability.</li>
                <li>All listings are subject to review and approval before appearing publicly.</li>
                <li>Sellers may not list counterfeit, stolen, illegal, or prohibited items.</li>
                <li>Buyers are responsible for reviewing listing details before completing a purchase.</li>
                <li>LocalHub reserves the right to remove any listing that violates these Terms or applicable law.</li>
              </ul>
            </div>

            <div id="bookings">
              <h2 className="text-xl font-black text-gray-900 mb-3">4. Service Booking Rules</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Service providers must honor confirmed bookings and communicate any delays promptly.</li>
                <li>Clients must provide accurate details necessary to complete the booked service.</li>
                <li>Either party may cancel a booking in accordance with the cancellation terms shown at booking time.</li>
                <li>Disputes about service quality should first be raised through LocalHub's messaging and review system, and may be escalated to our support team.</li>
              </ul>
            </div>

            <div id="responsibilities">
              <h2 className="text-xl font-black text-gray-900 mb-3">5. User Responsibilities</h2>
              <p>By using LocalHub, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Communicate honestly and respectfully with other users.</li>
                <li>Only submit reviews based on genuine transactions or bookings.</li>
                <li>Comply with all applicable local, provincial, and national laws.</li>
                <li>Not misrepresent your identity, qualifications, or the nature of your goods or services.</li>
              </ul>
            </div>

            <div id="payments">
              <h2 className="text-xl font-black text-gray-900 mb-3">6. Payments</h2>
              <p>
                Payments made through LocalHub are processed via secure third-party payment providers (including Stripe). LocalHub does not store your full card details. By making a payment, you authorize us and our payment processor to charge the agreed amount for the product or service booked. Prices are listed in Pakistani Rupees (PKR) unless otherwise stated.
              </p>
            </div>

            <div id="refunds">
              <h2 className="text-xl font-black text-gray-900 mb-3">7. Refunds & Cancellations</h2>
              <p>
                Refund eligibility depends on the nature of the transaction, the seller's or provider's stated policy, and the circumstances of the request. LocalHub facilitates communication between parties to resolve refund requests fairly, and may step in to mediate disputes reported through our platform. Refunds for payment processing errors are handled in accordance with our payment provider's policies.
              </p>
            </div>

            <div id="ip">
              <h2 className="text-xl font-black text-gray-900 mb-3">8. Intellectual Property</h2>
              <p>
                The LocalHub name, logo, design, and underlying software are the property of LocalHub and may not be copied, modified, or used without written permission. Users retain ownership of the content they upload (such as photos and descriptions) but grant LocalHub a non-exclusive, worldwide license to display that content on the Platform for the purpose of operating our services.
              </p>
            </div>

            <div id="prohibited">
              <h2 className="text-xl font-black text-gray-900 mb-3">9. Prohibited Activities</h2>
              <p className="mb-2">You may not use LocalHub to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>List illegal, counterfeit, or restricted goods and services.</li>
                <li>Harass, threaten, or defraud other users.</li>
                <li>Circumvent LocalHub's payment or fee systems.</li>
                <li>Scrape, reverse-engineer, or interfere with the Platform's operation.</li>
                <li>Create multiple accounts to manipulate reviews, ratings, or listings.</li>
              </ul>
            </div>

            <div id="suspension">
              <h2 className="text-xl font-black text-gray-900 mb-3">10. Account Suspension & Termination</h2>
              <p>
                LocalHub may suspend or terminate accounts that violate these Terms, engage in fraudulent behavior, or receive repeated, substantiated reports from other users. Where possible, we will notify you of the reason for any action taken against your account. You may also close your account at any time from your account settings.
              </p>
            </div>

            <div id="content">
              <h2 className="text-xl font-black text-gray-900 mb-3">11. Content Ownership</h2>
              <p>
                Reviews, messages, and listing content submitted to LocalHub remain the property of the user who created them, subject to the license granted in Section 8. LocalHub may remove content that violates these Terms without prior notice.
              </p>
            </div>

            <div id="liability">
              <h2 className="text-xl font-black text-gray-900 mb-3">12. Limitation of Liability</h2>
              <p>
                LocalHub provides the Platform on an "as is" and "as available" basis. To the fullest extent permitted by law, LocalHub is not liable for disputes, losses, or damages arising from transactions between users, the quality of goods or services exchanged, or the conduct of any user on or off the Platform. Our liability for any claim relating to the Platform is limited to the fees, if any, paid by you to LocalHub in the twelve months preceding the claim.
              </p>
            </div>

            <div id="changes">
              <h2 className="text-xl font-black text-gray-900 mb-3">13. Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time to reflect changes in our services or applicable law. Material changes will be communicated via the Platform or by email. Continued use of LocalHub after changes take effect constitutes acceptance of the updated Terms.
              </p>
            </div>

            <div id="law">
              <h2 className="text-xl font-black text-gray-900 mb-3">14. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the Islamic Republic of Pakistan, without regard to conflict-of-law principles. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Pakistan.
              </p>
            </div>

            <div id="contact" className="card p-6 bg-[#e6f4f1] border-none">
              <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                <Mail size={18} className="text-[#007261]" /> 15. Contact Information
              </h2>
              <p>
                Questions about these Terms can be sent to{' '}
                <Link href="/contact" className="font-semibold text-[#007261] hover:underline">legal@localhub.pk</Link> or through our{' '}
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
