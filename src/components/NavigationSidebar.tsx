"use client";
import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { authService } from '../services/authService';

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ isOpen, onClose }) => {
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [userProfile] = useState(authService.getUserProfile());

  const whatsappUrl = "https://api.whatsapp.com/send?phone=919011557658&text=%E0%A4%9C%E0%A4%AF%20%E0%A4%97%E0%A5%81%E0%A4%B0%E0%A5%81%E0%A4%A6%E0%A5%87%E0%A4%B5";

  const togglePolicies = () => {
    setIsPoliciesOpen(!isPoliciesOpen);
  };

  const handleDeleteAccount = async () => {
    if (!authService.canDeleteAccount()) {
      const profile = authService.getUserProfile();
      if (!profile) {
        alert('You must be logged in to delete your account.');
        return;
      }
      if (!profile.email_verified) {
        alert('You must verify your email address before you can delete your account. Please check your email and verify your account first.');
        return;
      }
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your reading progress, downloaded books, and profile data will be permanently deleted.'
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'This is your final warning. Deleting your account will:\n\n• Remove all your reading progress\n• Delete your profile information\n• Remove all downloaded books\n• Cannot be undone\n\nAre you absolutely sure?'
    );

    if (!doubleConfirmed) return;

    try {
      await authService.deleteAccount();
      alert('Your account has been successfully deleted. You will now be signed out.');
      onClose();
      window.location.reload();
    } catch {
      alert('Failed to delete account. Please try again or contact support.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 w-64 sm:w-72 md:w-80 max-w-[80vw] bg-white shadow-2xl z-[70] rounded-l-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-tl-2xl">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="p-4">
          <nav className="space-y-2">
            <button
              onClick={() => {
                window.location.href = '/about-us';
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group text-left"
            >
              <div className="w-6 h-6 flex items-center justify-center">📖</div>
              <span className="text-gray-700 group-hover:text-gray-900 font-medium">इस एप की कहानी</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <FaWhatsapp 
                size={24} 
                className="text-green-500 group-hover:text-green-600 transition-colors" 
              />
              <span className="text-gray-700 group-hover:text-gray-900 font-medium">WhatsApp Us</span>
            </a>

            <div>
              <button
                onClick={togglePolicies}
                className="w-full flex items-center justify-between space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">📜</div>
                  <span className="text-gray-700 group-hover:text-gray-900 font-medium">Policies</span>
                </div>
                {isPoliciesOpen ? (
                  <ChevronDown size={20} className="text-gray-500" />
                ) : (
                  <ChevronRight size={20} className="text-gray-500" />
                )}
              </button>

              {isPoliciesOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  <Link
                    href="/privacy-policy"
                    onClick={onClose}
                    className="block p-2 pl-8 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms-and-conditions"
                    onClick={onClose}
                    className="block p-2 pl-8 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    Terms and Conditions
                  </Link>
                  {authService.canDeleteAccount() && (
                    <button
                      onClick={handleDeleteAccount}
                      className="block w-full text-left p-2 pl-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete my account
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500 text-center">© 2025 Gurudev Books</p>
        </div>
      </div>
    </>
  );
};

export default NavigationSidebar;