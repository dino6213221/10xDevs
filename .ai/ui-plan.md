# UI Architecture for AI Flashcards MVP

## 1. UI Structure Overview

The UI is organized into three modular sections: authentication, flashcard management, and the AI generation/review queue. Each module is designed to separate concerns, promote reusability, and ensure that the MVP delivers a fluid experience. The interface is responsive using Tailwind CSS and leverages accessible Shadcn/ui components. Key state management is handled via React Context to synchronize with Supabase API endpoints, enforcing inline validations, security cues, and error feedback.

## 2. View List

**1. Login / Sign Up View**  
- **View path:** `/login` or `/signup`  
- **Main purpose:** Allow users to create an account or log in securely.  
- **Key information to display:**  
  - Form fields for email and password  
  - Inline validation messages for incorrect input or existing account issues  
  - Security notices (e.g., password strength, session expiry warnings)  
- **Key view components:**  
  - Authentication form components (email, password fields)  
  - Submit button with disabled state management during submission  
  - Error notification components  
- **UX, Accessibility, and Security considerations:**  
  - Clear error indication with ARIA-live regions  
  - Keyboard navigability and focus management  
  - Secure password fields and client-side encryption hints

**2. Dashboard / Flashcards List View**  
- **View path:** `/dashboard` or `/flashcards`  
- **Main purpose:** Display a paginated list of user-created flashcards with options to view details, edit, or delete.  
- **Key information to display:**  
  - Flashcard previews (front text) with quick actions  
  - Navigation to create a new flashcard or view flashcard details  
  - Session status and notifications about unaccepted AI candidates (if any)  
- **Key view components:**  
  - List/table/grid of flashcards  
  - Pagination controls for large datasets  
  - Action buttons for edit and delete with confirmation dialogues  
- **UX, Accessibility, and Security considerations:**  
  - Responsive layout accommodating various screen sizes  
  - Accessible table/list with proper ARIA roles and labels  
  - Visible session status indicator prompting re-authentication if expired

**3. Flashcard Create / Edit View**  
- **View path:** `/flashcards/new` and `/flashcards/:id/edit`  
- **Main purpose:** Allow users to manually create a new flashcard or edit an existing flashcard.  
- **Key information to display:**  
  - Input fields for flashcard front and back (with character counters matching 200/500 limits)  
  - Inline validations and error messages  
  - Save and cancel buttons  
- **Key view components:**  
  - Form components with text areas  
  - Character count feedback  
  - Action buttons with disabled states if validations fail  
- **UX, Accessibility, and Security considerations:**  
  - Screen-reader friendly error announcements  
  - Responsive input fields designed for both mobile and desktop  
  - Prevention of duplicate submissions through UI safeguards

**4. AI Generation Input View**  
- **View path:** `/ai/generate`  
- **Main purpose:** Enable users to input source text to trigger AI flashcard candidate generation.  
- **Key information to display:**  
  - Input area for source text  
  - Generate button to trigger AI call  
  - Immediate inline warning if input is empty or invalid  
- **Key view components:**  
  - Textarea for source text input  
  - Submit button with loading state  
  - Feedback notifications for request status and error messages  
- **UX, Accessibility, and Security considerations:**  
  - ARIA labels and descriptions for interactive elements  
  - Clear focus indicators and error state styling  
  - Optimistic UI feedback while waiting for API response

**5. AI Candidate Review Queue View**  
- **View path:** `/ai/review`  
- **Main purpose:** Display AI-generated flashcard candidates for user review, offering options to accept, edit, or discard each candidate.  
- **Key information to display:**  
  - List of all current session candidates with front and back texts  
  - Edit fields for making inline modifications  
  - Action buttons for Accept, Edit & Accept, Discard, and Retry for failed generations  
- **Key view components:**  
  - Candidate card component with edit mode  
  - Action buttons with idempotency safeguards and loading statuses  
  - Notifications for success or error messages  
