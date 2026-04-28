alter table "users"
  add column if not exists "profile_sponsored_until" timestamp;

alter table "listings"
  add column if not exists "sponsored_until" timestamp;
