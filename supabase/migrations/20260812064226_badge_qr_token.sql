-- ============================================================
-- Migration : QR code de vérification anti-fraude
-- ============================================================

alter table public.registrations
  add column if not exists qr_token uuid default gen_random_uuid();

create unique index if not exists idx_registrations_qr_token
  on public.registrations (qr_token);

comment on column public.registrations.qr_token is
  'Identifiant aléatoire encodé dans le QR code du reçu. Permet de vérifier en direct les informations d''une inscription (anti-fraude sur PDF falsifié) — jamais le payment_ref, pour éviter qu''une URL soit devinable.';
