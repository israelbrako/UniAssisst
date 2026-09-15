"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AGENTS, Agent } from "@/lib/constants/agents";

export type UserRole = "student" | "agent" | "admin";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  agentDetails?: Agent;
}

interface AuthContextType {
  user: CurrentUser;
  setRole: (
    role: UserRole,
    agentId?: string,
    studentDetails?: Pick<CurrentUser, "name" | "email" | "studentId">
  ) => void;
  activeAgent: Agent;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENTS[0]); // Marcus Vance
  const [registeredStudent, setRegisteredStudent] = useState<
    Pick<CurrentUser, "name" | "email" | "studentId">
  >({ name: "", email: "", studentId: undefined });
  const [user, setUser] = useState<CurrentUser>({
    id: AGENTS[0].id,
    name: AGENTS[0].name,
    email: AGENTS[0].email,
    role: "agent",
    avatar: AGENTS[0].avatar,
    agentDetails: AGENTS[0],
  });

  const setRole = (
    role: UserRole,
    agentId?: string,
    studentDetails?: Pick<CurrentUser, "name" | "email" | "studentId">
  ) => {
    if (role === "agent") {
      const agent = AGENTS.find((a) => a.id === agentId) || AGENTS[0];
      setActiveAgent(agent);
      setUser({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        role: "agent",
        avatar: agent.avatar,
        agentDetails: agent,
      });
    } else if (role === "admin") {
      setUser({
        id: "admin-1",
        name: "Campus IT Director",
        email: "director.it@campus.edu",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
      });
    } else {
      const student = studentDetails || registeredStudent;
      if (studentDetails) setRegisteredStudent(studentDetails);
      setUser({
        id: `stu-${Date.now()}`,
        name: student.name,
        email: student.email,
        role: "student",
        studentId: student.studentId,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, setRole, activeAgent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
