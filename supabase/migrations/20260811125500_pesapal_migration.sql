-- ============================================================
-- Migration : adaptation de la table `registrations` pour Pesapal
-- (remplace le flux XentriPay, carte bancaire uniquement)
-- ============================================================

-- Nouvelles colonnes nécessaires pour le suivi Pesapal
alter table public.registrations
  add column if not exists pesapal_order_tracking_id text,
  add column if not exists pesapal_confirmation_code text,
  add column if not exists currency text default 'USD';

-- La facturation carte passe désormais directement en USD (plus de
-- conversion via un taux de change externe) : `amount_usd` reste la
-- source de vérité pour le montant payé.
comment on column public.registrations.amount_usd is
  'Montant facturé en USD, envoyé tel quel à Pesapal (plus de conversion RWF).';

-- Colonnes propres à l'ancien flux XentriPay, à retirer si vous n'en avez
-- plus besoin pour l'historique (à exécuter seulement après avoir vérifié
-- qu'aucun rapport/export n'en dépend) :
-- alter table public.registrations drop column if exists exchange_rate;
-- alter table public.registrations drop column if exists amount; -- ancien montant en RWF

create index if not exists idx_registrations_pesapal_order_tracking_id
  on public.registrations (pesapal_order_tracking_id);
