"use client";
import React, { useState } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import NavigationSidebar from '../components/NavigationSidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <div className="pb-16">{children}</div>
      <BottomNavigation onMenuClick={() => setIsSidebarOpen(true)} />
      <NavigationSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
}