"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ConsentPage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConsent = async () => {
    if (!uid) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:4001/oauth/interaction/${uid}/consent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          redirect: "manual", // CRITICAL: Don't auto-follow redirects
        }
      );

      // Check if backend returned a redirect
      if (response.type === "opaqueredirect" || response.status === 0) {
        // Navigate back to continue the flow
        window.location.href = `http://localhost:4001/oauth/auth/${uid}`;
        return;
      }

      if (!response.ok) {
        throw new Error("Consent failed");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAbort = async () => {
    if (!uid) return;

    try {
      await fetch(`http://localhost:4001/oauth/interaction/${uid}/abort`, {
        method: "POST",
        credentials: "include",
      });

      // Redirect back to home
      window.location.href = "/";
    } catch (err) {
      console.error("Abort failed:", err);
      window.location.href = "/";
    }
  };

  if (!uid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="bg-white p-8 rounded shadow">
          <p className="text-red-600">Invalid consent session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Grant Permission</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <p className="mb-6 text-gray-700">
          The application is requesting access to your:
        </p>

        <ul className="list-disc list-inside mb-6 text-gray-600">
          <li>Profile information</li>
          <li>Email address</li>
        </ul>

        <div className="flex gap-4">
          <button
            onClick={handleConsent}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Allow"}
          </button>

          <button
            onClick={handleAbort}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 disabled:bg-gray-400"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}
