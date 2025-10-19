-- migration: add rls policies for flashcards
-- filename: 20251018120000_add_rls_policies.sql
-- purpose: add row level security policies for flashcards table to allow operations during development/testing
-- note: these policies allow all operations for anon role since authentication is not yet implemented

-- rls policies for flashcards table
-- allow all operations for anon role during development
create policy flashcards_select_anon on flashcards
    for select
    to anon
    using (true);

create policy flashcards_insert_anon on flashcards
    for insert
    to anon
    with check (true);

create policy flashcards_update_anon on flashcards
    for update
    to anon
    using (true)
    with check (true);

create policy flashcards_delete_anon on flashcards
    for delete
    to anon
    using (true);

-- allow all operations for authenticated role as well
create policy flashcards_select_authenticated on flashcards
    for select
    to authenticated
    using (true);

create policy flashcards_insert_authenticated on flashcards
    for insert
    to authenticated
    with check (true);

create policy flashcards_update_authenticated on flashcards
    for update
    to authenticated
    using (true)
    with check (true);

create policy flashcards_delete_authenticated on flashcards
    for delete
    to authenticated
    using (true);
