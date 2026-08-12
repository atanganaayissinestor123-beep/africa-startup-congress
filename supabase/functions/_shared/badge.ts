// ============================================================
// Génération de l'image QR code (PNG) encodant l'URL publique du badge.
// Utilise la librairie `qrcode` (rendu pur JS, sans dépendance native —
// fonctionne donc directement dans le runtime Deno des Edge Functions).
// ============================================================
import QRCode from 'https://esm.sh/qrcode@1.5.3';

export function getBadgeUrl(qrToken: string): string {
  const publicUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://africastartupcongress.org';
  return `${publicUrl}/badge/${qrToken}`;
}

// Retourne les octets PNG du QR code, prêts à être embarqués dans un PDF
// via pdf-lib (`pdfDoc.embedPng(bytes)`).
export async function generateQrPngBytes(qrToken: string): Promise<Uint8Array> {
  const dataUrl: string = await QRCode.toDataURL(getBadgeUrl(qrToken), {
    margin: 1,
    width: 300,
    color: { dark: '#001F54', light: '#FFFFFF' },
  });

  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}