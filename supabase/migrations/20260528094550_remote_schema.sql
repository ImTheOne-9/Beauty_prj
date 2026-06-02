drop extension if exists "pg_net";

create type "public"."subscription_status" as enum ('active', 'cancelled', 'expired', 'pending', 'past_due', 'incomplete', 'trialing');

create type "public"."user_role" as enum ('user', 'admin');


  create table "public"."api_keys" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "key_value" text not null,
    "provider" text not null default 'virtual_makeup_ai'::text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."api_keys" enable row level security;


  create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "api_category_key" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."categories" enable row level security;


  create table "public"."plans" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "slug" text not null,
    "price" numeric(10,2) not null,
    "billing_interval" text default 'month'::text,
    "scan_limit" integer not null,
    "history_days" integer not null,
    "description" text,
    "features" jsonb default '[]'::jsonb,
    "badge" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "stripe_price_id" text
      );


alter table "public"."plans" enable row level security;


  create table "public"."product_configs" (
    "id" uuid not null default gen_random_uuid(),
    "product_id" uuid not null,
    "hex_color" text,
    "texture" text,
    "color_intensity" integer,
    "pattern_name" text,
    "extra_params" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."product_configs" enable row level security;


  create table "public"."products" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "brand" text,
    "category_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "image_url" text,
    "external_url" text,
    "description" text
      );


alter table "public"."products" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "first_name" text,
    "last_name" text,
    "role" public.user_role not null default 'user'::public.user_role,
    "avatar_url" text,
    "updated_at" timestamp with time zone not null default now(),
    "plan_id" uuid,
    "stripe_customer_id" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."recommendations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "scan_id" uuid not null,
    "product_id" uuid not null,
    "reason" text not null default ''::text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."recommendations" enable row level security;


  create table "public"."scans" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "original_image" text,
    "image_url" text,
    "effects" jsonb not null default '[]'::jsonb,
    "mode" text not null default 'demo'::text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."scans" enable row level security;


  create table "public"."subscriptions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "plan_id" uuid not null,
    "status" public.subscription_status not null default 'active'::public.subscription_status,
    "started_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "stripe_subscription_id" text,
    "stripe_customer_id" text,
    "stripe_price_id" text,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone
      );


alter table "public"."subscriptions" enable row level security;

CREATE UNIQUE INDEX api_keys_pkey ON public.api_keys USING btree (id);

CREATE UNIQUE INDEX categories_api_category_key_key ON public.categories USING btree (api_category_key);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE INDEX idx_product_configs_lookup ON public.product_configs USING btree (hex_color, texture);

CREATE UNIQUE INDEX plans_pkey ON public.plans USING btree (id);

CREATE UNIQUE INDEX plans_slug_key ON public.plans USING btree (slug);

CREATE UNIQUE INDEX plans_stripe_price_id_key ON public.plans USING btree (stripe_price_id);

CREATE INDEX product_configs_extra_params_idx ON public.product_configs USING gin (extra_params);

CREATE UNIQUE INDEX product_configs_pkey ON public.product_configs USING btree (id);

CREATE INDEX product_configs_product_id_idx ON public.product_configs USING btree (product_id);

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX recommendations_pkey ON public.recommendations USING btree (id);

CREATE INDEX scans_created_at_idx ON public.scans USING btree (created_at DESC);

CREATE UNIQUE INDEX scans_pkey ON public.scans USING btree (id);

