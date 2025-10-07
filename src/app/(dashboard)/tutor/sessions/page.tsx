"use client";

import { useMemo, useState } from "react";
import { createSessionColumns } from "@/components/tables/SessionColumns";
import { DataTable } from "@/components/tables/DataTable";
import { useSessions } from "@/context/SessionsContext";
import { AddSessionModal } from "@/components/tables/AddSessionModal";
import { useModal } from "@/hooks/useModal";

export default function SessionsPage() {
  const {
    sessions,
    loading,
    error,
    removeSession,
    updateSessionById,
    addSession,
  } = useSessions();

  const { isOpen, openModal, closeModal } = useModal();
  const [isAdding, setIsAdding] = useState(false);

  const columns = useMemo(
    () =>
      createSessionColumns({
        onDelete: removeSession,
        onUpdate: updateSessionById,
      }),
    [removeSession, updateSessionById],
  );

  const handleAddSession = async (sessionData: any) => {
    setIsAdding(true);
    const result = await addSession(sessionData);
    setIsAdding(false);
    return result;
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Sessions</h1>
        <p>Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Sessions</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <DataTable openModal={openModal} columns={columns} data={sessions} />

      <AddSessionModal
        isOpen={isOpen}
        onClose={closeModal}
        onAdd={handleAddSession}
        isAdding={isAdding}
      />
    </div>
  );
}
