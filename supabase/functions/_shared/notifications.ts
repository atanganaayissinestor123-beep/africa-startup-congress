// ============================================================
// GÉNÉRATION DU REÇU PDF + ENVOI D'E-MAIL VIA RESEND
// Logique inchangée par rapport à l'ancienne intégration XentriPay
// (aucune dépendance à un agrégateur particulier) — seulement déplacée
// ici pour être partagée entre pesapal-payment et pesapal-ipn.
// ============================================================
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';
import { generateQrPngBytes, getBadgeUrl } from './badge.ts';

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

interface ReceiptData {
  registrationId: string;
  fullName: string;
  email: string;
  organization: string | null;
  country: string | null;
  role: string | null;
  paymentMethod: string | null;
  amountUsd: number | null;
  date: string;
  qrToken: string | null;
}

async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const navy = rgb(0 / 255, 31 / 255, 84 / 255);
  const gold = rgb(253 / 255, 185 / 255, 19 / 255);
  const gray = rgb(0.35, 0.35, 0.35);

  let y = 780;

  page.drawText('Africa Startup Congress #ASC27', { x: 50, y, size: 20, font: boldFont, color: navy });
  y -= 10;
  page.drawRectangle({ x: 50, y, width: 130, height: 4, color: gold });
  y -= 30;

  page.drawText('Official Payment Receipt', { x: 50, y, size: 14, font: boldFont, color: gray });
  y -= 45;

  const row = (label: string, value: string | null | undefined) => {
    page.drawText(label, { x: 50, y, size: 10, font: boldFont, color: gray });
    page.drawText(value || '—', { x: 230, y, size: 10, font, color: navy });
    y -= 24;
  };

  row('Registration ID:', data.registrationId);
  row('Full Name:', data.fullName);
  row('Email:', data.email);
  row('Organization:', data.organization);
  row('Country:', data.country);
  row('Delegate Category:', data.role);
  row('Payment Method:', data.paymentMethod || 'Card');
  row('Amount Paid (USD):', data.amountUsd != null ? `USD ${data.amountUsd}` : null);
  row('Date:', data.date);
  row('Status:', 'Confirmed');

  y -= 24;
  page.drawRectangle({ x: 50, y: y + 14, width: 495, height: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 20;

  page.drawText(
    'Thank you for registering for the Africa Startup Congress #ASC27 (24-26 February 2027, Kigali, Rwanda).',
    { x: 50, y, size: 9, font, color: gray, maxWidth: 495 }
  );
  y -= 14;
  page.drawText(
    'This receipt confirms your payment has been received in full. Please keep it for your records.',
    { x: 50, y, size: 9, font, color: gray, maxWidth: 495 }
  );

  // ============================================================
  // QR CODE — vérification anti-fraude. Scanné, il renvoie les vraies
  // informations d'inscription depuis la base de données, à comparer
  // avec ce qui est imprimé sur ce PDF (détecte un reçu falsifié).
  // ============================================================
  if (data.qrToken) {
    try {
      const qrBytes = await generateQrPngBytes(data.qrToken);
      const qrImage = await pdfDoc.embedPng(qrBytes);
      const qrSize = 110;
      const qrX = 435;
      const qrY = 60;

      page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });
      page.drawText('Verify online', {
        x: qrX, y: qrY - 12, size: 8, font: boldFont, color: navy,
      });
      page.drawText('Scan to confirm authenticity', {
        x: qrX, y: qrY - 22, size: 7, font, color: gray,
      });
    } catch (qrError) {
      console.error(`[RECEIPT] Échec génération QR code pour ${data.registrationId} — reçu généré sans badge:`, qrError);
    }
  }

  return await pdfDoc.save();
}

export async function sendConfirmationEmailViaResend(delegateData: {
  email: string;
  fullName: string;
  registrationId: string;
  role: string;
  amountUsd: number;
  organization?: string | null;
  country?: string | null;
  paymentMethod?: string | null;
  date?: string | null;
  qrToken?: string | null;
}) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromAddress = Deno.env.get('RESEND_FROM') || 'Africa Startup Congress <asc@africastartupcongress.org>';

  if (!resendApiKey) {
    console.error("RESEND_API_KEY manquant dans les secrets Supabase — envoi d'e-mail impossible.");
    return;
  }

  const badgeUrl = delegateData.qrToken ? getBadgeUrl(delegateData.qrToken) : null;

  const subject = 'Africa Startup Congress #ASC27';
  const body = `
Registration & Payment Confirmation

Dear ${delegateData.fullName},
Thank you for registering for the Africa Startup Congress #ASC27, taking place in Kigali, Rwanda, from 24–26 February 2027.

We are pleased to confirm that we have successfully received your registration and payment.

Registration Details
Registration ID: ${delegateData.registrationId}
Delegate Category: ${delegateData.role}
Amount Paid: USD ${delegateData.amountUsd}
Payment Status: Confirmed

Your official payment receipt is attached to this email as a PDF — please keep it for your records. It includes a QR code you can scan to verify your registration details online at any time${badgeUrl ? ` (${badgeUrl})` : ''}.
Your registration is now complete, and your place at Africa's premier gathering of entrepreneurs, investors, innovators, policymakers, and ecosystem leaders has been secured.

Few weeks to the congress you will receive:
- Your official delegate confirmation letter
- Event programme and agenda
- Venue and accommodation information
- Travel and visa support details (where applicable)
- Networking and event access instructions

We look forward to welcoming you to Kigali for three inspiring days of innovation, collaboration, investment, and business opportunities.

If you have any questions, please contact us at asc@africastartupcongress.org

Thank you for being part of the movement to accelerate Africa's innovation and entrepreneurship ecosystem.

Africa Startup Congress #ASC27
Accelerating Innovation. Connecting Africa. Building the Future.
  `.trim();

  console.log(`[EMAIL] Tentative d'envoi via Resend à ${delegateData.email} pour ${delegateData.registrationId}`);

  let attachments: { filename: string; content: string }[] | undefined;
  try {
    const pdfBytes = await generateReceiptPdf({
      registrationId: delegateData.registrationId,
      fullName: delegateData.fullName,
      email: delegateData.email,
      organization: delegateData.organization ?? null,
      country: delegateData.country ?? null,
      role: delegateData.role,
      paymentMethod: delegateData.paymentMethod ?? null,
      amountUsd: delegateData.amountUsd,
      date: delegateData.date || new Date().toISOString().slice(0, 10),
      qrToken: delegateData.qrToken ?? null,
    });
    attachments = [{
      filename: `ASC27-Receipt-${delegateData.registrationId}.pdf`,
      content: uint8ToBase64(pdfBytes),
    }];
    console.log(`[EMAIL] Reçu PDF généré (${pdfBytes.length} octets) pour ${delegateData.registrationId}`);
  } catch (pdfError) {
    console.error(`[EMAIL] Échec génération du reçu PDF pour ${delegateData.registrationId} — envoi sans pièce jointe:`, pdfError);
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: delegateData.email,
        subject,
        text: body,
        ...(attachments ? { attachments } : {}),
      }),
    });

    const respData = await resp.json();

    if (!resp.ok) {
      console.error(`[EMAIL] Échec Resend (HTTP ${resp.status}) pour ${delegateData.email} :`, JSON.stringify(respData));
    } else {
      console.log(`[EMAIL] Succès — envoyé à ${delegateData.email} (Resend id: ${respData.id})`);
    }
  } catch (error) {
    console.error(`[EMAIL] Erreur réseau lors de l'envoi à ${delegateData.email} :`, error);
  }
}
