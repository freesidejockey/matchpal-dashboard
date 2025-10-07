"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import {
  Tutor,
  TutorInsert,
  TutorUpdate,
  getTutors,
  createTutor,
  updateTutor,
  deleteTutor,
} from "@/actions/tutors";

type TutorsContextType = {
  tutors: Tutor[];
  loading: boolean;
  error: string | null;
  refreshTutors: () => Promise<void>;
  addTutor: (tutor: TutorInsert) => Promise<{
    success: boolean;
    data?: Tutor;
    error?: string;
  }>;
  updateTutorById: (
    id: string,
    updates: TutorUpdate,
  ) => Promise<{ success: boolean; data?: Tutor; error?: string }>;
  removeTutor: (id: string) => Promise<{ success: boolean; error?: string }>;
};

const TutorsContext = createContext<TutorsContextType | undefined>(
  undefined,
);

export const TutorsProvider: React.FC<{
  children: React.ReactNode;
  initialTutors?: Tutor[];
}> = ({ children, initialTutors = [] }) => {
  const [tutors, setTutors] = useState<Tutor[]>(initialTutors);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTutors = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTutors();
      if (result.success && result.data) {
        setTutors(result.data);
      } else {
        setError(result.error || "Failed to load tutors");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const addTutor = async (tutor: TutorInsert) => {
    const result = await createTutor(tutor);
    if (result.success && result.data) {
      setTutors((prev) => [result.data!, ...prev]);
    }
    return result;
  };

  const updateTutorById = async (id: string, updates: TutorUpdate) => {
    const result = await updateTutor(id, updates);
    if (result.success && result.data) {
      setTutors((prev) =>
        prev.map((t) => (t.id === id ? result.data! : t)),
      );
    }
    return result;
  };

  const removeTutor = async (id: string) => {
    // Store the tutor in case we need to rollback
    const tutorToDelete = tutors.find((t) => t.id === id);

    // Optimistically remove from UI
    setTutors((prev) => prev.filter((t) => t.id !== id));

    // Try to delete from database
    const result = await deleteTutor(id);

    // Rollback if deletion failed
    if (!result.success && tutorToDelete) {
      setTutors((prev) => [...prev, tutorToDelete].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    }

    return result;
  };

  // Load tutors on mount if no initial data provided
  useEffect(() => {
    if (initialTutors.length === 0) {
      refreshTutors();
    }
  }, []);

  return (
    <TutorsContext.Provider
      value={{
        tutors,
        loading,
        error,
        refreshTutors,
        addTutor,
        updateTutorById,
        removeTutor,
      }}
    >
      {children}
    </TutorsContext.Provider>
  );
};

export const useTutors = () => {
  const context = useContext(TutorsContext);
  if (context === undefined) {
    throw new Error("useTutors must be used within a TutorsProvider");
  }
  return context;
};
