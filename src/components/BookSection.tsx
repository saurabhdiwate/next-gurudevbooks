"use client";
import React from 'react';
import BookCard from './BookCard';
import { Book } from '../types/Book';

interface BookSectionProps {
  title: string;
  books: Book[];
  showProgress: boolean;
  onBookClick?: (book: Book) => void;
}

const BookSection: React.FC<BookSectionProps> = ({ title, books, showProgress, onBookClick }) => {
  return (
    <section className="py-2">
      <h2 className="text-lg font-bold text-gray-800 mb-3 px-1">{title}</h2>
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-3 pl-1">
          {books.map((book, index) => (
            <BookCard 
              key={book.id} 
              book={book} 
              showProgress={showProgress}
              isLast={index === books.length - 1}
              onBookClick={onBookClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookSection;