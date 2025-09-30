"use client";

import { useMemo, useState } from "react";
import { createColumns } from "./Columns";
import { DataTable } from "./DataTable";
import { useStudents } from "@/context/StudentsContext";
import { AddStudentModal } from "./AddStudentModal";
import { useModal } from "@/hooks/useModal";

export default function StudentTablePage() {
  const {
    students,
    loading,
    error,
    removeStudent,
    updateStudentById,
    addStudent,
  } = useStudents();
  const { isOpen, openModal, closeModal } = useModal();
  const [isAdding, setIsAdding] = useState(false);

  const columns = useMemo(
    () =>
      createColumns({
        onDelete: removeStudent,
        onUpdate: updateStudentById,
      }),
    [removeStudent, updateStudentById],
  );

  const handleAddStudent = async (studentData: any) => {
    setIsAdding(true);
    const result = await addStudent(studentData);
    setIsAdding(false);
    return result;
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Students</h1>
        <p>Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Students</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <DataTable openModal={openModal} columns={columns} data={students} />

      <AddStudentModal
        isOpen={isOpen}
        onClose={closeModal}
        onAdd={handleAddStudent}
        isAdding={isAdding}
      />
    </div>
  );
}
