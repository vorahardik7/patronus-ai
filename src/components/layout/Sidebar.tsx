"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  MicrophoneIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  BeakerIcon,
  ClipboardDocumentIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Transcribe', href: '/transcribe', icon: MicrophoneIcon },
  { name: 'Doctors', href: '/doctors', icon: UserGroupIcon },
  { name: 'Hospitals', href: '/hospitals', icon: BuildingOfficeIcon },
  { name: 'Drugs', href: '/drugs', icon: BeakerIcon },
  { name: 'Reports', href: '/reports', icon: ClipboardDocumentIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-secondary-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex-1 px-3 space-y-1 bg-white">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'}
                `}
              >
                <item.icon 
                  className={`
                    mr-3 flex-shrink-0 h-6 w-6
                    ${isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'}
                  `} 
                  aria-hidden="true" 
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="p-4 border-t border-secondary-200">
        <Link
          href="/settings"
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
        >
          <Cog6ToothIcon className="mr-3 flex-shrink-0 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" aria-hidden="true" />
          Settings
        </Link>
      </div>
    </div>
  );
}
