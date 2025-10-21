export type PaymentStatus = "pending" | "paid" | "refunded";
export type AssignmentStatus =
  | "unassigned"
  | "assigned"
  | "active"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  student_id: string;
  service_tier_id: string;
  tutor_id: string | null;
  payment_status: PaymentStatus;
  assignment_status: AssignmentStatus;
  total_units: number;
  units_remaining: number;
  hourly_rate_locked: number | null;
  status_notes: string | null;
  revisions_total: number | null;
  revisions_used: number | null;
  initial_document_url: string | null;
  created_at: string;
  updated_at: string;
  assigned_at: string | null;
  completed_at: string | null;
}

export type OrderInsert = Omit<
  Order,
  "id" | "created_at" | "updated_at" | "assigned_at" | "completed_at"
> & {
  id?: string;
};

export type OrderUpdate = Partial<
  Omit<Order, "id" | "created_at" | "updated_at">
>;

// Type with joined data for display
export interface OrderWithDetails extends Order {
  student_first_name: string | null;
  student_last_name: string | null;
  tutor_first_name: string | null;
  tutor_last_name: string | null;
  service_tier_name: string | null;
  service_title: string | null;
}
