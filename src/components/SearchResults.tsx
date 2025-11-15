"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { Book } from '../types/Book';

interface SearchResultsProps {
  query: string;
  books: Book[];
  onBookClick?: (book: Book) => void;
  onClearSearch: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, books, onBookClick, onClearSearch }) => {
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    const fuse = new Fuse(books, {
      keys: [
        { name: 'book_name', weight: 0.7 },
        { name: 'title', weight: 0.7 },
        { name: 'author', weight: 0.3 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 1,
      ignoreLocation: true
    });
    const results = fuse.search(query);
    const filteredBooks = results.map(result => result.item);
    setSearchResults(filteredBooks);
    setIsLoading(false);
  }, [query, books]);

  const getBookTitle = (book: Book) => book.book_name || book.title || 'Unknown Title';
  const getBookCover = (book: Book) => book.image_url || book.coverUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 pb-16">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-4 shadow-lg -mt-12">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onClearSearch} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <button onClick={onClearSearch} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">Search Results</h2>
          <p className="text-sm text-orange-100">
            {isLoading ? 'Searching...' : <>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "<span className="font-medium text-orange-200">{query}</span>"</>}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching books...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="p-4">
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No books found</h3>
              <p className="text-gray-600 mb-4">We couldn't find any books matching "{query}"</p>
              <button onClick={onClearSearch} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">Try Different Keywords</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => onBookClick?.(book)}>
                  <div 
                    className="h-32 bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundImage: `url(${getBookCover(book)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    {!getBookCover(book) && (
                      <div className="text-white text-xs text-center p-2 font-medium">{getBookTitle(book)}</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">{getBookTitle(book)}</h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-1">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;