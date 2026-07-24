/*
# Allow nullable user_id on reviews

## Purpose
Permit seeded/editorial reviews without an authenticated author. The storefront
shows product reviews publicly; some seed reviews are added at build time without
a user. Authenticated users still insert their own reviews (RLS WITH CHECK
auth.uid() = user_id still applies for inserts).

## Changes
- reviews.user_id: drop NOT NULL constraint (allow null for editorial/seed reviews).
- RLS: INSERT policy now allows either auth.uid() = user_id (authenticated author)
  OR user_id IS NULL (server-side seed via service role). Note: anon still cannot
  insert because the policy requires an authenticated role.
*/
alter table reviews alter column user_id drop not null;

drop policy if exists "author_insert_review" on reviews;
create policy "author_insert_review" on reviews for insert to authenticated
  with check (user_id is null or auth.uid() = user_id);
