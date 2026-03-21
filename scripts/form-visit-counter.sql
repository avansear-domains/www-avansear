-- Run once in Supabase SQL Editor (Dashboard → SQL).
-- Set SUPABASE_SERVICE_ROLE_KEY in your deployment env (Vercel, etc.).

create table if not exists form_visit_counter (
  id text primary key,
  count bigint not null default 0
);

insert into form_visit_counter (id, count)
values ('default', 0)
on conflict (id) do nothing;

create or replace function increment_form_visit_count()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  update form_visit_counter
  set count = count + 1
  where id = 'default'
  returning count into new_count;

  if new_count is null then
    insert into form_visit_counter (id, count)
    values ('default', 1)
    returning count into new_count;
  end if;

  return new_count;
end;
$$;

revoke all on function increment_form_visit_count() from public;
grant execute on function increment_form_visit_count() to service_role;

alter table form_visit_counter enable row level security;
