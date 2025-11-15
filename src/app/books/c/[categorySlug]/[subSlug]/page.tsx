"use client";
import React from 'react';
import Header from '../../../../../components/Header';
import BooksScreen from '../../../../../components/BooksScreen';
import { useParams, useRouter } from 'next/navigation';
import { SupabaseDataService } from '../../../../../services/supabaseService';

export default function BooksSubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = (params as any)?.categorySlug as string;
  const subSlug = (params as any)?.subSlug as string;
  const [allBooks, setAllBooks] = React.useState<any[]>([]);
  React.useEffect(() => { SupabaseDataService.getInitialBooks().then(setAllBooks).catch(() => setAllBooks([])); }, []);
  const handleSearch = (q: string) => { if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`); };
  return (
    <>
      <Header showWelcome={false} books={allBooks} onSearch={handleSearch} />
      <div className="pt-32">
        <BooksScreen categorySlug={categorySlug} subSlug={subSlug} onBack={() => router.push('/')} onBookClick={(book: any) => router.push(`/book/${book.slug || book.id}`)} />
      </div>
    </>
  );
}