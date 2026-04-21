'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatWindow from '@/components/ChatWindow';

export default function ChatPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      {/* Header with user info */}
      <div className="fixed top-0 right-0 z-50 p-4">
        <div className="flex items-center space-x-4 bg-white shadow rounded-lg px-4 py-2">
          <span className="text-sm text-gray-700">{user.name}</span>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
      <ChatWindow />
    </div>
  );
}
