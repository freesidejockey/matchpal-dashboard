"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import {
  RevisionWithDetails,
  RevisionInsert,
} from "@/types";
import {
  getRevisions,
  getRevisionsByTutor,
  createRevision,
  updateRevisionPayoutStatus,
} from "@/actions/revisions";

type RevisionsContextType = {
  revisions: RevisionWithDetails[];
  loading: boolean;
  error: string | null;
  refreshRevisions: () => Promise<void>;
  addRevision: (revision: RevisionInsert) => Promise<{
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    error?: string;
  }>;
  updatePayoutStatus: (
    id: string,
    status: "pending" | "paid_out",
  ) => Promise<{ success: boolean; error?: string }>;
};

const RevisionsContext = createContext<RevisionsContextType | undefined>(
  undefined,
);

export const RevisionsProvider: React.FC<{
  children: React.ReactNode;
  initialRevisions?: RevisionWithDetails[];
  tutorId?: string; // Optional: if provided, only fetch revisions for this tutor
}> = ({ children, initialRevisions = [], tutorId }) => {
  const [revisions, setRevisions] = useState<RevisionWithDetails[]>(
    initialRevisions,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRevisions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = tutorId
        ? await getRevisionsByTutor(tutorId)
        : await getRevisions();

      if (result.success && result.data) {
        setRevisions(result.data);
      } else {
        setError(result.error || "Failed to fetch revisions");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addRevision = async (revision: RevisionInsert) => {
    const result = await createRevision(revision);
    if (result.success) {
      await refreshRevisions();
    }
    return result;
  };

  const updatePayoutStatus = async (
    id: string,
    status: "pending" | "paid_out",
  ) => {
    // Store the original revision for rollback
    const originalRevision = revisions.find((r) => r.id === id);
    if (!originalRevision) {
      return { success: false, error: "Revision not found" };
    }

    const previousStatus = originalRevision.payout_status;

    // Optimistically update the UI
    setRevisions((prev) =>
      prev.map((revision) =>
        revision.id === id ? { ...revision, payout_status: status } : revision
      )
    );

    // Make the server request
    const result = await updateRevisionPayoutStatus(id, status);

    // Rollback if the update failed
    if (!result.success) {
      setRevisions((prev) =>
        prev.map((revision) =>
          revision.id === id
            ? { ...revision, payout_status: previousStatus }
            : revision
        )
      );
      return { success: false, error: result.error };
    }

    return { success: true };
  };

  useEffect(() => {
    if (initialRevisions.length === 0) {
      refreshRevisions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RevisionsContext.Provider
      value={{
        revisions,
        loading,
        error,
        refreshRevisions,
        addRevision,
        updatePayoutStatus,
      }}
    >
      {children}
    </RevisionsContext.Provider>
  );
};

export const useRevisions = () => {
  const context = useContext(RevisionsContext);
  if (context === undefined) {
    throw new Error("useRevisions must be used within a RevisionsProvider");
  }
  return context;
};
