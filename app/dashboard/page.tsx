"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { userInfo, loading, refreshUserInfo, logout } = useAuth();

  useEffect(() => {
    const accessToken = sessionStorage.getItem("access_token");
    if (!accessToken) {
      router.push("/");
    }
  }, [router]);

  const testVlifeAccess = async () => {
    const accessToken = sessionStorage.getItem("access_token");
    try {
      const response = await fetch("http://localhost:4001/test/protected", {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const data = await response.json();
      alert(`vLife API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (err: any) {
      alert(`vLife API Error: ${err.message}`);
    }
  };

  const testMultiTenantAccess = async (type: "protected" | "premium") => {
    const accessToken = sessionStorage.getItem("access_token");
    try {
      const response = await fetch(`http://localhost:4002/test/${type}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const data = await response.json();
      alert(
        `Multi-Tenant (${type}) Response: ${JSON.stringify(data, null, 2)}`
      );
    } catch (err: any) {
      alert(`Multi-Tenant Error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    const idToken = sessionStorage.getItem("id_token");

    if (idToken) {
      // Use end_session endpoint (standard OIDC endpoint name)
      const logoutUrl = new URL("http://localhost:4001/oauth/session/end");
      logoutUrl.searchParams.set("id_token_hint", idToken);
      logoutUrl.searchParams.set(
        "post_logout_redirect_uri",
        "http://localhost:3000"
      );

      // Clear local state first
      sessionStorage.clear();

      // Redirect to OIDC logout
      window.location.href = logoutUrl.toString();
    } else {
      logout();
    }
  };

  const handleRevokeAndLogout = async () => {
    const accessToken = sessionStorage.getItem("access_token");
    const refreshToken = sessionStorage.getItem("refresh_token");

    // Helper to revoke a token
    const revokeToken = async (
      token: string,
      type: "access_token" | "refresh_token"
    ) => {
      try {
        const response = await fetch(
          "http://localhost:4001/oauth/token/revocation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              token: token,
              token_type_hint: type,
              client_id: "partner-dashboard-local-2",
            }),
            credentials: "include",
          }
        );

        console.log("Revocation response:", response);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Revocation failed for ${type}:`,
            response.status,
            errorText
          );
          alert(`Revocation failed: ${response.status} ${errorText}`);
        } else {
          console.log(`Revocation successful for ${type}`);
        }
      } catch (err) {
        console.error(`Failed to revoke ${type}`, err);
      }
    };

    if (accessToken) await revokeToken(accessToken, "access_token");
    if (refreshToken) await revokeToken(refreshToken, "refresh_token");

    // Proceed with standard logout
    handleLogout();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshUserInfo}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh User Info
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
              <button
                onClick={handleRevokeAndLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Revoke Access & Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              User Profile
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Personal details and authentication information.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {userInfo ? (
                Object.entries(userInfo).map(([key, value], index) => (
                  <div
                    key={key}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
                  >
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </dd>
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 sm:px-6 text-gray-500">
                  No user information available.
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Token Information Section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Session Information
            </h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Access Token:</span>{" "}
                {sessionStorage.getItem("access_token")
                  ? "✅ Present"
                  : "❌ Missing"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID Token:</span>{" "}
                {sessionStorage.getItem("id_token")
                  ? "✅ Present"
                  : "❌ Missing"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Refresh Token:</span>{" "}
                {sessionStorage.getItem("refresh_token")
                  ? "✅ Present"
                  : "❌ Missing"}
              </p>
            </div>
          </div>
        </div>

        {/* API Testing Section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              API Access Testing
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Verify your authentication and subscription status across
              services.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={testVlifeAccess}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
              >
                Test vLife (Auth Only)
              </button>
              <button
                onClick={() => testMultiTenantAccess("protected")}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium"
              >
                Test Multi-Tenant (Auth Only)
              </button>
              <button
                onClick={() => testMultiTenantAccess("premium")}
                className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 text-sm font-medium"
              >
                Test Multi-Tenant (Subscription Required)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
