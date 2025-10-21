export type PayoutStatus = "pending" | "paid_out";

export interface SessionAttachment {
  name: string;
  path: string;
  publicUrl: string;
  size: number;
}

export interface Session {
  id: string;
  order_id: string;
  tutor_id: string;
  student_id: string;
  units_consumed: number;
  session_date: string;
  session_notes: string | null;
  comments_to_student: string | null;
  attachments: SessionAttachment[] | null;
  payout_status: PayoutStatus;
  created_at: string;
  updated_at: string;
}

export type SessionInsert = Omit<Session, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export type SessionUpdate = Partial<
  Omit<Session, "id" | "created_at" | "updated_at">
>;

// Type with joined data for display
export interface SessionWithDetails extends Session {
  student_first_name: string | null;
  student_last_name: string | null;
  tutor_first_name: string | null;
  tutor_last_name: string | null;
  tutor_payment_preference: string | null;
  tutor_payment_system_username: string | null;
  tutor_hourly_rate: number | null;
  order_service_title: string | null;
}
