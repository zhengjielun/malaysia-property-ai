-- PropertyAI 房源表
create extension if not exists pgcrypto;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null,
  price numeric not null,
  property_type text,
  bedrooms integer,
  bathrooms integer,
  size_sqft integer,
  status text default '在售',
  purpose text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

alter table public.properties enable row level security;

-- 开发阶段策略：允许匿名读写，便于本地演示。
-- 生产环境必须替换为基于 authenticated 用户、团队或角色的最小权限策略。
drop policy if exists "development anonymous properties access" on public.properties;
create policy "development anonymous properties access"
on public.properties
for all
to anon
using (true)
with check (true);
