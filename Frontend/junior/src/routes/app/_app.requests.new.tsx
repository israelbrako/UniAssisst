import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  CheckCircle2,
  Code2,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  Microscope,
  Paperclip,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useState, useRef } from "react";
import type { ElementType } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
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
import { RequestStatusBadge } from "@/components/shared/StatusBadge";
import { formatBytes, formatDate } from "@/lib/format";
import { requestsService } from "@/services";
import type { ServiceCategory, Priority } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_app/requests/new")({
  head: () => ({ meta: [{ title: "New Request — UniAssist" }] }),
  component: NewRequestPage,
});

// ─── Schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  category: z.string().min(1, "Select a service"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Describe your request in at least 20 characters"),
  course: z.string().optional(),
  department: z.string().optional(),
  technology: z.string().optional(),
  additionalInfo: z.string().optional(),
  deadline: z.string().min(1, "Set a deadline"),
  deadlineTime: z.string().optional(),
  priority: z.string().min(1, "Select a priority"),
});
type FormValues = z.infer<typeof schema>;

// ─── Constants ───────────────────────────────────────────────────────────────
const serviceCards: { slug: ServiceCategory; name: string; short: string; icon: ElementType }[] = [
  { slug: "tutoring", name: "Academic Support", short: "Tutoring and study guidance", icon: GraduationCap },
  { slug: "programming", name: "Programming", short: "Debugging and development guidance", icon: Code2 },
  { slug: "technical-support", name: "Technical Support", short: "Software install and setup", icon: Wrench },
  { slug: "project-support", name: "Project Support", short: "Planning and implementation guidance", icon: Layers },
  { slug: "research-support", name: "Research Support", short: "Methodology and research guidance", icon: Microscope },
  { slug: "documentation", name: "Documentation", short: "Proofreading and formatting", icon: FileText },
];

const priorities: { value: Priority; label: string; desc: string; color: string }[] = [
  { value: "LOW", label: "Low", desc: "Not time-sensitive", color: "border-border" },
  { value: "NORMAL", label: "Normal", desc: "Standard timeline", color: "border-teal/40" },
  { value: "HIGH", label: "High", desc: "Needed soon", color: "border-status-review/50" },
  { value: "URGENT", label: "Urgent", desc: "Critical deadline", color: "border-status-danger/50" },
];

const STEPS = ["Service", "Details", "Deadline", "Files", "Review"];

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
}

function NewRequestPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [reference, setReference] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      course: "",
      department: "",
      technology: "",
      additionalInfo: "",
      deadline: "",
      deadlineTime: "17:00",
      priority: "NORMAL",
    },
    mode: "onTouched",
  });

  // ─── Step validation ───────────────────────────────────────────────────────
  async function canAdvance(): Promise<boolean> {
    if (step === 0) return form.trigger(["category"]);
    if (step === 1) return form.trigger(["title", "description"]);
    if (step === 2) return form.trigger(["deadline", "priority"]);
    return true;
  }

  async function next() {
    if (await canAdvance()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  // ─── File handling ─────────────────────────────────────────────────────────
  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "image/png",
      "image/jpeg",
      "image/gif",
      "text/plain",
      "text/x-python",
      "application/x-zip-compressed",
    ];
    Array.from(fileList).forEach((f) => {
      if (!allowed.includes(f.type) && !f.name.match(/\.(py|js|ts|tsx|jsx|java|c|cpp|h|cs|go|rs|rb)$/)) {
        toast.error(`${f.name}: unsupported file type`);
        return;
      }
      const id = crypto.randomUUID();
      setFiles((prev) => [...prev, { id, name: f.name, size: f.size, type: f.type, progress: 0 }]);
      // Simulate upload progress
      let prog = 0;
      const iv = setInterval(() => {
        prog += Math.random() * 30 + 10;
        if (prog >= 100) { prog = 100; clearInterval(iv); }
        setFiles((prev) => prev.map((x) => (x.id === id ? { ...x, progress: Math.round(prog) } : x)));
      }, 200);
    });
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  async function onSubmit(values: FormValues) {
    const result = await requestsService.create({ ...values, files: files.map((f) => f.name) });
    setReference(result.reference as string);
    setStep(STEPS.length); // success step
  }

  const vals = form.watch();
  const selectedService = serviceCards.find((s) => s.slug === vals.category);

  // ─── Stepper header ────────────────────────────────────────────────────────
  const StepHeader = () => (
    <div className="mb-8">
      <ol className="flex items-center gap-0" aria-label="Request steps">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-[12px] font-bold transition-colors",
                  i < step
                    ? "bg-emerald text-ink"
                    : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? <CheckCircle2 className="size-4" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-[13px] font-medium sm:block",
                  i === step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-2 h-px w-8 sm:w-12", i < step ? "bg-emerald" : "bg-border")} aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </div>
  );

  // ─── Success screen ────────────────────────────────────────────────────────
  if (step === STEPS.length) {
    return (
      <>
        <PageTitle title="New Request" />
        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="panel mx-auto max-w-lg p-8 text-center"
        >
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald/15 text-emerald">
            <CheckCircle2 className="size-8" aria-hidden />
          </span>
          <h2 className="mt-5 text-[24px] font-extrabold">Request submitted</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Your request has been received. We'll review it and get back to you shortly.
          </p>
          <div className="mt-5 rounded-xl bg-accent px-6 py-4">
            <p className="text-[12px] font-semibold tracking-[0.2em] text-teal uppercase">Reference</p>
            <p className="mt-1 text-[28px] font-extrabold tracking-tight text-emerald">{reference}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <a href="/app/requests">View my requests</a>
            </Button>
            <Button variant="outline" onClick={() => { setStep(0); form.reset(); setFiles([]); setReference(null); }}>
              Submit another
            </Button>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="New Request" description="Tell us what you need help with." />
      <StepHeader />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduce ? undefined : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ── Step 0: Service ─────────────────────────────────────────── */}
              {step === 0 && (
                <div>
                  <h2 className="mb-6 text-[20px] font-bold">Select a service</h2>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Service category">
                          {serviceCards.map((s) => {
                            const Icon = s.icon;
                            const selected = field.value === s.slug;
                            return (
                              <button
                                key={s.slug}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => field.onChange(s.slug)}
                                className={cn(
                                  "flex items-start gap-4 rounded-xl border p-4 text-left transition-all",
                                  selected
                                    ? "border-emerald/60 bg-accent/60 ring-1 ring-emerald/40"
                                    : "border-border bg-card hover:border-emerald/30 hover:bg-accent/30",
                                )}
                              >
                                <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", selected ? "bg-emerald/15 text-emerald" : "bg-accent text-teal")}>
                                  <Icon className="size-5" aria-hidden />
                                </span>
                                <div>
                                  <p className="text-[14.5px] font-semibold">{s.name}</p>
                                  <p className="mt-0.5 text-[13px] text-muted-foreground">{s.short}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage className="mt-2" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ── Step 1: Details ──────────────────────────────────────────── */}
              {step === 1 && (
                <div className="panel max-w-2xl p-6 sm:p-8 space-y-5">
                  <h2 className="text-[20px] font-bold">Describe your request</h2>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Help debugging my Python pipeline" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the problem, what you've already tried, and what outcome you need…"
                            className="min-h-[140px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. CE 415 — Data Engineering" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Computer Engineering" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="technology"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technology / Language <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Python, React, MATLAB" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional information <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                          <Textarea placeholder="Anything else we should know…" className="min-h-[80px] resize-y" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ── Step 2: Deadline ─────────────────────────────────────────── */}
              {step === 2 && (
                <div className="panel max-w-2xl p-6 sm:p-8 space-y-6">
                  <h2 className="text-[20px] font-bold">Deadline & priority</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="date" {...field} min={new Date().toISOString().split("T")[0]} />
                              <CalendarIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deadlineTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Priority level">
                          {priorities.map((p) => {
                            const selected = field.value === p.value;
                            return (
                              <button
                                key={p.value}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => field.onChange(p.value)}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                                  selected
                                    ? `${p.color} bg-accent/60 ring-1 ring-current/20`
                                    : "border-border hover:border-emerald/30",
                                )}
                              >
                                <span className={cn("size-3 rounded-full border-2", selected ? "border-current bg-current" : "border-muted-foreground")} aria-hidden />
                                <div>
                                  <p className="text-[14px] font-semibold">{p.label}</p>
                                  <p className="text-[12.5px] text-muted-foreground">{p.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ── Step 3: Files ────────────────────────────────────────────── */}
              {step === 3 && (
                <div className="panel max-w-2xl space-y-5 p-6 sm:p-8">
                  <h2 className="text-[20px] font-bold">Attach files <span className="text-[15px] font-normal text-muted-foreground">(optional)</span></h2>
                  <p className="text-[14px] text-muted-foreground">
                    Accepted: PDF, DOC/DOCX, PPT/PPTX, ZIP, images, source code files.
                  </p>

                  {/* Drop zone */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed border-border py-10 transition-colors hover:border-emerald/40 hover:bg-accent/30"
                  >
                    <Paperclip className="mx-auto size-8 text-muted-foreground" aria-hidden />
                    <p className="mt-2 text-[14.5px] font-semibold">Click to attach files</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">or drag and drop here</p>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.gif,.py,.js,.ts,.tsx,.jsx,.java,.c,.cpp,.h,.cs"
                    onChange={(e) => handleFiles(e.target.files)}
                    aria-label="Upload files"
                  />

                  {files.length > 0 && (
                    <ul className="space-y-2.5" aria-label="Attached files">
                      {files.map((f) => (
                        <li key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3">
                          <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-medium">{f.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <p className="text-[12px] text-muted-foreground">{formatBytes(f.size)}</p>
                              {f.progress < 100 ? (
                                <div className="flex-1 overflow-hidden rounded-full bg-muted h-1">
                                  <div
                                    className="h-1 rounded-full bg-emerald transition-all duration-200"
                                    style={{ width: `${f.progress}%` }}
                                    role="progressbar"
                                    aria-valuenow={f.progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  />
                                </div>
                              ) : (
                                <span className="text-[11.5px] font-semibold text-emerald">Uploaded</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                            aria-label={`Remove ${f.name}`}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="size-4" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* ── Step 4: Review ───────────────────────────────────────────── */}
              {step === 4 && (
                <div className="max-w-2xl space-y-5">
                  <h2 className="text-[20px] font-bold">Review your request</h2>
                  <div className="panel divide-y divide-border overflow-hidden p-0">
                    {[
                      { label: "Service", value: selectedService?.name ?? vals.category },
                      { label: "Title", value: vals.title },
                      { label: "Description", value: vals.description },
                      ...(vals.course ? [{ label: "Course", value: vals.course }] : []),
                      ...(vals.department ? [{ label: "Department", value: vals.department }] : []),
                      ...(vals.technology ? [{ label: "Technology", value: vals.technology }] : []),
                      { label: "Deadline", value: vals.deadline ? formatDate(vals.deadline) + (vals.deadlineTime ? ` at ${vals.deadlineTime}` : "") : "—" },
                      { label: "Priority", value: vals.priority },
                      { label: "Files", value: files.length ? `${files.length} file(s) attached` : "No files attached" },
                    ].map(({ label, value }) => (
                      <div key={label} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5">
                        <dt className="text-[13px] font-semibold text-muted-foreground">{label}</dt>
                        <dd className="text-[14px] break-words">{value}</dd>
                      </div>
                    ))}
                  </div>
                  <p className="text-[13.5px] text-muted-foreground">
                    By submitting, you agree to UniAssist's terms. Our team will review your request and
                    issue a quote before any work begins.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center gap-3">
            {step > 0 && (
              <Button type="button" variant="outline" size="lg" className="h-11" onClick={back}>
                <ArrowLeft className="size-4" aria-hidden /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" size="lg" className="h-11 px-7" onClick={next}>
                Continue <ArrowRight className="size-4" aria-hidden />
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="h-11 px-7"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <><Loader2 className="size-4 animate-spin" aria-hidden /> Submitting…</>
                ) : (
                  <>Submit request <ArrowRight className="size-4" aria-hidden /></>
                )}
              </Button>
            )}
            {step === 3 && (
              <Button type="button" variant="ghost" size="lg" className="h-11 text-muted-foreground" onClick={next}>
                Skip — no files
              </Button>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}
