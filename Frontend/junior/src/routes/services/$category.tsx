import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, FileText, GraduationCap, Layers, Microscope, Wrench } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { services } from "@/services/mock-data";

const icons = { GraduationCap, Wrench, Code2, Layers, Microscope, FileText };

export const Route = createFileRoute("/services/$category")({
  loader: ({ params }) => {
    const service = services.find((s) => s.slug === params.category);
    if (!service) throw notFound();
    return service;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Service"} — UniAssist` },
      { name: "description", content: loaderData?.description ?? "" },
    ],
  }),
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const service = Route.useLoaderData();
  const reduce = useReducedMotion();
  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const Icon = icons[service.icon as keyof typeof icons] ?? GraduationCap;

  // related services (excluding current)
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="surface-ink pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-mint/70 hover:text-mint"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            All services
          </Link>
          <div className="mt-6 flex items-start gap-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald/15 text-emerald">
              <Icon className="size-7" aria-hidden />
            </span>
            <div>
              <h1 className="text-[36px] font-extrabold leading-tight text-ivory sm:text-[48px]">
                {service.name}
              </h1>
              <p className="mt-3 max-w-2xl text-[16.5px] leading-relaxed text-ivory/65">
                {service.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="mx-auto max-w-[1200px] px-5 py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <motion.div {...rise()}>
            <p className="text-[12px] font-semibold tracking-[0.22em] text-teal uppercase">What's included</p>
            <h2 className="mt-4 text-[28px] font-extrabold sm:text-[34px]">
              What you can expect from this service.
            </h2>
            <ul className="mt-8 space-y-4">
              {service.includes.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald" aria-hidden />
                  <div>
                    <p className="text-[15.5px] font-semibold">{item}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7">
                <Link to="/auth/register">
                  Request this service <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7">
                <Link to="/auth/login">Log in to request</Link>
              </Button>
            </div>
          </motion.div>

          {/* How it's delivered */}
          <motion.aside {...rise(0.1)} className="panel h-fit p-6">
            <h3 className="text-[16px] font-bold">How it's delivered</h3>
            <ul className="mt-4 space-y-4">
              {[
                ["Submit", "Describe your need — include any course context, files or links."],
                ["Review", "Our team reviews your request within a few hours."],
                ["Matched", "You're paired with the right support member."],
                ["Support", "Track progress and receive your completed support."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold">{title}</p>
                    <p className="text-[13px] text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </section>

      {/* Related services */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-16">
          <h2 className="text-[22px] font-bold">Other services</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((s, i) => {
              const RIcon = icons[s.icon as keyof typeof icons];
              return (
                <motion.article
                  key={s.slug}
                  {...rise(0.05 * i)}
                  className="panel group flex items-start gap-4 p-5 transition-colors hover:border-emerald/40"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-teal">
                    <RIcon className="size-4.5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold">{s.name}</h3>
                    <p className="mt-1 text-[13px] text-muted-foreground line-clamp-2">{s.short}</p>
                    <Link
                      to="/services/$category"
                      params={{ category: s.slug }}
                      className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-emerald hover:underline"
                    >
                      Explore <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
