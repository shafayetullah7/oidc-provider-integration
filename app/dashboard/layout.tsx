"use client";

// app/dashboard/layout.tsx
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <nav className="flex gap-6 border-b p-4">
        <Link href="/dashboard" className="font-medium">
          Dashboard
        </Link>
        <Link href="/dashboard/partners" className="font-medium">
          Partners
        </Link>
        <Link href="/subscriptions" className="font-medium">
          Subscriptions
        </Link>
      </nav>

      <main className="p-6">{children}</main>
    </div>
  );
}
