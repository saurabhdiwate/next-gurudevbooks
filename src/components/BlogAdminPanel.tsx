"use client";
import React, { useState, useEffect } from 'react';
import { BlogPost, BlogCategory, BlogTag, BlogFilters } from '@/services/blogService';
import blogService from '@/services/blogServiceInstance';
import { Plus, Edit, Trash2, Eye, Search, Filter, Calendar, User, Tag, Eye as EyeIcon, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface BlogAdminPanelProps {
  onCreateNew: () => void;
  onEdit: (post: BlogPost) => void;
}

export default function BlogAdminPanel({ onCreateNew, onEdit }: BlogAdminPanelProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BlogFilters>({ status: 'published' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const postsPerPage = 20;

  useEffect(() => {
    loadPosts();
    loadCategories();
    loadTags();
  }, [filters, currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { posts: fetchedPosts, total } = await blogService.getBlogPosts(
        {
          ...filters,
          search: searchTerm || undefined,
        },
        postsPerPage,
        (currentPage - 1) * postsPerPage
      );
      setPosts(fetchedPosts);
      setTotalPages(Math.ceil(total / postsPerPage));
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const fetchedCategories = await blogService.getBlogCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const fetchedTags = await blogService.getBlogTags();
      setTags(fetchedTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm('क्या आप वाकई इस पोस्ट को हटाना चाहते हैं?')) {
      try {
        await blogService.deleteBlogPost(postId);
        loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('पोस्ट हटाने में त्रुटि हुई');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return;
    
    if (confirm(`क्या आप वाकई ${selectedPosts.size} पोस्टों को हटाना चाहते हैं?`)) {
      try {
        await Promise.all(Array.from(selectedPosts).map(id => blogService.deleteBlogPost(id)));
        setSelectedPosts(new Set());
        loadPosts();
      } catch (error) {
        console.error('Error bulk deleting posts:', error);
        alert('पोस्टों को हटाने में त्रुटि हुई');
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map(post => post.id)));
    }
  };

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'प्रकाशित';
      case 'draft': return 'ड्राफ्ट';
      case 'scheduled': return 'निर्धारित';
      case 'private': return 'निजी';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ब्लॉग प्रबंधन</h1>
          <p className="text-gray-600 mt-1">अपने ब्लॉग पोस्टों का प्रबंधन करें</p>
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          नया लेख
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">कुल लेख</p>
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">प्रकाशित</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.status === 'published').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ड्राफ्ट</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.status === 'draft').length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Edit className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">श्रेणियाँ</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="लेख खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      loadPosts();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} />
                फ़िल्टर
              </button>
              <button
                onClick={loadPosts}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                खोजें
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">स्थिति</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">सभी</option>
                    <option value="published">प्रकाशित</option>
                    <option value="draft">ड्राफ्ट</option>
                    <option value="scheduled">निर्धारित</option>
                    <option value="private">निजी</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">श्रेणी</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">सभी श्रेणियाँ</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">लेखक</label>
                  <input
                    type="text"
                    placeholder="लेखक का नाम"
                    value={filters.author || ''}
                    onChange={(e) => setFilters({ ...filters, author: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setFilters({});
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  साफ़ करें
                </button>
                <button
                  onClick={loadPosts}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  लागू करें
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedPosts.size > 0 && (
          <div className="p-4 bg-orange-50 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-orange-800">
                {selectedPosts.size} पोस्ट चयनित
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  हटाएं
                </button>
                <button
                  onClick={() => setSelectedPosts(new Set())}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  रद्द करें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPosts.size === posts.length && posts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  शीर्षक
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  स्थिति
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  लेखक
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  दिनांक
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  दृश्य
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  क्रियाएं
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    लोड हो रहा है...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    कोई लेख नहीं मिला
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPosts.has(post.id)}
                        onChange={() => handleSelectPost(post.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-sm font-medium text-gray-900 hover:text-orange-600"
                        >
                          {post.title}
                        </Link>
                        {post.is_featured && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            विशेष
                          </span>
                        )}
                        {post.is_sticky && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            चिपका हुआ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {post.author_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(post.published_at || post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.view_count}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800"
                          title="देखें"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => onEdit(post)}
                          className="text-green-600 hover:text-green-800"
                          title="संपादित करें"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-800"
                          title="हटाएं"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                पृष्ठ {currentPage} का {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  पिछला
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        pageNum === currentPage
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  अगला
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}