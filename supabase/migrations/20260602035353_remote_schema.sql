alter table "public"."product_configs" drop constraint "product_configs_color_intensity_check";

drop index if exists "public"."idx_product_configs_lookup";

drop index if exists "public"."product_configs_extra_params_idx";

alter table "public"."product_configs" drop column "color_intensity";

alter table "public"."product_configs" drop column "extra_params";

alter table "public"."product_configs" drop column "hex_color";

alter table "public"."product_configs" drop column "pattern_name";

alter table "public"."product_configs" drop column "texture";

alter table "public"."product_configs" add column "effect_category" text;

alter table "public"."product_configs" add column "effect_data" jsonb default '{}'::jsonb;

alter table "public"."product_configs" add column "primary_color" text;


