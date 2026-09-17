import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, Globe, Lock, Mail, Shield, Sliders, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/_admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin · UniAssist" }] }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const reduce = useReducedMotion();

  // Notification state
  const [emailNewReq, setEmailNewReq] = useState(true);
  const [emailPayment, setEmailPayment] = useState(true);
  const [emailDeadline, setEmailDeadline] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Platform state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newRegistrations, setNewRegistrations] = useState(true);
  const [autoAssign, setAutoAssign] = useState(false);
  const [currency, setCurrency] = useState("GHS");
  const [timezone, setTimezone] = useState("Africa/Accra");

  const rise = (delay = 0) =>
    reduce ? {} : {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
    };

  const sections = [
    {
      id: "notifications",
      icon: Bell,
      title: "Admin notifications",
      delay: 0,
      content: (
        <div className="space-y-4">
          {[
            { id: "email-new-req", label: "New request submitted", desc: "Email alert when a student submits a new request", value: emailNewReq, set: setEmailNewReq },
            { id: "email-payment", label: "Payment received", desc: "Email alert when a student completes payment", value: emailPayment, set: setEmailPayment },
            { id: "email-deadline", label: "Deadline reminders", desc: "Alert 24 hours before request deadlines", value: emailDeadline, set: setEmailDeadline },
            { id: "sms-alerts", label: "SMS urgent alerts", desc: "SMS for urgent priority requests only", value: smsAlerts, set: setSmsAlerts },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor={item.id} className="text-[14px] font-medium cursor-pointer">{item.label}</Label>
                <p className="text-[13px] text-muted-foreground">{item.desc}</p>
              </div>
              <Switch id={item.id} checked={item.value} onCheckedChange={item.set} aria-label={item.label} />
            </div>
          ))}
          <div className="border-t border-border pt-4">
            <Button size="sm" onClick={() => toast.success("Notification settings saved")}>Save</Button>
          </div>
        </div>
      ),
    },
    {
      id: "platform",
      icon: Sliders,
      title: "Platform settings",
      delay: 0.06,
      content: (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-[14px] font-medium">Maintenance mode</Label>
              <p className="text-[13px] text-muted-foreground">Disable platform access for students during maintenance</p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={(v) => { setMaintenanceMode(v); toast[v ? "warning" : "success"](v ? "Maintenance mode enabled" : "Platform back online"); }}
              aria-label="Maintenance mode"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-[14px] font-medium">New registrations</Label>
              <p className="text-[13px] text-muted-foreground">Allow new student account registrations</p>
            </div>
            <Switch checked={newRegistrations} onCheckedChange={setNewRegistrations} aria-label="New registrations" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-[14px] font-medium">Auto-assign requests</Label>
              <p className="text-[13px] text-muted-foreground">Automatically assign to available team members</p>
            </div>
            <Switch checked={autoAssign} onCheckedChange={setAutoAssign} aria-label="Auto-assign" />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="currency-select" className="text-[14px]">Default currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GHS">GHS — Ghanaian Cedi</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone-select" className="text-[14px]">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+1)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <Button size="sm" onClick={() => toast.success("Platform settings saved")}>Save</Button>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      icon: Mail,
      title: "Email configuration",
      delay: 0.1,
      content: (
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="from-name" className="text-[14px]">From name</Label>
            <Input id="from-name" defaultValue="UniAssist Support" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="from-email" className="text-[14px]">From email</Label>
            <Input id="from-email" type="email" defaultValue="support@uniassist.app" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reply-to" className="text-[14px]">Reply-to email</Label>
            <Input id="reply-to" type="email" defaultValue="noreply@uniassist.app" />
          </div>
          <div className="border-t border-border pt-4">
            <Button size="sm" onClick={() => toast.success("Email settings saved")}>Save</Button>
          </div>
        </div>
      ),
    },
    {
      id: "security",
      icon: Shield,
      title: "Security",
      delay: 0.14,
      content: (
        <div className="space-y-3 max-w-md">
          <Button variant="outline" className="w-full justify-between" onClick={() => toast.info("2FA admin enforcement — coming soon")}>
            <span className="flex items-center gap-2"><Lock className="size-4" aria-hidden /> Enforce 2FA for admin accounts</span>
            <span className="text-[12px] text-muted-foreground">Off</span>
          </Button>
          <Button variant="outline" className="w-full justify-between" onClick={() => toast.info("Session management — coming soon")}>
            <span className="flex items-center gap-2"><Zap className="size-4" aria-hidden /> Active admin sessions</span>
            <span className="text-[12px] text-muted-foreground">1 session</span>
          </Button>
          <Button variant="outline" className="w-full justify-between" onClick={() => toast.info("IP allowlist — coming soon")}>
            <span className="flex items-center gap-2"><Globe className="size-4" aria-hidden /> IP allowlist</span>
            <span className="text-[12px] text-muted-foreground">Disabled</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageTitle title="Admin Settings" description="Configure platform behaviour, notifications and security." />

      <div className="max-w-2xl space-y-5">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.section
              key={section.id}
              {...rise(section.delay)}
              className="panel p-6"
              aria-labelledby={`${section.id}-heading`}
            >
              <div className="flex items-start gap-3 mb-5">
                <span className="grid size-9 place-items-center rounded-lg bg-accent text-teal shrink-0">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <h2 id={`${section.id}-heading`} className="text-[16px] font-bold">{section.title}</h2>
              </div>
              {section.content}
            </motion.section>
          );
        })}
      </div>
    </>
  );
}
