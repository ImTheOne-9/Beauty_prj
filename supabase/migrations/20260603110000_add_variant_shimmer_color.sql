alter table "public"."product_variants"
  add column if not exists "shimmer_color" text;

alter table "public"."product_variants"
  drop constraint if exists "product_variants_shimmer_color_check";

alter table "public"."product_variants"
  add constraint "product_variants_shimmer_color_check"
  check (shimmer_color is null or shimmer_color ~ '^#[0-9A-Fa-f]{6}$')
  not valid;

alter table "public"."product_variants"
  validate constraint "product_variants_shimmer_color_check";