CREATE INDEX scans_user_id_idx ON public.scans USING btree (user_id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE INDEX subscriptions_status_idx ON public.subscriptions USING btree (status);

CREATE INDEX subscriptions_stripe_sub_id_idx ON public.subscriptions USING btree (stripe_subscription_id);

CREATE UNIQUE INDEX subscriptions_stripe_subscription_id_key ON public.subscriptions USING btree (stripe_subscription_id);

CREATE INDEX subscriptions_user_id_idx ON public.subscriptions USING btree (user_id);

alter table "public"."api_keys" add constraint "api_keys_pkey" PRIMARY KEY using index "api_keys_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."plans" add constraint "plans_pkey" PRIMARY KEY using index "plans_pkey";

alter table "public"."product_configs" add constraint "product_configs_pkey" PRIMARY KEY using index "product_configs_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."recommendations" add constraint "recommendations_pkey" PRIMARY KEY using index "recommendations_pkey";

alter table "public"."scans" add constraint "scans_pkey" PRIMARY KEY using index "scans_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."categories" add constraint "categories_api_category_key_key" UNIQUE using index "categories_api_category_key_key";

alter table "public"."plans" add constraint "plans_slug_key" UNIQUE using index "plans_slug_key";

alter table "public"."plans" add constraint "plans_stripe_price_id_key" UNIQUE using index "plans_stripe_price_id_key";

alter table "public"."product_configs" add constraint "product_configs_color_intensity_check" CHECK (((color_intensity >= 0) AND (color_intensity <= 100))) not valid;

alter table "public"."product_configs" validate constraint "product_configs_color_intensity_check";

alter table "public"."product_configs" add constraint "product_configs_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_configs" validate constraint "product_configs_product_id_fkey";

alter table "public"."products" add constraint "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE not valid;

alter table "public"."products" validate constraint "products_category_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.plans(id) not valid;

alter table "public"."profiles" validate constraint "profiles_plan_id_fkey";

alter table "public"."recommendations" add constraint "recommendations_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."recommendations" validate constraint "recommendations_product_id_fkey";

alter table "public"."recommendations" add constraint "recommendations_scan_id_fkey" FOREIGN KEY (scan_id) REFERENCES public.scans(id) ON DELETE CASCADE not valid;

alter table "public"."recommendations" validate constraint "recommendations_scan_id_fkey";

alter table "public"."scans" add constraint "scans_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'api'::text]))) not valid;

alter table "public"."scans" validate constraint "scans_mode_check";

alter table "public"."scans" add constraint "scans_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."scans" validate constraint "scans_user_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE RESTRICT not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_plan_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_stripe_subscription_id_key" UNIQUE using index "subscriptions_stripe_subscription_id_key";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Lấy ID của gói 'free' dựa trên slug
  SELECT id INTO free_plan_id FROM public.plans WHERE slug = 'free' LIMIT 1;

  INSERT INTO public.profiles (
    id, email, first_name, last_name, role, avatar_url, plan_id
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    CASE WHEN new.email = 'admin@gmail.com' THEN 'admin'::public.user_role ELSE 'user'::public.user_role END,
    new.raw_user_meta_data->>'avatar_url',
    free_plan_id -- Gán gói free tự động
  );
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_profile_plan()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE public.profiles SET plan_id = NEW.plan_id WHERE id = NEW.user_id;
  END IF;

  -- Nếu cancel/expire → reset về free plan
  IF NEW.status IN ('cancelled', 'expired') THEN
    UPDATE public.profiles
    SET plan_id = (SELECT id FROM public.plans WHERE slug = 'free' LIMIT 1)
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$function$
;

grant delete on table "public"."api_keys" to "anon";

grant insert on table "public"."api_keys" to "anon";

grant references on table "public"."api_keys" to "anon";

grant select on table "public"."api_keys" to "anon";

grant trigger on table "public"."api_keys" to "anon";

grant truncate on table "public"."api_keys" to "anon";

grant update on table "public"."api_keys" to "anon";

grant delete on table "public"."api_keys" to "authenticated";

grant insert on table "public"."api_keys" to "authenticated";

grant references on table "public"."api_keys" to "authenticated";

grant select on table "public"."api_keys" to "authenticated";

grant trigger on table "public"."api_keys" to "authenticated";

grant truncate on table "public"."api_keys" to "authenticated";

grant update on table "public"."api_keys" to "authenticated";

grant delete on table "public"."api_keys" to "service_role";

grant insert on table "public"."api_keys" to "service_role";

grant references on table "public"."api_keys" to "service_role";

grant select on table "public"."api_keys" to "service_role";

grant trigger on table "public"."api_keys" to "service_role";

grant truncate on table "public"."api_keys" to "service_role";

grant update on table "public"."api_keys" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."plans" to "anon";

grant insert on table "public"."plans" to "anon";

grant references on table "public"."plans" to "anon";

grant select on table "public"."plans" to "anon";

grant trigger on table "public"."plans" to "anon";

grant truncate on table "public"."plans" to "anon";

grant update on table "public"."plans" to "anon";

grant delete on table "public"."plans" to "authenticated";

grant insert on table "public"."plans" to "authenticated";

grant references on table "public"."plans" to "authenticated";

grant select on table "public"."plans" to "authenticated";

grant trigger on table "public"."plans" to "authenticated";

grant truncate on table "public"."plans" to "authenticated";

grant update on table "public"."plans" to "authenticated";

grant delete on table "public"."plans" to "service_role";

grant insert on table "public"."plans" to "service_role";

grant references on table "public"."plans" to "service_role";

grant select on table "public"."plans" to "service_role";

grant trigger on table "public"."plans" to "service_role";

grant truncate on table "public"."plans" to "service_role";

grant update on table "public"."plans" to "service_role";

grant delete on table "public"."product_configs" to "anon";

grant insert on table "public"."product_configs" to "anon";

grant references on table "public"."product_configs" to "anon";

grant select on table "public"."product_configs" to "anon";

grant trigger on table "public"."product_configs" to "anon";

grant truncate on table "public"."product_configs" to "anon";

grant update on table "public"."product_configs" to "anon";

grant delete on table "public"."product_configs" to "authenticated";

grant insert on table "public"."product_configs" to "authenticated";

grant references on table "public"."product_configs" to "authenticated";

grant select on table "public"."product_configs" to "authenticated";

grant trigger on table "public"."product_configs" to "authenticated";

grant truncate on table "public"."product_configs" to "authenticated";

grant update on table "public"."product_configs" to "authenticated";

grant delete on table "public"."product_configs" to "service_role";

grant insert on table "public"."product_configs" to "service_role";

grant references on table "public"."product_configs" to "service_role";

grant select on table "public"."product_configs" to "service_role";

grant trigger on table "public"."product_configs" to "service_role";

grant truncate on table "public"."product_configs" to "service_role";

grant update on table "public"."product_configs" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."recommendations" to "anon";

grant insert on table "public"."recommendations" to "anon";

grant references on table "public"."recommendations" to "anon";

grant select on table "public"."recommendations" to "anon";

grant trigger on table "public"."recommendations" to "anon";

grant truncate on table "public"."recommendations" to "anon";

grant update on table "public"."recommendations" to "anon";

grant delete on table "public"."recommendations" to "authenticated";

grant insert on table "public"."recommendations" to "authenticated";

grant references on table "public"."recommendations" to "authenticated";

grant select on table "public"."recommendations" to "authenticated";

grant trigger on table "public"."recommendations" to "authenticated";

grant truncate on table "public"."recommendations" to "authenticated";

grant update on table "public"."recommendations" to "authenticated";

grant delete on table "public"."recommendations" to "service_role";

grant insert on table "public"."recommendations" to "service_role";

grant references on table "public"."recommendations" to "service_role";

grant select on table "public"."recommendations" to "service_role";

grant trigger on table "public"."recommendations" to "service_role";

grant truncate on table "public"."recommendations" to "service_role";

grant update on table "public"."recommendations" to "service_role";

grant delete on table "public"."scans" to "anon";

grant insert on table "public"."scans" to "anon";

grant references on table "public"."scans" to "anon";

grant select on table "public"."scans" to "anon";

grant trigger on table "public"."scans" to "anon";

grant truncate on table "public"."scans" to "anon";

grant update on table "public"."scans" to "anon";

grant delete on table "public"."scans" to "authenticated";

grant insert on table "public"."scans" to "authenticated";

grant references on table "public"."scans" to "authenticated";

grant select on table "public"."scans" to "authenticated";

grant trigger on table "public"."scans" to "authenticated";

grant truncate on table "public"."scans" to "authenticated";

grant update on table "public"."scans" to "authenticated";

grant delete on table "public"."scans" to "service_role";

grant insert on table "public"."scans" to "service_role";

grant references on table "public"."scans" to "service_role";

grant select on table "public"."scans" to "service_role";

grant trigger on table "public"."scans" to "service_role";

grant truncate on table "public"."scans" to "service_role";

grant update on table "public"."scans" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";


  create policy "Admin only"
  on "public"."api_keys"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admin manage categories"
  on "public"."categories"
  as permissive
  for all
  to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());



  create policy "Read access for all authenticated"
  on "public"."categories"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Only admins can modify plans"
  on "public"."plans"
  as permissive
  for all
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Public plans are viewable by everyone"
  on "public"."plans"
  as permissive
  for select
  to public
