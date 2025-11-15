"use client";
import React from 'react';
import Header from '../../components/Header';
import ProfileScreen from '../../components/ProfileScreen';
import { useRouter } from 'next/navigation';
import { SupabaseDataService } from '../../services/supabaseService';

export default function ProfilePage() {
  const router = useRouter();
  const [allBooks, setAllBooks] = React.useState<any[]>([]);
  React.useEffect(() => { SupabaseDataService.getInitialBooks().then(setAllBooks).catch(() => setAllBooks([])); }, []);
  const handleSearch = (q: string) => { if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`); };
  return (
    <>
      <Header showWelcome={false} books={allBooks} onSearch={handleSearch} />
      <div className="pt-32">
        <ProfileScreen onBack={() => router.push('/')} onBookClick={(book: any) => router.push(`/book/${book.slug || book.id}`)} />
      </div>
    </>
  );
}