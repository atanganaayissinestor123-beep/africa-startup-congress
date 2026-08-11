// ============================================================
// Applique le résultat de GetTransactionStatus à une ligne `registrations`.
// Partagé entre pesapal-payment (action=status, polling front) et
// pesapal-ipn (notification push de Pesapal), pour ne jamais dupliquer
// la logique "libérer la place Early Bird si échec / envoyer l'e-mail si
// succès".
// ============================================================
import { sendConfirmationEmailViaResend } from './notifications.ts';
import { mapPesapalStatus } from './pesapal.ts';

export async function applyTransactionStatus(
  supabaseAdmin: any,
  paymentRef: string,
  statusData: any
) {
  const newStatus = mapPesapalStatus(statusData.status_code);

  const { data: reg } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('payment_ref', paymentRef)
    .maybeSingle();

  if (!reg) {
    console.warn(`[STATUS] Aucune ligne Supabase trouvée pour payment_ref=${paymentRef} — mise à jour ignorée.`);
    return null;
  }

  // Toujours garder trace des identifiants Pesapal, même si le statut
  // global n'a pas encore changé (utile pour le debug / support).
  await supabaseAdmin
    .from('registrations')
    .update({
      pesapal_order_tracking_id: statusData.order_tracking_id ?? reg.pesapal_order_tracking_id ?? null,
      pesapal_confirmation_code: statusData.confirmation_code ?? reg.pesapal_confirmation_code ?? null,
    })
    .eq('payment_ref', paymentRef);

  if (reg.payment_status === newStatus) {
    console.log(`[STATUS] payment_status déjà à jour (${reg.payment_status}) pour ${paymentRef} — pas de ré-envoi.`);
    return { ...reg, payment_status: newStatus };
  }

  const { error: updateError } = await supabaseAdmin
    .from('registrations')
    .update({ payment_status: newStatus })
    .eq('payment_ref', paymentRef);

  if (updateError) {
    console.error(`[STATUS] Erreur update Supabase pour ${paymentRef}:`, updateError);
  } else {
    console.log(`[STATUS] Supabase mis à jour: payment_status=${newStatus} pour ${paymentRef}`);
  }

  // Paiement échoué → on libère la place Early Bird réservée à l'inscription.
  if (newStatus === 'failed' && reg.role) {
    const { error: releaseError } = await supabaseAdmin.rpc('release_registration_price', { p_role: reg.role });
    if (releaseError) {
      console.error(`[STATUS] Erreur libération de place pour ${paymentRef} (catégorie ${reg.role}):`, releaseError);
    } else {
      console.log(`[STATUS] Place Early Bird libérée pour catégorie ${reg.role} (paiement ${paymentRef} échoué)`);
    }
  }

  if (newStatus === 'completed') {
    await sendConfirmationEmailViaResend({
      email: reg.email,
      fullName: reg.full_name,
      registrationId: paymentRef,
      role: reg.role_detail || reg.role,
      amountUsd: reg.amount_usd || 0,
      organization: reg.organization,
      country: reg.country,
      paymentMethod: 'Card',
      date: reg.created_at ? String(reg.created_at).slice(0, 10) : null,
    });
  }

  return { ...reg, payment_status: newStatus };
}
