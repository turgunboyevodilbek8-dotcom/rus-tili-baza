-- Baza: Rus Tili — Profile (nickname + avatar) migration
-- Run this in Supabase SQL Editor AFTER schema.sql and schema_dialogues.sql.

alter table users add column if not exists nickname text not null default '';
alter table users add column if not exists avatar text not null default '';
-- avatar stores a compressed base64 data URL (resized client-side before upload, so this stays small)
