import type { ReactNode } from "react";
import { PublicNavbar } from "./PublicNavbar";
import { Footer } from "./Footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="surface-ink pt-28 pb-16">
      <div className="mx-auto max-w-[1200px] px-5">
        <p className="text-[12px] font-semibold tracking-[0.22em] text-mint/70 uppercase">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-ivory md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ivory/65">{description}</p>
      </div>
    </section>
  );
}
