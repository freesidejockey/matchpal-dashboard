# Implementation Plan: Grant Questionnaire & Pairing System

## Overview
Students purchase packages (service tiers) which create orders (grants). Some grants require the student to be paired with a tutor/advisor. Before pairing can happen, students must complete questionnaires to provide information needed for matching.

## Architecture

```
┌─────────────────┐      ┌─────────────────────┐      ┌──────────────────┐
│   Service Tier  │──────│   Questionnaire     │      │   Questions      │
│  (Package/Grant)│      │  (Template tied to  │──────│  (Individual     │
└─────────────────┘      │   service type)     │      │   questions)     │
                         └─────────────────────┘      └──────────────────┘
                                   │
                                   ▼
┌─────────────────┐      ┌─────────────────────┐      ┌──────────────────┐
│     Order       │──────│ QuestionnaireResponse│─────│ QuestionAnswers  │
│  (Student's     │      │ (Student's completed│      │ (Individual      │
│   grant)        │      │  questionnaire)     │      │  answers)        │
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

## Phase 1: Database Schema & Types
**Goal**: Create the foundation - tables and TypeScript types

### Step 1.1: Create Questionnaire Tables
Create SQL migration for:
- `questionnaires` - Template definitions (tied to service type)
- `questionnaire_questions` - Individual questions within a questionnaire
- `questionnaire_responses` - Student's submission of a questionnaire
- `questionnaire_answers` - Individual answers to questions

**Test**: Run migration, verify tables exist in Supabase

### Step 1.2: Create TypeScript Types
Define types in `src/types/questionnaire.ts`:
- `Questionnaire`
- `QuestionnaireQuestion`
- `QuestionnaireResponse`
- `QuestionnaireAnswer`
- Question type enums (text, textarea, select, multi-select, etc.)

**Test**: TypeScript compiles without errors

---

## Phase 2: Server Actions for Questionnaires (Admin)
**Goal**: CRUD operations for managing questionnaires

### Step 2.1: Create Questionnaire Actions
In `src/actions/questionnaires.ts`:
- `getQuestionnaires()` - List all questionnaires
- `getQuestionnaireById(id)` - Get single questionnaire with questions
- `createQuestionnaire(data)` - Create new questionnaire
- `updateQuestionnaire(id, data)` - Update questionnaire
- `deleteQuestionnaire(id)` - Delete questionnaire

**Test**: Call actions from a test script or temporary API route

### Step 2.2: Create Question Actions
- `addQuestion(questionnaireId, data)` - Add question to questionnaire
- `updateQuestion(id, data)` - Update question
- `deleteQuestion(id)` - Delete question
- `reorderQuestions(questionnaireId, questionIds)` - Reorder questions

**Test**: Create a questionnaire with multiple questions via actions

---

## Phase 3: Link Questionnaires to Services
**Goal**: Associate questionnaires with service types so orders know which questionnaire to require

### Step 3.1: Add Questionnaire FK to Services
- Add `questionnaire_id` column to `services` table
- Update `Service` type to include questionnaire reference

**Test**: Verify column exists, types compile

### Step 3.2: Update Service Actions
- Modify `createService` / `updateService` to accept questionnaire_id
- Modify `getServices` to include questionnaire info

**Test**: Create a service linked to a questionnaire

---

## Phase 4: Student Questionnaire Response System
**Goal**: Track which students need to complete which questionnaires

### Step 4.1: Create Response Actions
In `src/actions/questionnaire-responses.ts`:
- `getPendingQuestionnairesForStudent(studentId)` - Get incomplete questionnaires
- `getQuestionnaireResponsesByStudent(studentId)` - Get all responses
- `createQuestionnaireResponse(orderId, questionnaireId)` - Start a response
- `submitQuestionnaireResponse(responseId, answers)` - Submit completed response

**Test**: Create a pending questionnaire for a test student

### Step 4.2: Auto-Create Pending Questionnaires on Order Creation
- Modify order creation webhook/action to check if service has questionnaire
- If yes, create a `questionnaire_response` record with status='pending'

**Test**: Create an order for a service with questionnaire, verify pending response created

---

## Phase 5: Student Questionnaire UI
**Goal**: Student-facing interface to view and complete questionnaires

### Step 5.1: Create Questionnaire Components
- `QuestionnaireCard.tsx` - Display questionnaire info with status
- `QuestionnaireForm.tsx` - Dynamic form based on questions
- `QuestionRenderer.tsx` - Render different question types

**Test**: Render components with mock data

### Step 5.2: Create Student Questionnaires Page
- New page at `/student/questionnaires`
- List pending questionnaires
- Link to complete each one

**Test**: Navigate to page, see pending questionnaires

### Step 5.3: Create Questionnaire Completion Page
- New page at `/student/questionnaires/[id]`
- Display questionnaire form
- Submit and save answers

**Test**: Complete a questionnaire, verify answers saved

### Step 5.4: Add Tab/Navigation for Students
- Add "Questionnaires" link to student navigation
- Show badge with pending count

**Test**: Badge shows correct pending count

---

## Phase 6: Pairing Service Foundation
**Goal**: Create the pairing service that will be triggered

### Step 6.1: Define Pairing Types
In `src/types/pairing.ts`:
- `PairingRequest` - Request for pairing with questionnaire answers
- `PairingSuggestion` - Suggested tutor/advisor match
- `PairingStatus` - enum for tracking status

**Test**: Types compile

### Step 6.2: Create Pairing Suggestions Table
- `pairing_suggestions` table with:
  - `order_id` - The order needing pairing
  - `suggested_tutor_id` - Suggested match
  - `match_score` - How good the match is
  - `match_reasons` - Why this match was suggested
  - `status` - pending/accepted/rejected

**Test**: Table exists, can insert records

### Step 6.3: Create Pairing Service Actions
In `src/actions/pairing.ts`:
- `createPairingRequest(orderId)` - Initiate pairing for an order
- `getPairingSuggestions(orderId)` - Get suggestions for an order
- `acceptPairingSuggestion(suggestionId)` - Accept and assign tutor
- `rejectPairingSuggestion(suggestionId)` - Reject suggestion

**Test**: Create and retrieve pairing suggestions

---

## Phase 7: Connect Questionnaire Completion to Pairing
**Goal**: Trigger pairing when questionnaire is completed

### Step 7.1: Add Trigger on Questionnaire Submission
- In `submitQuestionnaireResponse`:
  - After saving answers, check if order needs pairing
  - If yes, call `createPairingRequest(orderId)`

**Test**: Complete questionnaire, verify pairing request created

### Step 7.2: Basic Matching Algorithm (Placeholder)
- Create initial matching logic based on:
  - Tutor availability
  - Tutor specialties vs student interests
  - Tutor workload (existing students)

**Test**: Pairing request generates at least one suggestion

---

## Phase 8: Admin Questionnaire Management UI
**Goal**: Admin interface to create and manage questionnaires

### Step 8.1: Admin Questionnaires List Page
- New page at `/admin/questionnaires`
- List all questionnaires with CRUD actions

**Test**: View, create, edit questionnaires from admin UI

### Step 8.2: Questionnaire Builder
- Create/edit questionnaire with:
  - Title, description
  - Add/remove/reorder questions
  - Preview functionality

**Test**: Build a questionnaire from scratch in admin UI

### Step 8.3: Link Questionnaire to Service UI
- Add questionnaire selector to service creation/edit forms

**Test**: Create service with linked questionnaire

---

## Phase 9: Admin Pairing Management UI
**Goal**: Admin interface to view and manage pairing suggestions

### Step 9.1: Pairing Dashboard
- New page at `/admin/pairing`
- List orders awaiting pairing
- Show pairing suggestions

**Test**: View pending pairings with suggestions

### Step 9.2: Accept/Reject Suggestions
- Actions to accept or reject suggestions
- On accept, update order with tutor assignment

**Test**: Accept suggestion, verify order updated

---

## Phase 10: Polish & Integration
**Goal**: Final touches and full integration testing

### Step 10.1: Email Notifications
- Email student when questionnaire is required
- Email admin when pairing suggestion is ready
- Email student/tutor when pairing is accepted

### Step 10.2: Student Dashboard Integration
- Show pending questionnaires alert on student dashboard
- Show pairing status on order cards

### Step 10.3: End-to-End Testing
- Full flow: Order created → Questionnaire pending → Student completes → Pairing suggested → Admin accepts → Tutor assigned

---

## File Structure (New Files)

```
src/
├── types/
│   ├── questionnaire.ts          # Phase 1.2
│   └── pairing.ts                # Phase 6.1
├── actions/
│   ├── questionnaires.ts         # Phase 2.1, 2.2
│   ├── questionnaire-responses.ts # Phase 4.1
│   └── pairing.ts                # Phase 6.3
├── components/
│   └── questionnaire/
│       ├── QuestionnaireCard.tsx # Phase 5.1
│       ├── QuestionnaireForm.tsx # Phase 5.1
│       └── QuestionRenderer.tsx  # Phase 5.1
├── app/
│   └── (dashboard)/
│       ├── student/
│       │   └── questionnaires/
│       │       ├── page.tsx      # Phase 5.2
│       │       └── [id]/
│       │           └── page.tsx  # Phase 5.3
│       └── admin/
│           ├── questionnaires/
│           │   └── page.tsx      # Phase 8.1
│           └── pairing/
│               └── page.tsx      # Phase 9.1
scripts/
└── create_questionnaires.sql     # Phase 1.1
```

---

## Testing Checklist Per Phase

### Phase 1: Database & Types
- [ ] Migration runs successfully
- [ ] Tables exist in Supabase
- [ ] TypeScript compiles
- [ ] Can insert/query test data

### Phase 2: Admin Actions
- [ ] Can create questionnaire
- [ ] Can add questions
- [ ] Can retrieve questionnaire with questions
- [ ] Can update/delete

### Phase 3: Service Linking
- [ ] Service has questionnaire_id column
- [ ] Can create service with questionnaire
- [ ] Service retrieval includes questionnaire

### Phase 4: Response System
- [ ] Can get pending questionnaires for student
- [ ] Can create response
- [ ] Can submit answers
- [ ] Order creation auto-creates pending response

### Phase 5: Student UI
- [ ] Questionnaires page loads
- [ ] Shows pending questionnaires
- [ ] Form renders all question types
- [ ] Submission saves answers
- [ ] Navigation shows pending badge

### Phase 6: Pairing Foundation
- [ ] Pairing types compile
- [ ] Pairing table exists
- [ ] Can create/retrieve suggestions

### Phase 7: Questionnaire-Pairing Integration
- [ ] Completing questionnaire triggers pairing
- [ ] Pairing generates suggestions
- [ ] Suggestions appear in system

### Phase 8: Admin Questionnaire UI
- [ ] List page shows questionnaires
- [ ] Can create/edit/delete
- [ ] Can build questions
- [ ] Can link to services

### Phase 9: Admin Pairing UI
- [ ] Shows pending pairings
- [ ] Can view suggestions
- [ ] Can accept/reject
- [ ] Accept updates order

### Phase 10: Polish
- [ ] Emails send correctly
- [ ] Dashboard alerts work
- [ ] End-to-end flow complete

---

## Notes

- Each phase is independently deployable
- Database changes should use migrations (not direct edits)
- All actions use Supabase client for consistency
- Forms use react-hook-form + Zod (existing pattern)
- UI uses shadcn/ui components (existing pattern)
