'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface DemoLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function DemoLayout({ title, description, children }: DemoLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* Demo Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}
