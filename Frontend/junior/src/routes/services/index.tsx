import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Code2, FileText, GraduationCap, Layers, Microscope, Wrench } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/layout/PublicLayout";
import { services } from "@/services/mock-data";

const icons = { GraduationCap, Wrench, Code2, Layers, Microscope, FileText };

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — UniAssist" },
      { name: "description", content: "Explore UniAssist's six academic and technical support service tracks." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
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
        eyebrow="What we support"
        title="Support built around how students actually work."
        description="Six focused service tracks — each delivered by people who explain the reasoning, not just the result. Choose the track that matches what you need."
      />

      <section className="mx-auto max-w-[1200px] px-5 py-20 lg:py-28">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[s.icon as keyof typeof icons];
            return (
              <motion.article
                key={s.slug}
                {...rise(0.05 * i)}
                className="panel group flex flex-col p-7 transition-colors hover:border-emerald/40"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-accent text-teal">
                  <Icon className="size-5.5" aria-hidden />
                </span>
                <h2 className="mt-5 text-[20px] font-bold">{s.name}</h2>
                <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <ul className="mt-5 space-y-1.5">
                  {s.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-emerald/70 shrink-0" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/services/$category"
                  params={{ category: s.slug }}
                  className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-emerald hover:underline"
                >
                  Learn more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="surface-ink">
        <div className="mx-auto max-w-[1200px] px-5 py-20 text-center">
          <motion.div {...rise()}>
            <h2 className="mx-auto max-w-xl text-[30px] font-extrabold text-ivory sm:text-[38px]">
              Not sure which track fits?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15.5px] text-ivory/60">
              Submit a request and describe what you need — we'll match you with the right support.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/auth/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Get Started <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-mint/25 bg-transparent px-7 text-[15px] font-semibold text-ivory hover:bg-ivory/8"
              >
                Talk to us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
