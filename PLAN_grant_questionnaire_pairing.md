# Implementation Plan: Grant Questionnaire & Pairing System

## Overview
Students purchase packages (service tiers) which create orders (grants). Some grants require the student to be paired with a tutor/advisor. Before pairing can happen, students must complete an intake questionnaire. The system then automatically matches them with available tutors/advisors.

## Simplified Approach
**Questionnaires are hardcoded form components** (not dynamic/database-driven). This means:
- Each questionnaire type is a React component with Zod schema
- No admin UI needed for building questionnaires
- Database only stores responses, not question definitions

## Architecture

```
┌─────────────────┐      ┌─────────────────────┐
│   Service       │──────│  questionnaire_type │  (enum: 'tutoring' | 'advising' | null)
│  (e.g., MCAT)   │      │  (column on service)│
└─────────────────┘      └─────────────────────┘
                                   │
                                   ▼
┌─────────────────┐      ┌─────────────────────┐      ┌──────────────────┐
│     Order       │──────│ questionnaire_      │      │  Form Component  │
│  (Student's     │      │ responses table     │      │  (Hardcoded in   │
│   grant)        │      │ (stores JSON data)  │      │   React + Zod)   │
└─────────────────┘      └─────────────────────┘      └──────────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐      ┌──────────────────┐
                         │  Pairing Service    │──────│  Pairing Offers  │
                         │  (Matching algo)    │      │  (12hr timeout)  │
                         └─────────────────────┘      └──────────────────┘
```

---

## Intake Form Specifications

### Auto-Populated Fields (from order/student data)
These fields are **read-only** and displayed for context:
- Name (first + last)
- Email
- Package type (service tier name)
- Medical school
- Current class year

### Student Tutoring Intake Form
For students who purchased **tutoring packages**:

```typescript
const tutoringIntakeSchema = z.object({
  // Required
  exam: z.enum([
    'USMLE Step 1',
    'USMLE Step 2',
    'COMLEX 1',
    'COMLEX 2',
    'Pre-clinical Exam',
    'Shelf Exam'
  ]),

  // Conditional: Only if exam is USMLE Step 1/2 or COMLEX 1/2
  attempt_type: z.enum(['First attempt', 'Retake']).optional(),

  // Provider Selection (from ProviderSelector component)
  provider_preference: z.string().nullable(),  // tutor_profile.id or null for "No Preference"

  // Optional (TBD - can add later)
  primary_goal: z.string().optional(),
});
```

### Student Advising Intake Form
For students who purchased **advising packages**:

```typescript
const SPECIALTIES = [
  'Anesthesiology',
  'Dermatology',
  'Diagnostic radiology',
  'Emergency medicine',
  'Family medicine',
  'Internal medicine',
  'Neurology',
  'Nuclear medicine',
  'Obstetrics and gynecology',
  'Ophthalmology',
  'Orthopedic surgery',
  'Otolaryngology',
  'Pathology',
  'Pediatrics',
  'Physical medicine and rehabilitation',
  'Plastic surgery',
  'Psychiatry',
  'Radiation oncology',
  'Surgery (general)',
  'Urology'
] as const;

const REGIONS = [
  'New England',
  'Middle Atlantic',
  'East North Central',
  'West North Central',
  'South Atlantic',
  'East South Central',
  'West South Central',
  'Mountain',
  'Pacific'
] as const;

const advisingIntakeSchema = z.object({
  // Required
  specialty: z.enum(SPECIALTIES),
  preferred_region: z.enum(REGIONS),

  // Provider Selection (from ProviderSelector component)
  provider_preference: z.string().nullable(),  // tutor_profile.id or null for "No Preference"

  // Optional (TBD - can add later)
  primary_goal: z.string().optional(),
});
```

---

## Provider Selection Component

Students can browse and select a preferred provider, or choose "No Preference" to let the algorithm decide.

