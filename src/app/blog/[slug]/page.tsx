import React from 'react';
import { BlogPost } from '@/services/blogService';
import blogService from '@/services/blogServiceInstance';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, Tag, ArrowLeft, Share2, Heart, Eye } from 'lucide-react';
import Header from '@/components/Header';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

async function getBlogPostBySlug(slug: string) {
  try {
    return await blogService.getBlogPostBySlug(slug);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

async function getRelatedPosts(postId: string) {
  try {
    return await blogService.getRelatedBlogPosts(postId, 3);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
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

async function getBlogPost(slug: string) {
  try {
    return await blogService.getBlogPost(slug);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id);
  const categories = await getBlogCategories();
  const tags = await getBlogTags();

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

  const shareOnSocial = (platform: string) => {
    const url = `https://gurudevbooks.com/blog/${post.slug}`;
    const text = `पढ़ें: ${post.title}`;
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      default:
        return '#';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header showWelcome={false} books={[]} onSearch={(query) => {}} />
      <div className="pt-32">
        {/* Hero Section */}
        {post.featured_image_url && (
          <div className="relative h-96 bg-gray-900">
            <Image
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              fill
              className="object-cover opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="container mx-auto">
                <div className="max-w-4xl">
                  {/* Categories */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.slice(0, 2).map((categorySlug: string) => {
                        const category = categories.find(c => c.slug === categorySlug);
                        return category ? (
                          <span
                            key={categorySlug}
                            className="inline-block px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm bg-white/20 text-white"
                          >
                            {category.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    {post.title}
                  </h1>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <span className="flex items-center gap-1">
                      <User size={16} />
                      {post.author_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                    {post.content && (
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {calculateReadingTime(post.content)} मिनट पढ़ें
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {post.view_count} बार देखा गया
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Back Link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 transition-colors"
              >
                <ArrowLeft size={16} />
                सभी लेख
              </Link>

              {/* Title (if no featured image) */}
              {!post.featured_image_url && (
                <>
                  {/* Categories */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.slice(0, 2).map((categorySlug: string) => {
                        const category = categories.find(c => c.slug === categorySlug);
                        return category ? (
                          <span
                            key={categorySlug}
                            className="inline-block px-3 py-1 text-sm font-medium rounded-full"
                            style={{ backgroundColor: category.color + '20', color: category.color }}
                          >
                            {category.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    {post.title}
                  </h1>
                </>
              )}

              {/* Meta Info (if no featured image) */}
              {!post.featured_image_url && (
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6 pb-6 border-b">
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    {post.author_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {formatDate(post.published_at || post.created_at)}
                  </span>
                  {post.content && (
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {calculateReadingTime(post.content)} मिनट
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye size={16} />
                    {post.view_count}
                  </span>
                </div>
              )}

              {/* Excerpt */}
              {post.excerpt && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                  <p className="text-gray-700 italic">{post.excerpt}</p>
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">टैग</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tagSlug: string) => {
                      const tag = tags.find(t => t.slug === tagSlug);
                      return tag ? (
                        <Link
                          key={tagSlug}
                          href={`/blog?tag=${tagSlug}`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors"
                        >
                          <Tag size={12} />
                          {tag.name}
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">साझा करें</h3>
                <div className="flex gap-3">
                  <a
                    href={shareOnSocial('twitter')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Share2 size={16} />
                    Twitter
                  </a>
                  <a
                    href={shareOnSocial('facebook')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 size={16} />
                    Facebook
                  </a>
                  <a
                    href={shareOnSocial('whatsapp')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Share2 size={16} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">संबंधित लेख</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="group block"
                    >
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        {relatedPost.featured_image_url && (
                          <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                            <Image
                              src={relatedPost.featured_image_url}
                              alt={relatedPost.featured_image_alt || relatedPost.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                          <Calendar size={12} />
                          {formatDate(relatedPost.published_at || relatedPost.created_at)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">लेखक</h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User size={24} className="text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{post.author_name}</h4>
                <p className="text-sm text-gray-600 mt-2">
                  आध्यात्मिक और ज्ञानवर्धक लेखों के लेखक
                </p>
              </div>
            </div>

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

            {/* Recent Posts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">हाल के लेख</h3>
              <div className="space-y-4">
                {[post, ...relatedPosts].slice(0, 5).map((recentPost) => (
                  <Link
                    key={recentPost.id}
                    href={`/blog/${recentPost.slug}`}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      {recentPost.featured_image_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={recentPost.featured_image_url}
                            alt={recentPost.featured_image_alt || recentPost.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {recentPost.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(recentPost.published_at || recentPost.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}