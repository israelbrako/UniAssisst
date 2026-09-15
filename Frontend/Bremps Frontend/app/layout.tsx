import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AURATECH | Fast & Reliable University Tech Support",
  description:
    "AURATECH private software support business featuring three-person expert triage and focused technical problem solving.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full flex flex-col bg-[#f8fafc] text-slate-900 antialiased">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <div className="page-enter flex-1 flex flex-col min-h-0">{children}</div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
