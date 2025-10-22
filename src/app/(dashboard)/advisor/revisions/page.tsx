"use client";

import { useMemo, useState, useEffect } from "react";
import { createRevisionColumns } from "@/components/tables/RevisionColumns";
import { DataTable } from "@/components/tables/DataTable";
import { AddRevisionModal } from "@/components/tables/AddRevisionModal";
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";
import { useProfile } from "@/context/ProfileContext";
import { getRevisionsByTutor } from "@/actions/revisions";
import { createRevision } from "@/actions/revisions";
import { RevisionWithDetails, RevisionInsert } from "@/types";

export default function RevisionsPage() {
  const { profile } = useProfile();
  const [revisions, setRevisions] = useState<RevisionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isOpen, openModal, closeModal } = useModal();
  const [isAdding, setIsAdding] = useState(false);

  const loadRevisions = async () => {
    setLoading(true);
    const result = await getRevisionsByTutor(profile.id);

    if (result.success && result.data) {
      setRevisions(result.data);
      setError(null);
    } else {
      setError(result.error || "Failed to load revisions");
    }

    setLoading(false);
  };

  const columns = useMemo(() => createRevisionColumns(undefined, false), []);

  useEffect(() => {
    loadRevisions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  const handleAddRevision = async (revisionData: RevisionInsert) => {
    setIsAdding(true);
    const result = await createRevision(revisionData);
    setIsAdding(false);

    if (result.success) {
      toast.success("Revision submitted successfully!", {
        description: "The student has been notified via email.",
      });
      // Reload revisions
      await loadRevisions();
    }

    return result;
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Revisions</h1>
        <p>Loading revisions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Revisions</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <DataTable openModal={openModal} columns={columns} data={revisions} />

      <AddRevisionModal
        isOpen={isOpen}
        onClose={closeModal}
        onAdd={handleAddRevision}
        isAdding={isAdding}
      />
    </div>
  );
}
