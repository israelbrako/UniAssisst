import React from "react";
import { AGENTS } from "@/lib/constants/agents";
import { RatingStars } from "@/components/tickets/RatingStars";
import { MapPin, Clock, ShieldCheck, Mail, Phone, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
          About AURATECH
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Dedicated Software Problem Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          AURATECH is a private three-person technology business focused on solving software, operating system, database, and development environment problems.
        </p>
      </div>

      {/* Campus Locations & Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
            <MapPin className="w-4 h-4" />
            <span>Walk-In Help Desks</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
              <span><strong>Student Union (Central Hub):</strong> Room 204, 2nd Floor (Across from Campus Bookstore)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
              <span><strong>Science & Engineering Library:</strong> Ground Floor Kiosk near Pharos Printing Hub</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Operating Hours</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex justify-between">
              <span>Monday – Thursday:</span>
              <span className="font-semibold text-slate-800">8:00 AM – 8:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Friday:</span>
              <span className="font-semibold text-slate-800">8:00 AM – 5:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Weekends & Finals Week:</span>
              <span className="font-semibold text-emerald-700">10:00 AM – 4:00 PM (Emergency On-Call)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The 3-Person Team */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">The 3 Support Specialists</h2>
          <p className="text-xs text-slate-500">
            Certified Apple, Microsoft, and Cisco technicians assigned directly to your tickets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-3"
            >
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-slate-100"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">{agent.name}</h3>
                <p className="text-xs text-sky-700 font-semibold">{agent.role}</p>
                <p className="text-[11px] text-slate-400 mt-1">{agent.email}</p>
              </div>

              <div className="flex items-center justify-center gap-1 pt-1">
                <RatingStars score={Math.round(agent.rating)} size="sm" />
                <span className="text-xs font-bold text-slate-800 ml-1">{agent.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
