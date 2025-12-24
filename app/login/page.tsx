"use client";
import { useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // We use form action instead of fetch to allow native browser redirects
  // (e.g. to subscription page or back to OAuth flow)
  const actionUrl = `http://localhost:4001/oauth/interaction/${uid}/login`;

  if (!uid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="bg-white p-8 rounded shadow">
          <p className="text-red-600">
            Invalid login session. Please start over.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 text-blue-600 underline"
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form method="POST" action={actionUrl}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
