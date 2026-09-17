import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, MessageSquare, Search, Send, Shield, Star, Zap } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — UniAssist" },
      { name: "description", content: "Learn how UniAssist connects students with the right academic and technical support in four simple steps." },
    ],
  }),
  component: HowItWorksPage,
});

const steps = [
  {
    n: "01",
    title: "Submit your request",
    body: "Tell us what you need. Choose a service category, describe the problem, attach relevant files, and set a deadline. The form takes around 3 minutes.",
    icon: Send,
    points: [
      "Select from 6 service tracks",
      "Describe your need in plain language",
      "Attach PDFs, code, presentations or ZIP files",
      "Set deadline and priority level",
    ],
  },
  {
    n: "02",
    title: "Our team reviews",
    body: "Your request lands with our operations team, who review it, scope the support and issue a transparent quote within a few hours.",
    icon: Search,
    points: [
      "Review typically within 2–4 hours",
      "Transparent pricing before you commit",
      "Accept or decline the quote",
      "No surprise charges",
    ],
  },
  {
    n: "03",
    title: "Get matched",
    body: "Once you accept the quote and confirm payment, we assign your request to the right support member based on skill, availability and your deadline.",
    icon: Zap,
    points: [
      "Matched by skill and availability",
      "See who you're working with",
      "Direct messaging channel opens",
      "Deadline tracked from this point",
    ],
  },
  {
    n: "04",
    title: "Get support",
    body: "Track real-time progress, communicate directly with your support member, and receive your completed deliverables securely through the platform.",
    icon: CheckCircle2,
    points: [
      "Live progress indicator",
      "Request-specific message thread",
      "Deliverables delivered on platform",
      "Review and mark complete",
    ],
  },
];

const values = [
  { icon: Shield, title: "Integrity first", body: "Every session is about teaching and guidance. You understand what you submit." },
  { icon: Clock, title: "On your schedule", body: "Set your deadline. We work around your timetable, not the other way around." },
  { icon: MessageSquare, title: "Direct communication", body: "Message your support member directly inside the platform — no third-party apps." },
  { icon: Star, title: "Quality rated", body: "Rate your support session. We use feedback to keep standards high." },
];

function HowItWorksPage() {
  const reduce = useReducedMotion();
  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-50px" },
          transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="The process"
        title="Four steps from stuck to supported."
        description="UniAssist is designed so that getting the right help is fast, transparent and pressure-free. Here's exactly how it works."
      />

      {/* Steps */}
      <section className="mx-auto max-w-[1200px] px-5 py-20 lg:py-28">
        <div className="space-y-16 lg:space-y-24">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 1;
            return (
              <motion.div
                key={step.n}
                {...rise(0.05 * i)}
                className={`grid items-center gap-10 lg:grid-cols-2 ${isEven ? "lg:[&>:first-child]:order-2" : ""}`}
              >
                <div>
                  <p className="text-[13px] font-bold tracking-[0.18em] text-teal uppercase">{step.n}</p>
                  <h2 className="mt-3 text-[28px] font-extrabold leading-snug sm:text-[34px]">{step.title}</h2>
                  <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">{step.body}</p>
                  <ul className="mt-6 space-y-2.5">
                    {step.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2.5 text-[14.5px]">
                        <CheckCircle2 className="size-4.5 shrink-0 text-emerald" aria-hidden />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="panel flex aspect-[4/3] items-center justify-center p-8">
                  <Icon className="size-20 text-emerald/30" aria-hidden strokeWidth={1} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Values */}
      <section className="surface-deep">
        <div className="mx-auto max-w-[1200px] px-5 py-20 lg:py-24">
          <motion.div {...rise()} className="max-w-xl">
            <h2 className="text-[28px] font-extrabold text-ivory sm:text-[36px]">
              Why students choose UniAssist.
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-ivory/65">
              We're not a shortcuts service. We're a support platform.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const VIcon = v.icon;
              return (
                <motion.div key={v.title} {...rise(0.07 * i)} className="rounded-xl border border-mint/12 bg-deep p-6">
                  <span className="grid size-10 place-items-center rounded-lg bg-emerald/15 text-emerald">
                    <VIcon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[16px] font-semibold text-ivory">{v.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ivory/60">{v.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 py-20 text-center lg:py-24">
        <motion.div {...rise()}>
          <h2 className="text-[28px] font-extrabold sm:text-[36px]">Ready to get started?</h2>
          <p className="mx-auto mt-4 max-w-lg text-[15.5px] text-muted-foreground">
            Create your account, submit your first request and get matched within hours.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-7">
              <Link to="/auth/register">
                Create account <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7">
              <Link to="/services">View services</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </PublicLayout>
  );
}
