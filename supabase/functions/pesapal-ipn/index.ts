// ============================================================
// Endpoint IPN Pesapal — c'est l'URL que vous enregistrez UNE FOIS via le
// formulaire d'enregistrement IPN de Pesapal (voir README-pesapal.md).
// Pesapal appelle cette URL en GET ou POST (selon ce qui a été choisi à
// l'enregistrement) à chaque changement de statut de paiement.
//
// Important (doc Pesapal) : ni le callback_url ni l'IPN ne contiennent le
// statut du paiement pour des raisons de sécurité — il faut toujours
// rappeler GetTransactionStatus avec l'OrderTrackingId reçu.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, getPesapalToken, getTransactionStatus } from '../_shared/pesapal.ts';
import { applyTransactionStatus } from '../_shared/registrations.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // Les paramètres arrivent soit en query string (GET), soit dans le
    // corps JSON (POST) — on gère les deux selon ce qui a été choisi lors
    // de l'enregistrement IPN.
    let orderTrackingId: string | null = null;
    let orderMerchantReference: string | null = null;

    const url = new URL(req.url);
    orderTrackingId = url.searchParams.get('OrderTrackingId');
    orderMerchantReference = url.searchParams.get('OrderMerchantReference');

    if (!orderTrackingId && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      orderTrackingId = body.OrderTrackingId ?? null;
      orderMerchantReference = body.OrderMerchantReference ?? null;
    }

    console.log(`[IPN] Reçu OrderTrackingId=${orderTrackingId} OrderMerchantReference=${orderMerchantReference}`);

    if (!orderTrackingId || !orderMerchantReference) {
      console.error('[IPN] Paramètres manquants dans la notification Pesapal.');
      return new Response(JSON.stringify({ status: 500, message: 'Missing parameters' }), {
        status: 200, // Pesapal attend un HTTP 200 même en cas d'erreur métier, avec status:500 dans le corps
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = await getPesapalToken();
    const statusData = await getTransactionStatus(token, orderTrackingId);
    console.log(`[IPN] Statut Pesapal pour ${orderMerchantReference}:`, JSON.stringify(statusData));

    await applyTransactionStatus(supabaseAdmin, orderMerchantReference, statusData);

    // Format de réponse exact attendu par Pesapal pour accuser réception.
    return new Response(
      JSON.stringify({
        orderNotificationType: 'IPNCHANGE',
        orderTrackingId,
        orderMerchantReference,
        status: 200,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[IPN] Erreur critique:', error);
    // On répond quand même 200 côté HTTP avec status:500 dans le corps,
    // conformément à ce qu'attend Pesapal (sinon il continuera à réessayer
    // indéfiniment sans qu'on puisse diagnostiquer la cause).
    return new Response(JSON.stringify({ status: 500, message: error.message || 'Internal error' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});