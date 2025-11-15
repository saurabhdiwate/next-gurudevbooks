"use client";
import React from 'react';
import { Book } from '../types/Book';

interface BookCardProps {
  book: Book;
  showProgress: boolean;
  isLast: boolean;
  onBookClick?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, showProgress, isLast, onBookClick }) => {
  const getBookTitle = () => {
    const title = book.book_name || book.title;
    return title || 'Unknown Title';
  };
  const getBookCover = () => {
    const cover = book.image_url || book.coverUrl;
    return cover;
  };
  return (
    <div className={`flex-shrink-0 ${isLast ? 'pr-3 mr-[-1.5rem]' : ''}`}>
      <div 
        className="w-28 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
        onClick={() => onBookClick?.(book)}
      >
        <div 
          className="h-36 bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center relative overflow-hidden"
          style={{
            backgroundImage: `url(${getBookCover()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!getBookCover() && (
            <div className="text-white text-xs text-center p-2 font-medium">{getBookTitle()}</div>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="font-semibold text-gray-800 text-xs line-clamp-2 mb-1">{getBookTitle()}</h3>
          <p className="text-gray-600 text-xs mb-1.5 line-clamp-1">{book.author}</p>
          {showProgress && book.progress !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Progress</span>
                <span className="text-xs font-medium text-orange-600">{book.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${book.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;