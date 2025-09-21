import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin
        </h1>
      </div>
    </div>
  );
};
