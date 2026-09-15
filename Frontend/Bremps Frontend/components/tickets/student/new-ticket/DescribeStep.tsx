"use client";

import React from "react";
import { Attachment, TicketUrgency } from "@/lib/types/ticket";
import { FormField } from "@/components/forms/FormField";
import { FileUpload } from "@/components/forms/FileUpload";
import { UrgencyDot } from "@/components/tickets/UrgencyDot";
import { cn } from "@/lib/utils";

export interface DescribeFormData {
  title: string;
  description: string;
  urgency: TicketUrgency;
  studentName: string;
  studentEmail: string;
  studentId: string;
  program: string;
  phone: string;
  attachments: Attachment[];
}

interface DescribeStepProps {
  formData: DescribeFormData;
  onChange: (updated: Partial<DescribeFormData>) => void;
  onPrev: () => void;
  onNext: () => void;
  errors?: Record<string, string>;
}

export function DescribeStep({
  formData,
  onChange,
  onPrev,
  onNext,
  errors = {},
}: DescribeStepProps) {
  const urgencies: { id: TicketUrgency; label: string; desc: string }[] = [
    { id: "low", label: "Low", desc: "Non-critical query, cosmetic bug, or general question" },
    { id: "normal", label: "Normal", desc: "Affects daily campus workflow but workarounds exist" },
    { id: "urgent", label: "Urgent", desc: "Exam lockout, class deadline imminent, hardware failure" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Describe the Problem
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Be as detailed as possible so our technicians can prepare the right tools and diagnostic scripts.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        {/* Ticket Title */}
        <FormField
          label="Issue Summary / Title"
          required
          hint="Keep it concise"
          error={errors.title}
        >
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Cannot connect to Eduroam Wi-Fi in North Quad Dorm"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </FormField>

        {/* Urgency Selector */}
        <FormField label="Urgency Level" required error={errors.urgency}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {urgencies.map((u) => {
              const isSelected = formData.urgency === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onChange({ urgency: u.id })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer",
                    isSelected
                      ? "border-sky-600 bg-sky-50/50 ring-1 ring-sky-600"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{u.label}</span>
                    <UrgencyDot urgency={u.id} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{u.desc}</p>
                </button>
              );
            })}
          </div>
        </FormField>

        {/* Detailed Problem Description */}
        <FormField
          label="Detailed Problem Description"
          required
          hint={`${formData.description.length}/2000 chars`}
          error={errors.description}
        >
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe what happened, what device you're using (macOS, Windows, iOS, Android), any error messages, and what steps you already tried..."
            className="w-full p-3.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none leading-relaxed"
          />
        </FormField>

        {/* File / Screenshot Upload */}
        <FormField label="Screenshots & Error Logs" hint="Optional">
          <FileUpload
            files={formData.attachments}
            onChange={(files) => onChange({ attachments: files })}
          />
        </FormField>

        {/* Student Contact Info */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Student Contact & Campus Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField label="Full Name" required error={errors.studentName}>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => onChange({ studentName: e.target.value })}
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </FormField>

            <FormField label="Student ID" required error={errors.studentId}>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => onChange({ studentId: e.target.value })}
                placeholder="Student ID"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </FormField>

            <FormField label="Campus Email" required error={errors.studentEmail}>
              <input
                type="email"
                value={formData.studentEmail}
                onChange={(e) => onChange({ studentEmail: e.target.value })}
                placeholder="e.g. maya.lin@campus.edu"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </FormField>

            <FormField label="Program / Department" required error={errors.program}>
              <input
                type="text"
                value={formData.program}
                onChange={(e) => onChange({ program: e.target.value })}
                placeholder="e.g. Biochemistry (Class of '26)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </FormField>

            <FormField label="Ghana Phone Number" required hint="Use +233 or a local 0-prefix number" error={errors.phone}>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="Phone Number"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          ← Change Category
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs shadow-sky-600/20 cursor-pointer"
        >
          Proceed to Payment & Review →
        </button>
      </div>
    </div>
  );
}
