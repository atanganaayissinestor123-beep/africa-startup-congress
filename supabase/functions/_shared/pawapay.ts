// ============================================================
// Utilitaires partagés pour l'intégration PawaPay v2 (Mobile Money).
// Utilisé par les fonctions pawapay-payment et pawapay-ipn.
// Documentation officielle : https://docs.pawapay.io/v2/docs/welcome
// ============================================================

import { corsHeaders, safeJsonParse } from './pesapal.ts';

export { corsHeaders };

// ============================================================
// BASE URL / AUTH
// Contrairement à Pesapal, PawaPay utilise un token Bearer statique
// généré une fois depuis le Dashboard (un par environnement), pas un
// flux OAuth à renouveler à chaque appel.
// ============================================================
export function getPawapayBaseUrl(): string {
  return Deno.env.get('PAWAPAY_ENV') === 'live'
    ? 'https://api.pawapay.io'
    : 'https://api.sandbox.pawapay.io';
}

export function getPawapayToken(): string {
  const token = Deno.env.get('PAWAPAY_ENV') === 'live'
    ? Deno.env.get('PAWAPAY_PRODUCTION_TOKEN')
    : Deno.env.get('PAWAPAY_SANDBOX_TOKEN');

  if (!token) {
    throw new Error(
      'PAWAPAY_SANDBOX_TOKEN / PAWAPAY_PRODUCTION_TOKEN non configuré dans les secrets Supabase.'
    );
  }
  return token;
}

// ============================================================
// PAYS / DEVISES COUVERTS PAR PAWAPAY
// Mappe le countryCode ISO alpha-2 utilisé dans register.tsx vers le
// code alpha-3 attendu par PawaPay et la devise locale MoMo du pays.
// Source : https://docs.pawapay.io/v2/docs/providers (20 pays actifs)
// ============================================================
export const PAWAPAY_COUNTRIES: Record<string, { alpha3: string; currency: string }> = {
  BJ: { alpha3: 'BEN', currency: 'XOF' }, // Bénin
  BF: { alpha3: 'BFA', currency: 'XOF' }, // Burkina Faso
  CM: { alpha3: 'CMR', currency: 'XAF' }, // Cameroun
  CI: { alpha3: 'CIV', currency: 'XOF' }, // Côte d'Ivoire
  CD: { alpha3: 'COD', currency: 'CDF' }, // RDC
  ET: { alpha3: 'ETH', currency: 'ETB' }, // Éthiopie
  GA: { alpha3: 'GAB', currency: 'XAF' }, // Gabon
  GH: { alpha3: 'GHA', currency: 'GHS' }, // Ghana
  KE: { alpha3: 'KEN', currency: 'KES' }, // Kenya
  LS: { alpha3: 'LSO', currency: 'LSL' }, // Lesotho
  MW: { alpha3: 'MWI', currency: 'MWK' }, // Malawi
  MZ: { alpha3: 'MOZ', currency: 'MZN' }, // Mozambique
  NG: { alpha3: 'NGA', currency: 'NGN' }, // Nigeria
  CG: { alpha3: 'COG', currency: 'XAF' }, // Congo-Brazzaville
  RW: { alpha3: 'RWA', currency: 'RWF' }, // Rwanda
  SN: { alpha3: 'SEN', currency: 'XOF' }, // Sénégal
  SL: { alpha3: 'SLE', currency: 'SLE' }, // Sierra Leone
  TZ: { alpha3: 'TZA', currency: 'TZS' }, // Tanzanie
  UG: { alpha3: 'UGA', currency: 'UGX' }, // Ouganda
  ZM: { alpha3: 'ZMB', currency: 'ZMW' }, // Zambie
};

export function isPawapayCountry(countryCodeAlpha2: string): boolean {
  return countryCodeAlpha2 in PAWAPAY_COUNTRIES;
}

export function getPawapayCountryConfig(countryCodeAlpha2: string) {
  return PAWAPAY_COUNTRIES[countryCodeAlpha2] ?? null;
}

