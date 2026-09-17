import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Eye, EyeOff, Loader2, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/shared/States";
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
import { usersService } from "@/services";

export const Route = createFileRoute("/app/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — UniAssist" }] }),
  component: ProfilePage,
});

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  university: z.string().min(2, "University is required"),
  department: z.string().min(2, "Department is required"),
  level: z.string().min(1, "Level is required"),
  studentId: z.string().min(2, "Student ID is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function ProfilePage() {
  const reduce = useReducedMotion();
  const [editMode, setEditMode] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: () => usersService.profile(),
  });

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      university: "",
      department: "",
      level: "",
      studentId: "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        university: profile.university,
        department: profile.department,
        level: profile.level,
        studentId: profile.studentId,
      });
    }
  }, [profile, profileForm]);

  async function onProfileSave(values: ProfileValues) {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Profile updated successfully");
    setEditMode(false);
  }

  async function onPasswordSave(_values: PasswordValues) {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Password changed successfully");
    passwordForm.reset();
  }

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="panel h-32 animate-pulse bg-muted/50" />
        <div className="panel h-64 animate-pulse bg-muted/50" />
      </div>
    );
  }
  if (isError || !profile) return <ErrorState />;

  return (
    <>
      <PageTitle title="Profile" description="Manage your account details." />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Avatar card */}
        <motion.div {...rise()} className="panel h-fit p-6 text-center">
          <div className="relative mx-auto w-fit">
            <span className="grid size-20 place-items-center rounded-full bg-ink text-[28px] font-extrabold text-mint">
              {profile.initials}
            </span>
            <button
              type="button"
              className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border-2 border-background bg-emerald text-ink shadow hover:bg-emerald/90"
              aria-label="Change profile photo"
            >
              <Camera className="size-3.5" aria-hidden />
            </button>
          </div>
          <h2 className="mt-3 text-[17px] font-bold">{profile.fullName}</h2>
          <p className="text-[13.5px] text-muted-foreground">{profile.email}</p>
          <div className="mt-4 space-y-1.5 text-left text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">University</span>
              <span className="font-medium text-right max-w-[160px] truncate">{profile.university}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Department</span>
              <span className="font-medium">{profile.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Level</span>
              <span className="font-medium">{profile.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student ID</span>
              <span className="font-mono text-[12.5px] font-semibold">{profile.studentId}</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-5">
          {/* Profile form */}
          <motion.div {...rise(0.06)} className="panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[16px] font-bold">Personal information</h2>
              {!editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="gap-1.5">
                  <Pencil className="size-3.5" aria-hidden /> Edit
                </Button>
              )}
            </div>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input disabled={!editMode} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input type="email" disabled={!editMode} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input type="tel" disabled={!editMode} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID</FormLabel>
                        <FormControl>
                          <Input disabled={!editMode} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>University</FormLabel>
                        <FormControl>
                          <Input disabled={!editMode} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input disabled={!editMode} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                          <Input disabled={!editMode} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {editMode && (
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                      {profileForm.formState.isSubmitting ? (
                        <><Loader2 className="size-4 animate-spin" aria-hidden /> Saving…</>
                      ) : "Save changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setEditMode(false); profileForm.reset(); }}>
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </motion.div>

          {/* Password form */}
          <motion.div {...rise(0.1)} className="panel p-6">
            <h2 className="mb-5 text-[16px] font-bold">Change password</h2>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="space-y-4 max-w-md">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showCurrent ? "text" : "password"} className="pr-10" {...field} />
                          <button type="button" onClick={() => setShowCurrent((v) => !v)} aria-label={showCurrent ? "Hide" : "Show"} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showCurrent ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showNew ? "text" : "password"} className="pr-10" placeholder="Min. 8 chars" {...field} />
                          <button type="button" onClick={() => setShowNew((v) => !v)} aria-label={showNew ? "Hide" : "Show"} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showNew ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting ? (
                    <><Loader2 className="size-4 animate-spin" aria-hidden /> Updating…</>
                  ) : "Update password"}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
