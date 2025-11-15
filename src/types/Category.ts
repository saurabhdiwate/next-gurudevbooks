export interface Category {
  id: string;
  name: string;
  icon: string;
  slug?: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  bookCount: number;
  icon?: string;
  slug?: string;
}

export interface CategoryBook {
  id: string;
  slug?: string;
  title: string;
  author: string;
  coverUrl?: string;
  rating: number;
  pages: number;
  category: string;
  subcategory: string;
  language?: string;
  book_size?: string;
  size?: string;
}