// ============================================================
// CONVERSION USD -> DEVISE LOCALE
// Source : ExchangeRate-API, accès libre sans clé, 161 devises,
// mise à jour quotidienne. https://www.exchangerate-api.com/docs/free
// La plupart des providers MoMo (dont RWF) ne supportent pas les
// décimales : on arrondit systématiquement à l'entier le plus proche,
// ce qui reste valide pour les devises qui supportent les décimales.
// ============================================================
let rateCache: { fetchedAt: number; rates: Record<string, number> } | null = null;
const RATE_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h, largement sous le rafraîchissement quotidien de la source

async function getUsdRates(): Promise<Record<string, number>> {
  if (rateCache && Date.now() - rateCache.fetchedAt < RATE_CACHE_TTL_MS) {
    return rateCache.rates;
  }

  const resp = await fetch('https://open.er-api.com/v6/latest/USD');
  const data = await resp.json();

  if (data.result !== 'success' || !data.rates) {
    console.error('[FX] Échec récupération des taux de change:', JSON.stringify(data).slice(0, 300));
    throw new Error('Impossible de récupérer le taux de change USD en ce moment. Réessayez.');
  }

  rateCache = { fetchedAt: Date.now(), rates: data.rates };
  return data.rates;
}

export async function convertUsdToLocal(
  amountUsd: number,
  currency: string
): Promise<{ localAmount: number; rate: number }> {
  const rates = await getUsdRates();
  const rate = rates[currency];

  if (!rate) {
    throw new Error(`Taux de change indisponible pour la devise ${currency}.`);
  }

  const localAmount = Math.round(amountUsd * rate);
  return { localAmount, rate };
}

// ============================================================
// DEPOSIT VIA PAYMENT PAGE — crée le widget hébergé et renvoie
// l'URL de redirection (équivalent du SubmitOrderRequest Pesapal).
// ============================================================
export interface SubmitPaymentPageParams {
  depositId: string;       // UUIDv4, généré côté serveur
  returnUrl: string;
  amount: number;          // déjà converti en devise locale, arrondi
  currency: string;
  phoneNumber?: string | null;
  country: string;         // alpha-3
  reason: string;          // 4 à 22 caractères visibles par le client
  orderId: string;         // = payment_ref, stocké en metadata pour réconciliation
}

export async function submitPaymentPage(token: string, params: SubmitPaymentPageParams) {
  const resp = await fetch(`${getPawapayBaseUrl()}/v2/paymentpage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      depositId: params.depositId,
      returnUrl: params.returnUrl,
      amountDetails: {
        amount: String(params.amount),
        currency: params.currency,
      },
      phoneNumber: params.phoneNumber || undefined,
      country: params.country,
      reason: params.reason.slice(0, 22),
      metadata: [{ orderId: params.orderId }],
    }),
  });

  return await safeJsonParse(resp, 'PAWAPAY_PAYMENT_PAGE');
}

// ============================================================
// CHECK DEPOSIT STATUS
// ============================================================
export async function checkDepositStatus(token: string, depositId: string) {
  const resp = await fetch(`${getPawapayBaseUrl()}/v2/deposits/${encodeURIComponent(depositId)}`, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });

  return await safeJsonParse(resp, 'PAWAPAY_CHECK_STATUS');
}

// Traduit le status PawaPay (COMPLETED / FAILED / ACCEPTED / SUBMITTED /
// ENQUEUED / IN_RECONCILIATION / REJECTED) en statut interne utilisé par
// la table `registrations`.
export function mapPawapayStatus(status: string | undefined | null): 'pending' | 'completed' | 'failed' {
  switch (status) {
    case 'COMPLETED':
      return 'completed';
    case 'FAILED':
    case 'REJECTED':
      return 'failed';
    default:
      // ACCEPTED, SUBMITTED, ENQUEUED, IN_RECONCILIATION, ou inconnu :
      // le paiement est encore en cours de traitement, ne rien figer.
      return 'pending';
  }
}
