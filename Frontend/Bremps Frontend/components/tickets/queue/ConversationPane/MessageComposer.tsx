"use client";

import React, { useState, useRef } from "react";
import { CannedResponses } from "./CannedResponses";
import { Send, Paperclip, Sparkles, X, FileText } from "lucide-react";
import { Attachment } from "@/lib/types/ticket";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
  categoryId?: string;
  onSendMessage: (content: string, attachments?: Attachment[]) => Promise<void> | void;
  isSending?: boolean;
  placeholder?: string;
}

export function MessageComposer({
  categoryId,
  onSendMessage,
  isSending = false,
  placeholder = "Type your response to the student... (Press Cmd+Enter to send)",
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [showCanned, setShowCanned] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSending) return;

    await onSendMessage(content.trim(), attachments);
    setContent("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: Attachment[] = Array.from(e.target.files).map((file, i) => ({
      id: `att-comp-${Date.now()}-${i}`,
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "file",
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleInsertCanned = (text: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
    textareaRef.current?.focus();
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200 relative shrink-0">
      {/* Canned Responses Popover */}
      <CannedResponses
        categoryId={categoryId}
        isOpen={showCanned}
        onClose={() => setShowCanned(false)}
        onSelect={handleInsertCanned}
      />

      {/* Attachment Chips */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {attachments.map((att) => (
            <span
              key={att.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[120px]">{att.name}</span>
              <button
                type="button"
                onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                className="text-slate-400 hover:text-rose-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Textarea Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className="w-full p-3 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none transition-all"
        />

        <div className="flex items-center justify-between gap-2">
          {/* Quick Tools */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowCanned(!showCanned)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors",
                showCanned
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Canned Responses</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Attach</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!content.trim() || isSending}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-xs",
              content.trim() && !isSending
                ? "bg-sky-600 hover:bg-sky-700 text-white cursor-pointer shadow-sky-600/20"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            <span>{isSending ? "Sending..." : "Reply"}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
