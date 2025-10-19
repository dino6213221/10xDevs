-- migration: add status field to flashcards table for proposal system
-- filename: 20251018130000_add_flashcard_status.sql
-- purpose: add status column to flashcards table to support proposal workflow where new flashcards start as 'proposal' and can be approved later
-- note: all sql is in lowercase; destructive commands have copious comments

--------------------------------------------------------------------------------
-- add status column to flashcards table
--------------------------------------------------------------------------------

-- add status column with default value 'approved' for existing flashcards
-- new flashcards will be created with 'proposal' status
alter table flashcards add column status varchar(20) not null default 'approved';

-- add check constraint to ensure status is one of the allowed values
alter table flashcards add constraint chk_flashcards_status check (status in ('proposal', 'approved'));

-- create index on status for efficient filtering
create index if not exists idx_flashcards_status on flashcards(status);

-- add comment to explain the status field
comment on column flashcards.status is 'status of the flashcard: proposal (draft, needs review) or approved (ready for use)';

--------------------------------------------------------------------------------
-- update existing data
--------------------------------------------------------------------------------

-- all existing flashcards should be marked as 'approved' since they were already created and presumably reviewed
-- the default value handles this, but let's be explicit for clarity
-- no update needed as default handles existing records

--------------------------------------------------------------------------------
-- end of migration
--------------------------------------------------------------------------------
