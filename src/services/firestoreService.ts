import { Book } from "../types/Book";
import { Category } from "../types/Category";
import { SupabaseDataService, supabase, Book as SupabaseBook, Category as SupabaseCategory, Subcategory as SupabaseSubcategory } from './supabaseService';

const toSlug = (name: string = ''): string => {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const mapSupabaseBookToBook = (supabaseBook: SupabaseBook): Book => {
  return {
    id: supabaseBook.slug || supabaseBook.id?.toString() || 'unknown',
    slug: supabaseBook.slug,
    title: supabaseBook.book_name,
    book_name: supabaseBook.book_name,
    author: supabaseBook.author,
    category_slug: supabaseBook.category_slug,
    subcategory_slug: supabaseBook.subcategory_slug,
    description: '',
    image_url: supabaseBook.image_url,
    coverUrl: supabaseBook.image_url,
    pdf_url: supabaseBook.pdf_url,
    totalPages: supabaseBook.pages,
    pages: supabaseBook.pages,
    rating: 0,
    is_popular: typeof supabaseBook.is_popular === 'boolean' ? (supabaseBook.is_popular ? 'yes' : 'no') : supabaseBook.is_popular,
    is_featured: typeof supabaseBook.is_featured === 'boolean' ? (supabaseBook.is_featured ? 'yes' : 'no') : supabaseBook.is_featured,
    is_active: supabaseBook.is_active,
    publication_year: supabaseBook.publication_year,
    language: supabaseBook.language,
    book_size: supabaseBook.book_size,
    created_at: supabaseBook.created_at,
    updated_at: supabaseBook.updated_at
  };
};

const mapSupabaseCategoryToCategory = (supabaseCategory: SupabaseCategory, subcategories: SupabaseSubcategory[] = []) => {
  const categorySubcategories = subcategories.filter(
    sub => sub.category_slug === supabaseCategory.slug
  ).map(sub => ({
    id: sub.slug,
    name: sub.name,
    slug: sub.slug,
    bookCount: sub.book_count
  }));
  return {
    id: supabaseCategory.slug,
    name: supabaseCategory.name,
    icon: supabaseCategory.icon,
    slug: supabaseCategory.slug,
    subcategories: categorySubcategories
  } as Category;
};

export const fetchBookBySlug = async (slug: string): Promise<Book | null> => {
  try {
    const supabaseBook = await SupabaseDataService.getBookBySlug(slug);
    return supabaseBook ? mapSupabaseBookToBook(supabaseBook) : null;
  } catch {
    return null;
  }
};

export const fetchBookById = async (bookId: string): Promise<Book | null> => {
  try {
    const supabaseBook = await SupabaseDataService.getBookBySlug(bookId);
    return supabaseBook ? mapSupabaseBookToBook(supabaseBook) : null;
  } catch {
    return null;
  }
};

export const fetchInitialBooks = async (): Promise<Book[]> => {
  try {
    const supabaseBooks = await SupabaseDataService.getInitialBooks();
    return supabaseBooks.map(mapSupabaseBookToBook);
  } catch {
    return [];
  }
};

export const fetchBooks = async (): Promise<Book[]> => {
  try {
    const { data: allBooks } = await supabase
      .from('books')
      .select('*')
      .eq('is_active', 1)
      .order('book_name', { ascending: true });
    return (allBooks || []).map(mapSupabaseBookToBook);
  } catch {
    return [];
  }
};

export const fetchBooksByCategory = async (categorySlug: string): Promise<Book[]> => {
  try {
    const supabaseBooks = await SupabaseDataService.getBooksByCategory(categorySlug);
    return supabaseBooks.map(mapSupabaseBookToBook);
  } catch {
    return [];
  }
};

export const fetchBooksBySubcategory = async (categorySlug: string, subSlug: string): Promise<Book[]> => {
  try {
    const supabaseBooks = await SupabaseDataService.getBooksBySubcategory(categorySlug, subSlug);
    return supabaseBooks.map(mapSupabaseBookToBook);
  } catch {
    return [];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const [supabaseCategories, supabaseSubcategories] = await Promise.all([
      SupabaseDataService.getCategories(),
      SupabaseDataService.getAllSubcategories()
    ]);
    const mappedCategories = supabaseCategories.map((cat: SupabaseCategory) => 
      mapSupabaseCategoryToCategory(cat, supabaseSubcategories)
    );
    return mappedCategories as any;
  } catch {
    return [];
  }
};

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const supabaseBooks = await SupabaseDataService.searchBooks(query);
    return supabaseBooks.map(mapSupabaseBookToBook);
  } catch {
    return [];
  }
};

export const fetchBooksWithFilters = async (filters: {
  categorySlug?: string;
  subcategorySlug?: string;
  language?: string;
  author?: string;
  size?: string;
}): Promise<Book[]> => {
  try {
    if (filters.categorySlug && filters.subcategorySlug) {
      return await fetchBooksBySubcategory(filters.categorySlug, filters.subcategorySlug);
    } else if (filters.categorySlug) {
      return await fetchBooksByCategory(filters.categorySlug);
    } else {
      const supabaseBooks = await SupabaseDataService.getFeaturedBooks();
      return supabaseBooks.map(mapSupabaseBookToBook);
    }
  } catch {
    return [];
  }
};