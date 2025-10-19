# REST API Plan

## 1. Resources

- **Users**: Maps to the "users" table. This resource handles account management including signup, login, password updates, and deletion.
- **Flashcards**: Maps to the "flashcards" table. This resource stores user-created flashcards with validated text lengths (front <=200 chars, back <=500 chars).
- **Flashcard Generation Statistics**: Maps to the "flashcard_generation_statistics" table. This resource records statistics of AI generation processes.
- **Spaced Repetition History**: Maps to the "spaced_repetition_history" table. This resource is included for future integration of spaced repetition functionality.

## 2. Endpoints

### 2.1 User Endpoints

- **POST /api/signup**
  - Description: Create a new account.
  - Request Payload:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPassword123!"
    }
    ```
  - Response Payload:
    ```json
    {
      "userId": 1,
      "message": "Account successfully created"
    }
    ```
  - Success Codes: 201 (Created)
  - Error Codes: 400 (Validation error), 409 (Email already exists)

- **POST /api/login**
  - Description: Authenticate and login the user.
  - Request Payload:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPassword123!"
    }
    ```
  - Response Payload:
    ```json
    {
      "token": "JWT-token-string",
      "userId": 1,
      "message": "Login successful"
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 401 (Unauthorized), 400 (Validation error)

- **POST /api/logout**
  - Description: Logout the user and clear session; clears any transient AI-generated candidates.
  - Request Payload: _None (session-based via token)_
  - Response Payload:
    ```json
    {
      "message": "Logout successful, session cleared"
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 401 (Unauthorized)

- **PUT /api/users/password**
  - Description: Change the password for the authenticated user.
  - Request Payload:
    ```json
    {
      "currentPassword": "CurrentPassword!",
      "newPassword": "NewStrongPassword!"
    }
    ```
  - Response Payload:
    ```json
    {
      "message": "Password updated successfully"
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 400 (Validation error), 401 (Unauthorized)

- **DELETE /api/users**
  - Description: Delete the authenticated user's account and all associated data.
  - Request Payload: _None (confirmation via URL param or header)_
  - Response Payload:
    ```json
    {
      "message": "Account and associated flashcards deleted"
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 401 (Unauthorized)

### 2.2 Flashcards Endpoints (Manual CRUD)

- **POST /api/flashcards**
  - Description: Create a new manual flashcard.
  - Request Payload:
    ```json
    {
      "front": "Front text up to 200 characters",
      "back": "Back text up to 500 characters",
      "source": "manual"
    }
    ```
  - Response Payload:
    ```json
    {
      "flashcardId": 1,
      "message": "Flashcard created successfully"
    }
    ```
  - Success Codes: 201 (Created)
  - Error Codes: 400 (Validation errors such as text length), 401 (Unauthorized)

- **GET /api/flashcards**
  - Description: Retrieve a paginated list of flashcards for the authenticated user.
  - Query Parameters:
    - `page`: Page number (default 1)
    - `limit`: Number of items per page (default 10)
    - `sort`: Field to sort by (e.g., created_at)
    - `order`: asc/desc
  - Response Payload:
    ```json
    {
      "flashcards": [
        {
          "id": 1,
          "front": "Flashcard front",
          "back": "Flashcard back",
          "created_at": "2025-10-18T12:00:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 25
      }
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 401 (Unauthorized)

- **GET /api/flashcards/{id}**
  - Description: Retrieve detailed information of a single flashcard.
  - Response Payload:
    ```json
    {
      "id": 1,
      "front": "Flashcard front",
      "back": "Flashcard back",
      "created_at": "2025-10-18T12:00:00Z",
      "updated_at": "2025-10-18T12:05:00Z"
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 404 (Not Found), 401 (Unauthorized)

- **PUT /api/flashcards/{id}**
  - Description: Update an existing flashcard.
  - Request Payload:
    ```json
    {
      "front": "Updated front text",
      "back": "Updated back text"
    }
    ```
  - Response Payload:
    ```json
    {
      "message": "Flashcard updated successfully"
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 400 (Validation errors), 404 (Not Found), 401 (Unauthorized)

- **DELETE /api/flashcards/{id}**
  - Description: Delete an existing flashcard.
  - Response Payload:
    ```json
    {
      "message": "Flashcard deleted successfully"
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 404 (Not Found), 401 (Unauthorized)

### 2.3 AI Generation and Review Queue Endpoints

Note: AI-generated candidates exist only during the active session and are not persisted until accepted.

- **POST /api/ai/generate**
  - Description: Trigger AI generation of flashcard candidates using source text.
  - Request Payload:
    ```json
    {
      "sourceText": "Text from which to generate candidate flashcard",
      "options": {}
    }
    ```
  - Response Payload:
    ```json
    {
      "candidate": {
        "front": "AI suggested front text",
        "back": "AI suggested back text"
      },
      "generationDurationMs": 350
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 400 (Missing or invalid source text), 500 (AI generation error with descriptive error message)

- **GET /api/ai/candidates**
  - Description: Retrieve the current session’s list of AI-generated candidates.
  - Response Payload:
    ```json
    {
      "candidates": [
        {
          "id": "temp-1",
          "front": "Candidate front text",
          "back": "Candidate back text"
        }
      ]
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 401 (Unauthorized)

- **POST /api/ai/candidates/{candidateId}/accept**
  - Description: Accept an AI-generated candidate to save as a flashcard. Implements idempotency to prevent duplicate saves on rapid clicks.
  - Request Payload:
    ```json
    {
      "front": "Optionally edited front text (<=200 chars)",
      "back": "Optionally edited back text (<=500 chars)"
    }
    ```
  - Response Payload:
    ```json
    {
      "flashcardId": 2,
      "message": "Candidate accepted and flashcard created"
    }
    ```
  - Success Codes: 201 (Created)
  - Error Codes: 400 (Validation errors), 409 (Duplicate action), 401 (Unauthorized)

- **PUT /api/ai/candidates/{candidateId}/edit**
  - Description: Edit a candidate before acceptance.
  - Request Payload:
    ```json
    {
      "front": "Edited front text",
      "back": "Edited back text"
    }
    ```
  - Response Payload:
    ```json
    {
      "message": "Candidate updated. Please submit accept action to persist."
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 400 (Validation errors), 401 (Unauthorized)

- **DELETE /api/ai/candidates/{candidateId}**
  - Description: Discard an AI-generated candidate.
  - Response Payload:
    ```json
    {
      "message": "Candidate discarded"
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 401 (Unauthorized)

- **POST /api/ai/generate/{candidateId}/retry**
  - Description: Retry AI generation for a candidate that previously failed.
  - Request Payload: _None (Candidate re-generation based on stored source text)_
  - Response Payload:
    ```json
    {
      "candidate": {
        "front": "New AI suggested front text",
        "back": "New AI suggested back text"
      },
      "generationDurationMs": 400
    }
    ```
  - Success Codes: 200 (OK)
  - Error Codes: 500 (AI generation error), 401 (Unauthorized)

## 3. Authentication and Authorization

- All endpoints require an authentication token (e.g., JWT) sent in the Authorization header.
- User accounts use email/password signup; passwords are hashed using an industry-standard algorithm before storage.
- Backend row-level security (RLS) on the flashcards table ensures that users can only access their own flashcards.
- Endpoints for flashcards and AI candidate operations enforce authenticated access to ensure data privacy.

## 4. Validation and Business Logic

- **Validation Conditions:**
  - Flashcard "front" field must not exceed 200 characters.
  - Flashcard "back" field must not exceed 500 characters.
  - Inline validation errors are returned for any text limits exceeded during create or update operations.
- **Business Logic Implementation:**
  - **User Management:** Business rules include unique email enforcement and session management with automatic clearance of transient AI candidates on logout or session expiration.
  - **Flashcard CRUD:** Manual creation, updating, and deletion of flashcards leverage standard CRUD operations with inline validations.
  - **AI Candidate Management:** AI-generated candidates are transient (stored only in session) and subject to review actions (accept, edit, discard). Idempotency is enforced on the candidate acceptance endpoint to prevent duplicate flashcard creation.
  - **Review Queue:** Provides a dedicated endpoint to view and manage AI candidates, ensuring that only accepted candidates are persisted, while others remain ephemeral.
  - **Error Handling:** All endpoints provide clear error messages with appropriate HTTP error codes, and the retry mechanism for AI generation addresses temporary failures.

This API plan is designed to integrate seamlessly with the provided tech stack (Astro with React for frontend, Supabase and PostgreSQL for backend, and Openrouter.ai for AI services) ensuring a robust, secure, and efficient MVP implementation.
