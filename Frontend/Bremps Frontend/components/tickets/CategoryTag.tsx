import React from "react";
import { getCategoryById } from "@/lib/constants/categories";
import { Wifi, GraduationCap, Laptop, Cpu, KeyRound, Printer, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryTagProps {
  categoryId: string;
  className?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "wifi-network": Wifi,
  "portal-lms": GraduationCap,
  "hardware-diagnostics": Laptop,
  "software-os": Cpu,
  "account-2fa": KeyRound,
  "printing-peripherals": Printer,
};

export function CategoryTag({ categoryId, className, size = "sm", showIcon = true }: CategoryTagProps) {
  const category = getCategoryById(categoryId);
  const Icon = CATEGORY_ICONS[categoryId] || HelpCircle;

  if (!category) {
    return (
      <span className="inline-flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
        General IT
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md bg-slate-100/90 text-slate-700 border border-slate-200/80 transition-colors",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs sm:text-sm",
        className
      )}
    >
      {showIcon && <Icon className={cn("shrink-0 text-slate-600", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />}
      <span className="truncate">{category.shortName}</span>
    </span>
  );
}

export function CategoryIcon({ categoryId, className }: { categoryId: string; className?: string }) {
  const Icon = CATEGORY_ICONS[categoryId] || HelpCircle;
  return <Icon className={className} />;
}
