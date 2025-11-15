"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Filter, X } from 'lucide-react';
import { SupabaseDataService } from '../services/supabaseService';
import { fetchCategories } from '../services/firestoreService';
import { Category, Subcategory, CategoryBook } from '../types/Category';
import { Book } from '../types/Book';
import { useRouter } from 'next/navigation';

interface BooksScreenProps {
  onBack: () => void;
  onBookClick?: (book: Book) => void;
  categorySlug?: string;
  subSlug?: string;
}

const BooksScreen: React.FC<BooksScreenProps> = ({ onBack, onBookClick, categorySlug, subSlug }) => {
  const router = useRouter();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    categoryName: string;
    subcategory: Subcategory;
  } | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [books, setBooks] = useState<CategoryBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allBooks, setAllBooks] = useState<CategoryBook[]>([]);
  const [filters, setFilters] = useState({
    language: '',
    size: '',
    author: ''
  });

  const languageOptions = ['Hindi', 'Gujarati', 'English', 'Marathi'];
  const sizeOptions = ['Folder', 'Pocket', 'Regular', 'Big', 'Smarika'];
  const authorOptions = [
    'Pt. Shriram Sharma Achary',
    'Pt. S.R.S.A. & M.B.D.S.',
    'Dr. Pranav Pandya',
    'Brahmavarchas',
    'Mata Bhagavati Devi Sharma',
    'Others'
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCategories()
      .then(categories => {
        setCategoriesList(categories);
      })
      .catch(() => {
        setError('Failed to load categories.');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setSelectedSubcategory(null);
  };

  const selectSubcategory = (category: Category, subcategory: Subcategory) => {
    setSelectedSubcategory({ categoryName: category.name, subcategory });
    const catSlug = category.slug || encodeURIComponent(category.name);
    const subSlugSafe = subcategory.slug || encodeURIComponent(subcategory.name);
    router.push(`/books/c/${catSlug}/${subSlugSafe}`);
    if (category.slug && subcategory.slug) {
      loadBooksForSubcategory(category.slug, subcategory.slug);
    }
  };

  const selectCategoryDirectly = (category: Category) => {
    setSelectedSubcategory({ 
      categoryName: category.name, 
      subcategory: { id: category.id, name: category.name, bookCount: 0, slug: category.slug } 
    });
    const catSlug = category.slug || encodeURIComponent(category.name);
    router.push(`/books/c/${catSlug}`);
    if (category.slug) {
      loadBooksForCategory(category.slug);
    }
  };

  const loadBooksForSubcategory = (categorySlug: string, subCategorySlug: string) => {
    setLoading(true);
    setError(null);
    SupabaseDataService.getBooksBySubcategory(categorySlug, subCategorySlug)
      .then((books) => {
        const mappedBooks = 
          books.map((b: any) => ({
            id: b.id,
            slug: b.slug || b.code,
            title: b.book_name || 'Unknown Title',
            author: b.author || '',
            coverUrl: b.image_url || '',
            rating: b.rating ?? 0,
            pages: b.pages ?? 0,
            category: b.category || '',
            subcategory: b.sub_category || '',
            language: b.language || '',
            size: b.book_size || '',
            book_size: b.book_size || ''
          }));
        setAllBooks(mappedBooks);
        setBooks(mappedBooks);
      })
      .catch(() => {
        setError('Failed to load books.');
      })
      .finally(() => setLoading(false));
  };

  const loadBooksForCategory = (categorySlug: string) => {
    setLoading(true);
    setError(null);
    SupabaseDataService.getBooksByCategory(categorySlug)
      .then((books) => {
        const mappedBooks = 
          books.map((b: any) => ({
            id: b.id,
            slug: b.slug || b.code,
            title: b.book_name || b.title || 'Unknown Title',
            author: b.author || '',
            coverUrl: b.image_url || b.coverUrl || '',
            rating: b.rating ?? 0,
            pages: b.pages ?? b.totalPages ?? 0,
            category: b.category || '',
            subcategory: b.sub_category || b.subcategory || '',
            language: b.language || '',
            book_size: b.book_size || '',
            size: b.size || b.book_size || ''
          }));
        setAllBooks(mappedBooks);
        setBooks(mappedBooks);
      })
      .catch(() => {
        setError('Failed to load books.');
      })
      .finally(() => setLoading(false));
  };

  const applyFilters = () => {
    let filteredBooks = [...allBooks];
    if (filters.language) {
      filteredBooks = filteredBooks.filter(book => book.language === filters.language);
    }
    if (filters.size) {
      filteredBooks = filteredBooks.filter(book => book.size === filters.size || book.book_size === filters.size);
    }
    if (filters.author) {
      if (filters.author === 'Others') {
        filteredBooks = filteredBooks.filter(book => !authorOptions.slice(0, -1).includes(book.author));
      } else {
        filteredBooks = filteredBooks.filter(book => book.author === filters.author);
      }
    }
    setBooks(filteredBooks);
  };

  const resetFilters = () => {
    setFilters({ language: '', size: '', author: '' });
    setBooks(allBooks);
  };

  useEffect(() => {
    if (allBooks.length > 0) {
      applyFilters();
    }
  }, [filters, allBooks]);

  useEffect(() => {
    if (categoriesList.length === 0) return;
    if (categorySlug) {
      const cat = categoriesList.find(c => c.slug === categorySlug);
      if (cat) {
        setExpandedCategory(cat.id);
        if (subSlug) {
          const sub = (cat.subcategories || []).find(s => s.slug === subSlug);
          if (sub) {
            setSelectedSubcategory({ categoryName: cat.name, subcategory: sub });
            if (cat.slug && sub.slug) {
              loadBooksForSubcategory(cat.slug, sub.slug);
            }
          } else {
            setSelectedSubcategory({ categoryName: cat.name, subcategory: { id: cat.id, name: cat.name, bookCount: 0, slug: cat.slug } });
            if (cat.slug) {
              loadBooksForCategory(cat.slug);
            }
          }
        } else {
          setSelectedSubcategory({ categoryName: cat.name, subcategory: { id: cat.id, name: cat.name, bookCount: 0, slug: cat.slug } });
          if (cat.slug) {
            loadBooksForCategory(cat.slug);
          }
        }
      }
    } else {
      setSelectedSubcategory(null);
      setExpandedCategory(null);
    }
  }, [categorySlug, subSlug, categoriesList]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  if (selectedSubcategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 pb-16">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-4 shadow-lg mt-2 sm:mt-3 md:mt-4">
          <div className="flex items-center mb-2">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className="mr-3 p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">{selectedSubcategory.subcategory.name}</h1>
              <p className="text-orange-100 text-sm">{selectedSubcategory.categoryName} • {books.length} books</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Filter size={18} className="mr-2 text-orange-500" />
                Filter Books
              </h3>
              <button
                onClick={resetFilters}
                className="text-orange-600 text-sm font-medium hover:text-orange-700 px-3 py-1 rounded-lg border border-orange-200 hover:bg-orange-50"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">भाषा (Language)</label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="">सभी भाषाएं (All Languages)</option>
                  {languageOptions.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">आकार (Size)</label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="">सभी आकार (All Sizes)</option>
                  {sizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">लेखक (Author)</label>
                <select
                  value={filters.author}
                  onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="">सभी लेखक (All Authors)</option>
                  {authorOptions.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>
            </div>

            {(filters.language || filters.size || filters.author) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-2">Applied Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.language && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
                      भाषा: {filters.language}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, language: '' }))}
                        className="ml-2 hover:text-orange-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {filters.size && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
                      आकार: {filters.size}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, size: '' }))}
                        className="ml-2 hover:text-orange-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {filters.author && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
                      लेखक: {filters.author}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, author: '' }))}
                        className="ml-2 hover:text-orange-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {books.length === 0 ? (
            <div className="text-center text-gray-500">
              {allBooks.length === 0 ? 'No books found in this category.' : 'No books match the selected filters.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                  onClick={() => onBookClick?.(book as any)}
                >
                  <div 
                    className="h-32 bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundImage: `url(${book.coverUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!book.coverUrl && (
                      <div className="text-white text-xs text-center p-2 font-medium">
                        {book.title}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">{book.title}</h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-1">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 pb-16">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-4 shadow-lg mt-2 sm:mt-3 md:mt-4">
        <div className="flex items-center mb-2">
          <button
            onClick={onBack}
            className="mr-3 p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Browse Books</h1>
            <p className="text-orange-100 text-sm font-medium">Discover your next great read</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {categoriesList.length === 0 ? (
          <div className="text-center text-gray-500">No categories found.</div>
        ) : (
          categoriesList.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  if (Array.isArray(category.subcategories) && category.subcategories.length > 0) {
                    toggleCategory(category.id);
                  } else {
                    selectCategoryDirectly(category);
                  }
                }}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-600">
                      {(Array.isArray(category.subcategories) && category.subcategories.length > 0) ? `${category.subcategories.length} subcategories` : 'View books'}
                    </p>
                  </div>
                </div>
                {(Array.isArray(category.subcategories) && category.subcategories.length > 0) && (expandedCategory === category.id ? (
                  <ChevronDown size={20} className="text-gray-400" />
                ) : (
                  <ChevronRight size={20} className="text-gray-400" />
                ))}
              </button>

              {expandedCategory === category.id && Array.isArray(category.subcategories) && category.subcategories.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => selectSubcategory(category, subcategory)}
                      className="w-full px-6 py-3 flex items-center justify-between hover:bg-white transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-gray-800">{subcategory.name}</h4>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BooksScreen;