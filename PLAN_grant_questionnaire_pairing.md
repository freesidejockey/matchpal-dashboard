# Implementation Plan: Grant Questionnaire & Pairing System

## Overview
Students purchase packages (service tiers) which create orders (grants). Some grants require the student to be paired with a tutor/advisor. Before pairing can happen, students must complete questionnaires to provide information needed for matching.

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
                         ┌─────────────────────┐
                         │  Pairing Service    │
                         │  (Triggered on      │
                         │   completion)       │
                         └─────────────────────┘
```

---

## Questionnaire Types

We'll start with two questionnaire types:

### 1. Tutoring Questionnaire
For students purchasing tutoring packages (MCAT, USMLE, etc.)
```typescript
const tutoringQuestionnaireSchema = z.object({
  target_exam: z.string(),                    // Which exam are you preparing for?
  exam_date: z.string().optional(),           // When is your exam?
  previous_score: z.string().optional(),      // Previous score (if retaking)
  target_score: z.string(),                   // What score are you aiming for?
  study_hours_per_week: z.number(),           // How many hours/week can you study?
  preferred_schedule: z.array(z.string()),    // Preferred days/times
  learning_style: z.string(),                 // Visual, auditory, reading, kinesthetic
  areas_of_difficulty: z.array(z.string()),   // Which sections need most help?
  additional_notes: z.string().optional(),    // Anything else we should know?
});
```

### 2. Advising Questionnaire
For students purchasing advising packages (Med School Apps, Residency, etc.)
```typescript
const advisingQuestionnaireSchema = z.object({
  application_cycle: z.string(),              // Which cycle are you applying?
  target_specialties: z.array(z.string()),    // Specialties of interest
  current_stage: z.string(),                  // Where are you in the process?
  schools_of_interest: z.array(z.string()),   // Target schools/programs
  gpa: z.string().optional(),                 // Academic stats
  mcat_score: z.string().optional(),          // MCAT score
  research_experience: z.string(),            // Research background
  clinical_experience: z.string(),            // Clinical experience
  timeline_concerns: z.string().optional(),   // Any timeline pressures?
  additional_notes: z.string().optional(),    // Anything else?
});
```

---

## Phase 1: Database Schema & Types
**Goal**: Create the foundation - single table for responses + TypeScript types

### Step 1.1: Create Questionnaire Response Table
Create SQL migration for `questionnaire_responses`:
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
```

**Test**: Run migration, verify table exists in Supabase

### Step 1.2: Add questionnaire_type to Services
```sql
ALTER TABLE services
ADD COLUMN questionnaire_type VARCHAR(50);  -- 'tutoring' | 'advising' | null
```

**Test**: Column exists, can set questionnaire type on a service

### Step 1.3: Create TypeScript Types
Define types in `src/types/questionnaire.ts`:
```typescript
export type QuestionnaireType = 'tutoring' | 'advising';

export interface QuestionnaireResponse {
  id: string;
  order_id: string;
  questionnaire_type: QuestionnaireType;
  status: 'pending' | 'completed';
  responses: TutoringQuestionnaireData | AdvisingQuestionnaireData | null;
  created_at: string;
  completed_at: string | null;
}

// Zod schemas and inferred types for each questionnaire
```

**Test**: TypeScript compiles without errors

---

## Phase 2: Server Actions for Questionnaire Responses
**Goal**: CRUD operations for questionnaire responses

### Step 2.1: Create Response Actions
In `src/actions/questionnaire-responses.ts`:
- `getPendingQuestionnairesForStudent(profileId)` - Get incomplete questionnaires for student's orders
- `getQuestionnaireResponse(orderId)` - Get response for a specific order
- `submitQuestionnaireResponse(orderId, data)` - Submit completed questionnaire

**Test**: Call actions, verify data flows correctly

### Step 2.2: Auto-Create Pending Response on Order Creation
- Modify order creation to check if service has `questionnaire_type`
- If yes, create a `questionnaire_responses` record with status='pending'

