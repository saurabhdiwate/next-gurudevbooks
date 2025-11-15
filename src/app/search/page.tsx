"use client";
import React, { useMemo, Suspense } from 'react';
import Header from '../../components/Header';
import SearchResults from '../../components/SearchResults';
import { useRouter, useSearchParams } from 'next/navigation';
import { SupabaseDataService } from '../../services/supabaseService';

function SearchContent() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get('q') || '';

  const [allBooks, setAllBooks] = React.useState<any[]>([]);

  React.useEffect(() => {
    SupabaseDataService.getInitialBooks().then(setAllBooks).catch(() => setAllBooks([]));
  }, []);

  const handleSearch = (q: string) => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      <Header showWelcome={false} books={allBooks} onSearch={handleSearch} />
      <div className="pt-32">
        <SearchResults 
          query={query}
          books={allBooks as any}
          onBookClick={(book) => {
            const slug = (book as any).slug || (book as any).id;
            router.push(`/book/${slug}`);
          }}
          onClearSearch={() => router.push('/')}
        />
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}