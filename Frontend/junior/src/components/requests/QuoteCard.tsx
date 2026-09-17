import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/format";
import type { Quote } from "@/types";

export function QuoteCard({
  quote,
  onAccept,
  onDecline,
  onPay,
}: {
  quote: Quote;
  onAccept?: () => void;
  onDecline?: () => void;
  onPay?: () => void;
}) {
  return (
    <section className="rounded-xl border border-emerald/25 bg-accent/40 p-5" aria-label="Service quote">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.18em] text-teal uppercase">Service quote</p>
          <h3 className="mt-1.5 text-[17px] font-semibold">{quote.summary}</h3>
        </div>
        <span className="rounded-md border border-border bg-card px-2 py-1 text-[12px] font-semibold">
          {quote.status === "ACCEPTED" ? "Accepted" : quote.status === "DECLINED" ? "Declined" : "Pending"}
        </span>
      </div>

      <dl className="mt-5 space-y-2.5 text-[14.5px]">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Estimated delivery</dt>
          <dd className="font-medium">{quote.deliveryEstimate}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Service</dt>
          <dd className="tabular-nums">{currency(quote.serviceAmount, quote.currency)}</dd>
        </div>
        {quote.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="tabular-nums text-emerald">− {currency(quote.discount, quote.currency)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-3 text-[16px] font-bold">
          <dt>Total</dt>
          <dd className="tabular-nums">{currency(quote.total, quote.currency)}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        {quote.status === "PENDING" ? (
          <>
            <Button onClick={onAccept}>
              <Check className="size-4" aria-hidden /> Accept quote
            </Button>
            <Button variant="outline" onClick={onDecline}>
              <X className="size-4" aria-hidden /> Decline
            </Button>
          </>
        ) : quote.status === "ACCEPTED" ? (
          <Button onClick={onPay}>Proceed to payment</Button>
        ) : (
          <p className="text-[14px] text-muted-foreground">This quote was declined.</p>
        )}
      </div>
    </section>
  );
}
