import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PharmaFlow AI",
  description: "Empowering physicians to capture and understand pharmaceutical interactions more effectively",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.7 3.3c-.4-.4-1-.4-1.4 0l-4.3 4.3v-1.1c0-.6-.4-1-1-1H6c-.6 0-1 .4-1 1v12c0 .6.4 1 1 1h7c.6 0 1-.4 1-1v-1.1l4.3 4.3c.4.4 1 .4 1.4 0 .4-.4.4-1 0-1.4L15 16l4.7-4.3-4.7-4.3 4.7-4.3c.4-.4.4-1 0-1.4zM12 17H7V7h5v10z" />
                </svg>
                <span className="text-xl font-bold text-indigo-900">PharmaFlow AI</span>
              </Link>
              
              <div className="flex space-x-4">
                <Link 
                  href="/" 
                  className="px-3 py-2 text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded-md"
                >
                  Home
                </Link>
                <Link 
                  href="/record" 
                  className="px-3 py-2 text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded-md"
                >
                  Record Meeting
                </Link>
                <Link 
                  href="#" 
                  className="px-3 py-2 text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded-md"
                >
                  View Summaries
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        <main>
          {children}
        </main>
        
        <footer className="bg-white border-t mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} PharmaFlow AI. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
