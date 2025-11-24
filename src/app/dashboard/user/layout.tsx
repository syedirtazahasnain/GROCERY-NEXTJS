'use client';

import ProtectedRoute from '@/app/_components/auth/ProtectedRoute';
import { Suspense } from 'react';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import Header from "@/app/_components/header/index";
import Sidebar from "@/app/_components/sidebar/index";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <div className="w-[15%] relative">
            <Sidebar />
          </div>

          {/* Main Area */}
          <div className="w-[85%] mx-auto">
            {/* Header (sticky) */}
            <div className="bg-white sticky top-0 z-20">
              <Header />
            </div>

            {/* Page content with transitions */}
            <main className="flex-1 p-4">
             {children}
            </main>
          </div>
        </div>
      </Suspense>
    </ProtectedRoute>
  );
}
