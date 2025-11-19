import { supabaseServer as supabase } from './supabaseServer';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  featured_image_alt: string;
  author_id: string;
  author_name: string;
  status: 'draft' | 'published' | 'scheduled' | 'private';
  visibility: 'public' | 'private' | 'password_protected';
  password: string;
  published_at: string;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  reading_time: number;
  allow_comments: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
  is_sticky: boolean;
  is_featured: boolean;
  language: string;
  tags: string[];
  categories: string[];
  custom_fields: Record<string, any>;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  color: string;
  icon: string;
  post_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  post_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  parent_id: string;
  author_name: string;
  author_email: string;
  author_website: string;
  content: string;
  is_approved: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

export interface BlogMedia {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  url: string;
  file_size: number;
  mime_type: string;
  alt_text: string;
  caption: string;
  description: string;
  dimensions: { width: number; height: number };
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'private';
  visibility?: 'public' | 'private' | 'password_protected';
  password?: string;
  scheduled_at?: string;
  reading_time?: number;
  allow_comments?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  is_sticky?: boolean;
  is_featured?: boolean;
  language?: string;
  tags?: string[];
  categories?: string[];
  custom_fields?: Record<string, any>;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  author?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'private';
  language?: string;
  featured?: boolean;
  sticky?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export class BlogService {
  // Blog Posts CRUD Operations
  
  async createBlogPost(data: CreateBlogPostData): Promise<BlogPost> {
    try {
      // Generate unique slug
      const slug = await this.generateUniqueSlug(data.title);
      
      const postData = {
        ...data,
        slug,
        author_id: (await supabase.auth.getUser()).data.user?.id,
        author_name: (await supabase.auth.getUser()).data.user?.user_metadata?.full_name || 'Anonymous',
        published_at: data.status === 'published' ? new Date().toISOString() : null,
      };

      const { data: post, error } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      
      // Handle categories and tags
      if (data.categories && data.categories.length > 0) {
        await this.assignCategories(post.id, data.categories);
      }
      
      if (data.tags && data.tags.length > 0) {
        await this.assignTags(post.id, data.tags);
      }

      return post;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  async updateBlogPost(id: string, data: UpdateBlogPostData): Promise<BlogPost> {
    try {
      const updateData: any = { ...data };
      
      // If title changed, update slug
      if (data.title) {
        updateData.slug = await this.generateUniqueSlug(data.title, id);
      }
      
      // If status changed to published, set published_at
      if (data.status === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { data: post, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Handle categories and tags
      if (data.categories) {
        await this.assignCategories(id, data.categories);
      }
      
      if (data.tags) {
        await this.assignTags(id, data.tags);
      }

      return post;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  async deleteBlogPost(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  async getBlogPost(id: string): Promise<BlogPost | null> {
    try {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return post;
    } catch (error) {
      console.error('Error getting blog post:', error);
      throw error;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Increment view count
      await this.incrementViewCount(post.id);

      return post;
    } catch (error) {
      console.error('Error getting blog post by slug:', error);
      throw error;
    }
  }

  async getBlogPosts(filters: BlogFilters = {}, limit = 10, offset = 0): Promise<{ posts: BlogPost[]; total: number }> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        // Default to published posts for public view
        query = query.eq('status', 'published');
      }

      if (filters.category) {
        query = query.contains('categories', [filters.category]);
      }

      if (filters.tag) {
        query = query.contains('tags', [filters.tag]);
      }

      if (filters.author) {
        query = query.eq('author_id', filters.author);
      }

      if (filters.language) {
        query = query.eq('language', filters.language);
      }

      if (filters.featured) {
        query = query.eq('is_featured', true);
      }

      if (filters.sticky) {
        query = query.eq('is_sticky', true);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }

      if (filters.date_from) {
        query = query.gte('published_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('published_at', filters.date_to);
      }

      // Apply ordering - sticky first, then by published date
      query = query.order('is_sticky', { ascending: false }).order('published_at', { ascending: false });

      const { data: posts, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      return { posts: posts || [], total: count || 0 };
    } catch (error) {
      console.error('Error getting blog posts:', error);
      throw error;
    }
  }

  async getRelatedBlogPosts(postId: string, limit = 5): Promise<BlogPost[]> {
    try {
      const currentPost = await this.getBlogPost(postId);
      if (!currentPost) return [];

      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .neq('id', postId);

      // If post has categories, find posts with similar categories
      if (currentPost.categories && currentPost.categories.length > 0) {
        query = query.contains('categories', currentPost.categories.slice(0, 1));
      }

      // If post has tags, find posts with similar tags
      if (currentPost.tags && currentPost.tags.length > 0) {
        query = query.contains('tags', currentPost.tags.slice(0, 2));
      }

      const { data: posts, error } = await query
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return posts || [];
    } catch (error) {
      console.error('Error getting related blog posts:', error);
      throw error;
    }
  }

  // Blog Categories
  
  async getBlogCategories(): Promise<BlogCategory[]> {
    try {
      const { data: categories, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return categories || [];
    } catch (error) {
      console.error('Error getting blog categories:', error);
      throw error;
    }
  }

  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    try {
      const { data: category, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return category;
    } catch (error) {
      console.error('Error getting blog category by slug:', error);
      throw error;
    }
  }

  async createBlogCategory(data: Omit<BlogCategory, 'id' | 'created_at' | 'updated_at'>): Promise<BlogCategory> {
    try {
      const { data: category, error } = await supabase
        .from('blog_categories')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return category;
    } catch (error) {
      console.error('Error creating blog category:', error);
      throw error;
    }
  }

  // Blog Tags
  
  async getBlogTags(): Promise<BlogTag[]> {
    try {
      const { data: tags, error } = await supabase
        .from('blog_tags')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return tags || [];
    } catch (error) {
      console.error('Error getting blog tags:', error);
      throw error;
    }
  }

  async getBlogTagBySlug(slug: string): Promise<BlogTag | null> {
    try {
      const { data: tag, error } = await supabase
        .from('blog_tags')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return tag;
    } catch (error) {
      console.error('Error getting blog tag by slug:', error);
      throw error;
    }
  }

  async createBlogTag(data: Omit<BlogTag, 'id' | 'created_at' | 'updated_at'>): Promise<BlogTag> {
    try {
      const { data: tag, error } = await supabase
        .from('blog_tags')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return tag;
    } catch (error) {
      console.error('Error creating blog tag:', error);
      throw error;
    }
  }

  // Blog Comments
  
  async getBlogComments(postId: string): Promise<BlogComment[]> {
    try {
      const { data: comments, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return comments || [];
    } catch (error) {
      console.error('Error getting blog comments:', error);
      throw error;
    }
  }

  async createBlogComment(data: Omit<BlogComment, 'id' | 'created_at' | 'updated_at' | 'is_approved'>): Promise<BlogComment> {
    try {
      const { data: comment, error } = await supabase
        .from('blog_comments')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return comment;
    } catch (error) {
      console.error('Error creating blog comment:', error);
      throw error;
    }
  }

  // Media Management
  
  async uploadBlogImage(file: File, postId?: string): Promise<BlogMedia> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('blog-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-media')
        .getPublicUrl(filePath);

      // Create media record
      const mediaData = {
        filename: fileName,
        original_filename: file.name,
        file_path: filePath,
        url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data: media, error } = await supabase
        .from('blog_media')
        .insert(mediaData)
        .select()
        .single();

      if (error) throw error;

      return media;
    } catch (error) {
      console.error('Error uploading blog image:', error);
      throw error;
    }
  }

  async getBlogMedia(limit = 50, offset = 0): Promise<{ media: BlogMedia[]; total: number }> {
    try {
      const { data: media, error, count } = await supabase
        .from('blog_media')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { media: media || [], total: count || 0 };
    } catch (error) {
      console.error('Error getting blog media:', error);
      throw error;
    }
  }

  async deleteBlogMedia(id: string): Promise<void> {
    try {
      // Get media record first
      const { data: media, error: getError } = await supabase
        .from('blog_media')
        .select('file_path')
        .eq('id', id)
        .single();

      if (getError) throw getError;
      if (!media) throw new Error('Media not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('blog-media')
        .remove([media.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: deleteError } = await supabase
        .from('blog_media')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error('Error deleting blog media:', error);
      throw error;
    }
  }

  // Helper Methods
  
  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('generate_unique_blog_slug', { title, exclude_id: excludeId });

      if (error) throw error;
      return data;
    } catch (error) {
      // Fallback to manual generation
      const baseSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s]+/g, '-')
        .trim();
      
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const { data: existing } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', slug)
          .single();
        
        if (!existing || (excludeId && existing.id === excludeId)) {
          break;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      return slug;
    }
  }

  private async assignCategories(postId: string, categoryIds: string[]): Promise<void> {
    try {
      // Delete existing categories
      await supabase
        .from('blog_post_categories')
        .delete()
        .eq('post_id', postId);

      // Insert new categories
      if (categoryIds.length > 0) {
        const categoryData = categoryIds.map((categoryId, index) => ({
          post_id: postId,
          category_id: categoryId,
          is_primary: index === 0, // First category is primary
        }));

        const { error } = await supabase
          .from('blog_post_categories')
          .insert(categoryData);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error assigning categories:', error);
      throw error;
    }
  }

  private async assignTags(postId: string, tagIds: string[]): Promise<void> {
    try {
      // Delete existing tags
      await supabase
        .from('blog_post_tags')
        .delete()
        .eq('post_id', postId);

      // Insert new tags
      if (tagIds.length > 0) {
        const tagData = tagIds.map(tagId => ({
          post_id: postId,
          tag_id: tagId,
        }));

        const { error } = await supabase
          .from('blog_post_tags')
          .insert(tagData);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error assigning tags:', error);
      throw error;
    }
  }

  private async incrementViewCount(postId: string): Promise<void> {
    try {
      await supabase
        .from('blog_posts')
        .update({ view_count: supabase.rpc('increment', { column: 'view_count' }) })
        .eq('id', postId);
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't throw error as this is not critical
    }
  }

  // Statistics
  
  async getBlogStats(): Promise<{
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    total_categories: number;
    total_tags: number;
    total_comments: number;
    total_media: number;
  }> {
    try {
      const [
        { count: total_posts },
        { count: published_posts },
        { count: draft_posts },
        { count: total_categories },
        { count: total_tags },
        { count: total_comments },
        { count: total_media }
      ] = await Promise.all([
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('blog_categories').select('*', { count: 'exact', head: true }),
        supabase.from('blog_tags').select('*', { count: 'exact', head: true }),
        supabase.from('blog_comments').select('*', { count: 'exact', head: true }),
        supabase.from('blog_media').select('*', { count: 'exact', head: true })
      ]);

      return {
        total_posts: total_posts || 0,
        published_posts: published_posts || 0,
        draft_posts: draft_posts || 0,
        total_categories: total_categories || 0,
        total_tags: total_tags || 0,
        total_comments: total_comments || 0,
        total_media: total_media || 0
      };
    } catch (error) {
      console.error('Error getting blog stats:', error);
      throw error;
    }
  }
}

export const blogService = new BlogService();