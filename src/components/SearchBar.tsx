"use client";
import React, { useRef, useEffect } from 'react';
import { FiSearch, FiClock, FiX } from 'react-icons/fi';
import { useSearch } from '../hooks/useSearch';
import { Book } from '../types/Book';

interface SearchBarProps {
  books?: Book[];
  onSearch: (query: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ books = [], onSearch, className = '' }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    suggestions,
    isLoading,
    showSuggestions,
    recentSearches,
    setQuery,
    setShowSuggestions,
    saveToRecentSearches,
    clearRecentSearches
  } = useSearch(books);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [setShowSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      saveToRecentSearches(searchQuery.trim());
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: Book) => {
    const searchTerm = suggestion.book_name || suggestion.title;
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const handleRecentSearchClick = (recentSearch: string) => {
    setQuery(recentSearch);
    handleSearch(recentSearch);
  };

  const handleClearQuery = () => {
    setQuery('');
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const shouldShowSuggestions = showSuggestions && (suggestions.length > 0 || recentSearches.length > 0);

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`} ref={searchContainerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search books, authors..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-lg"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {shouldShowSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {recentSearches.length > 0 && query.length === 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Searches</h4>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    <FiClock className="w-3 h-3 mr-2 text-gray-400" />
                    <span className="truncate">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-2">
              {query.length > 0 && (
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">Suggestions</h4>
              )}
              <div className="space-y-1">
                {suggestions.slice(0, 8).map((suggestion, index) => (
                  <button
                    key={suggestion.id || index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-start w-full px-2 py-2 text-left hover:bg-gray-50 rounded transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-10 bg-gray-200 rounded mr-3 overflow-hidden">
                      {suggestion.image_url && (
                        <img
                          src={suggestion.image_url}
                          alt={suggestion.book_name || suggestion.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-600">
                        {suggestion.book_name || suggestion.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.author}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="p-4 text-center">
              <div className="inline-flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                Searching...
              </div>
            </div>
          )}

          {!isLoading && query.length > 0 && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No books found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;