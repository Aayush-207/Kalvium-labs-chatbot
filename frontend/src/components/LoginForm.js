'use client';

import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Toast from './Toast';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { setIdToken, setUser } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get ID token
      const idToken = await result.user.getIdToken();

      // Store token and redirect
      localStorage.setItem('idToken', idToken);
      setIdToken(idToken);

      // Verify user and get profile
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        router.push('/chat');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💬</div>
          <h1 className="text-3xl font-bold text-gray-800">Chat Support</h1>
          <p className="text-gray-600 mt-2">Get instant help from our support team</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 disabled:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <image
              href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGQkJGMjQiLz48cGF0aCBkPSJNMTkuNjAzIDEwLjJIMTguNFY5Ljh2LTEuMkg5VjEwLjJ2LTEuMkg3LjJWMTBIMTBWMjB2MS4ySDEuMlYxLjJIMjBWMTAuMnoiIGZpbGw9IiMzQzhFRTMiLz48L3N2Zz4="
              width="100%"
              height="100%"
            />
          </svg>
          <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            By signing in, you agree to our <a href="#" className="text-blue-500 hover:underline">Terms</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>

      {error && <Toast message={error} type="error" />}
    </div>
  );
}