**Test**: Create order for service with questionnaire, verify pending response created

---

## Phase 3: Student Questionnaire UI
**Goal**: Student-facing interface to view and complete questionnaires

### Step 3.1: Create Questionnaire Form Components
- `TutoringQuestionnaireForm.tsx` - Hardcoded form for tutoring
- `AdvisingQuestionnaireForm.tsx` - Hardcoded form for advising

**Test**: Forms render and validate correctly

### Step 3.2: Create Student Questionnaires Page
- New page at `/student/questionnaires`
- List pending questionnaires (linked to orders)
- Show which service/order each questionnaire is for

**Test**: Navigate to page, see pending questionnaires

### Step 3.3: Create Questionnaire Completion Page
- New page at `/student/questionnaires/[orderId]`
- Render appropriate form based on questionnaire_type
- Submit and save responses

**Test**: Complete a questionnaire, verify responses saved in JSONB

### Step 3.4: Add Navigation & Badge
- Add "Questionnaires" link to student sidebar
- Show badge with pending count
- Optional: Alert banner on student dashboard

**Test**: Badge shows correct pending count

---

## Phase 4: Pairing Service Foundation
**Goal**: Create the pairing service that will be triggered

### Step 4.1: Create Pairing Suggestions Table
```sql
CREATE TABLE pairing_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  suggested_tutor_id UUID NOT NULL REFERENCES tutor_profiles(id),
  match_score INTEGER,  -- 0-100 score
  match_reasons JSONB,  -- Array of reasons for match
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | accepted | rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id)
);
```

**Test**: Table exists, can insert records

### Step 4.2: Define Pairing Types
In `src/types/pairing.ts`:
```typescript
export interface PairingSuggestion {
  id: string;
  order_id: string;
  suggested_tutor_id: string;
  match_score: number | null;
  match_reasons: string[] | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  // Joined data
  tutor?: TutorProfile;
  order?: Order;
}
```

**Test**: Types compile

### Step 4.3: Create Pairing Service Actions
In `src/actions/pairing.ts`:
- `createPairingSuggestions(orderId)` - Generate suggestions for an order
- `getPairingSuggestions(orderId)` - Get suggestions for an order
- `acceptPairingSuggestion(suggestionId)` - Accept and assign tutor to order
- `rejectPairingSuggestion(suggestionId)` - Reject suggestion

**Test**: Create and retrieve pairing suggestions

---

## Phase 5: Connect Questionnaire to Pairing
**Goal**: Trigger pairing when questionnaire is completed

### Step 5.1: Trigger on Questionnaire Submission
- In `submitQuestionnaireResponse`:
  - After saving responses, call `createPairingSuggestions(orderId)`
  - Update order status if needed

**Test**: Complete questionnaire, verify pairing suggestions created

### Step 5.2: Basic Matching Algorithm
Initial simple matching based on:
- Tutor's `accepting_new_students` = true
- Tutor's services/specialties overlap with order's service
- Tutor's current workload (fewer existing orders = higher score)

**Test**: Pairing generates at least one suggestion for available tutors

---

## Phase 6: Admin Pairing UI
**Goal**: Admin interface to view and manage pairing suggestions

### Step 6.1: Pairing Dashboard
- New page at `/admin/pairing`
- List orders awaiting pairing (have suggestions with status='pending')
- Show order details, student info, questionnaire responses

**Test**: View pending pairings

### Step 6.2: Suggestion Cards
- Display each suggestion with tutor info, match score, reasons
- Accept/Reject buttons

**Test**: Can view suggestions for an order

### Step 6.3: Accept/Reject Actions
- Accept: Updates order.tutor_id, suggestion.status, order.assignment_status
- Reject: Updates suggestion.status, optionally re-generates

**Test**: Accept suggestion, verify order updated with tutor

---

## Phase 7: Polish & Integration
**Goal**: Final touches and full integration testing

