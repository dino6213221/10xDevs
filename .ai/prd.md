# Product Requirements Document (PRD) - AI Flashcards MVP

## 1. Product Overview

AI Flashcards MVP is a web application that reduces the friction of creating high-quality study flashcards by combining manual authoring with AI-assisted generation and an intuitive review queue. The product targets students, professionals, and lifelong learners who value spaced repetition but are discouraged by the time cost of card creation. For the MVP internal demo, the focus is on core functionality: secure user accounts, manual flashcard CRUD, manual trigger for AI-generated candidates that exist only during the session, a simple review queue to accept/edit/discard candidates, and clear error handling. PostgreSQL is used for persistent storage, and integration with an open-source spaced repetition algorithm will be planned later.

Primary objectives for the internal demo:

- Demonstrate end-to-end creation of flashcards via manual input and AI-generated candidates.
- Validate the review queue UX for accepting, editing, or discarding AI-generated candidates.
- Ensure accepted cards are stored in the user’s account; unaccepted candidates are ephemeral.
- Provide reliable error handling and inline validation for input limits.

Assumptions:

- Single web application experience; mobile apps are out of scope for MVP.
- Minimal UI consistent with internal demo-level quality and usability.
- No analytics or telemetry in MVP.

## 2. User Problem

Manual flashcard creation is slow and repetitive, which discourages consistent use of spaced repetition despite its efficacy. Users need a way to quickly transform learning material into accurate flashcards and maintain a clean workflow to validate AI suggestions. Common pain points include:

- High time cost to create and curate cards from raw study material.
- Inconsistent quality when drafting cards without a review structure.
- Frustration when tools either overcomplicate setup or lose draft work.
- Lack of clear error feedback that slows down correction and iteration.

This MVP addresses these by:

- Enabling rapid AI-assisted candidate generation initiated manually by the user.
- Presenting candidates in a dedicated review queue with accept/edit/discard actions.
- Preserving only accepted cards to avoid clutter and maintain quality.
- Enforcing simple, clear input limits (front: 200 characters, back: 500 characters) with inline validation.

## 3. Functional Requirements

3.1 Accounts and Authentication

- Email/password signup, login, logout.
- Ability to change password and delete account.
- Basic session management; session expiration logs out users and clears in-session AI candidates.

  3.2 Flashcard Management (Manual)

- Create, read, update, delete flashcards stored per user in PostgreSQL.
- Flashcard fields: front (<=200 chars), back (<=500 chars), timestamps, user ownership.
- Inline validation on create/edit actions with clear error messages.
- Store in database source of flashcards (AI, manual, etc.)

  3.3 AI Flashcard Generation and Review Queue

- Users manually trigger AI generation after entering source text or selecting content.
- AI-generated candidates exist only during the active session; not stored in the database until accepted.
- Review queue interface to display candidates with actions: accept, edit, discard.
- Edit flow within the queue must enforce the same input limits as manual creation.
- Retry option on failed AI generation; show descriptive, user-friendly error messages.
- Prevent duplicate saves from rapid repeated actions (idempotent accept).
- Store in database (in separate table) statistics related to flashcard generation, e.g. duration, who generated flashcard, when accepted or discarded, etc.

  3.4 Data and Persistence

- PostgreSQL schema with minimal relational structure:
  - users: id, email (unique), password_hash, created_at, updated_at.
  - flashcards: id, user_id (FK), front, back, created_at, updated_at.
- AI-generated candidates remain in temporary session cache (not persisted) until accepted.

  3.5 Error Handling and Validation

- Inline validation errors for exceeding text limits on front/back.
- Display encountered errors to the user for all operations (auth, CRUD, AI generation).
- Provide retry on AI errors; do not auto-retry without user action in MVP.
- All errors related to Flashcard generation should be stored in the database in the way that it can be connected to specific user.

  3.6 Security and Privacy (MVP scope)

- Hash passwords with industry-standard algorithm.
- Enforce authenticated access to all flashcard operations.
- Clear all in-session AI candidates on logout or session expiration.

  3.7 Spaced Repetition Integration (Deferred)

