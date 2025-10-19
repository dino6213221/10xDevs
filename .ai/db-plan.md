# AI Flashcards MVP - PostgreSQL Database Schema

## 1. List of Tables

### 1.1 Users

This table is managed by Supabase Auth.

- **id**: SERIAL PRIMARY KEY
- **email**: VARCHAR(255) NOT NULL UNIQUE  
  _Constraint_: Unique constraint on email.
- **password_hash**: TEXT NOT NULL  
  _Note_: Should store industry-standard hashed passwords.
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 1.2 Flashcards

- **id**: SERIAL PRIMARY KEY
- **user_id**: INTEGER NOT NULL  
  _Foreign Key_: References users(id) with ON DELETE CASCADE.
- **front**: VARCHAR(200) NOT NULL  
  _Constraint_: Maximum length of 200 characters.
- **back**: VARCHAR(500) NOT NULL  
  _Constraint_: Maximum length of 500 characters.
- **source**: VARCHAR(50) NOT NULL DEFAULT 'manual'  
  _Note_: Indicates flashcard origin (e.g., "manual", "AI").
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 1.3 Flashcard Generation Statistics

- **id**: SERIAL PRIMARY KEY
- **user_id**: INTEGER NOT NULL  
  _Foreign Key_: References users(id) with ON DELETE CASCADE.
- **flashcard_id**: INTEGER NULL  
  _Foreign Key_: References flashcards(id) (if accepted).
- **generation_duration_ms**: INTEGER NOT NULL  
  _Note_: Duration of AI generation in milliseconds.
- **status**: VARCHAR(20) NOT NULL  
  _Possible values_: 'accepted', 'discarded', 'failed'.
- **error_message**: TEXT NULL  
  _Note_: Stores error details if generation fails.
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 1.4 Spaced Repetition History (Placeholder)

- **id**: SERIAL PRIMARY KEY
- **flashcard_id**: INTEGER NOT NULL  
  _Foreign Key_: References flashcards(id) with ON DELETE CASCADE.
- **review_date**: TIMESTAMPTZ NOT NULL  
  _Note_: Date of the review session.
- **next_review_date**: TIMESTAMPTZ NULL  
  _Note_: Next planned review date.
- **performance_rating**: INTEGER NULL  
  _Note_: Rating for performance review.

## 2. Relationships Between Tables

- **Users ⇢ Flashcards**: One-to-Many (A user can have multiple flashcards). Cascade deletion is applied.
- **Users ⇢ Flashcard Generation Statistics**: One-to-Many (A user can trigger multiple generation events).
- **Flashcards ⇢ Flashcard Generation Statistics**: One-to-Many (A generated flashcard event may reference a stored flashcard).
- **Flashcards ⇢ Spaced Repetition History**: One-to-Many (Each flashcard can have multiple spaced repetition history entries).

## 3. Indexes

- **Users Table**:
  - Unique index on `email`.
- **Flashcards Table**:
  - Index on `user_id` for optimized query performance.
  - Index on `created_at` to speed up sorting and date-based queries.
- **Flashcard Generation Statistics Table**:
  - Index on `user_id` for tracking generation events.
- **Spaced Repetition History Table**:
  - Index on `flashcard_id` for efficient look-ups.

## 4. PostgreSQL Row-Level Security (RLS) Policies

For the Flashcards table:

-- Enable RLS on flashcards table
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only the owning user to access their flashcards
CREATE POLICY flashcard_owner_policy ON flashcards
USING (user_id = current_setting('app.current_user_id')::INTEGER);

## 5. Additional Notes and Explanations

- **Password Security**: Store passwords in the `password_hash` column using industry-standard salted and hashed mechanisms.
- **Cascade Deletion**: On deletion of a user, all their flashcards and related generation stats are automatically removed.
- **Data Validation**: Enforced at the database level with VARCHAR length restrictions.
- **Future Integration**: The `spaced_repetition_history` table is defined as a placeholder for future spaced repetition functionalities.
- **Logging and Monitoring**: The Flashcard Generation Statistics table allows tracking of AI generation performance and errors.