- **UX, Accessibility, and Security considerations:**  
  - Keyboard navigability for each candidate action  
  - ARIA roles for candidate list items and live error/notification regions  
  - Disabled buttons to prevent rapid duplicate actions

**6. User Account Management View**  
- **View path:** `/account`  
- **Main purpose:** Allow users to change password, view session status, and delete their account.  
- **Key information to display:**  
  - Forms to change password with current and new password inputs  
  - Account deletion confirmation modal/dialog  
  - Session expiration warnings and display of authentication state  
- **Key view components:**  
  - Password change form with inline validation  
  - Modal dialogues for account deletion confirmation  
  - Notification components for session expiry alerts  
- **UX, Accessibility, and Security considerations:**  
  - Clear labeling, ARIA attributes for modals, and keyboard navigability  
  - Security confirmation steps for sensitive actions  
  - Immediate session feedback to avoid unauthorized operations

## 3. User Journey Map

1. **Authentication Flow:**  
   - New users land on the Sign Up view to create an account or use the Login view if returning.  
   - Upon successful login/signup, the user is redirected to the Dashboard.

2. **Flashcard Management Flow:**  
   - From the Dashboard, users can directly view all stored flashcards.  
   - Users choose to create a new flashcard, which takes them to the Create view where inline validations ensure proper input limits.  
   - Users can also select an existing flashcard to enter the Edit view.

3. **AI Generation and Review Flow:**  
   - Users navigate to the AI Generation Input view to enter source text.  
   - On submission, the AI generation process begins and successful candidates are stored temporarily.  
   - Users are then automatically routed to the AI Candidate Review Queue view to review candidates.  
   - In the review queue, users can (a) accept a candidate (which saves it as a flashcard and removes it from the queue), (b) edit then accept it, or (c) discard it.  
   - Retry options are available if AI generation fails.

4. **Account Management Flow:**  
   - From any view, users have access to the account management section via a global navigation bar.  
   - They can change passwords, view their authentication status, and, if needed, delete their account.  
   - When logging out, the system clears in-session AI candidates and redirects to the Login view.

## 4. Layout and Navigation Structure

- **Global Header / Navigation Bar:**  
  - Displays authentication state, links/buttons for Dashboard, AI Generation, and Account management.  
  - Includes logout functionality clearly visible with session expiry alerts.

- **Sidebar or Tab Navigation (optional for larger screens):**  
  - Provides quick access to Manual Flashcards and AI Review sections.  
  - Adaptively collapses into a hamburger menu on mobile devices.

- **Responsive Layouts:**  
  - Use Tailwind CSS responsive utilities ensuring grids, forms, and list components adapt from mobile through desktop.  
  - Ensure that interactive elements have adequate touch targets and spacing.

- **Breadcrumbs and Back Buttons:**  
  - For flows like flashcard editing and review queue, include breadcrumbs or back buttons to enable easy navigation back to the Dashboard or previous state.

## 5. Key Components

- **AuthForm Component:** Reusable component for both login and sign-up, enforcing inline validation, error handling, and secure input fields.  
- **FlashcardList Component:** Displays flashcards in a paginated, accessible list with preview actions.  
- **FlashcardForm Component:** Used for both creation and editing, includes character counters, inline validations, and submission safeguards.  
- **AIGenerator Component:** Accepts source text input and triggers AI generation; shows loading state and error notifications.  
- **AICandidateCard Component:** Represents an individual AI-generated candidate with inline edit capabilities, accept/discard actions, and retry support.  
- **Notification Component:** Global component to display error messages, confirmation alerts, and session notifications in an accessible manner.  
- **Modal Component:** For critical actions like account deletion, showing confirmations and ensuring focus trapping for accessibility.

This architecture maps directly to the product and API requirements while addressing potential failure points such as invalid inputs, rapid duplicate actions, and session expirations. It ensures all user stories are covered—from authentication and flashcard CRUD to AI candidate generation and review—while maintaining a responsive, accessible, and secure user interface.
