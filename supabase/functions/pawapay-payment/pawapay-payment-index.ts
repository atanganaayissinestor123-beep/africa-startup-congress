import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  getPawapayToken,
  getPawapayCountryConfig,
  isPawapayCountry,
  convertUsdToLocal,
  submitPaymentPage,
  checkDepositStatus,
} from '../_shared/pawapay.ts';
import { applyPawapayTransactionStatus } from '../_shared/registrations.ts';

const PUBLIC_URL = Deno.env.get('PUBLIC_SITE_URL') || 'https://africastartupcongress.org';
const PENDING_TIMEOUT_MINUTES = 15; // durée de vie de la Payment Page PawaPay

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    console.log('PAYLOAD REÇU (pawapay-payment):', JSON.stringify(body, null, 2));

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const action = body.action;

    // ============================================================
    // 1. INITIATION DE PAIEMENT (Mobile Money, via PawaPay Payment Page)
    // ============================================================
    if (action === 'initiate_payment') {
      const { customerRef, email, cname, amount_usd, phone, countryCode } = body;

      if (!customerRef || !email || !amount_usd || !countryCode) {
        return new Response(
          JSON.stringify({ success: 0, reply: 'customerRef, email, amount_usd et countryCode sont requis.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!isPawapayCountry(countryCode)) {
        return new Response(
          JSON.stringify({ success: 0, reply: `Mobile Money non disponible pour ce pays (${countryCode}).` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const countryConfig = getPawapayCountryConfig(countryCode)!;
      console.log(`[INIT] customerRef=${customerRef} amount_usd=${amount_usd} country=${countryCode}`);

      let localAmount: number;
      let rate: number;
      try {
        ({ localAmount, rate } = await convertUsdToLocal(Number(amount_usd), countryConfig.currency));
      } catch (fxError: any) {
        console.error('[INIT] Erreur conversion devise:', fxError);
        return new Response(
          JSON.stringify({ success: 0, reply: fxError.message || 'Erreur de conversion de devise.' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const depositId = crypto.randomUUID();
      const callbackUrl = `${PUBLIC_URL}/register?ref=${customerRef}`;

      // Filet de sécurité : synchro amount + traçabilité PawaPay, la ligne
      // doit déjà exister (insérée côté client avant cet appel).
      await supabaseAdmin
        .from('registrations')
        .update({
          amount_usd: Number(amount_usd),
          payment_provider: 'pawapay',
          pawapay_deposit_id: depositId,
          pawapay_initiated_at: new Date().toISOString(),
          local_amount: localAmount,
          local_currency: countryConfig.currency,
          exchange_rate: rate,
        })
        .eq('payment_ref', customerRef);

      const token = getPawapayToken();
      const pageData = await submitPaymentPage(token, {
        depositId,
        returnUrl: callbackUrl,
        amount: localAmount,
        currency: countryConfig.currency,
        phoneNumber: phone || null,
        country: countryConfig.alpha3,
        reason: `ASC27 registration`,
        orderId: customerRef,
      });

      console.log('[INIT] Réponse PawaPay Payment Page:', JSON.stringify(pageData));

      if (!pageData.redirectUrl) {
        console.error('[INIT] Pas de redirectUrl dans la réponse PawaPay — échec probable:', JSON.stringify(pageData));
        return new Response(
          JSON.stringify({
            success: 0,
            reply: pageData.failureReason?.failureMessage || pageData.message || 'Impossible de créer la page de paiement PawaPay.',
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: 1,
          url: pageData.redirectUrl,
          refid: customerRef,
          deposit_id: depositId,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================================
    // 2. VÉRIFICATION DE STATUT (polling depuis register.tsx)
    // ============================================================
    if (action === 'status') {
      const refToCheck = body.paymentRef || body.customerRef;

      if (!refToCheck) {
        return new Response(
          JSON.stringify({ success: false, error: 'Référence de paiement manquante.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: reg } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('payment_ref', refToCheck)
        .maybeSingle();

      if (!reg?.pawapay_deposit_id) {
        console.warn(`[STATUS] Pas encore de pawapay_deposit_id pour ${refToCheck} — paiement pas encore initié.`);
        return new Response(
          JSON.stringify({ success: true, status: 'PENDING', registration: null }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = getPawapayToken();
      const result = await checkDepositStatus(token, reg.pawapay_deposit_id);
      console.log(`[STATUS] Réponse PawaPay pour ${refToCheck}:`, JSON.stringify(result));

      let updatedReg = reg;

      if (result.status === 'FOUND') {
        updatedReg = await applyPawapayTransactionStatus(supabaseAdmin, refToCheck, result.data);
      } else if (result.status === 'NOT_FOUND') {
        // Le client n'a jamais appuyé sur "Payer" (page abandonnée).
        // PawaPay recommande de considérer ça comme un échec après 15 min.
        const initiatedAt = reg.pawapay_initiated_at ? new Date(reg.pawapay_initiated_at).getTime() : 0;
        const elapsedMinutes = (Date.now() - initiatedAt) / 60000;
        if (elapsedMinutes > PENDING_TIMEOUT_MINUTES) {
          updatedReg = await applyPawapayTransactionStatus(supabaseAdmin, refToCheck, { status: 'FAILED' });
        }
      }

      const registration = updatedReg && updatedReg.payment_status === 'completed'
        ? {
            payment_ref: updatedReg.payment_ref,
            full_name: updatedReg.full_name,
            email: updatedReg.email,
            phone: updatedReg.phone,
            organization: updatedReg.organization,
            country: updatedReg.country,
            role: updatedReg.role,
            role_detail: updatedReg.role_detail,
            amount_usd: updatedReg.amount_usd,
            payment_method: 'momo',
          }
        : null;

      const publicStatus = updatedReg?.payment_status === 'completed'
        ? 'SUCCESS'
        : updatedReg?.payment_status === 'failed'
          ? 'FAILED'
          : 'PENDING';

      return new Response(
        JSON.stringify({ success: true, status: publicStatus, data: result, registration }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Action inconnue: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Erreur critique pawapay-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur interne.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
