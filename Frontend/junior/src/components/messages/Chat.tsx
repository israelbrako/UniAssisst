import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatBytes, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

export function MessageBubble({ message }: { message: Message }) {
  if (message.kind === "system") {
    return (
      <div className="my-3 flex justify-center">
        <p className="rounded-full border border-border bg-muted px-3.5 py-1.5 text-[12.5px] text-muted-foreground">
          {message.body}
        </p>
      </div>
    );
  }

  if (message.kind === "internal") {
    return (
      <div className="my-3 rounded-lg border border-dashed border-status-review/50 bg-status-review/8 p-3">
        <p className="text-[11.5px] font-bold tracking-wide text-status-review uppercase">Internal note</p>
        <p className="mt-1 text-[14px]">{message.body}</p>
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          {message.authorName} · {relativeTime(message.createdAt)}
        </p>
      </div>
    );
  }

  const mine = message.kind === "student";
  return (
    <div className={cn("my-2.5 flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[86%] sm:max-w-[70%]", mine && "text-right")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-left text-[14.5px] leading-relaxed",
            mine
              ? "rounded-br-sm bg-ink text-ivory"
              : "rounded-bl-sm border border-border bg-card text-card-foreground",
          )}
        >
          {!mine && <p className="mb-1 text-[12.5px] font-semibold text-emerald">{message.authorName}</p>}
          <p className="whitespace-pre-wrap">{message.body}</p>
          {message.attachment && (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12.5px]",
                mine ? "border-mint/20 text-mint" : "border-border text-muted-foreground",
              )}
            >
              <Paperclip className="size-3.5" aria-hidden />
              {message.attachment.name} · {formatBytes(message.attachment.size)}
            </p>
          )}
        </div>
        <p className="mt-1 px-1 text-[11.5px] text-muted-foreground">
          {relativeTime(message.createdAt)}
          {mine && (message.read ? " · Read" : " · Sent")}
        </p>
      </div>
    </div>
  );
}

export function MessageInput({ onSend }: { onSend: (body: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="border-t border-border bg-card p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onSend(value.trim());
        setValue("");
      }}
    >
      <label htmlFor="message-body" className="sr-only">
        Message
      </label>
      <Textarea
        id="message-body"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        placeholder="Write a message…"
        className="resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
      />
      <div className="mt-1 flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
          <Paperclip className="size-4" aria-hidden /> Attach
        </Button>
        <Button type="submit" size="sm" disabled={!value.trim()}>
          <Send className="size-4" aria-hidden /> Send
        </Button>
      </div>
    </form>
  );
}

export function ChatWindow({
  messages,
  onSend,
  header,
}: {
  messages: Message[];
  onSend: (body: string) => void;
  header?: React.ReactNode;
}) {
  return (
    <div className="panel flex h-[560px] flex-col overflow-hidden">
      {header && <div className="border-b border-border px-4 py-3">{header}</div>}
      <div className="flex-1 overflow-y-auto px-4 py-3" role="log" aria-live="polite">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>
      <MessageInput onSend={onSend} />
    </div>
  );
}
