'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const codeVerifier = sessionStorage.getItem('code_verifier');

    // Handle OAuth errors
    if (errorParam) {
      setError(`OAuth Error: ${errorParam}`);
      return;
    }

    // Exchange authorization code for tokens
    if (code && codeVerifier) {
      exchangeCodeForToken(code, codeVerifier);
    } else if (!code) {
      setError('No authorization code received');
    } else if (!codeVerifier) {
      setError('No code verifier found. Please try logging in again.');
    }
  }, [searchParams]);

  const exchangeCodeForToken = async (code: string, codeVerifier: string) => {
    try {
      const response = await fetch('http://localhost:4001/oidc/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'http://localhost:3000/auth/callback',
          client_id: 'partner-dashboard-local-2',
          code_verifier: codeVerifier,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Token exchange failed');
      }

      const tokens = await response.json();
      
      // Store tokens (consider using httpOnly cookies instead for production)
      sessionStorage.setItem('access_token', tokens.access_token);
      if (tokens.id_token) {
        sessionStorage.setItem('id_token', tokens.id_token);
      }
      if (tokens.refresh_token) {
        sessionStorage.setItem('refresh_token', tokens.refresh_token);
      }

      // Clean up code verifier
      sessionStorage.removeItem('code_verifier');

      // Redirect to protected area or dashboard
      router.push('/dashboard'); // or wherever you want to send them
      
    } catch (err: any) {
      setError(err.message || 'Failed to complete authentication');
      console.error('Token exchange error:', err);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="bg-white p-8 rounded shadow max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="bg-white p-8 rounded shadow">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-700">Completing authentication...</p>
        </div>
      </div>
    </div>
  );
}