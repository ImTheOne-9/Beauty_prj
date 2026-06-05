do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'Public read categories'
  ) then
    create policy "Public read categories"
      on "public"."categories"
      as permissive
      for select
      to public
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Public read products'
  ) then
    create policy "Public read products"
      on "public"."products"
      as permissive
      for select
      to public
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_variants'
      and policyname = 'Public read product variants'
  ) then
    create policy "Public read product variants"
      on "public"."product_variants"
      as permissive
      for select
      to public
    using (true);
  end if;
end $$;
