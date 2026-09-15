import React from "react";
import { StudentInfo } from "@/lib/types/ticket";
import { Mail, Phone, GraduationCap, IdCard, User } from "lucide-react";

interface StudentInfoCardProps {
  student: StudentInfo;
}

export function StudentInfoCard({ student }: StudentInfoCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
        <User className="w-3.5 h-3.5" />
        <span>Student Profile</span>
      </div>

      <div className="flex items-start gap-3">
        {student.avatar ? (
          <img
            src={student.avatar}
            alt={student.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shrink-0">
            {student.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900 truncate">{student.name}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <IdCard className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-mono">{student.studentId}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{student.program}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <a
            href={`mailto:${student.email}`}
            className="text-sky-600 hover:text-sky-700 hover:underline truncate"
          >
            {student.email}
          </a>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <a
            href={`tel:${student.phone}`}
            className="text-slate-700 hover:underline truncate"
          >
            {student.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
