import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Code2, GraduationCap, Heart, Layers, Shield, Users } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { team } from "@/services/mock-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — UniAssist" },
      { name: "description", content: "UniAssist is a premium student academic-support platform built by Balerioncodes. Learn who we are and what we stand for." },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: GraduationCap,
    title: "Student-first",
    body: "Every design decision starts with a student's experience. Complex, stressful, time-pressured.",
  },
  {
    icon: Shield,
    title: "Integrity",
    body: "We guide students to understand what they submit. The learning stays with them.",
  },
  {
    icon: Code2,
    title: "Technical depth",
    body: "Our support team are engineers, researchers and subject specialists — not generalists.",
  },
  {
    icon: Heart,
    title: "Care",
    body: "Academic pressure is real. We take the work seriously and treat every request with respect.",
  },
  {
    icon: Users,
    title: "Community",
    body: "A growing network of students and support professionals connected by a single platform.",
  },
  {
    icon: Layers,
    title: "Infrastructure",
    body: "Built with the same rigour as enterprise software — because students deserve a real product.",
  },
];

function AboutPage() {
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
        eyebrow="Our story"
        title="Built by Balerioncodes, for students."
        description="UniAssist is the flagship academic support platform from Balerioncodes — designed to connect university students with the right technical and academic expertise, on their terms."
      />

      {/* Mission */}
      <section className="mx-auto max-w-[1200px] px-5 py-20 lg:py-28">
        <motion.div {...rise()} className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.22em] text-teal uppercase">Our mission</p>
            <h2 className="mt-4 text-[28px] font-extrabold sm:text-[36px]">
              Academic support, without the stress.
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
              University students face a unique set of pressures — tight deadlines, complex coursework, new
              programming environments, final-year projects, and the expectation to figure it all out
              independently. Most platforms treat them like a transaction.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              UniAssist was built to change that. By pairing students with the right support at the right time
              — and keeping the focus on learning, not just output — we help students move forward with
              confidence rather than anxiety.
            </p>
          </div>
          <div className="panel surface-ink rounded-2xl p-8 lg:p-10">
            <blockquote>
              <p className="text-[20px] font-semibold leading-snug text-ivory">
                "We help students learn, build, solve and succeed."
              </p>
              <footer className="mt-4 text-[14px] text-ivory/55">
                — The UniAssist principle
              </footer>
            </blockquote>
          </div>
        </motion.div>
      </section>

      {/* Pillars */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-[1200px] px-5 py-20 lg:py-24">
          <motion.div {...rise()} className="max-w-xl">
            <p className="text-[12px] font-semibold tracking-[0.22em] text-teal uppercase">What we stand for</p>
            <h2 className="mt-4 text-[28px] font-extrabold sm:text-[34px]">
              Six things that shape every decision.
            </h2>
          </motion.div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => {
              const PIcon = p.icon;
              return (
                <motion.div key={p.title} {...rise(0.05 * i)} className="panel p-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent text-teal">
                    <PIcon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[17px] font-bold">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{p.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-[1200px] px-5 py-20 lg:py-28">
        <motion.div {...rise()} className="max-w-xl">
          <p className="text-[12px] font-semibold tracking-[0.22em] text-teal uppercase">The team</p>
          <h2 className="mt-4 text-[28px] font-extrabold sm:text-[34px]">
            The people behind your support.
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-muted-foreground">
            Our support team are engineers, researchers, tutors and specialists who know what students face
            — because they've been there.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <motion.div key={member.id} {...rise(0.06 * i)} className="panel p-5 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-[18px] font-extrabold text-accent-foreground">
                {member.initials}
              </span>
              <h3 className="mt-3 text-[16px] font-bold">{member.name}</h3>
              <p className="text-[13.5px] text-muted-foreground">{member.role}</p>
              <p className="mt-1 text-[12.5px] text-teal">{member.specialization}</p>
              <div className="mt-3 text-[12.5px] text-muted-foreground">
                <span className="font-semibold text-emerald">{member.completedRequests}</span> completed
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Balerioncodes */}
      <section className="surface-ink">
        <div className="mx-auto max-w-[1200px] px-5 py-20 lg:py-24">
          <motion.div {...rise()} className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-center">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.22em] text-mint/70 uppercase">Built by</p>
              <h2 className="mt-4 text-[28px] font-extrabold text-ivory sm:text-[34px]">Balerioncodes</h2>
              <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ivory/65">
                Balerioncodes is a technology company that builds software products with intelligence and
                restraint. UniAssist is our flagship student platform — designed to the same standard as the
                enterprise tools we build for other industries.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="h-12">
                <Link to="/auth/register">
                  Get started today <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-mint/25 bg-transparent text-ivory hover:bg-ivory/8 hover:text-ivory"
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
