'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleBasedRedirect from './RoleBasedRedirect';
import ErrorMessage from "@/app/_components/error/index";
import Loader from "@/app/_components/loader/index";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  loadingComponent?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  loadingComponent = (
    <Loader />
  )
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Function to handle unauthenticated responses
  const handleUnauthenticated = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      handleUnauthenticated();
      return;
    }

    // Set up global response interceptor
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const clonedResponse = response.clone();// Clone the response to read it without consuming the stream
      try {
        const data = await clonedResponse.json();
        if (data.message === "Unauthenticated.") {
          handleUnauthenticated();
        }
      } catch (error) {
        // If response is not JSON, ignore
      }
      return response;
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  if (!isMounted) {
    return loadingComponent;
  }

  return (
    <RoleBasedRedirect
      allowedRoles={allowedRoles}
      loadingComponent={loadingComponent}
      onUnauthenticated={handleUnauthenticated}
    >
      {children}
    </RoleBasedRedirect>
  );
}