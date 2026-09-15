"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryStep } from "@/components/tickets/student/new-ticket/CategoryStep";
import { DescribeStep, DescribeFormData } from "@/components/tickets/student/new-ticket/DescribeStep";
import { PaymentStep } from "@/components/tickets/student/new-ticket/PaymentStep";
import { getCategoryById } from "@/lib/constants/categories";
import { useCreateTicket } from "@/lib/hooks/useTickets";
import { convertUsdToGhs } from "@/lib/utils";
import { Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type StepId = 1 | 2 | 3;

export default function NewTicketPage() {
  const router = useRouter();
  const createTicketMutation = useCreateTicket();

  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("wifi-network");
  const [formData, setFormData] = useState<DescribeFormData>({
    title: "",
    description: "",
    urgency: "normal",
    studentName: "",
    studentEmail: "",
    studentId: "",
    program: "",
    phone: "",
    attachments: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdateFormData = (updated: Partial<DescribeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
    // Clear errors for edited fields
    const updatedKeys = Object.keys(updated);
    if (updatedKeys.some((k) => errors[k])) {
      const newErrors = { ...errors };
      updatedKeys.forEach((k) => delete newErrors[k]);
      setErrors(newErrors);
    }
  };

  const validateDescribeStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.length < 5) {
      errs.title = "Title must be at least 5 characters.";
    }
    if (!formData.description.trim() || formData.description.length < 15) {
      errs.description = "Please describe the problem in at least 15 characters.";
    }
    if (!formData.studentName.trim()) errs.studentName = "Name is required.";
    if (!formData.studentEmail.trim() || !formData.studentEmail.includes("@")) {
      errs.studentEmail = "Valid email is required.";
    }
    if (!formData.studentId.trim()) errs.studentId = "Student ID is required.";
    if (!formData.program.trim()) errs.program = "Program is required.";
    const normalizedPhone = formData.phone.replace(/[\s()-]/g, "");
    if (!normalizedPhone) {
      errs.phone = "Ghana phone number is required.";
    } else if (!/^(?:\+233|233|0)(?:2[0-9]|5[0-9]|20|24|27|50|54|55|59)[0-9]{7}$/.test(normalizedPhone)) {
      errs.phone = "Enter a valid Ghana number, e.g. +233 24 392 8812.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromDescribe = () => {
    if (validateDescribeStep()) {
      setCurrentStep(3);
    }
  };

  const handleSubmitTicket = async () => {
    const category = getCategoryById(selectedCategoryId);
    const amount = (category?.basePrice || convertUsdToGhs(10)) + (formData.urgency === "urgent" ? convertUsdToGhs(5) : 0);

    const created = await createTicketMutation.mutateAsync({
      title: formData.title,
      description: formData.description,
      categoryId: selectedCategoryId,
      urgency: formData.urgency,
      status: "open",
      student: {
        id: `stu-${Date.now()}`,
        name: formData.studentName,
        email: formData.studentEmail,
        studentId: formData.studentId,
        program: formData.program,
        phone: formData.phone,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      },
      paymentStatus: "paid",
      amountPaid: amount,
      paymentRef: `PSTK-${Math.floor(100000 + Math.random() * 900000)}`,
      attachments: formData.attachments,
    });

    router.push(`/ticket/${created.id}`);
  };

  const steps = [
    { num: 1, label: "Category" },
    { num: 2, label: "Describe Issue" },
    { num: 3, label: "Review & Pay" },
  ];

  const selectedCategory = getCategoryById(selectedCategoryId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs font-mono font-medium text-slate-400">
          AURATECH Support Intake
        </span>
      </div>

      {/* 3-Step Stepper Header */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 sm:gap-6">
          {steps.map((s, idx) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-sky-600 text-white ring-4 ring-sky-100"
                        : "bg-slate-200 text-slate-600"
                    )}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-semibold hidden sm:inline",
                      isCurrent ? "text-slate-900" : "text-slate-500"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 sm:w-16 h-[2px]",
                      currentStep > s.num ? "bg-emerald-600" : "bg-slate-200"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Wizard Step Content */}
      <div className="pt-2">
        {currentStep === 1 && (
          <CategoryStep
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <DescribeStep
            formData={formData}
            onChange={handleUpdateFormData}
            onPrev={() => setCurrentStep(1)}
            onNext={handleNextFromDescribe}
            errors={errors}
          />
        )}

        {currentStep === 3 && selectedCategory && (
          <PaymentStep
            category={selectedCategory}
            formData={formData}
            onPrev={() => setCurrentStep(2)}
            onSubmitTicket={handleSubmitTicket}
            isSubmitting={createTicketMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
