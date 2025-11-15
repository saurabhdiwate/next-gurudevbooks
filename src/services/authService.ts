"use client";
import { supabase } from './supabaseService';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  name?: string;
  town_village?: string;
  state?: string;
  email?: string;
  email_verified: boolean;
  profile_photo_url?: string;
  total_satkarm: number;
  books_completed: number;
  created_at: string;
  updated_at: string;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_slug: string;
  current_page: number;
  total_pages: number;
  completion_percentage: number;
  total_time_spent_seconds: number;
  last_read_at: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompletedBook {
  id: string;
  user_id: string;
  book_slug: string;
  completed_at: string;
  total_time_spent_seconds: number;
  total_satkarm_earned: number;
  created_at: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initialize(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.currentUser = user;
        await this.loadUserProfile();
        return user;
      }
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        throw error;
      }
      if (data.user) {
        this.currentUser = data.user;
        await this.createUserProfile();
        return data.user;
      }
      throw new Error('Failed to create anonymous user');
    } catch (error) {
      throw error as any;
    }
  }

  private async loadUserProfile(): Promise<void> {
    if (!this.currentUser) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();
      if (error && (error as any).code !== 'PGRST116') {
        throw error;
      }
      this.userProfile = data as any;
    } catch {}
  }

  private async createUserProfile(): Promise<void> {
    if (!this.currentUser) return;
    try {
      const profileData = {
        id: this.currentUser.id,
        user_id: this.currentUser.id,
        email: this.currentUser.email || '',
        email_verified: !!this.currentUser.email_confirmed_at,
        total_satkarm: 0,
        books_completed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();
      if (error) {
        throw error;
      }
      this.userProfile = data as any;
    } catch {}
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user');
      }
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) {
        throw error;
      }
    } catch (error) {
      throw error as any;
    }
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user');
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });
      if (uploadError) {
        throw uploadError;
      }
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);
      await this.updateProfile({ profile_photo_url: data.publicUrl });
      return data.publicUrl;
    } catch (error) {
      throw error as any;
    }
  }

  async sendEmailVerification(): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: this.getCurrentUser()?.email || ''
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      throw error as any;
    }
  }

  async trackReadingSession(bookSlug: string, pageNumber: number, timeSpentSeconds: number): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user || timeSpentSeconds < 1) return;
      const satkarmPoints = Math.min(5, Math.floor(timeSpentSeconds / 20));
      if (satkarmPoints > 0) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('total_satkarm')
          .eq('id', user.id)
          .single();
        if (profileData) {
          const newTotalSatkarm = (profileData.total_satkarm || 0) + satkarmPoints;
          await supabase
            .from('user_profiles')
            .update({ total_satkarm: newTotalSatkarm })
            .eq('id', user.id);
        }
      }
      await supabase
        .from('reading_sessions')
        .upsert({
          user_id: user.id,
          book_slug: bookSlug,
          page_number: pageNumber,
          time_spent_seconds: timeSpentSeconds,
          session_date: new Date().toISOString().split('T')[0],
          satkarm_earned: satkarmPoints,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,book_slug,page_number,session_date'
        });
    } catch {}
  }

  async updateBookProgress(bookSlug: string, currentPage: number, totalPages: number): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) return;
      const completionPercentage = Math.min(100, Math.max(0, (currentPage / totalPages) * 100));
      const isCompleted = completionPercentage >= 95;
      await supabase
        .from('user_book_progress')
        .upsert({
          user_id: user.id,
          book_slug: bookSlug,
          current_page: currentPage,
          total_pages: totalPages,
          completion_percentage: completionPercentage,
          is_completed: isCompleted,
          last_read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,book_slug'
        });
    } catch {}
  }

  async markBookCompleted(bookSlug: string): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) return;
      await supabase
        .from('user_book_progress')
        .upsert({
          user_id: user.id,
          book_slug: bookSlug,
          completion_percentage: 100,
          is_completed: true,
          completed_at: new Date().toISOString(),
          last_read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,book_slug'
        });
    } catch {}
  }

  async getReadingProgress(): Promise<ReadingProgress[]> {
    try {
      const user = this.getCurrentUser();
      if (!user) return [];
      const { data } = await supabase
        .from('user_book_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('last_read_at', { ascending: false });
      return (data as any) || [];
    } catch {
      return [];
    }
  }

  async getCompletedBooks(): Promise<ReadingProgress[]> {
    try {
      const user = this.getCurrentUser();
      if (!user) return [];
      const { data } = await supabase
        .from('user_book_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });
      return (data as any) || [];
    } catch {
      return [];
    }
  }

  async getRecentBooks(): Promise<ReadingProgress[]> {
    try {
      const user = this.getCurrentUser();
      if (!user) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: sessionData } = await supabase
        .from('reading_sessions')
        .select('book_slug, session_date')
        .eq('user_id', user.id)
        .gte('session_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('session_date', { ascending: false });
      if (!sessionData || sessionData.length === 0) {
        return [];
      }
      const uniqueBooks = new Map<string, string>();
      (sessionData as any[]).forEach(session => {
        if (!uniqueBooks.has(session.book_slug) || 
            new Date(session.session_date) > new Date(uniqueBooks.get(session.book_slug)!)) {
          uniqueBooks.set(session.book_slug, session.session_date);
        }
      });
      const recentBookSlugs = Array.from(uniqueBooks.keys());
      const { data: bookData } = await supabase
        .from('user_book_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('book_slug', recentBookSlugs)
        .order('last_read_at', { ascending: false });
      return (bookData as any) || [];
    } catch {
      return [];
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      this.currentUser = null;
      this.userProfile = null;
    } catch (error) {
      throw error as any;
    }
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  canDeleteAccount(): boolean {
    const user = this.getCurrentUser();
    const profile = this.getUserProfile();
    return !!(user && profile && profile.email_verified);
  }

  async deleteAccount(): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user');
      }
      const profile = this.getUserProfile();
      if (!profile || !profile.email_verified) {
        throw new Error('Email verification required to delete account');
      }
      const userId = user.id;
      const deleteOperations = [
        supabase.from('reading_sessions').delete().eq('user_id', userId),
        supabase.from('user_book_progress').delete().eq('user_id', userId),
        supabase.from('user_favorites').delete().eq('user_id', userId),
        supabase.from('user_profiles').delete().eq('id', userId)
      ];
      await Promise.allSettled(deleteOperations);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteError) {
        throw deleteError;
      }
      await this.signOut();
    } catch {}
  }
}

export const authService = AuthService.getInstance();