- The specific open-source algorithm is not yet selected.
- MVP will be designed to support future integration (e.g., add fields later without breaking core flows).
- No practice review session required for MVP; focus remains on candidate review and card CRUD.

  3.8 Performance and Reliability (MVP constraints)

- No specific latency SLAs; prioritize reliability and clear error reporting.
- Manual trigger for AI limits unnecessary API usage.

## 4. Product Boundaries

In Scope

- Email/password authentication and session management.
- Manual flashcard CRUD with inline validation (200/500 char limits).
- AI-assisted candidate generation triggered manually by the user.
- Review queue to accept, edit, or discard AI-generated candidates.
- Display of descriptive error messages; retry for AI failures.
- PostgreSQL persistence for user accounts and accepted flashcards only.

Out of Scope (MVP)

- Mobile apps (iOS/Android) and browser extensions.
- Analytics, usage tracking, or reporting on accept/edit/discard rates.
- Flashcard sets, tags, or grouping beyond a single flat per-user collection.
- Automatic AI generation or background generation.
- Final selection and integration of the spaced repetition algorithm.
- Collaboration, sharing, or multiplayer features.
- Localization and advanced accessibility beyond basic form semantics.

Assumptions and Dependencies

- Stable access to the chosen AI provider; failures are surfaced to users with retry.
- Minimalist UI suitable for internal demo.
- Future compatibility: database schema can be extended to support spaced repetition without migration complexity.

## 5. User Stories

US-001

- Title: Sign up with email and password
- Description: As a new user, I want to create an account with my email and a password so I can securely access my flashcards.
- Acceptance Criteria:
  - Given I provide a valid, unused email and a strong password, when I submit the sign-up form, then my account is created and I am signed in.
  - Given I provide an email already in use, when I submit, then I see a clear error indicating the email is taken.
  - Given I provide invalid inputs, when I submit, then I see inline validation errors without losing form data.

US-002

- Title: Log in to my account
- Description: As a returning user, I want to log in using my email and password so I can access my stored flashcards.
- Acceptance Criteria:
  - Given valid credentials, when I submit the login form, then I am signed in and redirected to my dashboard.
  - Given invalid credentials, when I submit, then I see an error without revealing which field is incorrect.

US-003

- Title: Log out
- Description: As a signed-in user, I want to log out so I can end my session securely.
- Acceptance Criteria:
  - Given I am signed in, when I click log out, then my session ends and I am redirected to the login screen.
  - Given I have AI-generated candidates in session, when I log out, then all candidates are cleared and not persisted.

US-004

- Title: Change password
- Description: As a signed-in user, I want to change my password so I can maintain account security.
- Acceptance Criteria:
  - Given I provide the correct current password and a valid new password, when I submit, then my password is updated.
  - Given I provide an incorrect current password, when I submit, then I see an error.

US-005

- Title: Delete account
- Description: As a signed-in user, I want to delete my account so my personal data and flashcards are removed.
- Acceptance Criteria:
  - Given I confirm account deletion, when I proceed, then my account and all associated flashcards are deleted.
  - Given I cancel, when prompted, then no data is deleted.

US-006

- Title: Session expiration
- Description: As a signed-in user, I want the system to log me out on session expiration and clear AI candidates.
- Acceptance Criteria:
  - Given my session expires, when I next interact or refresh, then I am asked to log in again and any in-session candidates are cleared.

US-010

- Title: Create a manual flashcard
- Description: As a user, I want to create a flashcard manually by entering front and back text.
- Acceptance Criteria:
  - Given I enter front (<=200 chars) and back (<=500 chars), when I save, then the flashcard is created and stored to my account.
  - Given I exceed limits, when I attempt to save, then inline errors appear and the card is not saved.

US-012

- Title: Edit a stored flashcard
- Description: As a user, I want to update the front and/or back of an existing flashcard.
- Acceptance Criteria:
  - Given a stored card, when I open it and make changes within limits, then saving updates the card.
  - Given I exceed limits, then inline errors prevent saving.

US-013

- Title: Delete a stored flashcard
- Description: As a user, I want to delete a flashcard I no longer need.
- Acceptance Criteria:
  - Given a stored card, when I delete and confirm, then the card is removed from my account.

US-014