### Step 7.1: Update Service Management
- Add questionnaire_type dropdown to service create/edit (admin)
- Show questionnaire type in service list

**Test**: Can set questionnaire type on services

### Step 7.2: Student Dashboard Integration
- Show alert/banner when pending questionnaires exist
- Show pairing status on order cards (awaiting pairing, paired with X)

**Test**: Student sees clear status throughout process

### Step 7.3: Email Notifications (Optional)
- Email student when questionnaire is required
- Email admin when pairing suggestions ready
- Email student/tutor when pairing accepted

### Step 7.4: End-to-End Testing
Full flow:
1. Admin creates service with questionnaire_type='tutoring'
2. Order created for student → pending questionnaire auto-created
3. Student logs in, sees pending questionnaire
4. Student completes questionnaire → pairing suggestions generated
5. Admin views suggestions, accepts one
6. Order updated with tutor, student notified

---

## File Structure (New Files)

```
src/
├── types/
│   ├── questionnaire.ts              # Phase 1.3
│   └── pairing.ts                    # Phase 4.2
├── actions/
│   ├── questionnaire-responses.ts    # Phase 2.1
│   └── pairing.ts                    # Phase 4.3
├── components/
│   └── questionnaire/
│       ├── TutoringQuestionnaireForm.tsx   # Phase 3.1
│       ├── AdvisingQuestionnaireForm.tsx   # Phase 3.1
│       └── PendingQuestionnaireCard.tsx    # Phase 3.2
├── app/
│   └── (dashboard)/
│       ├── student/
│       │   └── questionnaires/
│       │       ├── page.tsx          # Phase 3.2
│       │       └── [orderId]/
│       │           └── page.tsx      # Phase 3.3
│       └── admin/
│           └── pairing/
│               └── page.tsx          # Phase 6.1
scripts/
└── create_questionnaire_tables.sql   # Phase 1.1
```

---

## Testing Checklist Per Phase

### Phase 1: Database & Types
- [ ] Migration runs successfully
- [ ] `questionnaire_responses` table exists
- [ ] `services.questionnaire_type` column exists
- [ ] TypeScript types compile
- [ ] Can insert test response record

### Phase 2: Response Actions
- [ ] Can get pending questionnaires for a student
- [ ] Can submit questionnaire response
- [ ] Order creation auto-creates pending response (when service has questionnaire_type)

### Phase 3: Student UI
- [ ] Questionnaires page loads at `/student/questionnaires`
- [ ] Shows pending questionnaires with order info
- [ ] Can navigate to completion page
- [ ] Form validates correctly
- [ ] Submission saves to database
- [ ] Sidebar shows questionnaires link with badge

### Phase 4: Pairing Foundation
- [ ] `pairing_suggestions` table exists
- [ ] Pairing types compile
- [ ] Can create pairing suggestions
- [ ] Can retrieve suggestions for an order

### Phase 5: Questionnaire-Pairing Integration
- [ ] Completing questionnaire triggers pairing
- [ ] Matching algorithm generates suggestions
- [ ] Suggestions have scores and reasons

### Phase 6: Admin Pairing UI
- [ ] Pairing page loads at `/admin/pairing`
- [ ] Shows orders with pending suggestions
- [ ] Can view questionnaire responses
- [ ] Can accept/reject suggestions
- [ ] Accept updates order with tutor

### Phase 7: Polish
- [ ] Can set questionnaire_type on services (admin)
- [ ] Student dashboard shows pending questionnaire alert
- [ ] Order cards show pairing status
- [ ] End-to-end flow works

---

## Notes

- **No admin questionnaire builder** - forms are hardcoded React components
- **Responses stored as JSONB** - flexible, queryable, typed in code
- **One questionnaire per order** - simplifies the model
- **Each phase is independently testable** - can deploy incrementally
- Uses existing patterns: react-hook-form + Zod, shadcn/ui, Supabase