### ProviderSelector Component
Displays a list of available providers filtered by questionnaire type:
- **Tutoring**: Shows tutors who teach the selected exam
- **Advising**: Shows advisors matching the selected specialty/region

```
┌─────────────────────────────────────────────────────────────────┐
│  Select Your Preferred Provider (Optional)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ○ No Preference - Let us find the best match for you    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ○  [Photo]  Dr. Sarah Johnson, MD                       │   │
│  │             Specialty: Internal Medicine                 │   │
│  │             Region: Northeast                            │   │
│  │             "Passionate about helping students..."       │   │
│  │                                    [View Full Profile]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ○  [Photo]  Dr. Michael Chen, DO                        │   │
│  │             Specialty: Internal Medicine                 │   │
│  │             Region: West Coast                           │   │
│  │             "Former program director with 10+ years..."  │   │
│  │                                    [View Full Profile]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### ProviderCard Component
Shows summary info for each provider:
- Profile photo (or avatar placeholder)
- Name + credentials (MD/DO)
- Specialty
- Region
- Short bio (truncated to ~100 chars)
- "View Full Profile" link

### ProviderDetailModal Component
Full provider profile in a modal:
- Large photo
- Full name + credentials
- Specialty + Region
- School name, Residency name
- Full bio
- Exam subjects they teach (for tutors)
- "Select This Provider" button

### Data Flow
1. Student selects exam (tutoring) or specialty/region (advising)
2. System fetches eligible providers based on selection
3. Student browses provider cards
4. Student clicks "View Full Profile" to see details
5. Student selects a provider OR "No Preference"
6. Selection saved as `provider_preference` in form data

### Tutor/Advisor Profile Fields (for matching)
These fields should exist on `tutor_profiles` for the matching algorithm:

```typescript
// Fields needed on tutor_profiles table
{
  degree: 'MD' | 'DO',                    // Their degree type
  school_name: string,                     // Free text (0 weight in algo)
  residency_name: string,                  // Free text (0 weight in algo)
  specialty: Specialty,                    // Same enum as students
  region: Region,                          // Same enum as students
  role_type: 'tutor' | 'advisor' | 'both', // What they do
  exam_subjects: ExamType[],               // If tutor/both: which exams they teach
}
```

---

## Pairing Workflow

```
1. Student purchases package
   └─→ Order created with service_tier
   └─→ Questionnaire response created (status: 'pending')

2. Student completes intake form
   └─→ Questionnaire response updated (status: 'completed')
   └─→ Pairing algorithm triggered

3. Algorithm finds best match
   └─→ Creates PairingOffer for top-ranked tutor/advisor
   └─→ Tutor notified via email
   └─→ 12-hour timer starts

4. Tutor responds
   ├─→ ACCEPT: Order assigned to tutor, student notified
   └─→ REJECT/TIMEOUT: Offer to next best match

5. Pairing complete
   └─→ Student receives email with tutor intro
   └─→ Order status updated to 'assigned'
```

---

## Phase 1: Database Schema & Types
**Goal**: Create the foundation - tables and TypeScript types

### Step 1.1: Create Questionnaire Response Table
```sql
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  questionnaire_type VARCHAR(50) NOT NULL,  -- 'tutoring' | 'advising'
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending' | 'completed'
  responses JSONB,  -- Stores the form data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(order_id)  -- One questionnaire per order
);