- Title: View my flashcards
- Description: As a user, I want to view a list of my stored flashcards.
- Acceptance Criteria:
  - Given I am signed in, when I open the flashcards page, then I see my cards with front preview and an option to view/edit/delete.

US-020

- Title: Enter source text and trigger AI generation
- Description: As a user, I want to paste or type source content and manually trigger AI generation of flashcard candidates.
- Acceptance Criteria:
  - Given I provide input and click Generate, then a request is sent to the AI service.
  - Given the request is successful, then candidates appear in the review queue.
  - Given I have not provided any input (if required), then I see a validation error prompting for content.

US-021

- Title: Display AI-generated candidate queue
- Description: As a user, I want to see all AI-generated candidates in a review queue during my session.
- Acceptance Criteria:
  - Given candidates are returned, when I open the queue, then I see each candidate's front and back.
  - Given there are no candidates, then I see an empty state message with guidance to generate.

US-022

- Title: Accept a candidate to save as a flashcard
- Description: As a user, I want to accept a candidate so it is stored to my account.
- Acceptance Criteria:
  - Given I click Accept on a candidate, when the save succeeds, then the card appears in my stored flashcards and is removed from the queue.
  - Given a transient error occurs, then I see an error message and the candidate remains in the queue.

US-023

- Title: Edit a candidate before acceptance
- Description: As a user, I want to edit the front/back of a candidate before saving it.
- Acceptance Criteria:
  - Given I click Edit, when I modify within limits and click Save & Accept, then the edited card is stored.
  - Given I exceed limits, then inline errors prevent acceptance.

US-024

- Title: Discard a candidate
- Description: As a user, I want to discard an unwanted candidate from the queue.
- Acceptance Criteria:
  - Given I click Discard, then the candidate is removed from the queue and not saved to my account.

US-025

- Title: Retry AI generation
- Description: As a user, I want to retry generation when a failure occurs.
- Acceptance Criteria:
  - Given the AI request fails, when I click Retry, then the system attempts generation again and updates the queue accordingly.

US-027

- Title: Session-only persistence of candidates
- Description: As a user, I want AI-generated candidates to exist only during my active session unless accepted.
- Acceptance Criteria:
  - Given I navigate away or log out, when my session ends, then unaccepted candidates are cleared.
  - Given I refresh within the active session, then candidates remain available if the session is still valid.

US-030

- Title: Prevent duplicate save on rapid clicks
- Description: As a user, I want the system to avoid duplicate flashcards if I click Accept multiple times rapidly.
- Acceptance Criteria:
  - Given I double-click Accept, then only one flashcard is created and the UI disables the action while saving.

US-031

- Title: Clear candidates on logout
- Description: As a user, I want confirmation that AI candidates will be cleared on logout.
- Acceptance Criteria:
  - Given I have candidates and click Logout, then after logout candidates are gone and not persisted.

US-032

- Title: View flashcard details
- Description: As a user, I want to view the full front and back of a stored flashcard.
- Acceptance Criteria:
  - Given I click a card in my list, then I can see its full content and actions to edit or delete.

Security-focused story
US-040

- Title: Enforce authenticated access
- Description: As a user, I want all flashcard operations restricted to authenticated sessions so my data remains private.
- Acceptance Criteria:
  - Given I am not authenticated, when I attempt to access any flashcard endpoints or pages, then I am redirected to login.
  - Given I am authenticated, when I access my flashcards, then only my data is returned.

## 6. Success Metrics

Functional success (for internal demo)

- The app supports end-to-end manual flashcard CRUD with length validation.
- Users can manually trigger AI generation; candidates appear in-session only.
- The review queue enables accept, edit-with-validation, and discard flows.
- Accepted candidates are persisted; unaccepted candidates are never saved.
- Clear error messages appear for all failure scenarios with retry for AI generation.

Technical quality gates

- Authentication enforced for all CRUD endpoints and pages.
- No duplicate cards created via rapid interactions within the review queue accept flow.
- All input validations enforced consistently (200/500 chars).

Checklist review

- Each user story is testable with clear acceptance criteria.
- Authentication and authorization requirements included (US-040).
- The set of user stories covers a fully functional MVP per scope.
- Error handling and inline validations are explicitly defined.
