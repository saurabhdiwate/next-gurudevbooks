"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

interface BlogFiltersProps {
  categories: Array<{ id: string; name: string; slug: string; color: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
  currentCategory?: string;
  currentTag?: string;
  currentSearch?: string;
}

export default function BlogFilters({ categories, tags, currentCategory, currentTag, currentSearch }: BlogFiltersProps) {
  const router = useRouter();

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(window.location.search);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams(window.location.search);
    if (tag) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="लेख खोजें..."
          defaultValue={currentSearch || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch((e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>
      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        value={currentCategory || ''}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="">सभी श्रेणियाँ</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        value={currentTag || ''}
        onChange={(e) => handleTagChange(e.target.value)}
      >
        <option value="">सभी टैग</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.slug}>
            {tag.name}
          </option>
        ))}
      </select>
    </div>
  );
}