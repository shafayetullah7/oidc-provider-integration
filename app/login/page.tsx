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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!uid) {
      setError("No interaction ID found");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4001/oidc/interaction/${uid}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          redirect: "manual", // CRITICAL: Don't auto-follow redirects
          body: JSON.stringify({ email, password }),
        }
      );

      // Check if backend returned a redirect (status 302/303)
      if (response.type === "opaqueredirect" || response.status === 0) {
        // finishInteraction sent a redirect back to /oidc/auth
        // We need to manually navigate there to continue the OAuth flow
        window.location.href = `http://localhost:4001/oidc/auth/${uid}`;
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      // If no redirect, something might be wrong
      console.warn("Expected redirect after login, but got:", response.status);
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  // const handleSubmit = () => {
  //   const form = document.createElement("form");
  //   form.method = "POST";
  //   form.action = `http://localhost:4001/oidc/interaction/${uid}/login`;

  //   form.appendChild(
  //     Object.assign(document.createElement("input"), {
  //       name: "email",
  //       value: email,
  //     })
  //   );

  //   form.appendChild(
  //     Object.assign(document.createElement("input"), {
  //       name: "password",
  //       type: "password",
  //       value: password,
  //     })
  //   );

  //   document.body.appendChild(form);
  //   form.submit();
  // };

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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              disabled={loading}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
