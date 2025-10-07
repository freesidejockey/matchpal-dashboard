"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import {
  SessionWithDetails,
  SessionInsert,
  SessionUpdate,
} from "@/types";
import {
  getSessions,
  getSessionsByTutor,
  createSession,
  updateSession,
  deleteSession,
} from "@/actions/sessions";

type SessionsContextType = {
  sessions: SessionWithDetails[];
  loading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  addSession: (session: SessionInsert) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
  updateSessionById: (
    id: string,
    updates: SessionUpdate,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  removeSession: (id: string) => Promise<{ success: boolean; error?: string }>;
};

const SessionsContext = createContext<SessionsContextType | undefined>(
  undefined,
);

export const SessionsProvider: React.FC<{
  children: React.ReactNode;
  initialSessions?: SessionWithDetails[];
  tutorId?: string; // Optional: if provided, only fetch sessions for this tutor
}> = ({ children, initialSessions = [], tutorId }) => {
  const [sessions, setSessions] = useState<SessionWithDetails[]>(
    initialSessions,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = tutorId
        ? await getSessionsByTutor(tutorId)
        : await getSessions();

      if (result.success && result.data) {
        setSessions(result.data);
      } else {
        setError(result.error || "Failed to fetch sessions");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (session: SessionInsert) => {
    const result = await createSession(session);
    if (result.success) {
      await refreshSessions();
    }
    return result;
  };

  const updateSessionById = async (id: string, updates: SessionUpdate) => {
    const result = await updateSession(id, updates);
    if (result.success) {
      await refreshSessions();
    }
    return result;
  };

  const removeSession = async (id: string) => {
    const result = await deleteSession(id);
    if (result.success) {
      await refreshSessions();
    }
    return result;
  };

  useEffect(() => {
    if (initialSessions.length === 0) {
      refreshSessions();
    }
  }, []);

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        loading,
        error,
        refreshSessions,
        addSession,
        updateSessionById,
        removeSession,
      }}
    >
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error("useSessions must be used within a SessionsProvider");
  }
  return context;
};
