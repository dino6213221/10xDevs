-- migration: create ai flashcards mvp schema
-- filename: 20251017120000_create_ai_flashcards_schema.sql
-- purpose: create tables for users, flashcards, flashcard_generation_statistics and spaced_repetition_history with proper security (rls) and indexes.
-- note: all sql is in lowercase; destructive commands have copious comments

--------------------------------------------------------------------------------
-- table: users
--------------------------------------------------------------------------------
create table if not exists users (
    id serial primary key,
    email varchar(255) not null unique,  -- unique constraint on email
    password_hash text not null,         -- store hashed password
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- enable row level security on users table
alter table users enable row level security;

-- rls policies for users table
-- policy for select by anon role: allow only if the record belongs to the current user
-- create policy users_select_anon on users
--     for select
--     to anon
--     using (id = current_setting('app.current_user_id')::integer);

-- policy for select by authenticated role
-- create policy users_select_authenticated on users
--     for select
--     to authenticated
--     using (id = current_setting('app.current_user_id')::integer);

-- policy for insert by anon role
-- create policy users_insert_anon on users
--     for insert
--     to anon
--     with check (true);  -- allow anonymous insert, adjust as needed

-- policy for insert by authenticated role
-- create policy users_insert_authenticated on users
--     for insert
--     to authenticated
--     with check (id = current_setting('app.current_user_id')::integer);

-- policy for update by anon role
-- create policy users_update_anon on users
--     for update
--     to anon
--     using (id = current_setting('app.current_user_id')::integer)
--     with check (id = current_setting('app.current_user_id')::integer);

-- policy for update by authenticated role
-- create policy users_update_authenticated on users
--     for update
--     to authenticated
--     using (id = current_setting('app.current_user_id')::integer)
--     with check (id = current_setting('app.current_user_id')::integer);

-- policy for delete by anon role
-- create policy users_delete_anon on users
--     for delete
--     to anon
--     using (id = current_setting('app.current_user_id')::integer);

-- policy for delete by authenticated role
-- create policy users_delete_authenticated on users
--     for delete
--     to authenticated
--     using (id = current_setting('app.current_user_id')::integer);

--------------------------------------------------------------------------------
-- table: flashcards
--------------------------------------------------------------------------------
create table if not exists flashcards (
    id serial primary key,
    user_id integer not null,  -- foreign key: references users(id) with on delete cascade
    front varchar(200) not null,  -- maximum length 200 characters
    back varchar(500) not null,   -- maximum length 500 characters
    source varchar(50) not null default 'manual',  -- flashcard origin (manual, ai, etc.)
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_user
        foreign key (user_id)
            references users (id)
            on delete cascade
);

-- create indexes for flashcards
create index if not exists idx_flashcards_user_id on flashcards(user_id);
create index if not exists idx_flashcards_created_at on flashcards(created_at);

-- enable row level security on flashcards table
alter table flashcards enable row level security;

-- rls policies for flashcards table: allow only owning user
-- select policies for flashcards
-- create policy flashcards_select_anon on flashcards
--     for select
--     to anon
--     using (user_id = current_setting('app.current_user_id')::integer);

-- create policy flashcards_select_authenticated on flashcards
--     for select
--     to authenticated
--     using (user_id = current_setting('app.current_user_id')::integer);

-- insert policies for flashcards
-- create policy flashcards_insert_anon on flashcards
--     for insert
--     to anon
--     with check (user_id = current_setting('app.current_user_id')::integer);

-- create policy flashcards_insert_authenticated on flashcards
--     for insert
--     to authenticated
--     with check (user_id = current_setting('app.current_user_id')::integer);

-- update policies for flashcards
-- create policy flashcards_update_anon on flashcards
--     for update
--     to anon
--     using (user_id = current_setting('app.current_user_id')::integer)
--     with check (user_id = current_setting('app.current_user_id')::integer);

-- create policy flashcards_update_authenticated on flashcards
--     for update
--     to authenticated
--     using (user_id = current_setting('app.current_user_id')::integer)
--     with check (user_id = current_setting('app.current_user_id')::integer);

-- delete policies for flashcards
-- create policy flashcards_delete_anon on flashcards
--     for delete
--     to anon
--     using (user_id = current_setting('app.current_user_id')::integer);

-- create policy flashcards_delete_authenticated on flashcards
--     for delete
--     to authenticated
--     using (user_id = current_setting('app.current_user_id')::integer);

--------------------------------------------------------------------------------
-- table: flashcard_generation_statistics
--------------------------------------------------------------------------------
create table if not exists flashcard_generation_statistics (
    id serial primary key,
    user_id integer not null,  -- foreign key: references users(id) with on delete cascade
    flashcard_id integer,      -- foreign key: references flashcards(id) (if accepted)
    generation_duration_ms integer not null,  -- duration in milliseconds
    status varchar(20) not null,  -- possible values: 'accepted', 'discarded', 'failed'
    error_message text,         -- stores error details if generation fails
    created_at timestamptz not null default now(),
    constraint fk_user_stats
        foreign key (user_id)
            references users (id)
            on delete cascade,
    constraint fk_flashcard_stats
        foreign key (flashcard_id)
            references flashcards (id)
);

-- create index for flashcard_generation_statistics
create index if not exists idx_stats_user_id on flashcard_generation_statistics(user_id);

-- enable row level security on flashcard_generation_statistics table
alter table flashcard_generation_statistics enable row level security;

-- rls policies for flashcard_generation_statistics table
-- for simplicity, restrict access to records where the user_id matches the current user
-- create policy fgs_select_anon on flashcard_generation_statistics
--     for select
--     to anon
--     using (user_id = current_setting('app.current_user_id')::integer);

-- create policy fgs_select_authenticated on flashcard_generation_statistics
--     for select
--     to authenticated
--     using (user_id = current_setting('app.current_user_id')::integer);

-- create policy fgs_insert_anon on flashcard_generation_statistics
--     for insert
--     to anon
--     with check (user_id = current_setting('app.current_user_id')::integer);

-- create policy fgs_insert_authenticated on flashcard_generation_statistics
--     for insert
--     to authenticated
--     with check (user_id = current_setting('app.current_user_id')::integer);

-- create policy fgs_update_anon on flashcard_generation_statistics
--     for update
--     to anon
--     using (user_id = current_setting('app.current_user_id')::integer)
--     with check (user_id = current_setting('app.current_user_id')::integer);

-- create policy fgs_update_authenticated on flashcard_generation_statistics
--     for update
--     to authenticated
--     using (user_id = current_setting('app.current_user_id')::integer)
--     with check (user_id = current_setting('app.current_user_id')::integer);

-- create policy fgs_delete_anon on flashcard_generation_statistics
--     for delete
--     to anon
--     using (user_id = current_setting('app.current_user_id')::integer);

-- create policy fgs_delete_authenticated on flashcard_generation_statistics
--     for delete
--     to authenticated
--     using (user_id = current_setting('app.current_user_id')::integer);

--------------------------------------------------------------------------------
-- table: spaced_repetition_history
--------------------------------------------------------------------------------
create table if not exists spaced_repetition_history (
    id serial primary key,
    flashcard_id integer not null,  -- foreign key: references flashcards(id) with on delete cascade
    review_date timestamptz not null,  -- date of review session
    next_review_date timestamptz,      -- planned next review date
    performance_rating integer,        -- rating for performance review
    constraint fk_flashcard_history
        foreign key (flashcard_id)
            references flashcards (id)
            on delete cascade
);

-- create index for spaced_repetition_history
create index if not exists idx_history_flashcard_id on spaced_repetition_history(flashcard_id);

-- enable row level security on spaced_repetition_history table
alter table spaced_repetition_history enable row level security;

-- rls policies for spaced_repetition_history table
-- as this is a placeholder for future functionality, using a simple true condition for now
-- create policy srh_select_anon on spaced_repetition_history
--     for select
--     to anon
--     using (true);

-- create policy srh_select_authenticated on spaced_repetition_history
--     for select
--     to authenticated
--     using (true);

-- create policy srh_insert_anon on spaced_repetition_history
--     for insert
--     to anon
--     with check (true);

-- create policy srh_insert_authenticated on spaced_repetition_history
--     for insert
--     to authenticated
--     with check (true);

-- create policy srh_update_anon on spaced_repetition_history
--     for update
--     to anon
--     using (true)
--     with check (true);

-- create policy srh_update_authenticated on spaced_repetition_history
--     for update
--     to authenticated
--     using (true)
--     with check (true);

-- create policy srh_delete_anon on spaced_repetition_history
--     for delete
--     to anon
--     using (true);

-- create policy srh_delete_authenticated on spaced_repetition_history
--     for delete
--     to authenticated
--     using (true);

--------------------------------------------------------------------------------
-- end of migration
--------------------------------------------------------------------------------
