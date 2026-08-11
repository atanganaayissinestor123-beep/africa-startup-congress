// ============================================================
// Utilitaires partagés pour l'intégration Pesapal API 3.0
// Utilisé par les fonctions pesapal-payment et pesapal-ipn.
// Documentation officielle :
// https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference
// ============================================================

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bascule sandbox / production via le secret Supabase PESAPAL_ENV=live|sandbox
export function getPesapalBaseUrl(): string {
  return Deno.env.get('PESAPAL_ENV') === 'live'
    ? 'https://pay.pesapal.com/v3/api'
    : 'https://cybqa.pesapal.com/pesapalv3/api';
}

// L'ipn_id est généré UNE SEULE FOIS via le formulaire d'enregistrement IPN
// de Pesapal (voir README-pesapal.md), puis stocké en secret Supabase :
//   supabase secrets set PESAPAL_IPN_ID_SANDBOX=xxxx-xxxx-...
//   supabase secrets set PESAPAL_IPN_ID_LIVE=xxxx-xxxx-...
export function getPesapalIpnId(): string {
  const id = Deno.env.get('PESAPAL_ENV') === 'live'
    ? Deno.env.get('PESAPAL_IPN_ID_LIVE')
    : Deno.env.get('PESAPAL_IPN_ID_SANDBOX');

  if (!id) {
    throw new Error(
      "PESAPAL_IPN_ID_SANDBOX / PESAPAL_IPN_ID_LIVE non configuré dans les secrets Supabase. " +
      "Enregistrez d'abord votre URL pesapal-ipn via le formulaire Pesapal, puis stockez l'ipn_id reçu."
    );
  }
  return id;
}

// Parse une réponse HTTP en JSON de façon sécurisée : si Pesapal renvoie du
// HTML/texte au lieu de JSON (erreur 500, WAF...), on logue le contenu brut
// (tronqué) au lieu de planter avec une exception non gérée.
export async function safeJsonParse(response: Response, context: string): Promise<any> {
  const rawText = await response.text();
  try {
    return JSON.parse(rawText);
  } catch {
    console.error(`[${context}] Réponse non-JSON reçue (HTTP ${response.status}):`, rawText.slice(0, 500));
    return {
      error: { message: `Réponse invalide du serveur Pesapal (HTTP ${response.status}).` },
      status: String(response.status),
      rawSnippet: rawText.slice(0, 300),
    };
  }
}

// ============================================================
// AUTHENTIFICATION
// Le token Pesapal est valide 5 minutes maximum (voir doc Authentication).
// Par simplicité et fiabilité, on redemande un token à chaque appel plutôt
// que de tenter un cache partagé entre invocations froides — le coût d'un
// appel HTTP supplémentaire est négligeable comparé au risque d'utiliser un
// token expiré.
// ============================================================
export async function getPesapalToken(): Promise<string> {
  const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');

  if (!consumerKey || !consumerSecret) {
    throw new Error('PESAPAL_CONSUMER_KEY / PESAPAL_CONSUMER_SECRET manquants dans les secrets Supabase.');
  }

  const resp = await fetch(`${getPesapalBaseUrl()}/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
  });

  const data = await safeJsonParse(resp, 'AUTH');

  if (!data.token) {
    console.error('[AUTH] Échec récupération du token Pesapal:', JSON.stringify(data));
    throw new Error(data.error?.message || data.message || "Impossible de s'authentifier auprès de Pesapal.");
  }

  return data.token as string;
}

// ============================================================
// SUBMIT ORDER REQUEST — crée une commande de paiement et renvoie
// l'URL de redirection vers la page de paiement Pesapal.
// ============================================================
export interface SubmitOrderParams {
  id: string;               // = payment_ref, doit être unique, alphanum/-/_/./: uniquement, 50 caractères max
  amount: number;
  currency: string;         // ex: "USD"
  description: string;      // 100 caractères max
  callback_url: string;
  cancellation_url?: string;
  email: string;
  phone?: string | null;
  countryCode?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export async function submitOrderRequest(token: string, params: SubmitOrderParams) {
  const resp = await fetch(`${getPesapalBaseUrl()}/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: params.id,
      currency: params.currency,
      amount: params.amount,
      description: params.description.slice(0, 100),
      callback_url: params.callback_url,
      cancellation_url: params.cancellation_url,
      notification_id: getPesapalIpnId(),
      billing_address: {
        email_address: params.email,
        phone_number: params.phone || '',
        country_code: params.countryCode || '',
        first_name: params.firstName || '',
        last_name: params.lastName || '',
      },
    }),
  });

  return await safeJsonParse(resp, 'SUBMIT_ORDER');
}

// ============================================================
// GET TRANSACTION STATUS
// ============================================================
export async function getTransactionStatus(token: string, orderTrackingId: string) {
  const resp = await fetch(
    `${getPesapalBaseUrl()}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    }
  );

  return await safeJsonParse(resp, 'GET_STATUS');
}

// Traduit le status_code Pesapal en statut interne utilisé par la table
// `registrations` :
//   0 = INVALID, 1 = COMPLETED, 2 = FAILED, 3 = REVERSED
export function mapPesapalStatus(statusCode: number | undefined | null): 'pending' | 'completed' | 'failed' {
  switch (statusCode) {
    case 1: return 'completed';
    case 2: return 'failed';
    case 3: return 'failed'; // remboursement — traité comme échec côté inscription
    default: return 'pending';
  }
}