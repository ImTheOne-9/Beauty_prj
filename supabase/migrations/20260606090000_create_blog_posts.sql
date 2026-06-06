create table if not exists "public"."blog_posts" (
  "id" uuid not null default gen_random_uuid(),
  "slug" text not null,
  "title" text not null,
  "excerpt" text,
  "content" text not null,
  "cover_image_url" text,
  "author_name" text,
  "category" text,
  "tags" text[] not null default '{}'::text[],
  "status" text not null default 'draft',
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  constraint "blog_posts_pkey" primary key ("id"),
  constraint "blog_posts_slug_key" unique ("slug"),
  constraint "blog_posts_status_check" check ("status" in ('draft', 'published'))
);

create index if not exists "blog_posts_status_published_at_idx"
  on "public"."blog_posts" ("status", "published_at" desc);

create index if not exists "blog_posts_category_idx"
  on "public"."blog_posts" ("category");

create index if not exists "blog_posts_tags_idx"
  on "public"."blog_posts"
  using gin ("tags");

alter table "public"."blog_posts" enable row level security;

do $$
begin
  if exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'set_updated_at'
  ) and not exists (
    select 1
    from pg_trigger
    where tgname = 'set_blog_posts_updated_at'
  ) then
    create trigger "set_blog_posts_updated_at"
      before update on "public"."blog_posts"
      for each row
      execute function "public"."set_updated_at"();
  end if;
end $$;

grant delete on table "public"."blog_posts" to "anon";
grant insert on table "public"."blog_posts" to "anon";
grant references on table "public"."blog_posts" to "anon";
grant select on table "public"."blog_posts" to "anon";
grant trigger on table "public"."blog_posts" to "anon";
grant truncate on table "public"."blog_posts" to "anon";
grant update on table "public"."blog_posts" to "anon";

grant delete on table "public"."blog_posts" to "authenticated";
grant insert on table "public"."blog_posts" to "authenticated";
grant references on table "public"."blog_posts" to "authenticated";
grant select on table "public"."blog_posts" to "authenticated";
grant trigger on table "public"."blog_posts" to "authenticated";
grant truncate on table "public"."blog_posts" to "authenticated";
grant update on table "public"."blog_posts" to "authenticated";

grant delete on table "public"."blog_posts" to "service_role";
grant insert on table "public"."blog_posts" to "service_role";
grant references on table "public"."blog_posts" to "service_role";
grant select on table "public"."blog_posts" to "service_role";
grant trigger on table "public"."blog_posts" to "service_role";
grant truncate on table "public"."blog_posts" to "service_role";
grant update on table "public"."blog_posts" to "service_role";

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blog_posts'
      and policyname = 'Public read published blog posts'
  ) then
    create policy "Public read published blog posts"
      on "public"."blog_posts"
      as permissive
      for select
      to public
      using ("status" = 'published');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blog_posts'
      and policyname = 'Admin manage blog posts'
  ) then
    create policy "Admin manage blog posts"
      on "public"."blog_posts"
      as permissive
      for all
      to authenticated
      using (public.is_admin_user())
      with check (public.is_admin_user());
  end if;
end $$;
