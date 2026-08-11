import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  getPesapalToken,
  submitOrderRequest,
  getTransactionStatus,
} from '../_shared/pesapal.ts';
import { applyTransactionStatus } from '../_shared/registrations.ts';

const PUBLIC_URL = Deno.env.get('PUBLIC_SITE_URL') || 'https://africastartupcongress.org';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    console.log('PAYLOAD REÇU:', JSON.stringify(body, null, 2));

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const action = body.action;

    // ============================================================
    // 1. INITIATION DE PAIEMENT (carte, via Pesapal)
    //    Facturation directement en USD — Pesapal accepte tout code
    //    devise ISO, plus besoin de conversion USD -> RWF.
    // ============================================================
    if (action === 'initiate_payment') {
      const {
        customerRef,
        email,
        cname,
        amount_usd,
        phone,
        countryCode,
      } = body;

      if (!customerRef || !email || !amount_usd) {
        return new Response(
          JSON.stringify({ success: 0, reply: 'customerRef, email et amount_usd sont requis.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[INIT] customerRef=${customerRef} amount_usd=${amount_usd}`);

      // Filet de sécurité : synchro amount si la ligne existe déjà
      await supabaseAdmin
        .from('registrations')
        .update({ amount_usd, currency: 'USD' })
        .eq('payment_ref', customerRef);

      const [firstName, ...rest] = String(cname || '').trim().split(' ');
      const lastName = rest.join(' ') || firstName;

      const callbackUrl = `${PUBLIC_URL}/register?ref=${customerRef}`;

      const token = await getPesapalToken();
      const orderData = await submitOrderRequest(token, {
        id: customerRef,
        amount: Number(amount_usd),
        currency: 'USD',
        description: `Registration ASC27 - ${customerRef}`,
        callback_url: callbackUrl,
        email,
        phone: phone || null,
        countryCode: countryCode || null,
        firstName: firstName || null,
        lastName: lastName || null,
      });

      console.log('[INIT] Réponse Pesapal SubmitOrderRequest:', JSON.stringify(orderData));

      if (!orderData.redirect_url) {
        console.error('[INIT] Pas de redirect_url dans la réponse Pesapal — échec probable:', JSON.stringify(orderData));
        return new Response(
          JSON.stringify({
            success: 0,
            reply: orderData.error?.message || orderData.message || 'Impossible de créer la commande de paiement.',
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabaseAdmin
        .from('registrations')
        .update({ pesapal_order_tracking_id: orderData.order_tracking_id })
        .eq('payment_ref', customerRef);

      return new Response(
        JSON.stringify({
          success: 1,
          url: orderData.redirect_url,
          refid: customerRef,
          order_tracking_id: orderData.order_tracking_id,
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

      if (!reg?.pesapal_order_tracking_id) {
        console.warn(`[STATUS] Pas encore de pesapal_order_tracking_id pour ${refToCheck} — paiement pas encore initié côté Pesapal.`);
        return new Response(
          JSON.stringify({ success: true, status: 'PENDING', registration: null }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = await getPesapalToken();
      const statusData = await getTransactionStatus(token, reg.pesapal_order_tracking_id);
      console.log(`[STATUS] Réponse Pesapal pour ${refToCheck}:`, JSON.stringify(statusData));

      const updatedReg = await applyTransactionStatus(supabaseAdmin, refToCheck, statusData);

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
            payment_method: 'cc',
          }
        : null;

      const publicStatus = updatedReg?.payment_status === 'completed'
        ? 'SUCCESS'
        : updatedReg?.payment_status === 'failed'
          ? 'FAILED'
          : 'PENDING';

      return new Response(
        JSON.stringify({ success: true, status: publicStatus, data: statusData, registration }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================================
    // 3. NETTOYAGE DES RÉSERVATIONS ABANDONNÉES (cron pg_cron, inchangé)
    // ============================================================
    if (action === 'cleanup_stale_reservations') {
      const timeoutMinutes = Number(Deno.env.get('RESERVATION_TIMEOUT_MINUTES') || '30');
      const cutoff = new Date(Date.now() - timeoutMinutes * 60000).toISOString();

      const { data: staleRegs, error: staleError } = await supabaseAdmin
        .from('registrations')
        .select('id, role, payment_ref, created_at')
        .eq('payment_status', 'pending')
        .lt('created_at', cutoff);

      if (staleError) {
        console.error('[CLEANUP] Erreur lecture des inscriptions en attente:', staleError);
        return new Response(
          JSON.stringify({ success: false, error: staleError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[CLEANUP] ${staleRegs?.length ?? 0} inscription(s) en attente depuis plus de ${timeoutMinutes} min.`);

      for (const staleReg of staleRegs ?? []) {
        await supabaseAdmin.from('registrations').update({ payment_status: 'expired' }).eq('id', staleReg.id);

        if (staleReg.role) {
          const { error: releaseError } = await supabaseAdmin.rpc('release_registration_price', { p_role: staleReg.role });
          if (releaseError) {
            console.error(`[CLEANUP] Erreur libération de place pour ${staleReg.payment_ref}:`, releaseError);
          }
        }
        console.log(`[CLEANUP] ${staleReg.payment_ref} expiré, place Early Bird libérée pour ${staleReg.role}`);
      }

      return new Response(
        JSON.stringify({ success: true, cleaned: staleRegs?.length ?? 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Action inconnue: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Erreur critique pesapal-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur interne.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});