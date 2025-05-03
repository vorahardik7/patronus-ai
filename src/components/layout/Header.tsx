"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const pathname = usePathname();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                {/* Placeholder for logo */}
                <div className="h-8 w-8 rounded-full bg-primary-600 mr-2 flex items-center justify-center text-white font-bold">
                  P
                </div>
                <span className="text-xl font-bold text-secondary-900">Patronus AI</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className={`${
                  pathname === '/' 
                    ? 'border-primary-500 text-secondary-900' 
                    : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Dashboard
              </Link>
              <Link 
                href="/record" 
                className={`${
                  pathname === '/record' 
                    ? 'border-primary-500 text-secondary-900' 
                    : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Record
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
