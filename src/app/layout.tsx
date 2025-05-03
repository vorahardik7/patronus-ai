// src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PharmTrack - Pharmaceutical Rep Tracking System',
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
          <Footer />
        </div>
      </body>
    </html>
  );
}