CREATE INDEX idx_questionnaire_responses_status ON questionnaire_responses(status);
CREATE INDEX idx_questionnaire_responses_order ON questionnaire_responses(order_id);
```

**Test**: Run migration, verify table exists

### Step 1.2: Add questionnaire_type to Services
```sql
ALTER TABLE services
ADD COLUMN questionnaire_type VARCHAR(50);  -- 'tutoring' | 'advising' | null
```

**Test**: Column exists, can set questionnaire type on a service

### Step 1.3: Add Matching Fields to Tutor Profiles
```sql
ALTER TABLE tutor_profiles
ADD COLUMN degree VARCHAR(10),              -- 'MD' | 'DO'
ADD COLUMN school_name VARCHAR(255),
ADD COLUMN residency_name VARCHAR(255),
ADD COLUMN specialty VARCHAR(100),
ADD COLUMN region VARCHAR(100),
ADD COLUMN role_type VARCHAR(20) DEFAULT 'tutor',  -- 'tutor' | 'advisor' | 'both'
ADD COLUMN exam_subjects TEXT[];            -- Array of exam types they can teach
```

**Test**: Columns exist, can update tutor profiles

### Step 1.4: Create TypeScript Types
In `src/types/questionnaire.ts`:
```typescript
export const EXAM_TYPES = [
  'USMLE Step 1',
  'USMLE Step 2',
  'COMLEX 1',
  'COMLEX 2',
  'Pre-clinical Exam',
  'Shelf Exam'
] as const;

export const SPECIALTIES = [
  'Anesthesiology',
  'Dermatology',
  // ... all 20
] as const;

export const REGIONS = [
  'New England',
  'Middle Atlantic',
  // ... all 9
] as const;

export type ExamType = typeof EXAM_TYPES[number];
export type Specialty = typeof SPECIALTIES[number];
export type Region = typeof REGIONS[number];
export type QuestionnaireType = 'tutoring' | 'advising';

// Zod schemas for form validation
export const tutoringIntakeSchema = z.object({...});
export const advisingIntakeSchema = z.object({...});

export type TutoringIntakeData = z.infer<typeof tutoringIntakeSchema>;
export type AdvisingIntakeData = z.infer<typeof advisingIntakeSchema>;

