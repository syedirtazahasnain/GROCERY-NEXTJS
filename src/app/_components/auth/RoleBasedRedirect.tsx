'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  onUnauthenticated?: () => void;
}

export default function RoleBasedRedirect({ 
  children, 
  allowedRoles,
  onUnauthenticated
}: RoleBasedRedirectProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  // Function to handle unauthenticated responses
  const handleUnauthenticated = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  useEffect(() => {
    setIsClient(true);
    const verifyAuth = () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        handleUnauthenticated();
        return;
      }

      try {
        const user = JSON.parse(userData);
        const userRole = user.role || user.my_role;
        
        if (allowedRoles && !allowedRoles.includes(userRole)) {
          const defaultRoute = userRole === 'admin' || userRole === 'superadmin' 
            ? '/dashboard/admin' 
            : '/dashboard/user';
          router.push(defaultRoute);
          return;
        }

        setIsAllowed(true);
      } catch (error) {
        handleUnauthenticated();
      }
    };

    verifyAuth();

    // Set up global response interceptor for API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const clonedResponse = response.clone();
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
  }, [router, allowedRoles]);

  if (!isClient) {
    return null;
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}