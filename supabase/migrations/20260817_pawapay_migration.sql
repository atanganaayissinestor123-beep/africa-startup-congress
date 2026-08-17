-- ============================================================
-- Migration : ajout du flux PawaPay (Mobile Money multi-pays)
-- en complément de Pesapal (carte bancaire).
-- ============================================================

alter table public.registrations
  add column if not exists payment_provider text default 'pesapal', -- 'pesapal' | 'pawapay'
  add column if not exists pawapay_deposit_id uuid,
  add column if not exists pawapay_initiated_at timestamptz,
  add column if not exists pawapay_provider_transaction_id text,
  add column if not exists local_amount numeric,
  add column if not exists local_currency text,
  add column if not exists exchange_rate numeric;

comment on column public.registrations.payment_provider is
  'Aggregateur utilisé pour ce paiement : pesapal (carte) ou pawapay (mobile money).';
comment on column public.registrations.pawapay_deposit_id is
  'UUIDv4 généré côté serveur, requis par PawaPay (Payment Page / deposits).';
comment on column public.registrations.pawapay_initiated_at is
  'Horodatage de l''appel à /v2/paymentpage — sert à expirer les paiements NOT_FOUND après 15 min.';
comment on column public.registrations.local_amount is
  'Montant converti dans la devise locale MoMo (arrondi à l''entier), tel qu''envoyé à PawaPay.';
comment on column public.registrations.exchange_rate is
  'Taux USD -> devise locale utilisé au moment de la conversion (traçabilité / support).';

create index if not exists idx_registrations_pawapay_deposit_id
  on public.registrations (pawapay_deposit_id);
