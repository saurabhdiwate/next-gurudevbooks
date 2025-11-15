"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Camera, Mail, MapPin, Edit3, Check, X } from 'lucide-react';
import { authService, UserProfile, ReadingProgress } from '../services/authService';
import { SupabaseDataService } from '../services/supabaseService';
import { Book } from '../types/Book';

interface ProfileScreenProps {
  onBack: () => void;
  onBookClick?: (book: Book) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onBookClick }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [completedBooks, setCompletedBooks] = useState<ReadingProgress[]>([]);
  const [recentBooks, setRecentBooks] = useState<ReadingProgress[]>([]);
  const [currentlyReadingData, setCurrentlyReadingData] = useState<any[]>([]);
  const [completedBooksData, setCompletedBooksData] = useState<any[]>([]);
  const [recentBooksData, setRecentBooksData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', town_village: '', state: '', email: '' });
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => { loadProfileData(); }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const userProfile = authService.getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setEditForm({
          name: userProfile.name || '',
          town_village: userProfile.town_village || '',
          state: userProfile.state || '',
          email: userProfile.email || ''
        });
      }
      const [progressData, completedData, recentData] = await Promise.all([
        authService.getReadingProgress(),
        authService.getCompletedBooks(),
        authService.getRecentBooks()
      ]);
      setReadingProgress(progressData);
      setCompletedBooks(completedData);
      setRecentBooks(recentData);
      if (completedData.length > 0) {
        const books = await Promise.all(completedData.slice(0, 5).map(cb => SupabaseDataService.getBookBySlug(cb.book_slug)));
        setCompletedBooksData(books.filter(Boolean).map(book => ({
          id: (book as any).slug,
          slug: (book as any).slug,
          title: (book as any).book_name,
          book_name: (book as any).book_name,
          author: (book as any).author,
          image_url: (book as any).image_url,
          coverUrl: (book as any).image_url,
          pages: (book as any).pages,
          totalPages: (book as any).pages
        })));
      }
      if (recentData.length > 0) {
        const books = await Promise.all(recentData.slice(0, 5).map(rb => SupabaseDataService.getBookBySlug(rb.book_slug)));
        setRecentBooksData(books.filter(Boolean).map((book, index) => ({
          id: (book as any).slug,
          slug: (book as any).slug,
          title: (book as any).book_name,
          book_name: (book as any).book_name,
          author: (book as any).author,
          image_url: (book as any).image_url,
          coverUrl: (book as any).image_url,
          pages: (book as any).pages,
          totalPages: (book as any).pages,
          progress: Math.round(recentData[index]?.completion_percentage || 0)
        })));
      }
      if (progressData.length > 0) {
        const books = await Promise.all(progressData.slice(0, 5).map(rp => SupabaseDataService.getBookBySlug(rp.book_slug)));
        setCurrentlyReadingData(books.filter(Boolean).map((book, index) => ({
          id: (book as any).slug,
          slug: (book as any).slug,
          title: (book as any).book_name,
          book_name: (book as any).book_name,
          author: (book as any).author,
          image_url: (book as any).image_url,
          coverUrl: (book as any).image_url,
          pages: (book as any).pages,
          totalPages: (book as any).pages,
          progress: Math.round(progressData[index]?.completion_percentage || 0)
        })));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
    try {
      setUploadingPhoto(true);
      const photoUrl = await authService.uploadProfilePhoto(file);
      if (photoUrl) {
        setProfile(prev => prev ? { ...prev, profile_photo_url: photoUrl } : null);
      }
    } catch {
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await authService.updateProfile(editForm);
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setEditMode(false);
    } catch {
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleSendEmailVerification = async () => {
    if (!editForm.email) { alert('Please enter an email address'); return; }
    try {
      await authService.sendEmailVerification();
      setShowEmailConfirmation(true);
    } catch {
      alert('Failed to send verification email. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 pb-16">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="mr-3 p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Profile</h1>
            <p className="text-orange-100 text-sm font-medium">Manage your reading journey</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          {!editMode && (
            <div className="flex justify-end mb-4">
              <button onClick={() => setEditMode(true)} className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            </div>
          )}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-white" />
                )}
              </div>
              {editMode && (
                <label className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-orange-600 transition-colors">
                  <Camera size={14} />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                </label>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-2">
                  <input type="text" placeholder="Your name" value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[44px]" />
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input type="text" placeholder="Town/Village" value={editForm.town_village} onChange={(e) => setEditForm(prev => ({ ...prev, town_village: e.target.value }))} className="w-full sm:flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[44px]" />
                    <input type="text" placeholder="State" value={editForm.state} onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))} className="w-full sm:flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[44px]" />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input type="email" placeholder="Email address" value={editForm.email} onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} className="w-full sm:flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[44px]" />
                    {editForm.email && !profile?.email_verified && (
                      <button onClick={handleSendEmailVerification} className="w-full sm:w-auto px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors min-h-[44px] whitespace-nowrap">Verify</button>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                    <button onClick={handleSaveProfile} className="w-full sm:flex-1 bg-green-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-1 min-h-[44px]"><Check size={16} /><span>Save</span></button>
                    <button onClick={() => setEditMode(false)} className="w-full sm:flex-1 bg-gray-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors flex items-center justify-center space-x-1 min-h-[44px]"><X size={16} /><span>Cancel</span></button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{profile?.name || 'Anonymous Reader'}</h2>
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <MapPin size={14} />
                    <span>{profile?.town_village && profile?.state ? `${profile.town_village}, ${profile.state}` : 'Location not set'}</span>
                  </div>
                  {profile?.email && (
                    <div className="flex items-center space-x-2 text-gray-600 text-sm mt-1">
                      <Mail size={14} />
                      <span>{profile.email}</span>
                      {profile.email_verified ? (
                        <span className="text-green-600 text-xs">✓ Verified</span>
                      ) : (
                        <span className="text-orange-600 text-xs">⚠ Not verified</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{profile?.books_completed || 0}</div>
            <div className="text-gray-600 text-sm">Books Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{profile?.total_satkarm || 0}</div>
            <div className="text-gray-600 text-sm">Satkarm</div>
          </div>
        </div>

        {completedBooksData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">Completed Books</h3>
              <button className="text-orange-600 text-sm font-medium hover:text-orange-700">View All ({completedBooks.length})</button>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {completedBooksData.map((book) => (
                <div key={book.id} className="flex-shrink-0 cursor-pointer" onClick={() => onBookClick?.(book)}>
                  <div className="w-20 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div 
                      className="h-28 bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundImage: `url(${book.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      {!book.image_url && (
                        <div className="text-white text-xs text-center p-1 font-medium">{book.book_name}</div>
                      )}
                    </div>
                    <div className="p-2">
                      <h4 className="font-semibold text-gray-800 text-xs line-clamp-2 mb-1">{book.book_name}</h4>
                      <p className="text-gray-600 text-xs line-clamp-1">{book.author}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentlyReadingData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">Currently Reading</h3>
              <button className="text-orange-600 text-sm font-medium hover:text-orange-700">View All ({readingProgress.length})</button>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {currentlyReadingData.map((book) => (
                <div key={book.id} className="flex-shrink-0 cursor-pointer" onClick={() => onBookClick?.(book)}>
                  <div className="w-20 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div 
                      className="h-28 bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundImage: `url(${book.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      {!book.image_url && (
                        <div className="text-white text-xs text-center p-1 font-medium">{book.book_name}</div>
                      )}
                    </div>
                    <div className="p-2">
                      <h4 className="font-semibold text-gray-800 text-xs line-clamp-2 mb-1">{book.book_name}</h4>
                      <p className="text-gray-600 text-xs line-clamp-1 mb-1">{book.author}</p>
                      {book.progress !== undefined && (
                        <div className="mt-1">
                          <div className="flex justify-between items-center mb-1"><span className="text-xs font-medium text-orange-600">{book.progress}%</span></div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1 rounded-full transition-all duration-300" style={{ width: `${book.progress}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentBooksData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">Recent Books</h3>
              <button className="text-orange-600 text-sm font-medium hover:text-orange-700">View All ({recentBooks.length})</button>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentBooksData.map((book) => (
                <div key={book.id} className="flex-shrink-0 cursor-pointer" onClick={() => onBookClick?.(book)}>
                  <div className="w-20 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div 
                      className="h-28 bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundImage: `url(${book.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      {!book.image_url && (
                        <div className="text-white text-xs text-center p-1 font-medium">{book.book_name}</div>
                      )}
                    </div>
                    <div className="p-2">
                      <h4 className="font-semibold text-gray-800 text-xs line-clamp-2 mb-1">{book.book_name}</h4>
                      <p className="text-gray-600 text-xs line-clamp-1">{book.author}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedBooksData.length === 0 && currentlyReadingData.length === 0 && recentBooksData.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Your Reading Journey</h3>
            <p className="text-gray-600 mb-4">Begin reading books to track your progress and earn Satkarm points!</p>
            <button onClick={onBack} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">Browse Books</button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><span className="text-orange-500 mr-2">❓</span>Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><span className="text-green-500 mr-2">⭐</span>What is Satkarm?</h4>
              <p className="text-gray-700 text-sm leading-relaxed">Satkarm are points you earn while reading books on our platform. You get <strong>1 Satkarm for every 20+ seconds</strong> you spend reading a single page, with a maximum of <strong>5 Satkarm points per page</strong>.</p>
            </div>
            <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><span className="text-blue-500 mr-2">📖</span>How do I earn Satkarm?</h4>
              <p className="text-gray-700 text-sm leading-relaxed">Simply read any book in our library! For every 20+ seconds you spend on a single page, you earn 1 Satkarm point, up to a maximum of 5 points per page.</p>
            </div>
            <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><span className="text-purple-500 mr-2">🏆</span>When is a book considered completed?</h4>
              <p className="text-gray-700 text-sm leading-relaxed">A book is marked as completed when you have read through all pages of the PDF, spending at least 1 minute on each page.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><span className="text-orange-500 mr-2">👤</span>Why should I complete my profile?</h4>
              <p className="text-gray-700 text-sm leading-relaxed">Completing your profile helps us provide a personalized experience. Adding your email allows you to verify your account and ensures your reading progress is permanently saved.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><span className="text-red-500 mr-2">🗑️</span>How to delete my account?</h4>
              <p className="text-gray-700 text-sm leading-relaxed">Make sure you are logged in, go to menu, click on policies then click on delete my account button. This action is permanent and will delete all your reading progress and data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;