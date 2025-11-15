"use client";
import React from 'react';
import Header from '../../../components/Header';
import BookDetailsScreen from '../../../components/BookDetailsScreen';
import { useParams, useRouter } from 'next/navigation';
import { SupabaseDataService } from '../../../services/supabaseService';

export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params as any)?.slug as string;
  const [book, setBook] = React.useState<any | null>(null);
  const [allBooks, setAllBooks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    SupabaseDataService.getInitialBooks().then(setAllBooks).catch(() => setAllBooks([]));
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const localBook = allBooks.find((b: any) => b.slug === slug || b.id === slug);
        if (localBook && !cancelled) {
          setBook(localBook);
          return;
        }
        const bySlug = await SupabaseDataService.getBookBySlug(slug);
        if (!cancelled) {
          setBook(bySlug);
        }
      } catch {
        if (!cancelled) setBook(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug, allBooks]);

  const handleSearch = (q: string) => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-4">The requested book could not be found.</p>
          <button onClick={() => router.push('/')} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header showWelcome={false} books={allBooks} onSearch={handleSearch} />
      <div className="pt-32">
        <BookDetailsScreen book={book as any} onBack={() => router.push('/')} />
      </div>
    </>
  );
}