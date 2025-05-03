// src/components/layout/Footer.tsx
export default function Footer() {
    return (
      <footer className="bg-white border-t border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="text-sm text-secondary-500">
              &copy; {new Date().getFullYear()} PharmTrack. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-secondary-500 hover:text-secondary-900">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-secondary-500 hover:text-secondary-900">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-secondary-500 hover:text-secondary-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }