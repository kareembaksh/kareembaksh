"use client";

import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">My Account</h1>
        <button
          onClick={logout}
          className="text-sm font-medium text-rose-500 hover:text-rose-600 px-4 py-2 border border-rose-200 rounded-full hover:bg-rose-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Profile</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Email</p>
                <p className="text-zinc-800 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Account ID</p>
                <p className="text-zinc-800 font-medium text-xs break-all">{user.uid}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Order History</h2>
            <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
              <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-zinc-500 font-medium mb-2">No orders yet</p>
              <Link href="/products" className="text-sm text-rose-500 font-semibold hover:text-rose-600">
                Start shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
