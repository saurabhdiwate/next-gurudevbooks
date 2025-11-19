"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseService';
import { BlogPost } from '@/services/blogService';
import BlogAdminPanel from '@/components/BlogAdminPanel';
import BlogPostForm from '@/components/BlogPostForm';
import { LogOut } from 'lucide-react';

export default function AdminBlogPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>(undefined);

  const handleCreateNew = () => {
    setEditingPost(undefined);
    setShowForm(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleSave = (post: BlogPost) => {
    setShowForm(false);
    setEditingPost(undefined);
    // Refresh the admin panel
    window.location.reload();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(undefined);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logout */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showForm ? 'लेख प्रबंधन' : 'ब्लॉग प्रबंधन'}
            </h1>
            <p className="text-gray-600">
              {showForm ? 'नया लेख बनाएं या संपादित करें' : 'अपने ब्लॉग लेखों का प्रबंधन करें'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            लॉगआउट
          </button>
        </div>

        {showForm ? (
          <BlogPostForm
            post={editingPost}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <BlogAdminPanel
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}