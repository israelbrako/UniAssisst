"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setRole } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRole("admin");
    router.push("/overview");
  };

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top_left,_#e8f0ff,_transparent_42%),linear-gradient(135deg,_#f8f9ff_0%,_#eef2ff_52%,_#fdf4fa_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4285f4,#7c4dff_58%,#e9427a)] text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-indigo-700">Secure workspace access</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Admin Login</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">Sign in to access AURATECH analytics, agent management, and service settings.</p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-xl rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col items-center justify-center gap-3 border-b border-slate-100 pb-5 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Admin Login</h2>
              <p className="mt-1 text-xs text-slate-500">Enter your credentials to continue.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="mb-1.5 block text-xs font-semibold text-slate-700">Username</label>
              <input id="admin-username" name="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="Enter your username" required className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold text-slate-700">Password</label>
              <input id="admin-password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" required className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
            </div>
          </div>

          <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#4285f4,#6d5dfc)] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-95">
            Sign in <ArrowRight className="h-4 w-4" />
          </button>
          <Link href="/" className="mt-4 block text-center text-xs font-medium text-slate-500 hover:text-slate-800">Return to main page</Link>
        </form>
      </div>
    </main>
  );
}