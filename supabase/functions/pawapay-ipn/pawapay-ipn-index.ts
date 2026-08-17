import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/pawapay.ts';
import { applyPawapayTransactionStatus } from '../_shared/registrations.ts';

// ============================================================
// Reçoit le "Deposit callback" poussé par PawaPay dès qu'un dépôt
// atteint un statut final (COMPLETED / FAILED / REJECTED).
// Doc: https://docs.pawapay.io/v2/api-reference/deposits/deposit-callback
//
// À enregistrer comme callback URL dans le Dashboard PawaPay
// (Sandbox et Production séparément) :
//   https://<project>.supabase.co/functions/v1/pawapay-ipn
//
// Le corps de la requête EST l'objet dépôt lui-même — pas de wrapper
// FOUND/NOT_FOUND comme sur l'endpoint de polling.
// ============================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const depositData = await req.json();
    console.log('[IPN] Callback PawaPay reçu:', JSON.stringify(depositData));

    const depositId = depositData?.depositId;
    if (!depositId) {
      console.warn('[IPN] Callback sans depositId, ignoré.');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // On retrouve la ligne via pawapay_deposit_id pour récupérer payment_ref,
    // seule clé connue par applyPawapayTransactionStatus.
    const { data: reg } = await supabaseAdmin
      .from('registrations')
      .select('payment_ref')
      .eq('pawapay_deposit_id', depositId)
      .maybeSingle();

    if (!reg?.payment_ref) {
      console.warn(`[IPN] Aucune inscription trouvée pour depositId=${depositId}.`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await applyPawapayTransactionStatus(supabaseAdmin, reg.payment_ref, depositData);

    // PawaPay attend un 200 simple pour marquer le callback comme livré.
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[IPN] Erreur critique pawapay-ipn:', error);
    // On renvoie quand même 200 pour éviter des retries en boucle sur une
    // erreur de traitement de notre côté ; l'erreur est loguée pour audit.
    // Si tu préfères que PawaPay retente automatiquement, renvoie 500 ici.
    return new Response(JSON.stringify({ received: true, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