export interface QuestionnaireResponse {
  id: string;
  order_id: string;
  questionnaire_type: QuestionnaireType;
  status: 'pending' | 'completed';
  responses: TutoringIntakeData | AdvisingIntakeData | null;
  created_at: string;
  completed_at: string | null;
}
```

**Test**: TypeScript compiles without errors

---

## Phase 2: Server Actions for Questionnaire Responses
**Goal**: CRUD operations for questionnaire responses

### Step 2.1: Create Response Actions
In `src/actions/questionnaire-responses.ts`:
- `getPendingQuestionnairesForStudent(profileId)` - Get incomplete questionnaires with order/service info
- `getQuestionnaireResponse(orderId)` - Get response for a specific order
- `submitQuestionnaireResponse(orderId, data)` - Submit completed intake form

**Test**: Call actions, verify data flows correctly

### Step 2.2: Auto-Create Pending Response on Order Creation
- Modify `createOrder` action to check if service has `questionnaire_type`
- If yes, create a `questionnaire_responses` record with status='pending'

**Test**: Create order for service with questionnaire, verify pending response created

---

## Phase 3: Student Intake UI
**Goal**: Student-facing interface to view and complete intake forms

### Step 3.1: Create Intake Form Components
- `TutoringIntakeForm.tsx` - Form with exam dropdown + conditional attempt_type
- `AdvisingIntakeForm.tsx` - Form with specialty + region dropdowns
- `IntakeFormWrapper.tsx` - Shows auto-populated fields + renders correct form

**Test**: Forms render and validate correctly

### Step 3.2: Create Provider Selection Components
- `ProviderSelector.tsx` - Main component with "No Preference" + provider list
- `ProviderCard.tsx` - Summary card for each provider (photo, name, bio snippet)
- `ProviderDetailModal.tsx` - Full profile modal with "Select This Provider" button

**Test**:
- Component displays "No Preference" option prominently
- Provider cards show correct info
- Modal opens with full details
- Selection updates form state

### Step 3.3: Server Action for Eligible Providers
In `src/actions/questionnaire-responses.ts`:
- `getEligibleProviders(questionnaireType, filters)`
  - For tutoring: filter by exam subject
  - For advising: filter by specialty/region
  - Only return providers with `accepting_new_students = true`

**Test**: Returns correctly filtered list of providers

### Step 3.4: Create Student Questionnaires Page
- New page at `/student/questionnaires`
- List pending intake forms (linked to orders)
- Show package name, service type for each

**Test**: Navigate to page, see pending questionnaires

### Step 3.5: Create Intake Completion Page
- New page at `/student/questionnaires/[orderId]`
- Display auto-populated info (name, email, package, school, year)
- Render appropriate form based on questionnaire_type
- **Include ProviderSelector component**
- Submit and save responses

**Test**: Complete an intake form, verify responses saved including provider_preference

### Step 3.6: Add Navigation & Badge
- Add "Questionnaires" link to student sidebar
- Show badge with pending count

**Test**: Badge shows correct pending count

---

## Phase 4: Pairing Service Foundation
**Goal**: Create the pairing tables and types

### Step 4.1: Create Pairing Offers Table
```sql
CREATE TABLE pairing_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES tutor_profiles(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | accepted | rejected | expired
  match_score INTEGER,           -- 0-100 score
  match_reasons JSONB,           -- Array of reasons
  offered_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,        -- offered_at + 12 hours
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pairing_offers_order ON pairing_offers(order_id);
CREATE INDEX idx_pairing_offers_tutor ON pairing_offers(tutor_id);
CREATE INDEX idx_pairing_offers_status ON pairing_offers(status);
CREATE INDEX idx_pairing_offers_expires ON pairing_offers(expires_at) WHERE status = 'pending';
```

**Test**: Table exists, can insert records

### Step 4.2: Define Pairing Types
In `src/types/pairing.ts`:
```typescript
export interface PairingOffer {
  id: string;
  order_id: string;
  tutor_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  match_score: number | null;
  match_reasons: string[] | null;
  offered_at: string;
  expires_at: string | null;
  responded_at: string | null;
  // Joined data
  tutor?: TutorProfile;
  order?: OrderWithDetails;
}
```

**Test**: Types compile

### Step 4.3: Create Pairing Service Actions
In `src/actions/pairing.ts`:
- `createPairingOffer(orderId)` - Run matching algo, create offer for best match
- `getPairingOffersForOrder(orderId)` - Get all offers for an order
- `getPairingOffersForTutor(tutorId)` - Get offers for a tutor (pending + history)
- `acceptPairingOffer(offerId)` - Tutor accepts, assign to order
- `rejectPairingOffer(offerId)` - Tutor rejects, offer to next match
- `expirePendingOffers()` - Cron job to expire 12hr old offers

**Test**: Create and manage pairing offers

---

## Phase 5: Matching Algorithm
**Goal**: Implement the matching logic

### Step 5.1: Handle Student Provider Preference
```typescript
function createPairingOffer(orderId: string) {
  const order = getOrderWithIntake(orderId);
  const intake = order.questionnaire_response?.responses;

  // If student selected a specific provider, offer to them first
  if (intake.provider_preference) {
    const preferredProvider = getTutorProfile(intake.provider_preference);

    // Verify provider is still eligible (accepting students, matches criteria)
    if (isEligible(preferredProvider, order)) {
      return createOffer(orderId, preferredProvider.id, {
        match_score: 100,
        match_reasons: ['Student selected this provider'],
        is_student_preference: true
      });
    }
  }

  // Otherwise, run the matching algorithm
  return createOfferForBestMatch(orderId);
}
```

### Step 5.2: Algorithm Matching Rules (for "No Preference")
```typescript
function calculateMatchScore(tutor: TutorProfile, order: OrderWithIntake): number {
  let score = 0;
  const intake = order.questionnaire_response?.responses;

  if (order.questionnaire_type === 'tutoring') {
    // Tutor must teach this exam
    if (tutor.exam_subjects?.includes(intake.exam)) {
      score += 50;
    } else {
      return 0; // Disqualify
    }

    // Tutor must be tutor or both
    if (!['tutor', 'both'].includes(tutor.role_type)) {
      return 0; // Disqualify
    }
  }

  if (order.questionnaire_type === 'advising') {
    // Specialty match
    if (tutor.specialty === intake.specialty) {
      score += 40;
    }

    // Region match
    if (tutor.region === intake.preferred_region) {
      score += 30;
    }

    // Tutor must be advisor or both
    if (!['advisor', 'both'].includes(tutor.role_type)) {
      return 0; // Disqualify
    }
  }

  // Availability bonus
  if (tutor.accepting_new_students) {
    score += 20;
  }

  // Workload factor (fewer current orders = higher score)
  score += Math.max(0, 10 - tutor.current_order_count);

  return score;
}
```

**Test**: Algorithm returns ranked list of tutors

### Step 5.3: Trigger on Questionnaire Completion
- In `submitQuestionnaireResponse`:
  - After saving responses, call `createPairingOffer(orderId)`
  - If student selected a provider, offer goes to them first
  - If "No Preference", algorithm finds best match

**Test**:
- Complete intake with provider preference → offer to selected provider
- Complete intake with no preference → offer to algorithm-selected provider

---

## Phase 6: Tutor Pairing UI
**Goal**: Tutor interface to view and respond to pairing offers

### Step 6.1: Tutor Pairing Offers Page
- New section in tutor dashboard or page at `/advisor/pairing`
- Show pending offers with:
  - Student info (name, school, year)
  - Package details (hours, service type)
  - Intake form responses
  - Time remaining to respond
- Accept/Reject buttons

**Test**: Tutor can see and respond to offers

### Step 6.2: Email Notifications
- Send email when new offer created
- Include key details + link to respond
- Reminder email at 6 hours if not responded

**Test**: Emails sent correctly

---

## Phase 7: Admin Pairing Management
**Goal**: Admin interface to view and manage pairings

### Step 7.1: Pairing Dashboard
- New page at `/admin/pairing`
- Tabs: Pending Matches | Active Offers | Completed | All
- Filter by service type, tutor, date range

**Test**: View all pairing activity

### Step 7.2: Order Pairing Details
- View all offers made for an order
- See which tutors rejected/timed out
- Manually assign tutor (override algo)
- Unassign and re-run matching

**Test**: Full control over assignments

### Step 7.3: Tutor Assignment View
- For each tutor, see:
  - Currently assigned students
  - Pending offers
  - Offer history (accepted/rejected)

**Test**: Can see tutor's full pairing history

---

## Phase 8: Polish & Integration
**Goal**: Final touches and full integration testing

### Step 8.1: Update Service Management
- Add questionnaire_type dropdown to service create/edit (admin)

**Test**: Can set questionnaire type on services

### Step 8.2: Tutor Profile Updates
- Add matching fields to tutor onboarding/profile edit:
  - Degree, specialty, region, role_type, exam_subjects

**Test**: Tutors can set their matching preferences

### Step 8.3: Student Notifications
- Email when paired: "You've been matched with [Tutor Name]!"
- Include tutor intro, next steps, resources

**Test**: Student receives pairing confirmation email

### Step 8.4: Cron Job for Offer Expiration
- Background job to expire 12hr old pending offers
- Auto-create offer for next best match

**Test**: Expired offers trigger next match

### Step 8.5: End-to-End Testing
Full flow:
1. Admin creates service with questionnaire_type='tutoring'
2. Admin sets up tutor profiles with exam_subjects
3. Order created for student → pending questionnaire
4. Student completes intake form → offer sent to best tutor
5. Tutor accepts within 12hrs → student notified
6. OR: Tutor rejects/times out → next tutor offered

---

## File Structure (New Files)

```
src/
├── types/
│   ├── questionnaire.ts              # Phase 1.4
│   └── pairing.ts                    # Phase 4.2
├── actions/
│   ├── questionnaire-responses.ts    # Phase 2.1, 3.3
│   └── pairing.ts                    # Phase 4.3, 5.1
├── components/
│   └── questionnaire/
│       ├── TutoringIntakeForm.tsx    # Phase 3.1
│       ├── AdvisingIntakeForm.tsx    # Phase 3.1
│       ├── IntakeFormWrapper.tsx     # Phase 3.1
│       ├── PendingIntakeCard.tsx     # Phase 3.4
│       ├── ProviderSelector.tsx      # Phase 3.2 - Main selector with No Preference
│       ├── ProviderCard.tsx          # Phase 3.2 - Summary card for each provider
│       └── ProviderDetailModal.tsx   # Phase 3.2 - Full profile modal
├── app/
│   └── (dashboard)/
│       ├── student/
│       │   └── questionnaires/
│       │       ├── page.tsx          # Phase 3.4
│       │       └── [orderId]/
│       │           └── page.tsx      # Phase 3.5
│       ├── advisor/
│       │   └── pairing/
│       │       └── page.tsx          # Phase 6.1
│       └── admin/
│           └── pairing/
│               └── page.tsx          # Phase 7.1
scripts/
└── create_questionnaire_tables.sql   # Phase 1.1-1.3
```

---

## Testing Checklist Per Phase

### Phase 1: Database & Types
- [ ] `questionnaire_responses` table exists
- [ ] `services.questionnaire_type` column exists
- [ ] Tutor profile matching columns exist (degree, specialty, region, etc.)
- [ ] TypeScript types compile
- [ ] Enums for exams, specialties, regions defined

### Phase 2: Response Actions
- [ ] Can get pending questionnaires for a student
- [ ] Can submit intake form
- [ ] Order creation auto-creates pending response

### Phase 3: Student UI
- [ ] Questionnaires page loads
- [ ] Auto-populated fields display correctly
- [ ] Tutoring form shows exam dropdown + conditional attempt_type
- [ ] Advising form shows specialty + region dropdowns
- [ ] **Provider Selector shows "No Preference" option first**
- [ ] **Provider cards display with photo, name, bio snippet**
- [ ] **Provider detail modal opens with full info**
- [ ] **Selecting provider updates form state**
- [ ] **getEligibleProviders returns filtered list based on exam/specialty**
- [ ] Submission saves to database (including provider_preference)
- [ ] Sidebar shows badge

### Phase 4: Pairing Foundation
- [ ] `pairing_offers` table exists
- [ ] Can create/retrieve offers
- [ ] Can accept/reject offers

### Phase 5: Matching Algorithm
- [ ] **Student selects provider → offer goes directly to selected provider**
- [ ] **Student selects "No Preference" → algorithm finds best match**
- [ ] Algorithm scores tutors correctly
- [ ] Disqualifies tutors who don't match criteria
- [ ] Completing intake triggers offer creation

### Phase 6: Tutor UI
- [ ] Tutor sees pending offers
- [ ] Offer shows student + intake info
- [ ] Can accept → order assigned
- [ ] Can reject → next offer created
- [ ] Email notifications work

### Phase 7: Admin UI
- [ ] Pairing dashboard shows all activity
- [ ] Can view offer history for order
- [ ] Can manually assign/unassign
- [ ] Can view tutor's assignments

### Phase 8: Polish
- [ ] Services can have questionnaire_type set
- [ ] Tutors can set matching preferences in profile
- [ ] Student pairing email works
- [ ] Offer expiration cron works
- [ ] End-to-end flow complete

---

## Notes

- **Auto-populated fields** come from existing student/order data - no new input needed
- **12-hour timeout** for tutor responses - configurable via env var
- **Matching weights** can be tuned based on real-world results
- **Role-based forms**: tutoring clients see exam dropdown, advising clients see specialty/region
- **No language field** - confirmed not needed
- Uses existing patterns: react-hook-form + Zod, shadcn/ui, Supabase