using (true);



  create policy "Admin manage configs"
  on "public"."product_configs"
  as permissive
  for all
  to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());



  create policy "Read access for all authenticated"
  on "public"."product_configs"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admin manage products"
  on "public"."products"
  as permissive
  for all
  to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());



  create policy "Read access for all authenticated"
  on "public"."products"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admins can read all"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "Admins can update all"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Users can read their own profile"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((auth.uid() = id));



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = id))
with check (((auth.uid() = id) AND (role = ( SELECT profiles_1.role
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid()))) AND (NOT (plan_id IS DISTINCT FROM ( SELECT profiles_1.plan_id
   FROM public.profiles profiles_1
  WHERE (profiles_1.id = auth.uid()))))));



  create policy "Users can insert own recommendations"
  on "public"."recommendations"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.scans
  WHERE ((scans.id = recommendations.scan_id) AND (scans.user_id = auth.uid())))));



  create policy "Users can view own recommendations"
  on "public"."recommendations"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.scans
  WHERE ((scans.id = recommendations.scan_id) AND (scans.user_id = auth.uid())))));



  create policy "Admins can read all"
  on "public"."scans"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "Users can delete own scans"
  on "public"."scans"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own scans"
  on "public"."scans"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own scans"
  on "public"."scans"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own scans"
  on "public"."scans"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins can manage subscriptions"
  on "public"."subscriptions"
  as permissive
  for all
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Service role can manage subscriptions"
  on "public"."subscriptions"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "Users can insert own subscriptions"
  on "public"."subscriptions"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "Users can update own subscriptions"
  on "public"."subscriptions"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users can view own subscriptions"
  on "public"."subscriptions"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));


CREATE TRIGGER on_subscription_change AFTER INSERT OR UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.sync_profile_plan();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Avatar images are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Public read makeup results"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'makeup_scans'::text));



  create policy "Scan images are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'scan-images'::text));



  create policy "Users can delete their own avatar"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can delete their own scan images"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'scan-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can update their own avatar"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can update their own scan images"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'scan-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their own avatar"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their own scan images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'scan-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users upload own makeup results"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'makeup_scans'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



