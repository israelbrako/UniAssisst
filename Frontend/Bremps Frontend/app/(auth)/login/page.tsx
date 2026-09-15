"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { LifeBuoy } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to student dashboard on normal form submit
    setRole("student");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center gap-4 p-4 bg-slate-50/70">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-600/20">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Single Sign-On</h1>
          <p className="text-xs text-slate-500">
            Enter your credentials to continue.
          </p>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700"> Email / ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or ID"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
          >
            Sign-in
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          <span>Don&apos;t have a registered campus profile? </span>
          <Link href="/signup" className="text-sky-600 font-semibold hover:underline">
            Sign up here
          </Link>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center">
        <Link
          href="/"
          className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
        >
          ← Back to main page
        </Link>
        <Link
          href="/admin-login"
          aria-label="Admin Login"
          title="Admin Login"
          className="fixed bottom-5 left-5 z-40 flex h-11 w-11 shrink-0 aspect-square items-center justify-center rounded-full bg-slate-900 text-white opacity-80 shadow-md transition-all hover:-translate-y-1 hover:bg-black hover:opacity-100 sm:bottom-6 sm:left-6"
        >
          <span className="text-base font-extrabold leading-none">A</span>
        </Link>
      </div>
    </div>
  );
}
