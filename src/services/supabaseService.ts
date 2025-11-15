"use client";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '')
  || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '')
  || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('categories').select('count').limit(1);
    if (error) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export interface Category {
  slug: string;
  name: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Subcategory {
  slug: string;
  category_slug: string;
  name: string;
  icon: string;
  display_order: number;
  book_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Book {
  slug: string;
  id: number;
  book_name: string;
  author: string;
  code: string;
  book_size: string;
  pages: number;
  publication_year: number;
  language: string;
  pdf_url: string;
  image_url: string;
  is_popular: string | boolean;
  is_featured: string | boolean;
  is_active: number;
  category_slug: string;
  subcategory_slug: string;
  created_at: string;
  updated_at: string;
}

class SupabaseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 30 * 24 * 60 * 60 * 1000;

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

const cache = new SupabaseCache();

export class SupabaseDataService {
  static async getInitialBooks(): Promise<Book[]> {
    const cacheKey = 'initial_books';
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const [featuredBooks, popularBooks] = await Promise.all([
      this.getFeaturedBooks(),
      this.getPopularBooks()
    ]);
    const bookMap = new Map();
    [...featuredBooks, ...popularBooks].forEach(book => {
      bookMap.set(book.slug, book);
    });
    const initialBooks = Array.from(bookMap.values());
    cache.set(cacheKey, initialBooks, 60 * 60 * 1000);
    return initialBooks;
  }

  static async getCategories(): Promise<Category[]> {
    const cacheKey = 'categories';
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    if (error) throw error;
    const categories = data || [];
    cache.set(cacheKey, categories, 7 * 24 * 60 * 60 * 1000);
    return categories;
  }

  static async getSubcategoriesByCategory(categorySlug: string): Promise<Subcategory[]> {
    const cacheKey = `subcategories_${categorySlug}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_slug', categorySlug)
      .eq('is_active', true)
      .order('display_order');
    if (error) throw error;
    const subcategories = data || [];
    cache.set(cacheKey, subcategories, 7 * 24 * 60 * 60 * 1000);
    return subcategories;
  }

  static async getAllSubcategories(): Promise<Subcategory[]> {
    const cacheKey = 'all_subcategories';
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('is_active', true)
      .order('category_slug, display_order');
    if (error) throw error;
    const subcategories = data || [];
    cache.set(cacheKey, subcategories, 7 * 24 * 60 * 60 * 1000);
    return subcategories;
  }

  static async getBooksByCategory(categorySlug: string): Promise<Book[]> {
    const cacheKey = `books_category_${categorySlug}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('category_slug', categorySlug)
      .eq('is_active', 1)
      .order('book_name');
    if (error) throw error;
    const books = data || [];
    cache.set(cacheKey, books, 7 * 24 * 60 * 60 * 1000);
    return books;
  }

  static async getBooksBySubcategory(categorySlug: string, subCategorySlug: string): Promise<Book[]> {
    const cacheKey = `books_subcategory_${categorySlug}_${subCategorySlug}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('category_slug', categorySlug)
      .eq('subcategory_slug', subCategorySlug)
      .eq('is_active', 1)
      .order('book_name');
    if (error) throw error;
    const books = data || [];
    cache.set(cacheKey, books, 7 * 24 * 60 * 60 * 1000);
    return books;
  }

  static async getBookBySlug(slug: string): Promise<Book | null> {
    const cacheKey = `book_${slug}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', 1)
      .single();
    if (error) {
      if ((error as any).code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    cache.set(cacheKey, data, 7 * 24 * 60 * 60 * 1000);
    return data;
  }

  static async searchBooks(query: string): Promise<Book[]> {
    const cacheKey = `search_${query.toLowerCase().trim()}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .or(`book_name.ilike.%${query}%,author.ilike.%${query}%,code.ilike.%${query}%`)
      .eq('is_active', 1)
      .order('book_name')
      .limit(50);
    if (error) throw error;
    const results = data || [];
    cache.set(cacheKey, results, 60 * 60 * 1000);
    return results;
  }

  static async getFeaturedBooks(): Promise<Book[]> {
    const cacheKey = 'featured_books';
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_featured', 'yes')
      .eq('is_active', 1)
      .order('book_name')
      .limit(10);
    if (error) throw error;
    let books = data || [];
    if (books.length === 0) {
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('books')
          .select('*')
          .eq('is_active', 1)
          .order('book_name')
          .limit(10);
        if (fallbackError) throw fallbackError;
        books = fallbackData || [];
      } catch {
        books = [];
      }
    }
    cache.set(cacheKey, books, 60 * 60 * 1000);
    return books;
  }

  static async getPopularBooks(): Promise<Book[]> {
    const cacheKey = 'popular_books';
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_popular', 'yes')
      .eq('is_active', 1)
      .order('book_name')
      .limit(10);
    if (error) throw error;
    let books = data || [];
    if (books.length === 0) {
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('books')
          .select('*')
          .eq('is_active', 1)
          .order('book_name')
          .range(10, 19);
        if (fallbackError) throw fallbackError;
        books = fallbackData || [];
      } catch {
        books = [];
      }
    }
    cache.set(cacheKey, books, 60 * 60 * 1000);
    return books;
  }

  static clearCache(): void {
    cache.clear();
  }

  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: (cache as any)['cache'].size,
      keys: Array.from((cache as any)['cache'].keys())
    };
  }
}