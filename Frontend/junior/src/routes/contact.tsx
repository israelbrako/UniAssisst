import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Mail, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout, PageHeader } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — UniAssist" },
      { name: "description", content: "Get in touch with the UniAssist team." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});
type FormValues = z.infer<typeof schema>;

const channels = [
  { icon: Mail, title: "Email us", body: "support@uniassist.app", sub: "We aim to respond within 4 hours." },
  { icon: MessageSquare, title: "Live chat", body: "Chat via the platform", sub: "Available to registered students." },
  { icon: Clock, title: "Response time", body: "< 4 hours", sub: "During weekday business hours." },
];

function ContactPage() {
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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const [submitted, setSubmitted] = useState(false);

  function onSubmit(_values: FormValues) {
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 4 hours.");
  }

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Get in touch"
        title="We're here to help."
        description="Questions about the platform, pricing, or your support request? Reach out and we'll get back to you quickly."
      />

      <section className="mx-auto max-w-[1200px] px-5 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <motion.div {...rise()}>
            {submitted ? (
              <div className="panel flex flex-col items-center gap-4 py-16 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-emerald/15 text-emerald">
                  <Mail className="size-7" aria-hidden />
                </span>
                <h2 className="text-[22px] font-bold">Message sent</h2>
                <p className="max-w-sm text-[15px] text-muted-foreground">
                  Thanks for reaching out. We'll reply to your email within 4 hours on weekdays.
                </p>
                <Button asChild className="mt-2">
                  <Link to="/">Back to home</Link>
                </Button>
              </div>
            ) : (
              <div className="panel p-6 sm:p-8">
                <h2 className="text-[22px] font-bold">Send us a message</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@university.edu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General enquiry</SelectItem>
                              <SelectItem value="services">Services & pricing</SelectItem>
                              <SelectItem value="support">Support request issue</SelectItem>
                              <SelectItem value="payment">Payment question</SelectItem>
                              <SelectItem value="technical">Technical problem</SelectItem>
                              <SelectItem value="other">Something else</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us what you need…"
                              className="min-h-[140px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="lg" className="h-12 w-full sm:w-auto sm:px-8">
                      Send message <ArrowRight className="size-4" aria-hidden />
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </motion.div>

          {/* Channels */}
          <motion.aside {...rise(0.1)} className="space-y-4">
            {channels.map((c, i) => {
              const CIcon = c.icon;
              return (
                <motion.div key={c.title} {...rise(0.08 * i)} className="panel p-5">
                  <div className="flex items-start gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-teal">
                      <CIcon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold">{c.title}</p>
                      <p className="text-[14.5px] text-emerald font-medium">{c.body}</p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">{c.sub}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <div className="panel p-5">
              <p className="text-[14px] font-semibold">Already have an account?</p>
              <p className="mt-1 text-[13.5px] text-muted-foreground">
                Use the messaging feature inside your request for the fastest response.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/auth/login">Log in <ArrowRight className="size-3.5" aria-hidden /></Link>
              </Button>
            </div>
          </motion.aside>
        </div>
      </section>
    </PublicLayout>
  );
}
