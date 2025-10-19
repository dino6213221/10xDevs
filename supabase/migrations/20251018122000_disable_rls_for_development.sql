-- migration: disable rls for development
-- filename: 20251018122000_disable_rls_for_development.sql
-- purpose: disable row level security on all tables for development purposes
-- note: this allows unrestricted access to tables during development

-- disable row level security on flashcards table
alter table flashcards disable row level security;

-- disable row level security on users table
alter table users disable row level security;

-- disable row level security on flashcard_generation_statistics table
alter table flashcard_generation_statistics disable row level security;

-- disable row level security on spaced_repetition_history table
alter table spaced_repetition_history disable row level security;
