"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { SupabaseDataService } from '../services/supabaseService';
import { Book } from '../types/Book';

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 5;

interface UseSearchReturn {
  query: string;
  suggestions: Book[];
  recentSearches: string[];
  isLoading: boolean;
  showSuggestions: boolean;
  setQuery: (query: string) => void;
  setShowSuggestions: (show: boolean) => void;
  saveToRecentSearches: (search: string) => void;
  clearRecentSearches: () => void;
}

export const useSearch = (books: Book[] = []): UseSearchReturn => {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const fuse = useMemo(() => {
    if (!books.length) return null;
    return new Fuse(books, {
      keys: [
        { name: 'book_name', weight: 0.7 },
        { name: 'title', weight: 0.7 },
        { name: 'author', weight: 0.3 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
      useExtendedSearch: true
    });
  }, [books]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        if (fuse && books.length > 0) {
          const fuseResults = fuse.search(searchQuery);
          const localResults = fuseResults.map(result => result.item).slice(0, 5);
          setSuggestions(localResults);
        }
        try {
          const supabaseResults = await SupabaseDataService.searchBooks(searchQuery);
          if (supabaseResults && supabaseResults.length > 0) {
            setSuggestions(prevSuggestions => {
              const combinedResults = [...prevSuggestions];
              supabaseResults.forEach((book: Book) => {
                if (!combinedResults.find(existing => existing.id === book.id || existing.slug === book.slug)) {
                  combinedResults.push(book);
                }
              });
              return combinedResults.slice(0, 8);
            });
          }
        } catch {}
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [fuse, books]
  );

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [query, debouncedSearch]);

  const saveToRecentSearches = useCallback((search: string) => {
    try {
      const trimmedSearch = search.trim();
      if (!trimmedSearch) return;
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item.toLowerCase() !== trimmedSearch.toLowerCase());
        const updated = [trimmedSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {}
  }, []);

  const clearRecentSearches = useCallback(() => {
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  }, []);

  return {
    query,
    suggestions,
    recentSearches,
    isLoading,
    showSuggestions,
    setQuery,
    setShowSuggestions,
    saveToRecentSearches,
    clearRecentSearches
  };
};

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}