"use client";
import React, { useState, useEffect, useRef } from 'react';
import { BlogPost, CreateBlogPostData, BlogCategory, BlogTag } from '@/services/blogService';
import blogService from '@/services/blogServiceInstance';
import { X, Upload, Calendar, Tag, Folder, Eye, Lock, Save, Send, Image as ImageIcon } from 'lucide-react';

interface BlogPostFormProps {
  post?: BlogPost;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

export default function BlogPostForm({ post, onSave, onCancel }: BlogPostFormProps) {
  const [formData, setFormData] = useState<CreateBlogPostData>({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    featured_image_url: post?.featured_image_url || '',
    featured_image_alt: post?.featured_image_alt || '',
    status: post?.status || 'draft',
    visibility: post?.visibility || 'public',
    password: post?.password || '',
    categories: post?.categories || [],
    tags: post?.tags || [],
    is_featured: post?.is_featured || false,
    is_sticky: post?.is_sticky || false,
    allow_comments: post?.allow_comments !== false,
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    meta_keywords: post?.meta_keywords || '',
    canonical_url: post?.canonical_url || '',
    language: post?.language || 'hi',
    custom_fields: post?.custom_fields || {},
  });

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(post?.scheduled_at || '');
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [slug, setSlug] = useState(post?.slug || '');
  const [slugManual, setSlugManual] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  useEffect(() => {
    if (formData.content) {
      const words = formData.content.trim().split(/\s+/).length;
      const minutes = Math.ceil(words / 200); // Average reading speed
      setReadingTime(minutes);
      setFormData(prev => ({ ...prev, reading_time: minutes }));
    }
  }, [formData.content]);

  useEffect(() => {
    if (!slugManual && formData.title) {
      const autoSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(autoSlug);
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title, slugManual]);

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const { url } = await blogService.uploadBlogImage(file);
      setFormData(prev => ({ 
        ...prev, 
        featured_image_url: url,
        featured_image_alt: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('छवि अपलोड करने में त्रुटि हुई');
    } finally {
      setUploadingImage(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const newCat = await blogService.createBlogCategory({
        name: newCategory,
        slug: newCategory.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        parent_id: '',
        color: '#6B7280',
        icon: 'folder',
        post_count: 0,
        is_active: true
      });
      setCategories([...categories, newCat]);
      setNewCategory('');
      setFormData(prev => ({
        ...prev,
        categories: [...(prev.categories || []), newCat.slug]
      }));
    } catch (error) {
      console.error('Error creating category:', error);
      alert('श्रेणी बनाने में त्रुटि हुई');
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;

    try {
      const newTagObj = await blogService.createBlogTag({
        name: newTag,
        slug: newTag.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        color: '#6B7280',
        post_count: 0,
        is_active: true
      });
      setTags([...tags, newTagObj]);
      setNewTag('');
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTagObj.slug]
      }));
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('टैग बनाने में त्रुटि हुई');
    }
  };

  const handleSubmit = async (status: 'draft' | 'published' | 'scheduled') => {
    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        status,
        scheduled_at: status === 'scheduled' && scheduledDate ? scheduledDate : undefined,
        reading_time: readingTime,
      };

      let result;
      if (post) {
        result = await blogService.updateBlogPost(post.id, submitData);
      } else {
        result = await blogService.createBlogPost(submitData);
      }

      onSave(result);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('पोस्ट सहेजने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setFormData(prev => ({ ...prev, slug: value }));
    setSlugManual(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'प्रकाशित करें';
      case 'draft': return 'ड्राफ्ट सहेजें';
      case 'scheduled': return 'निर्धारित करें';
      default: return 'सहेजें';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {post ? 'लेख संपादित करें' : 'नया लेख बनाएं'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              previewMode 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye size={16} />
            {previewMode ? 'संपादन' : 'पूर्वावलोकन'}
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {previewMode ? (
            <div className="prose max-w-none">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || 'शीर्षक'}</h1>
              {formData.featured_image_url && (
                <img
                  src={formData.featured_image_url}
                  alt={formData.featured_image_alt || formData.title}
                  className="w-full max-w-md rounded-lg mb-4"
                />
              )}
              <div className="text-gray-700 whitespace-pre-wrap">
                {formData.content || 'सामग्री यहां दिखाई देगी...'}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  शीर्षक *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  placeholder="अपने लेख का शीर्षक दर्ज करें..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  स्लग (URL)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="lekh-ka-slug"
                  />
                  <button
                    type="button"
                    onClick={() => setSlugManual(!slugManual)}
                    className={`px-4 py-2 border-t border-b border-r border-gray-300 rounded-r-lg transition-colors ${
                      slugManual ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {slugManual ? 'हस्तचालित' : 'स्वचालित'}
                  </button>
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  विशेष छवि
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {formData.featured_image_url ? (
                    <div className="space-y-4">
                      <img
                        src={formData.featured_image_url}
                        alt={formData.featured_image_alt || formData.title}
                        className="w-full max-w-md rounded-lg"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.featured_image_alt}
                          onChange={(e) => setFormData(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="छवि वैकल्पिक पाठ"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, featured_image_url: '', featured_image_alt: '' }))}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          हटाएं
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          <Upload size={16} />
                          {uploadingImage ? 'अपलोड हो रहा है...' : 'छवि अपलोड करें'}
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        JPG, PNG, GIF अधिकतम 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  सामग्री *
                </label>
                <textarea
                  ref={contentRef}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                  placeholder="अपनी सामग्री यहां लिखें..."
                />
                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                  <span>पढ़ने का समय: {readingTime} मिनट</span>
                  <span>{formData.content.length} वर्ण</span>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  सारांश
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="लेख का एक संक्षिप्त सारांश..."
                  maxLength={200}
                />
                <div className="mt-1 text-sm text-gray-500">
                  {(formData.excerpt || '').length}/200 वर्ण
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 p-6 space-y-6">
          {/* Publish */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">प्रकाशन</h3>
            
            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                स्थिति
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="draft">ड्राफ्ट</option>
                <option value="published">प्रकाशित</option>
                <option value="scheduled">निर्धारित</option>
                <option value="private">निजी</option>
              </select>
            </div>

            {/* Scheduled Date */}
            {formData.status === 'scheduled' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  निर्धारित तिथि
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Visibility */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Eye size={16} className="inline mr-1" />
                दृश्यता
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="public">सार्वजनिक</option>
                <option value="private">निजी</option>
                <option value="password_protected">पासवर्ड संरक्षित</option>
              </select>
            </div>

            {/* Password */}
            {formData.visibility === 'password_protected' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-1" />
                  पासवर्ड
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="पासवर्ड दर्ज करें"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                ड्राफ्ट सहेजें
              </button>
              <button
                onClick={() => handleSubmit('published')}
                disabled={loading || !formData.title || !formData.content}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                प्रकाशित करें
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">
              <Folder size={16} className="inline mr-1" />
              श्रेणियाँ
            </h3>
            
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categories?.includes(category.slug) || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        categories: checked
                          ? [...(prev.categories || []), category.slug]
                          : (prev.categories || []).filter(c => c !== category.slug)
                      }));
                    }}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>

            {/* Add New Category */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="नई श्रेणी"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <button
                onClick={addCategory}
                disabled={!newCategory.trim()}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
              >
                जोड़ें
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">
              <Tag size={16} className="inline mr-1" />
              टैग
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      tags: (prev.tags || []).filter(t => t !== tag)
                    }))}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add New Tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="नया टैग"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <button
                onClick={addTag}
                disabled={!newTag.trim()}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
              >
                जोड़ें
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">विकल्प</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">विशेष लेख</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_sticky}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_sticky: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">चिपका हुआ लेख</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allow_comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, allow_comments: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">टिप्पणियाँ अनुमत</span>
              </label>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">SEO</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  मेटा शीर्षक
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="SEO शीर्षक"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  मेटा विवरण
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="SEO विवरण"
                  maxLength={160}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {(formData.meta_description || '').length}/160 वर्ण
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  मेटा कीवर्ड
                </label>
                <input
                  type="text"
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="कीवर्ड अल्पविराम से अलग करें"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  कैनोनिकल URL
                </label>
                <input
                  type="url"
                  value={formData.canonical_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/original-post"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}