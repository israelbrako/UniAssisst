"use client";

import React, { useState } from "react";
import { HelpCategory } from "@/lib/constants/categories";
import { DescribeFormData } from "./DescribeStep";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStepProps {
  category: HelpCategory;
  formData: DescribeFormData;
  onPrev: () => void;
  onSubmitTicket: () => Promise<void>;
  isSubmitting: boolean;
}

export function PaymentStep({
  category,
  formData,
  onPrev,
  onSubmitTicket,
  isSubmitting,
}: PaymentStepProps) {
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Price calculations
  const basePrice = category.basePrice;
  const urgencyFee = formData.urgency === "urgent" ? 5 : 0;
  const campusDiscount = 0; // Student standard rate
  const totalAmount = basePrice + urgencyFee - campusDiscount;

  const handleSimulatePayment = async () => {
    setIsProcessingPayment(true);
    // Simulate Paystack payment latency
    setTimeout(async () => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(async () => {
        setShowPaystackModal(false);
        await onSubmitTicket();
      }, 900);
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Review & Payment
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Verify your ticket details and complete secure checkout via Paystack to dispatch an IT tech.
        </p>
      </div>

      {/* Order & Service Breakdown Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
              Selected Service
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">{category.name}</h3>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {category.slaHours}h SLA
          </span>
        </div>

        {/* Issue preview */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
          <p className="font-semibold text-slate-800 line-clamp-1">{formData.title}</p>
          <p className="text-slate-500 line-clamp-2 leading-relaxed">{formData.description}</p>
          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Student: <strong>{formData.studentName}</strong> ({formData.studentId})</span>
            <span className="capitalize font-semibold text-amber-700">Urgency: {formData.urgency}</span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Base Service Fee ({category.shortName})</span>
            <span>{formatCurrency(basePrice)}</span>
          </div>

          {urgencyFee > 0 && (
            <div className="flex items-center justify-between text-amber-700 font-medium">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Rush Priority Dispatch
              </span>
              <span>+{formatCurrency(urgencyFee)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm sm:text-base font-bold text-slate-900">
            <span>Total Payable</span>
            <span className="text-sky-700">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-500" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Paystack Secured
          </span>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Edit Details
        </button>

        <button
          type="button"
          onClick={() => setShowPaystackModal(true)}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay {formatCurrency(totalAmount)} via Paystack</span>
        </button>
      </div>

      {/* Paystack Checkout Embed / Modal */}
      {showPaystackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fade-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Paystack Brand Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                  P
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900">Paystack Checkout</span>
                  <p className="text-[10px] text-slate-400">AURATECH Technology Support Merchant</p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-2 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Payment Verified!</h4>
                <p className="text-xs text-slate-500">Creating your ticket and routing to tech queue...</p>
              </div>
            ) : (
              <>
                {/* Prefilled payer info */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Customer:</span>
                    <span className="font-medium text-slate-800">{formData.studentName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Email:</span>
                    <span className="font-medium text-slate-800">{formData.studentEmail}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Reference:</span>
                    <span className="font-mono text-slate-700">PSTK-{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>
                </div>

                {/* Simulated payment options */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Select Campus Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl border-2 border-sky-600 bg-sky-50/50 font-medium text-sky-900 flex items-center justify-between">
                      <span>Card / Debit</span>
                      <CheckCircle className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 text-slate-600 opacity-60 flex items-center justify-between cursor-not-allowed">
                      <span>Campus Meal/ID Pay</span>
                      <span className="text-[9px] bg-slate-200 px-1 rounded">Soon</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Pay Button */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <span>Authorizing transaction...</span>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Authorize Paystack Payment ({formatCurrency(totalAmount)})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPaystackModal(false)}
                    disabled={isProcessingPayment}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 text-center"
                  >
                    Cancel transaction
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
