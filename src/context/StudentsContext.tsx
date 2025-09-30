"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import {
  Student,
  StudentInsert,
  StudentUpdate,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/actions/students";

type StudentsContextType = {
  students: Student[];
  loading: boolean;
  error: string | null;
  refreshStudents: () => Promise<void>;
  addStudent: (student: StudentInsert) => Promise<{
    success: boolean;
    data?: Student;
    error?: string;
  }>;
  updateStudentById: (
    id: string,
    updates: StudentUpdate,
  ) => Promise<{ success: boolean; data?: Student; error?: string }>;
  removeStudent: (id: string) => Promise<{ success: boolean; error?: string }>;
};

const StudentsContext = createContext<StudentsContextType | undefined>(
  undefined,
);

export const StudentsProvider: React.FC<{
  children: React.ReactNode;
  initialStudents?: Student[];
}> = ({ children, initialStudents = [] }) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStudents();
      if (result.success && result.data) {
        setStudents(result.data);
      } else {
        setError(result.error || "Failed to load students");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student: StudentInsert) => {
    const result = await createStudent(student);
    if (result.success && result.data) {
      setStudents((prev) => [result.data!, ...prev]);
    }
    return result;
  };

  const updateStudentById = async (id: string, updates: StudentUpdate) => {
    const result = await updateStudent(id, updates);
    if (result.success && result.data) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? result.data! : s)),
      );
    }
    return result;
  };

  const removeStudent = async (id: string) => {
    // Store the student in case we need to rollback
    const studentToDelete = students.find((s) => s.id === id);

    // Optimistically remove from UI
    setStudents((prev) => prev.filter((s) => s.id !== id));

    // Try to delete from database
    const result = await deleteStudent(id);

    // Rollback if deletion failed
    if (!result.success && studentToDelete) {
      setStudents((prev) => [...prev, studentToDelete].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    }

    return result;
  };

  // Load students on mount if no initial data provided
  useEffect(() => {
    if (initialStudents.length === 0) {
      refreshStudents();
    }
  }, []);

  return (
    <StudentsContext.Provider
      value={{
        students,
        loading,
        error,
        refreshStudents,
        addStudent,
        updateStudentById,
        removeStudent,
      }}
    >
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error("useStudents must be used within a StudentsProvider");
  }
  return context;
};
