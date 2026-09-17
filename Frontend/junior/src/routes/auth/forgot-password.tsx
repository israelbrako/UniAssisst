import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "@/services";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [{ title: "Reset password — UniAssist" }],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    await authService.forgotPassword(values.email);
    setSentEmail(values.email);
    setSent(true);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="mb-8 w-full max-w-[420px]">
        <Logo to="/" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="panel w-full max-w-[420px] p-7 sm:p-8"
      >
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-emerald/15 text-emerald">
              <CheckCircle2 className="size-7" aria-hidden />
            </span>
            <h1 className="text-[22px] font-bold">Check your inbox</h1>
            <p className="text-[14.5px] text-muted-foreground">
              We've sent a password reset link to{" "}
              <span className="font-semibold text-foreground">{sentEmail}</span>.
              Check your spam folder if it doesn't appear within a few minutes.
            </p>
            <Button asChild size="lg" className="mt-2 h-12 w-full">
              <Link to="/auth/login">
                <ArrowLeft className="size-4" aria-hidden /> Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-xl bg-accent text-teal">
              <Mail className="size-5.5" aria-hidden />
            </span>
            <h1 className="mt-5 text-[22px] font-bold">Reset your password</h1>
            <p className="mt-1.5 text-[14px] text-muted-foreground">
              Enter the email address associated with your account and we'll send you a reset link.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@university.edu.gh"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="h-12 w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="size-4 animate-spin" aria-hidden /> Sending link…</>
                  ) : (
                    <>Send reset link <ArrowRight className="size-4" aria-hidden /></>
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-5 text-center text-[13.5px] text-muted-foreground">
              Remembered it?{" "}
              <Link to="/auth/login" className="font-semibold text-emerald hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
