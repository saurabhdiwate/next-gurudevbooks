import React from 'react';
import { BlogPost } from '@/services/blogService';
import blogService from '@/services/blogServiceInstance';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, Tag, ArrowRight, Eye } from 'lucide-react';
import BlogFilters from '@/components/BlogFilters';
import Header from '@/components/Header';

interface SerializedCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  post_count: number;
}

interface SerializedTag {
  id: string;
  name: string;
  slug: string;
}

interface SerializedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  featured_image_alt: string;
  is_featured: boolean;
  is_sticky: boolean;
  view_count: number;
  author_name: string;
  published_at: string;
  created_at: string;
  categories: string[];
  tags: string[];
}

interface BlogListingPageProps {
  searchParams: {
    category?: string;
    tag?: string;
    search?: string;
    page?: string;
  };
}

async function getBlogPosts(searchParams: BlogListingPageProps['searchParams']) {
  try {
    const page = parseInt(searchParams.page || '1');
    const limit = 12;
    const offset = (page - 1) * limit;

    const filters = {
      category: searchParams.category,
      tag: searchParams.tag,
      search: searchParams.search,
      status: 'published' as const,
    };

    console.log('Using blogService instance:', blogService);
    console.log('blogService type:', typeof blogService);
    console.log('getBlogPosts method:', typeof blogService.getBlogPosts);

    const { posts, total } = await blogService.getBlogPosts(filters, limit, offset);
    
    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      posts: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

async function getBlogCategories() {
  try {
    return await blogService.getBlogCategories();
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return [];
  }
}

async function getBlogTags() {
  try {
    return await blogService.getBlogTags();
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return [];
  }
}

export default async function BlogListingPage({ searchParams }: BlogListingPageProps) {
  const params = await searchParams;
  const { posts, total, page, totalPages } = await getBlogPosts(params);
  const categories = await getBlogCategories();
  const tags = await getBlogTags();

  // Debug logging
  console.log('Blog page data:', {
    postsCount: posts?.length,
    total,
    page,
    totalPages,
    categoriesCount: categories?.length,
    tagsCount: tags?.length,
    firstPost: posts?.[0] ? {
      id: posts[0].id,
      title: posts[0].title,
      categories: posts[0].categories,
      tags: posts[0].tags
    } : null
  });

  // Serialize pagination data
  const serializedTotal = Number(total);
  const serializedPage = Number(page);
  const serializedTotalPages = Number(totalPages);

  // Serialize the data to ensure it can be passed to client components
  console.log('Starting serialization...');
  
  const serializedCategories: SerializedCategory[] = JSON.parse(JSON.stringify(categories.map(cat => ({
    id: String(cat.id),
    name: String(cat.name),
    slug: String(cat.slug),
    color: String(cat.color),
    post_count: Number(cat.post_count)
  }))));
  console.log('Categories serialized:', serializedCategories.length);

  const serializedTags: SerializedTag[] = JSON.parse(JSON.stringify(tags.map(tag => ({
    id: String(tag.id),
    name: String(tag.name),
    slug: String(tag.slug)
  }))));
  console.log('Tags serialized:', serializedTags.length);

  const serializedPosts: SerializedPost[] = JSON.parse(JSON.stringify(posts.map(post => ({
    id: String(post.id),
    title: String(post.title),
    slug: String(post.slug),
    excerpt: String(post.excerpt),
    content: String(post.content),
    featured_image_url: String(post.featured_image_url),
    featured_image_alt: String(post.featured_image_alt),
    is_featured: Boolean(post.is_featured),
    is_sticky: Boolean(post.is_sticky),
    view_count: Number(post.view_count),
    author_name: String(post.author_name),
    published_at: String(post.published_at),
    created_at: String(post.created_at),
    categories: Array.isArray(post.categories) ? post.categories.map(cat => String(cat)) : [],
    tags: Array.isArray(post.tags) ? post.tags.map(tag => String(tag)) : []
  }))));
  console.log('Posts serialized:', serializedPosts.length);
  
  // Debug the props we're passing to client components
  console.log('Header props:', { showWelcome: false, books: undefined, onSearch: undefined });
  console.log('BlogFilters props:', {
    categoriesCount: serializedCategories.length,
    tagsCount: serializedTags.length,
    currentCategory: params.category || '',
    currentTag: params.tag || '',
    currentSearch: params.search || ''
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header showWelcome={false} books={undefined} onSearch={undefined} />
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Blog Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg mb-8">
            <div className="px-4 py-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">लेख</h1>
              <p className="text-xl opacity-90">ज्ञान, प्रेरणा और आध्यात्मिकता पर आधारित लेख</p>
            </div>
          </div>

          <div className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <BlogFilters
              categories={serializedCategories}
              tags={serializedTags}
              currentCategory={params.category || ''}
              currentTag={params.tag || ''}
              currentSearch={params.search || ''}
            />

            {/* Blog Posts Grid */}
            {serializedPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-500 text-xl mb-4">कोई लेख नहीं मिला</div>
                <p className="text-gray-400">कृपया अन्य श्रेणी या खोज शब्द आज़माएं</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serializedPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Featured Image */}
                    {post.featured_image_url && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.featured_image_url}
                          alt={post.featured_image_alt || post.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {post.is_featured && (
                          <div className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            विशेष
                          </div>
                        )}
                        {post.is_sticky && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            चिपका हुआ
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {/* Categories */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories.slice(0, 2).map((categorySlug) => {
                            const category = categories.find(c => c.slug === categorySlug);
                            return category ? (
                              <span
                                key={categorySlug}
                                className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                                style={{ backgroundColor: category.color + '20', color: category.color }}
                              >
                                {category.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        <Link href={`/blog/${post.slug}`} className="hover:text-orange-600 transition-colors">
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {post.author_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(post.published_at || post.created_at)}
                          </span>
                          {post.content && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {calculateReadingTime(post.content)} मिनट
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {post.view_count}
                        </span>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tagSlug: string) => {
                            const tag = tags.find(t => t.slug === tagSlug);
                            return tag ? (
                              <span
                                key={tagSlug}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                              >
                                <Tag size={10} />
                                {tag.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Read More */}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                      >
                        पढ़ना जारी रखें
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {serializedTotalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <Link
                  href={`/blog?page=${Math.max(1, serializedPage - 1)}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.tag ? `&tag=${searchParams.tag}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                  className={`px-4 py-2 rounded-lg border ${serializedPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  aria-disabled={serializedPage === 1}
                >
                  पिछला
                </Link>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, serializedTotalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(serializedTotalPages - 4, serializedPage - 2)) + i;
                  return (
                    <Link
                      key={pageNum}
                      href={`/blog?page=${pageNum}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.tag ? `&tag=${searchParams.tag}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                      className={`px-3 py-2 rounded-lg border ${pageNum === serializedPage ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                <Link
                  href={`/blog?page=${Math.min(serializedTotalPages, serializedPage + 1)}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.tag ? `&tag=${searchParams.tag}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                  className={`px-4 py-2 rounded-lg border ${serializedPage === serializedTotalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  aria-disabled={serializedPage === serializedTotalPages}
                >
                  अगला
                </Link>
              </div>
            )}
          </div>
          {/* Close Main Content */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">श्रेणियाँ</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog?category=${category.slug}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-500">({category.post_count})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">लोकप्रिय टैग</h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 15).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors"
                  >
                    {tag.name}
                    <span className="text-xs text-gray-500">({tag.post_count})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Posts */}
            {serializedPosts.filter(post => post.is_featured).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">विशेष लेख</h3>
                <div className="space-y-4">
                  {serializedPosts
                    .filter(post => post.is_featured)
                    .slice(0, 3)
                    .map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {post.featured_image_url && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={post.featured_image_url}
                                alt={post.featured_image_alt || post.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(post.published_at || post.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}