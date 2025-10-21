export interface Revision {
  id: string;
  order_id: string;
  tutor_id: string;
  completed_at: string;
  revised_document_url: string;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export type RevisionInsert = Omit<Revision, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export type RevisionUpdate = Partial<
  Omit<Revision, "id" | "created_at" | "updated_at">
>;

// Type with joined data for display
export interface RevisionWithDetails extends Revision {
  student_first_name: string | null;
  student_last_name: string | null;
  student_email: string | null;
  tutor_first_name: string | null;
  tutor_last_name: string | null;
  order_service_title: string | null;
}
