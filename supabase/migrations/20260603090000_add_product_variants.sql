create table if not exists "public"."product_variants" (
  "id" uuid not null default gen_random_uuid(),
  "product_id" uuid not null,
  "name" text,
  "color_hex" text not null,
  "texture" text,
  "image_url" text,
  "sku" text,
  "sort_order" integer not null default 0,
  "is_active" boolean not null default true,
  "created_at" timestamp with time zone not null default now()
);

alter table "public"."product_variants" enable row level security;

create unique index if not exists product_variants_pkey
  on public.product_variants using btree (id);

create index if not exists product_variants_product_id_idx
  on public.product_variants using btree (product_id);

create index if not exists product_variants_lookup_idx
  on public.product_variants using btree (product_id, is_active, sort_order);

create unique index if not exists product_variants_sku_key
  on public.product_variants using btree (sku)
  where sku is not null;

alter table "public"."product_variants"
  add constraint "product_variants_pkey"
  primary key using index "product_variants_pkey";

alter table "public"."product_variants"
  add constraint "product_variants_product_id_fkey"
  foreign key (product_id)
  references public.products(id)
  on delete cascade
  not valid;

alter table "public"."product_variants"
  validate constraint "product_variants_product_id_fkey";

alter table "public"."product_variants"
  add constraint "product_variants_color_hex_check"
  check (color_hex ~ '^#[0-9A-Fa-f]{6}$')
  not valid;

alter table "public"."product_variants"
  validate constraint "product_variants_color_hex_check";

grant delete on table "public"."product_variants" to "anon";
grant insert on table "public"."product_variants" to "anon";
grant references on table "public"."product_variants" to "anon";
grant select on table "public"."product_variants" to "anon";
grant trigger on table "public"."product_variants" to "anon";
grant truncate on table "public"."product_variants" to "anon";
grant update on table "public"."product_variants" to "anon";

grant delete on table "public"."product_variants" to "authenticated";
grant insert on table "public"."product_variants" to "authenticated";
grant references on table "public"."product_variants" to "authenticated";
grant select on table "public"."product_variants" to "authenticated";
grant trigger on table "public"."product_variants" to "authenticated";
grant truncate on table "public"."product_variants" to "authenticated";
grant update on table "public"."product_variants" to "authenticated";

grant delete on table "public"."product_variants" to "service_role";
grant insert on table "public"."product_variants" to "service_role";
grant references on table "public"."product_variants" to "service_role";
grant select on table "public"."product_variants" to "service_role";
grant trigger on table "public"."product_variants" to "service_role";
grant truncate on table "public"."product_variants" to "service_role";
grant update on table "public"."product_variants" to "service_role";

create policy "Admin manage product variants"
  on "public"."product_variants"
  as permissive
  for all
  to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "Read access for all authenticated"
  on "public"."product_variants"
  as permissive
  for select
  to authenticated
using (true);
