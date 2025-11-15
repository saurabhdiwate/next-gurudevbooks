"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TermsAndConditions: React.FC = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-30">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Terms and Conditions</h1>
          </div>
        </div>
      </div>
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="prose max-w-none text-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Terms and Conditions</h2>
              <p className="text-sm text-gray-500 mb-6">Effective Date: 05/05/2025</p>
              <p className="mb-4">Welcome to GurudevBooks.com. By accessing or using our website and services, you agree to comply with these Terms and Conditions.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Acceptance of Terms</h3>
              <p className="mb-4">By accessing or using GurudevBooks.com, you agree to these Terms and our Privacy Policy.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Use of the Website</h3>
              <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                <li>You must be at least 13 years old.</li>
                <li>Use the website for personal, non-commercial purposes only.</li>
                <li>Do not attempt unauthorized access or interfere with site operations.</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Intellectual Property</h3>
              <p>Public domain books are free to read and share. Website content is owned by us.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Disclaimer</h3>
              <p>We strive to ensure books are public domain. Contact us for any concerns.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Limitation of Liability</h3>
              <p>We are not liable for damages arising from use of the website.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6. Third-Party Links</h3>
              <p>We are not responsible for third-party sites linked from our website.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7. Changes to Terms</h3>
              <p>We may update these Terms at any time.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8. Governing Law</h3>
              <p>These Terms are governed by the laws of India.</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9. Contact Us</h3>
              <p><strong>Email:</strong> <a href="mailto:mail.gurudevbooks@gmail.com" className="text-blue-600 hover:underline">mail.gurudevbooks@gmail.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;