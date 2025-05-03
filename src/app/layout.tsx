// src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Patronus AI - Pharmaceutical Rep Tracking System',
  description: 'Track and share conversations between pharmaceutical sales reps and physicians',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-secondary-50">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}