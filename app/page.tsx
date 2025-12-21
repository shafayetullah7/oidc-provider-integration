'use client';
import { generateCodeVerifier, generateCodeChallenge } from './lib/pkce';

export default function Home() {
  const startLogin = async () => {
    // Generate PKCE challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store verifier for later use in callback
    sessionStorage.setItem('code_verifier', codeVerifier);

    // Build OAuth authorization URL
    const authUrl = new URL('http://localhost:4001/oidc/auth');
    authUrl.searchParams.set('client_id', 'partner-dashboard-local-2');
    authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/auth/callback');
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    // Navigate to OAuth provider (this will redirect to your login page)
    window.location.href = authUrl.toString();
  };

  const testVlifeAccess = async () => {
    try {
      const response = await fetch('http://localhost:4001/test/protected', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Success: ${JSON.stringify(data)}`);
      } else {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        alert(`Error ${response.status}: ${error.message || 'Unauthorized'}`);
      }
    } catch (err: any) {
      alert(`Network Error: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <main className="flex flex-col items-center justify-center p-16 bg-white rounded-lg shadow space-y-4">
        <h1 className="text-2xl font-bold mb-4">Welcome</h1>
        <button 
          onClick={startLogin}
          className="bg-blue-600 text-white px-10 py-3 rounded hover:bg-blue-700 w-full"
        >
          Login with OAuth
        </button>
        <button 
          onClick={testVlifeAccess}
          className="bg-zinc-200 text-zinc-800 px-10 py-3 rounded hover:bg-zinc-300 w-full"
        >
          Test vLife Access (No Login)
        </button>
      </main>
    </div>
  );
}