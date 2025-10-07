"use client";

import { useMemo, useState } from "react";
import { createTutorColumns } from "./TutorColumns";
import { DataTable } from "./DataTable";
import { useTutors } from "@/context/TutorsContext";
import { AddTutorModal } from "./AddTutorModal";
import { useModal } from "@/hooks/useModal";

export default function TutorTablePage() {
  const {
    tutors,
    loading,
    error,
    removeTutor,
    updateTutorById,
    addTutor,
  } = useTutors();
  const { isOpen, openModal, closeModal } = useModal();
  const [isAdding, setIsAdding] = useState(false);

  const columns = useMemo(
    () =>
      createTutorColumns({
        onDelete: removeTutor,
        onUpdate: updateTutorById,
      }),
    [removeTutor, updateTutorById],
  );

  const handleAddTutor = async (tutorData: any) => {
    setIsAdding(true);
    const result = await addTutor(tutorData);
    setIsAdding(false);
    return result;
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Tutors</h1>
        <p>Loading tutors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Tutors</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <DataTable openModal={openModal} columns={columns} data={tutors} />

      <AddTutorModal
        isOpen={isOpen}
        onClose={closeModal}
        onAdd={handleAddTutor}
        isAdding={isAdding}
      />
    </div>
  );
}
