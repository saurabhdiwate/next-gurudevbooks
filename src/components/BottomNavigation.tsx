"use client";
import React from 'react';
import { Home, User, Menu, BookOpen } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface BottomNavigationProps {
  onMenuClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'blog', icon: BookOpen, label: 'लेख', path: '/blog' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
    { id: 'menu', icon: Menu, label: 'Menu' },
  ];

  const getActiveId = () => {
    if (pathname === '/profile') return 'profile';
    if (pathname.startsWith('/blog')) return 'blog';
    return 'home';
  };

  const activeId = getActiveId();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-1.5">
        {tabs.map(({ id, icon: Icon, label, path }) => (
          <button
            key={id}
            onClick={() => id === 'menu' ? onMenuClick() : router.push(path!)}
            className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-200 ${
              activeId === id 
                ? 'text-orange-600 bg-orange-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={18} className="mb-0.5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;