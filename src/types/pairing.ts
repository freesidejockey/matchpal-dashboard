import { AdvisorProfile } from "./database";
import { OrderWithDetails } from "./order";
import { QuestionnaireResponse, ProviderForSelection } from "./questionnaire";

// =============================================
// PAIRING OFFER TYPES
// =============================================

export type PairingOfferStatus = "pending" | "accepted" | "rejected" | "expired";

/**
 * Pairing Offer - Database row type
 */
export interface PairingOffer {
  id: string;
  order_id: string;
  tutor_id: string;
  status: PairingOfferStatus;
  match_score: number | null;
  match_reasons: string[] | null;
  is_student_preference: boolean;
  offered_at: string;
  expires_at: string | null;
  responded_at: string | null;
  created_at: string;
}

/**
 * Pairing Offer with joined tutor data
 */
export interface PairingOfferWithTutor extends PairingOffer {
  tutor?: ProviderForSelection;
}

/**
 * Pairing Offer with full context for display
 */
export interface PairingOfferWithDetails extends PairingOffer {
  // Tutor info
  tutor_first_name?: string | null;
  tutor_last_name?: string | null;
  tutor_bio?: string | null;
  tutor_degree?: string | null;
  tutor_specialty?: string | null;
  tutor_region?: string | null;
  // Order info
  order?: OrderWithDetails;
  // Questionnaire info
  questionnaire_response?: QuestionnaireResponse;
}

// =============================================
// INSERT/UPDATE TYPES
// =============================================

export type PairingOfferInsert = Omit<
  PairingOffer,
  "id" | "created_at" | "responded_at"
> & {
  id?: string;
};

export type PairingOfferUpdate = Partial<
  Omit<PairingOffer, "id" | "order_id" | "tutor_id" | "created_at" | "offered_at">
>;

// =============================================
// MATCHING ALGORITHM TYPES
// =============================================

/**
 * Result from the matching algorithm
 */
export interface MatchResult {
  tutor_id: string;
  score: number;
  reasons: string[];
  tutor?: ProviderForSelection;
}

/**
 * Input for the matching algorithm
 */
export interface MatchingInput {
  order_id: string;
  questionnaire_type: "tutoring" | "advising";
  intake_data: Record<string, unknown>;
  provider_preference: string | null;
}

// =============================================
// PAIRING DASHBOARD TYPES
// =============================================

/**
 * Summary for admin pairing dashboard
 */
export interface PairingSummary {
  total_pending_questionnaires: number;
  total_active_offers: number;
  total_expired_offers: number;
  total_completed_pairings: number;
}

/**
 * Order awaiting pairing (for admin dashboard)
 */
export interface OrderAwaitingPairing {
  order_id: string;
  student_name: string;
  service_name: string;
  questionnaire_type: "tutoring" | "advising";
  questionnaire_completed_at: string;
  current_offer_status: PairingOfferStatus | null;
  offers_made_count: number;
}

/**
 * Tutor's pairing history
 */
export interface TutorPairingHistory {
  tutor_id: string;
  tutor_name: string;
  total_offers_received: number;
  offers_accepted: number;
  offers_rejected: number;
  offers_expired: number;
  current_assigned_students: number;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Calculate time remaining until offer expires
 */
export function getTimeRemaining(expiresAt: string | null): {
  hours: number;
  minutes: number;
  expired: boolean;
} {
  if (!expiresAt) {
    return { hours: 0, minutes: 0, expired: true };
  }

  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, expired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, expired: false };
}

/**
 * Format time remaining as string
 */
export function formatTimeRemaining(expiresAt: string | null): string {
  const { hours, minutes, expired } = getTimeRemaining(expiresAt);

  if (expired) {
    return "Expired";
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
}

/**
 * Get status badge color for pairing offer
 */
export function getOfferStatusColor(
  status: PairingOfferStatus
): "warning" | "success" | "error" | "default" {
  switch (status) {
    case "pending":
      return "warning";
    case "accepted":
      return "success";
    case "rejected":
    case "expired":
      return "error";
    default:
      return "default";
  }
}

/**
 * Default offer expiration time (12 hours in milliseconds)
 */
export const OFFER_EXPIRATION_MS = 12 * 60 * 60 * 1000;

/**
 * Calculate expires_at timestamp for a new offer
 */
export function calculateExpiresAt(offeredAt: Date = new Date()): Date {
  return new Date(offeredAt.getTime() + OFFER_EXPIRATION_MS);
}
