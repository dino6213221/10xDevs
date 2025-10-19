# Authentication and User Management Technical Specification

This document outlines the architecture for user registration, login, and password recovery as part of the AI Flashcards MVP. It ensures compatibility with existing application behavior and integrates with the specified tech stack (Astro, React, Supabase, Tailwind, etc.).

---

## 1. User Interface Architecture

### 1.1 Overview
- **Frontend Framework:** Astro for static pages and page routing, integrated with React components for interactive features.
- **UI Library:** Shadcn/ui with Tailwind for styled components and accessible design.
- **Language:** TypeScript for type safety in UI and component logic.

### 1.2 Page and Component Structure
- **Astro Pages:**
  - **/login:** Displays the login form and handles redirection upon successful authentication.
  - **/signup:** Presents the email/password registration page with inline validations.
  - **/recover:** Provides password recovery functionality and user prompts.
  - **/flashcards:** Authenticated view displaying user flashcards, review queue, and navigation.
- **React Components:**
  - **AuthForm:** A reusable form component for both sign-up and login pages that implements inline validation and error handling.
  - **PasswordRecoveryForm:** Handles the submission process for resetting the password.

### 1.3 Separation of Concerns
- **Astro pages** handle routing, server-side rendering (SSR) integration with the authentication backend, and layout definitions specific to authentication flows.
- **React components** (such as AuthForm and PasswordRecoveryForm) are responsible for managing form state, client-side validations (e.g., email format and password strength), and handling immediate user actions.
- **Shared logic:** Client-side forms utilize a common validation library to ensure input formats and required fields (without applying flashcard character limit validations, which are handled separately in flashcard-related modules).

### 1.4 Validation and Error Messaging
- **Inputs:** All forms include client-side validations ensuring:
  - Email format is valid.
  - Password meets strength requirements.
- **Error Displays:** Clear, descriptive messages are shown upon validation failures or backend error responses. The UI provides prompt feedback without losing user’s input.
- **Scenarios Handled:**
  - Existing account during registration.
  - Incorrect login credentials without revealing sensitive info.
  - Duplicate and rapid form submissions, ensuring idempotent behavior for accepting AI candidates.

---

## 2. Backend Logic

### 2.1 API Endpoints and Data Models
- **Endpoints:**
  - `POST /api/auth/signup`: Create a new user account.
  - `POST /api/auth/login`: Authenticate user and start a session.
  - `POST /api/auth/logout`: Invalidate current user session and clear in-session AI candidates.
  - `POST /api/auth/change-password`: Validate current password and update to a new one.
  - `DELETE /api/auth/delete-account`: Remove user account and associated flashcards.
- **Data Models:**
  - **User:** Contains id, email, password_hash, timestamps.
  - **Flashcard:** Contains reference to user
- **Logging:**
  - **Error Logging:** Structured to record errors encountered during AI generation (with user-defined error codes to map to specific operational events).

### 2.2 Input Data Validation and Exception Handling
- **Validation Layer:** 
  - Utilize middleware or validation libraries to verify input lengths, password format, and email structure.
  - Enforce rules before data reaches business logic.
- **Exception Handling:**
  - Centralized error handler returns standardized error responses.
- **Server-side Rendering Update:**
  - Update the SSR layer (integrated via Astro’s configuration in @astro.config.mjs) to include user session information in authenticated routes.
  - Seamlessly integrate with Supabase Auth to check session validity and roles during page generation.

---

## 3. Authentication System

### 3.1 Use of Supabase Auth
- **Integration:** 
  - Leverage Supabase’s built-in authentication for email/password sign-up, login, logout, and password recovery.
  - Utilize Supabase client libraries on both the frontend and API endpoints for session validation.
- **Client-side:**
  - After successful sign-up/login, store session tokens in memory and optionally secure cookies.
  - Ensure session persistence, automatic logout on expiry, and clearing of transient AI candidates upon logout.
- **Server-side:**
  - Implement middleware to check for authenticated sessions before processing API requests.
  - Bind current user context to each request to ensure user-specific operations (US-001, US-002, US-003, US-004, US-005, US-006, and US-040).
- **Password Recovery:**
  - Utilize Supabase's password reset flows integrated via secure email links.
  - Provide an additional endpoint to trigger password reset and notify via email.
- **Security Considerations:**
  - Secure password storage (hashing with industry-standard algorithm).
  - Reduce attack surface by exposing only necessary API endpoints to authenticated users.
  - Maintain session integrity by enforcing server-side session checks on each data operation.

---

## 4. Mapping to Authentication User Stories

The following user stories are fully supported by this architecture:
- **US-001 (Sign Up):** The `POST /api/auth/signup` endpoint validates unused emails and strong passwords via Supabase Auth and returns inline errors for invalid inputs.
- **US-002 (Log In):** The `POST /api/auth/login` endpoint authenticates users with proper email and password validation, redirecting to the flashcard list on success and providing generic error messages on failure.
- **US-003 (Log Out):** The `POST /api/auth/logout` endpoint terminates the session and clears any transient, in-session AI candidates, ensuring a clean logout.
- **US-004 (Change Password):** The `POST /api/auth/change-password` endpoint verifies the current password and updates to a new valid password, providing error feedback when necessary.
- **US-005 (Delete Account):** The `DELETE /api/auth/delete-account` endpoint securely removes the user account and all associated data, including flashcards, with proper confirmation.
- **US-006 (Session Expiration):** The session management mechanism via Supabase includes automatic logout on expiration and ensures that transient AI-generated candidates are cleared.
- **US-040 (Enforce Authenticated Access):** Middleware integrated with Supabase ensures that all sensitive operations, including flashcard management, are accessible only to authenticated users.

## 5. Summary and Roadmap
- **Frontend:** Astro pages provide routing and SSR foundation while React components handle dynamic form interactions and validations for authentication.
- **Backend:** API endpoints for authentication operations include robust input validation and centralized exception handling.
- **Authentication:** Supabase Auth forms the backbone of the user management system, ensuring secure, scalable user operations across registration, login, session management, and password recovery.
- **Future Extensibility:** The modular design allows for additional integrations (e.g., spaced repetition algorithms and enhanced account management) without impacting core authentication functionality.

This detailed architecture ensures clarity in responsibilities between the client-side and server-side components, fully addressing the authentication-related user stories while aligning with the overall PRD and technical stack specifications.
