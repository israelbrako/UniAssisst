import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [{ title: "Login — UniAssist" }],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await authService.login(values.email);
      toast.success("Welcome back!");
      navigate({ to: "/app" });
    } catch {
      toast.error("Invalid email or password.");
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex min-h-dvh">
      {/* Left brand panel */}
      <div className="surface-ink relative hidden flex-col justify-between p-10 lg:flex lg:w-[480px] xl:w-[560px]">
        <div aria-hidden className="grid-faint absolute inset-0 opacity-30" />
        <Logo tone="dark" />
        <div className="relative z-10 max-w-sm">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-mint/70 uppercase">Student platform</p>
          <h2 className="mt-4 text-[32px] font-extrabold leading-snug text-ivory">
            Academic support,<br />
            <span className="text-brand-gradient">without the stress.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ivory/60">
            Trusted tutoring, debugging, project guidance and technical support for university students.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-mint/12 pt-6">
            {[["1,200+", "Requests"], ["4.8/5", "Rating"], ["< 6h", "Response"]].map(([v, l]) => (
              <div key={l}>
                <dt className="text-[20px] font-extrabold text-mint">{v}</dt>
                <dd className="mt-0.5 text-[12px] text-ivory/50">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="relative text-[12px] text-ivory/30">© {new Date().getFullYear()} UniAssist</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <Logo to="/" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[26px] font-extrabold">Welcome back</h1>
            <p className="mt-1.5 text-[14.5px] text-muted-foreground">
              Sign in to your UniAssist account.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          to="/auth/forgot-password"
                          className="text-[13px] font-medium text-emerald hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="h-12 w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="size-4 animate-spin" aria-hidden /> Signing in…</>
                  ) : (
                    <>Sign in <ArrowRight className="size-4" aria-hidden /></>
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-[14px] text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/auth/register" className="font-semibold text-emerald hover:underline">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
