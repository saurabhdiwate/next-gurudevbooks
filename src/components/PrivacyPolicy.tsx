"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PrivacyPolicy: React.FC = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-30">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Privacy Policy</h1>
          </div>
        </div>
      </div>
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="prose max-w-none text-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Privacy Policy for GurudevBooks</h2>
              <p className="text-sm text-gray-500 mb-6">Effective Date: May 09, 2025</p>
              <p className="mb-4">This Privacy Policy describes how Qoptervzn Infocom Pvt Ltd (“we,” “us,” “our”) collects, uses, discloses, and protects your information when you use our website https://gurudevbooks.com and our mobile application (“App”).</p>
              <div className="bg-gray-50 p-4 rounded-md my-4">
                <p><strong>Registered Address:</strong> Balaji Nagar, Khat Road, Bhandara 441904, India</p>
                <p><strong>Contact:</strong> <a href="mailto:mail.gurudevbooks@gmail.com" className="text-blue-600 hover:underline">mail.gurudevbooks@gmail.com</a></p>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Information We Collect</h3>
              <p className="mb-4">We strive to minimize the collection of personal data. You may use our website and app to read books without registration.</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Account Information:</strong> If you create an account, we collect your email address and any information you provide.</li>
                <li><strong>Contact Data:</strong> When you contact us, we collect your email and message content.</li>
                <li><strong>Usage Data:</strong> We collect non-personal information such as device type, browser, app version, and pages visited for analytics and improvement.</li>
                <li><strong>Cookies and Similar Technologies:</strong> We may use cookies or similar technologies for functionality and analytics.</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. How We Use Your Data</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>To provide, maintain, and improve our website and app functionality</li>
                <li>To respond to your inquiries and support requests</li>
                <li>To analyze usage and enhance user experience</li>
                <li>To comply with legal obligations</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Data Sharing and Third Parties</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>When required by law or legal process</li>
                <li>To protect the rights, property, or safety of users or the public</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Data Security</h3>
              <p>We implement appropriate measures to protect your data against unauthorized access.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Data Retention and Deletion Policy</h3>
              <p>We retain your personal data only as long as necessary. Users can request deletion via account settings.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. User Rights and Consent</h3>
              <p>You can exercise rights by contacting us at <a href="mailto:mail.gurudevbooks@gmail.com" className="text-blue-600 hover:underline">mail.gurudevbooks@gmail.com</a>.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Children’s Privacy</h3>
              <p>Our website and app are not intended for children under the age of 13.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Changes to This Privacy Policy</h3>
              <p>We may update this policy from time to time.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Contact Information</h3>
              <p><strong>Qoptervzn Infocom Pvt Ltd</strong><br/>Balaji Nagar, Khat Road, Bhandara 441904, India<br/>Email: <a href="mailto:mail.gurudevbooks@gmail.com" className="text-blue-600 hover:underline">mail.gurudevbooks@gmail.com</a></p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10. Google Play Data Safety and Compliance</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>This Privacy Policy is available via an active URL and within the app.</li>
                <li>We have completed the Google Play Data Safety Form.</li>
                <li>We do not collect or share personal or sensitive user data without consent.</li>
                <li>Users can request deletion of their account and associated data.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;