"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { fetchCategories } from '../services/firestoreService';
import { Category, Subcategory } from '../types/Category';

interface CategoriesSectionProps {
  onCategorySelect?: (category: Category) => void;
  onSubcategorySelect?: (category: Category, subcategory: Subcategory) => void;
  onBack?: () => void;
  showHeader?: boolean;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onCategorySelect, onSubcategorySelect, onBack, showHeader = true }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCategories()
      .then(categories => { setCategoriesList(categories as any); })
      .catch(() => { setError('Failed to load categories.'); })
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleCategoryClick = (category: Category) => {
    if (Array.isArray(category.subcategories) && category.subcategories.length > 0) {
      toggleCategory(category.id);
    } else {
      onCategorySelect?.(category);
    }
  };

  const handleSubcategoryClick = (category: Category, subcategory: Subcategory) => {
    onSubcategorySelect?.(category, subcategory);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-4 shadow-lg -mt-4">
          <div className="flex items-center mb-2">
            {onBack && (
              <button onClick={onBack} className="mr-3 p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <ArrowLeft size={20} className="text-white" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">Browse Books</h1>
              <p className="text-orange-100 text-sm font-medium">Discover your next great read</p>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 space-y-3">
        {categoriesList.length === 0 ? (
          <div className="text-center text-gray-500">No categories found.</div>
        ) : (
          categoriesList.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button onClick={() => handleCategoryClick(category)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-600">{(Array.isArray(category.subcategories) && category.subcategories.length > 0) ? `${category.subcategories.length} subcategories` : 'View books'}</p>
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
                    <button key={subcategory.id} onClick={() => handleSubcategoryClick(category, subcategory)} className="w-full px-6 py-3 flex items-center justify-between hover:bg-white transition-colors border-b border-gray-100 last:border-b-0">
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

export default CategoriesSection;