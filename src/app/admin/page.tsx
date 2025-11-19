"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseService';
import { BookOpen, Users, Settings, BarChart3, FileText, Image, Tag, Folder, Eye, User, Calendar, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const stats = [
    { name: 'कुल लेख', value: '12', icon: FileText, color: 'bg-blue-500' },
    { name: 'प्रकाशित', value: '8', icon: Eye, color: 'bg-green-500' },
    { name: 'ड्राफ्ट', value: '3', icon: FileText, color: 'bg-yellow-500' },
    { name: 'श्रेणियाँ', value: '5', icon: Folder, color: 'bg-purple-500' },
    { name: 'टैग', value: '15', icon: Tag, color: 'bg-pink-500' },
    { name: 'दृश्य', value: '1,234', icon: BarChart3, color: 'bg-indigo-500' },
  ];

  const menuItems = [
    { name: 'ब्लॉग प्रबंधन', href: '/admin/blog', icon: BookOpen, description: 'लेख बनाएं और प्रबंधित करें' },
    { name: 'श्रेणियाँ', href: '/admin/categories', icon: Folder, description: 'श्रेणियाँ प्रबंधित करें' },
    { name: 'टैग', href: '/admin/tags', icon: Tag, description: 'टैग प्रबंधित करें' },
    { name: 'मीडिया', href: '/admin/media', icon: Image, description: 'छवियाँ और फ़ाइलें' },
    { name: 'उपयोगकर्ता', href: '/admin/users', icon: Users, description: 'उपयोगकर्ता प्रबंधित करें' },
    { name: 'सेटिंग्स', href: '/admin/settings', icon: Settings, description: 'सिस्टम सेटिंग्स' },
  ];

  const recentPosts = [
    { title: 'भगवद गीता का महत्व', status: 'published', date: '2024-01-15', views: 45 },
    { title: 'योग और ध्यान', status: 'draft', date: '2024-01-14', views: 0 },
    { title: 'आयुर्वेदिक जीवनशैली', status: 'published', date: '2024-01-13', views: 32 },
    { title: 'वेदों की शिक्षा', status: 'scheduled', date: '2024-01-16', views: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">प्रशासन डैशबोर्ड</h1>
            <p className="text-gray-600">अपने ब्लॉग और वेबसाइट का प्रबंधन करें</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            लॉगआउट
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Menu */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">प्रबंधन मेनू</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-all duration-200 group"
                    >
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <item.icon className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">हाल के लेख</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentPosts.map((post, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${
                          post.status === 'published' ? 'bg-green-500' :
                          post.status === 'draft' ? 'bg-yellow-500' :
                          post.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {post.date}
                          </span>
                          {post.views > 0 && (
                            <span className="flex items-center">
                              <Eye size={12} className="mr-1" />
                              {post.views}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link
                    href="/admin/blog"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    सभी लेख देखें
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">त्वरित क्रियाएं</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/admin/blog?action=create"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <BookOpen size={16} className="mr-2" />
                  नया लेख बनाएं
                </Link>
                <Link
                  href="/admin/categories"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Folder size={16} className="mr-2" />
                  श्रेणी जोड़ें
                </Link>
                <Link
                  href="/admin/media"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Image size={16} className="mr-2" />
                  मीडिया अपलोड करें
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}