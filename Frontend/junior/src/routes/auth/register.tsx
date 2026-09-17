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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authService } from "@/services";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [{ title: "Create account — UniAssist" }],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Enter a valid phone number"),
    university: z.string().min(2, "University is required"),
    department: z.string().min(2, "Department is required"),
    level: z.string().min(1, "Select your academic level"),
    studentId: z.string().min(2, "Student ID is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type FormValues = z.infer<typeof schema>;

const levels = ["100", "200", "300", "400", "Postgraduate", "PhD"];

function RegisterPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      university: "",
      department: "",
      level: "",
      studentId: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  async function advanceToStep2() {
    const ok = await form.trigger(["fullName", "email", "phone"]);
    if (ok) setStep(2);
  }

  async function onSubmit(values: FormValues) {
    try {
      await authService.register(values);
      toast.success("Account created! Welcome to UniAssist.");
      navigate({ to: "/app" });
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex min-h-dvh">
      {/* Brand panel */}
      <div className="surface-ink relative hidden flex-col justify-between p-10 lg:flex lg:w-[480px] xl:w-[560px]">
        <div aria-hidden className="grid-faint absolute inset-0 opacity-30" />
        <Logo tone="dark" />
        <div className="relative z-10 max-w-sm">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-mint/70 uppercase">Join UniAssist</p>
          <h2 className="mt-4 text-[32px] font-extrabold leading-snug text-ivory">
            Your academic support,<br />
            <span className="text-brand-gradient">built around you.</span>
          </h2>
          <ul className="mt-6 space-y-3">
            {[
              "Submit requests in minutes",
              "Track every request in real time",
              "Communicate directly with your support member",
              "Transparent pricing, no surprises",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[14.5px] text-ivory/70">
                <span className="size-1.5 rounded-full bg-emerald shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[12px] text-ivory/30">© {new Date().getFullYear()} UniAssist</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 lg:hidden">
            <Logo to="/" />
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-3" aria-label="Registration steps">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`flex size-7 items-center justify-center rounded-full text-[12px] font-bold ${
                    step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                <span className={`text-[13px] font-medium ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
                  {s === 1 ? "Personal info" : "Academic details"}
                </span>
                {s < 2 && <div className="h-px w-8 bg-border" aria-hidden />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 2 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[24px] font-extrabold">
              {step === 1 ? "Create your account" : "Academic details"}
            </h1>
            <p className="mt-1.5 text-[14px] text-muted-foreground">
              {step === 1
                ? "Step 1 of 2 — your personal information."
                : "Step 2 of 2 — your university details."}
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input placeholder="Alex Nyarko" autoComplete="name" {...field} />
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
                            <Input type="email" placeholder="you@university.edu.gh" autoComplete="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+233 24 000 0000" autoComplete="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      size="lg"
                      className="h-12 w-full"
                      onClick={advanceToStep2}
                    >
                      Continue <ArrowRight className="size-4" aria-hidden />
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="university"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. KNUST, UG, UCC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Computer Engineering" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {levels.map((l) => (
                                  <SelectItem key={l} value={l}>{l}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. CE/2022/1183" {...field} />
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPw ? "text" : "password"}
                                placeholder="Min. 8 chars, one uppercase, one number"
                                className="pr-10"
                                autoComplete="new-password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPw((v) => !v)}
                                aria-label={showPw ? "Hide password" : "Show password"}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPw ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Re-enter password"
                                className="pr-10"
                                autoComplete="new-password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                aria-label={showConfirm ? "Hide" : "Show"}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showConfirm ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="h-12 flex-1"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>
                      <Button type="submit" size="lg" className="h-12 flex-[2]" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><Loader2 className="size-4 animate-spin" aria-hidden /> Creating account…</>
                        ) : (
                          <>Create account <ArrowRight className="size-4" aria-hidden /></>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </Form>

            <p className="mt-5 text-center text-[13.5px] text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-semibold text-emerald hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
