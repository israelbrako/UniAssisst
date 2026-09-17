import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, Globe, Lock, Moon, Palette, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { notificationsService } from "@/services";

export const Route = createFileRoute("/app/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — UniAssist" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const reduce = useReducedMotion();

  const { data: prefs } = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: () => notificationsService.preferences(),
  });

  const [notifEmail, setNotifEmail] = useState(prefs?.email ?? true);
  const [notifSms, setNotifSms] = useState(prefs?.sms ?? false);
  const [notifProducts, setNotifProducts] = useState(prefs?.productUpdates ?? true);
  const [notifDeadlines, setNotifDeadlines] = useState(prefs?.deadlineReminders ?? true);
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");

  function saveNotifications() {
    toast.success("Notification preferences saved");
  }

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const sections = [
    {
      id: "notifications",
      icon: Bell,
      title: "Notifications",
      description: "Control how UniAssist communicates with you.",
    },
    {
      id: "appearance",
      icon: Palette,
      title: "Appearance",
      description: "Theme and display preferences.",
    },
    {
      id: "privacy",
      icon: Shield,
      title: "Privacy & security",
      description: "Manage your account security settings.",
    },
    {
      id: "danger",
      icon: Trash2,
      title: "Danger zone",
      description: "Irreversible account actions.",
    },
  ];

  return (
    <>
      <PageTitle title="Settings" description="Manage your account preferences." />

      <div className="max-w-2xl space-y-5">
        {/* Notifications */}
        <motion.section {...rise()} className="panel p-6" aria-labelledby="notif-heading">
          <div className="flex items-start gap-3 mb-5">
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-teal shrink-0">
              <Bell className="size-4.5" aria-hidden />
            </span>
            <div>
              <h2 id="notif-heading" className="text-[16px] font-bold">Notifications</h2>
              <p className="text-[13.5px] text-muted-foreground">Control how UniAssist communicates with you.</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { id: "email-notif", label: "Email notifications", description: "Request updates and messages by email", value: notifEmail, onChange: setNotifEmail },
              { id: "sms-notif", label: "SMS notifications", description: "Receive important alerts via SMS", value: notifSms, onChange: setNotifSms },
              { id: "product-notif", label: "Product updates", description: "News about new features and improvements", value: notifProducts, onChange: setNotifProducts },
              { id: "deadline-notif", label: "Deadline reminders", description: "Reminders 24 hours before request deadlines", value: notifDeadlines, onChange: setNotifDeadlines },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor={item.id} className="text-[14px] font-medium cursor-pointer">{item.label}</Label>
                  <p className="text-[13px] text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.value}
                  onCheckedChange={item.onChange}
                  aria-label={item.label}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <Button size="sm" onClick={saveNotifications}>Save preferences</Button>
          </div>
        </motion.section>

        {/* Appearance */}
        <motion.section {...rise(0.06)} className="panel p-6" aria-labelledby="appearance-heading">
          <div className="flex items-start gap-3 mb-5">
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-teal shrink-0">
              <Moon className="size-4.5" aria-hidden />
            </span>
            <div>
              <h2 id="appearance-heading" className="text-[16px] font-bold">Appearance</h2>
              <p className="text-[13.5px] text-muted-foreground">Theme and display preferences.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="theme-select" className="text-[14px]">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lang-select" className="text-[14px]">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="lang-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <Button size="sm" onClick={() => toast.success("Appearance settings saved")}>Save</Button>
          </div>
        </motion.section>

        {/* Privacy */}
        <motion.section {...rise(0.1)} className="panel p-6" aria-labelledby="privacy-heading">
          <div className="flex items-start gap-3 mb-5">
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-teal shrink-0">
              <Shield className="size-4.5" aria-hidden />
            </span>
            <div>
              <h2 id="privacy-heading" className="text-[16px] font-bold">Privacy & security</h2>
              <p className="text-[13.5px] text-muted-foreground">Keep your account secure.</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-between sm:w-auto sm:min-w-[220px]" onClick={() => toast.info("Two-factor authentication coming soon")}>
              <span className="flex items-center gap-2"><Lock className="size-4" aria-hidden /> Two-factor authentication</span>
              <span className="text-[12px] text-muted-foreground ml-4">Off</span>
            </Button>
            <Button variant="outline" className="w-full justify-between sm:w-auto sm:min-w-[220px]" onClick={() => toast.info("Active sessions management coming soon")}>
              <span className="flex items-center gap-2"><Globe className="size-4" aria-hidden /> Active sessions</span>
              <span className="text-[12px] text-muted-foreground ml-4">1 device</span>
            </Button>
          </div>
        </motion.section>

        {/* Danger zone */}
        <motion.section {...rise(0.14)} className="rounded-xl border border-status-danger/25 bg-status-danger/4 p-6" aria-labelledby="danger-heading">
          <div className="flex items-start gap-3 mb-5">
            <span className="grid size-9 place-items-center rounded-lg bg-status-danger/10 text-status-danger shrink-0">
              <Trash2 className="size-4.5" aria-hidden />
            </span>
            <div>
              <h2 id="danger-heading" className="text-[16px] font-bold text-status-danger">Danger zone</h2>
              <p className="text-[13.5px] text-muted-foreground">These actions are irreversible.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 rounded-lg border border-status-danger/20 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-semibold">Delete account</p>
                <p className="text-[13px] text-muted-foreground">Permanently remove your account and all data.</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                onClick={() => toast.error("Account deletion requires confirmation. Contact support.")}
              >
                Delete account
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
}
