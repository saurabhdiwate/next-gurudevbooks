"use client";
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2, FileText, Calendar, HardDrive } from 'lucide-react';
import { Book } from '../types/Book';
import BookSection from './BookSection';
import { SupabaseDataService } from '../services/supabaseService';
import PdfBookReader from './PdfBookReader';

interface BookDetailsScreenProps {
  book: Book;
  onBack: () => void;
}

const BookDetailsScreen: React.FC<BookDetailsScreenProps> = ({ book, onBack }) => {
  const [bookData, setBookData] = useState<Book>(book);
  const [loading, setLoading] = useState(false);
  const [showPdfReader, setShowPdfReader] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const loadBookData = async () => {
      if (book.slug) {
        setLoading(true);
        try {
          const fetchedBook = await SupabaseDataService.getBookBySlug(book.slug);
          if (fetchedBook) {
            setBookData(fetchedBook as any);
          }
        } catch {
        } finally {
          setLoading(false);
        }
      }
    };
    loadBookData();
  }, [book.slug]);

  useEffect(() => {
    SupabaseDataService.getInitialBooks()
      .then((books) => {
        setRelatedBooks((books as any).filter((b: any) => b.id !== (bookData as any).id).slice(0, 5));
      })
      .catch(() => {});
  }, [bookData.id]);

  const getBookTitle = () => (bookData.book_name || bookData.title || 'Unknown Title');
  const getBookCover = () => (bookData.image_url || bookData.coverUrl);
  const getBookPages = () => (bookData.pages || bookData.totalPages);
  const getBookSize = () => (bookData.book_size || bookData.size || bookData.fileSize);
  const getBookYear = () => {
    if (bookData.publication_year) return bookData.publication_year;
    if (bookData.publishedDate) return new Date(bookData.publishedDate).getFullYear();
    return null;
  };

  const handleWhatsAppShare = () => {
    const bookUrl = `https://gurudevbooks.com/book/${bookData.slug || (bookData as any).id}`;
    const text = `आज मैंने यह पुस्तक पढ़ी, आप भी इसे पढ़िए और पढ़ने के बाद आगे फॉरवर्ड कर दीजिये ताकि ज्ञान का आलोक जन जन तक पहुंचे।\n\n📖 पुस्तक का नाम - ${getBookTitle()}\n\n🔗 लिंक - ${bookUrl}\n\nइस एप पर आप परमपूज्य गुरुदेव की लिखी हुई सभी पुस्तकें मुफ्त में पढ़ सकते है और उन्हें शेयर कर लाखों लोगो तक विचार क्रांति अभियान को पहुंचा सकते है\n\n🙏 जय गुरुदेव`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const bookUrl = `https://gurudevbooks.com/book/${bookData.slug || (bookData as any).id}`;
    const text = `आज मैंने यह पुस्तक पढ़ी, आप भी इसे पढ़िए और पढ़ने के बाद आगे फॉरवर्ड कर दीजिये ताकि ज्ञान का आलोक जन जन तक पहुंचे।\n\n📖 पुस्तक का नाम - ${getBookTitle()}\n\n🔗 लिंक - ${bookUrl}\n\nइस एप पर आप परमपूज्य गुरुदेव की लिखी हुई सभी पुस्तकें मुफ्त में पढ़ सकते है और उन्हें शेयर कर लाखों लोगो तक विचार क्रांति अभियान को पहुंचा सकते है\n\n🙏 जय गुरुदेव`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookUrl)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleReadNow = () => {
    if (bookData.pdf_url && bookData.pdf_url.trim() !== '') {
      setShowPdfReader(true);
    } else {
      alert('PDF not available for this book');
    }
  };

  if (showPdfReader && bookData.pdf_url && bookData.pdf_url.trim() !== '') {
    return (
      <PdfBookReader
        pdfUrl={bookData.pdf_url}
        bookTitle={getBookTitle()}
        bookSlug={bookData.slug}
        onClose={() => setShowPdfReader(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 pb-16">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-4 shadow-lg" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Book Details</h1>
            <p className="text-orange-100 text-sm font-medium">Discover your next read</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div
                className="w-28 h-36 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-lg flex items-center justify-center relative overflow-hidden shadow-md"
                style={{ backgroundImage: `url(${getBookCover()})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {!getBookCover() && (
                  <div className="text-white text-xs text-center p-2 font-medium">{getBookTitle()}</div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">{getBookTitle()}</h2>
              <p className="text-gray-600 text-sm mb-3">by {bookData.author}</p>
            </div>
          </div>

          <div className="mt-4">
            <button onClick={handleReadNow} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 shadow-md text-base">Read Now</button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FileText size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Pages</p>
              <p className="text-sm font-semibold text-gray-800">{getBookPages() || 'N/A'}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <HardDrive size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Size</p>
              <p className="text-sm font-semibold text-gray-800">{getBookSize() || 'N/A'}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Published</p>
              <p className="text-sm font-semibold text-gray-800">{getBookYear() || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <Share2 size={20} className="mr-2 text-orange-500" />
            Share this book with others
          </h3>
          <div className="flex space-x-3">
            <button onClick={handleWhatsAppShare} className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
              <span>💬</span>
              <span>WhatsApp</span>
            </button>
            <button onClick={handleFacebookShare} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <span>📘</span>
              <span>Facebook</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">About this book</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{bookData.description || 'No description available for this book.'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <BookSection title="Related Books" books={relatedBooks} showProgress={false} />
        </div>
      </div>
    </div>
  );
};

export default BookDetailsScreen;