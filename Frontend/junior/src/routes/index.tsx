import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  FileText,
  GraduationCap,
  Layers,
  Microscope,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { services } from "@/services/mock-data";

const icons = { GraduationCap, Wrench, Code2, Layers, Microscope, FileText };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UniAssist — Academic support, without the stress" },
      {
        name: "description",
        content:
          "UniAssist connects students with trusted academic and technical support — tutoring, debugging, project guidance, research and documentation.",
      },
      { property: "og:title", content: "UniAssist — Academic support, without the stress" },
      {
        property: "og:description",
        content:
          "Trusted academic and technical support for university students: tutoring, programming, projects, research and documentation.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  { n: "01", title: "Submit", body: "Tell us what you need help with." },
  { n: "02", title: "Review", body: "Our team reviews your request and scopes the support." },
  { n: "03", title: "Get matched", body: "Your request is assigned to the right support member." },
  { n: "04", title: "Get support", body: "Track progress and receive your completed support." },
];

function Landing() {
  const reduce = useReducedMotion();
  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="surface-ink relative overflow-hidden">
        <div aria-hidden className="grid-faint absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-[1200px] gap-14 px-5 pt-32 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-40 lg:pb-28">
          <motion.div {...rise()}>
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/8 px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.2em] text-mint uppercase">
              <Sparkles className="size-3.5" aria-hidden /> Your success matters
            </span>
            <h1 className="mt-6 text-[40px] leading-[1.05] font-extrabold text-ivory sm:text-[52px] lg:text-[64px]">
              Academic support,
              <br />
              <span className="text-brand-gradient">without the stress.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-ivory/65">
              UniAssist connects students with trusted academic and technical support to help them learn,
              build, solve problems and move forward with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-[15px]">
                <Link to="/auth/register">
                  Get Started <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-mint/25 bg-transparent px-6 text-[15px] text-ivory hover:bg-ivory/8 hover:text-ivory"
              >
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-mint/12 pt-6">
              {[
                ["1,200+", "Requests supported"],
                ["4.8/5", "Student rating"],
              ].length
                ? [
                    ["1,200+", "Requests supported"],
                    ["4.8/5", "Student rating"],
                    ["< 6h", "Average first response"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <dt className="text-[22px] font-extrabold text-mint">{v}</dt>
                      <dd className="mt-1 text-[12.5px] text-ivory/50">{l}</dd>
                    </div>
                  ))
                : null}
            </dl>
          </motion.div>

          {/* Product mockup */}
          <motion.div {...rise(0.12)} className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[32px] bg-emerald/12 blur-3xl"
            />
            <div className="relative rounded-2xl border border-mint/15 bg-ink-soft/90 p-4 shadow-[var(--shadow-lift)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-mint/10 pb-3">
                <p className="text-[13px] font-semibold text-ivory/80">Your requests</p>
                <span className="rounded-md bg-emerald/15 px-2 py-1 text-[11.5px] font-semibold text-mint">
                  Live
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {[
                  { ref: "REQ-10482", title: "Website development project", status: "IN_PROGRESS", pct: 62 },
                  { ref: "REQ-10476", title: "Python pipeline debugging", status: "UNDER_REVIEW", pct: 15 },
                  { ref: "REQ-10461", title: "MATLAB licence setup", status: "COMPLETED", pct: 100 },
                ].map((r) => (
                  <div key={r.ref} className="rounded-xl border border-mint/10 bg-ink/60 p-3.5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-semibold text-mint/70">{r.ref}</p>
                        <p className="mt-0.5 truncate text-[14px] font-semibold text-ivory">{r.title}</p>
                      </div>
                      <RequestStatusBadge status={r.status as never} />
                    </div>
                    <Progress value={r.pct} className="mt-3 h-1.5 bg-ivory/10" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-[1200px] px-5 py-20 lg:py-28">
        <motion.div {...rise()} className="max-w-2xl">
          <p className="text-[12px] font-semibold tracking-[0.22em] text-teal uppercase">What we support</p>
          <h2 className="mt-4 text-[32px] font-extrabold sm:text-[40px]">
            Support built around how students actually work.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
            Six focused service tracks — each delivered by people who explain the reasoning, not just the
            result.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[s.icon as keyof typeof icons];
            return (
              <motion.article
                key={s.slug}
                {...rise(0.04 * i)}
                className="panel group flex flex-col p-6 transition-colors hover:border-emerald/40"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-teal">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-[19px] font-semibold">{s.name}</h3>
                <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-muted-foreground">{s.short}</p>
                <Link
                  to="/services/$category"
                  params={{ category: s.slug }}
                  className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-emerald hover:underline"
                >
                  Explore
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="surface-deep">
        <div className="mx-auto max-w-[1200px] px-5 py-20 lg:py-24">
          <motion.h2 {...rise()} className="max-w-2xl text-[32px] font-extrabold text-ivory sm:text-[40px]">
            Four steps from stuck to supported.
          </motion.h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-mint/12 bg-mint/10 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div key={s.n} {...rise(0.05 * i)} className="bg-deep p-6">
                <p className="text-[13px] font-bold text-mint/60">{s.n}</p>
                <h3 className="mt-3 text-[19px] font-semibold text-ivory">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ivory/60">{s.body}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild size="lg" className="h-12 px-6">
              <Link to="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Integrity */}
      <section className="mx-auto max-w-[1200px] px-5 py-20 lg:py-28">
        <motion.div {...rise()} className="panel grid gap-8 p-8 lg:grid-cols-[auto_1fr] lg:p-12">
          <span className="grid size-12 place-items-center rounded-xl bg-accent text-teal">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-[28px] font-extrabold sm:text-[34px]">
              We help students learn, build, solve and succeed.
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
              UniAssist is a support platform, not a shortcut. Every session is built around teaching,
              guidance and coaching — the work you submit stays yours, and you should be able to defend every
              line of it.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Tutoring", "Guidance", "Debugging", "Coaching", "Proofreading", "Skill development"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[13px] font-medium text-secondary-foreground"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="surface-ink">
        <div className="mx-auto max-w-[1200px] px-5 py-20 text-center lg:py-24">
          <motion.div {...rise()}>
            <h2 className="mx-auto max-w-2xl text-[32px] font-extrabold text-ivory sm:text-[42px]">
              Tell us what you&apos;re working on.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] text-ivory/60">
              Create an account, submit your first request and get matched with the right support member.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7">
                <Link to="/auth/register">Get Started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-mint/25 bg-transparent px-7 text-ivory hover:bg-ivory/8 hover:text-ivory"
              >
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
