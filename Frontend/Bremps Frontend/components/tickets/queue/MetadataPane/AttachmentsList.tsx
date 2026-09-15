"use client";

import React, { useState } from "react";
import { Attachment } from "@/lib/types/ticket";
import { Paperclip, Image as ImageIcon, FileText, ExternalLink, X } from "lucide-react";

interface AttachmentsListProps {
  attachments: Attachment[];
}

export function AttachmentsList({ attachments }: AttachmentsListProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Paperclip className="w-3.5 h-3.5" />
          <span>Attachments ({attachments.length})</span>
        </div>
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-1">No files attached by student.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {att.type === "image" ? (
                  <ImageIcon className="w-4 h-4 text-sky-600 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate max-w-[140px]">
                    {att.name}
                  </p>
                  <span className="text-[10px] text-slate-400">{att.size}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {att.type === "image" && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(att.url)}
                    className="p-1 text-slate-400 hover:text-sky-600 rounded"
                    title="Quick Preview"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-xl max-h-[85vh] p-2 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImage}
              alt="Attachment preview"
              className="max-h-[75vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
