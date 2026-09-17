import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "Platform",
    links: [
      { to: "/services", label: "Services" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/resources", label: "Resources" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/auth/login", label: "Login" },
      { to: "/auth/register", label: "Create account" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="surface-ink border-t border-mint/10">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo tone="dark" />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-ivory/60">
            Academic support, without the stress. UniAssist helps students learn, build, solve and succeed —
            we guide the work, you own it.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-[12px] font-semibold tracking-[0.18em] text-mint/60 uppercase">
              {col.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[14px] text-ivory/70 transition-colors hover:text-mint">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-mint/10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-5 text-[13px] text-ivory/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} UniAssist. All rights reserved.</p>
          <p>Built for what&apos;s next.</p>
        </div>
      </div>
    </footer>
  );
}
