// ============================================================
// Fonction badge — vérification anti-fraude.
//
// Le QR code du reçu encode une URL publique (/badge/:token). En la
// scannant, on obtient les VRAIES informations d'inscription telles
// qu'enregistrées côté serveur — donc si quelqu'un modifie/fabrique un
// PDF (autre nom, montant gonflé...), le scan révèle immédiatement
// l'incohérence, puisqu'il n'affiche jamais le contenu du PDF lui-même,
// seulement ce qui est réellement en base.
//
// Volontairement public (pas d'authentification) : le staff à l'entrée
// doit pouvoir scanner avec n'importe quel téléphone, sans code d'accès.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/pesapal.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Token manquant.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: reg } = await supabaseAdmin
      .from('registrations')
      .select('payment_ref, full_name, organization, country, role_detail, amount_usd, payment_status, created_at')
      .eq('qr_token', token)
      .maybeSingle();

    if (!reg) {
      return new Response(JSON.stringify({ success: false, error: 'Badge introuvable — ce QR code ne correspond à aucune inscription.' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (reg.payment_status !== 'completed') {
      return new Response(JSON.stringify({ success: false, error: 'Paiement non confirmé pour cette inscription.' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ce sont exactement les mêmes informations que celles imprimées sur
    // le reçu PDF — le point de comparaison pour détecter une falsification.
    return new Response(JSON.stringify({
      success: true,
      registration_id: reg.payment_ref,
      full_name: reg.full_name,
      organization: reg.organization,
      country: reg.country,
      role_detail: reg.role_detail,
      amount_usd: reg.amount_usd,
      date: reg.created_at ? String(reg.created_at).slice(0, 10) : null,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Erreur critique badge:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Erreur interne.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});