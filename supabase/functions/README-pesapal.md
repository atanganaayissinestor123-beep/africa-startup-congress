# Migration XentriPay → Pesapal (flux carte bancaire)

## 1. Appliquer la migration SQL

```bash
supabase db push
# ou exécuter supabase/migrations/pesapal_migration.sql via le SQL Editor
```

## 2. Configurer les secrets Supabase

```bash
supabase secrets set PESAPAL_CONSUMER_KEY=xxxxxxxxxxxx
supabase secrets set PESAPAL_CONSUMER_SECRET=xxxxxxxxxxxx
supabase secrets set PESAPAL_ENV=sandbox   # "live" en production
supabase secrets set PUBLIC_SITE_URL=https://africastartupcongress.org
# RESEND_API_KEY et RESEND_FROM sont déjà configurés (inchangés)
```

## 3. Déployer les deux fonctions

```bash
supabase functions deploy pesapal-payment
supabase functions deploy pesapal-ipn
```

## 4. Enregistrer l'URL IPN (une seule fois par environnement)

Allez sur le formulaire Pesapal correspondant et collez l'URL de votre
fonction `pesapal-ipn` :

- Sandbox : https://cybqa.pesapal.com/PesapalIframe/PesapalIframe3/IpnRegistration
  → URL à enregistrer : `https://<votre-projet>.supabase.co/functions/v1/pesapal-ipn`
- Production : https://pay.pesapal.com/iframe/PesapalIframe3/IpnRegistration
  → même URL, sur votre projet Supabase de production si différent

Choisissez le type de notification **GET** (le code gère les deux, mais GET
est le plus simple à déboguer).

Pesapal vous renvoie un `ipn_id` (GUID) pour chaque environnement. Stockez-les :

```bash
supabase secrets set PESAPAL_IPN_ID_SANDBOX=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
supabase secrets set PESAPAL_IPN_ID_LIVE=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 5. Mettre à jour register.tsx

Remplacer l'appel à `XENTRIPAY_ENDPOINT` par l'URL de `pesapal-payment` :

```ts
const PESAPAL_PAYMENT_ENDPOINT = "https://<votre-projet>.supabase.co/functions/v1/pesapal-payment";
```

Le payload `initiate_payment` attendu par la nouvelle fonction est plus
simple (plus de `cnumber`/`msisdn`/`pmethod`) :

```ts
{
  action: "initiate_payment",
  customerRef,        // = payment_ref
  email,
  cname: full_name,
  amount_usd,
  phone,               // format international, ex: +250788123456
  countryCode,          // ISO 2 lettres, ex: "RW"
}
```

Le reste du flux (polling `action: "status"`, retour sur `/register?ref=...`)
ne change pas côté frontend.

## 6. Supprimer l'ancienne fonction

Une fois les tests validés :

```bash
supabase functions delete xentripay-webhook
```

## Résumé des changements

| Avant (XentriPay) | Après (Pesapal) |
|---|---|
| 1 fonction `xentripay-webhook` (paiement + statut + webhook) | 2 fonctions : `pesapal-payment` (init + statut) et `pesapal-ipn` (notifications push) |
| Carte : flow Checkout en 2 appels (session puis pay) | Carte : 1 seul appel `SubmitOrderRequest` |
| Numéro rwandais de secours obligatoire pour les cartes étrangères | Plus nécessaire — `phone_number` international accepté nativement |
| Montant converti USD → RWF via API de change externe | Facturation directe en USD |
| `xentripayBaseUrl` (test/live) | `PESAPAL_ENV=sandbox|live` |
