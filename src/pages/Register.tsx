import { useState, useEffect, useRef, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import {
  Loader, Mail, Building, Globe, CreditCard, User, MessageSquare, Send, Check,
  X, HelpCircle, PhoneCall, CheckCircle2, XCircle, RefreshCw, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';
import PhoneInput, { getCountries } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// ============================================================
// Rôles détaillés, regroupés sous les 2 catégories de tarification
// (la catégorie pilote le prix + le compteur Early Bird ; le libellé
// précis est juste stocké à titre indicatif dans role_detail).
// ============================================================
const ROLE_GROUPS: { category: string; groupLabel: string; options: { value: string; label: string }[] }[] = [
  {
    category: 'startup/SME/Individual',
    groupLabel: 'Startup / SME / Individual',
    options: [
      { value: 'startup_founder', label: 'Startup founder' },
      { value: 'sme_owner', label: 'SME owner / operator' },
      { value: 'individual_attendee', label: 'Individual attendee' },
      { value: 'freelancer_consultant', label: 'Freelancer / consultant' },
      { value: 'student', label: 'Student' },
    ],
  },
  {
    category: 'corporate/investor/Organization',
    groupLabel: 'Corporate / Investor / Organisation',
    options: [
      { value: 'investor_vc', label: 'Investor / VC' },
      { value: 'corporate_executive', label: 'Corporate executive' },
      { value: 'organisation_ngo', label: 'Organisation / NGO' },
      { value: 'government_public', label: 'Government / public institution' },
      { value: 'development_partner', label: 'Development partner' },
      { value: 'sponsor_exhibitor', label: 'Sponsor / exhibitor' },
    ],
  },
];

function getCategoryForRoleDetail(roleDetail: string): string | null {
  for (const group of ROLE_GROUPS) {
    if (group.options.some(o => o.value === roleDetail)) return group.category;
  }
  return null;
}

function getRoleLabel(roleDetail: string): string {
  for (const group of ROLE_GROUPS) {
    const found = group.options.find(o => o.value === roleDetail);
    if (found) return found.label;
  }
  return roleDetail;
}

// Liste complète des pays (codes ISO 3166-1 alpha-2), noms générés
// dynamiquement via Intl.DisplayNames — pas besoin de dépendance
// supplémentaire, et ça reste à jour automatiquement.
const COUNTRY_CODES = [
  'AF','AL','DZ','AS','AD','AO','AI','AG','AR','AM','AW','AU','AT','AZ','BS','BH','BD','BB','BY','BE',
  'BZ','BJ','BM','BT','BO','BA','BW','BR','IO','BN','BG','BF','BI','CV','KH','CM','CA','KY','CF','TD',
  'CL','CN','CX','CC','CO','KM','CG','CD','CK','CR','CI','HR','CU','CW','CY','CZ','DK','DJ','DM','DO',
  'EC','EG','SV','GQ','ER','EE','SZ','ET','FK','FO','FJ','FI','FR','GF','PF','GA','GM','GE','DE','GH',
  'GI','GR','GL','GD','GP','GU','GT','GG','GN','GW','GY','HT','HN','HK','HU','IS','IN','ID','IR','IQ',
  'IE','IM','IL','IT','JM','JP','JE','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR',
  'LY','LI','LT','LU','MO','MG','MW','MY','MV','ML','MT','MH','MQ','MR','MU','YT','MX','FM','MD','MC',
  'MN','ME','MS','MA','MZ','MM','NA','NR','NP','NL','NC','NZ','NI','NE','NG','NU','NF','MK','MP','NO',
  'OM','PK','PW','PS','PA','PG','PY','PE','PH','PN','PL','PT','PR','QA','RE','RO','RU','RW','BL','SH',
  'KN','LC','MF','PM','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA',
  'SS','ES','LK','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK','TO','TT','TN','TR',
  'TM','TC','TV','UG','UA','AE','GB','US','UY','UZ','VU','VA','VE','VN','VG','VI','WF','EH','YE','ZM','ZW',
];

const countryRegionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function getCountryName(code: string): string {
  try {
    return countryRegionNames.of(code) || code;
  } catch {
    return code;
  }
}

const SUPPORTED_PHONE_COUNTRIES = new Set(getCountries());

const ALL_COUNTRIES = COUNTRY_CODES
  .filter(code => SUPPORTED_PHONE_COUNTRIES.has(code as any))
  .map(code => ({ code, name: getCountryName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

const PRICING: Record<string, { early: number; normal: number }> = {
  'startup/SME/Individual': { early: 50, normal: 100 },
  'corporate/investor/Organization': { early: 150, normal: 300 },
};
const EARLY_BIRD_THRESHOLD = 100;
const PESAPAL_ENDPOINT = "https://znyyfswvdtkixqznvlmr.supabase.co/functions/v1/pesapal-payment";
const PAWAPAY_ENDPOINT = "https://znyyfswvdtkixqznvlmr.supabase.co/functions/v1/pawapay-payment";
const PUBLIC_URL = "https://africastartupcongress.org";

// Pays couverts par PawaPay (Mobile Money) — doit rester synchronisé avec
// PAWAPAY_COUNTRIES dans functions/_shared/pawapay.ts. Si le pays choisi
// n'est pas dans cette liste, seul le paiement carte (Pesapal) est proposé.
const PAWAPAY_COUNTRIES = new Set([
  'BJ', 'BF', 'CM', 'CI', 'CD', 'ET', 'GA', 'GH', 'KE', 'LS',
  'MW', 'MZ', 'NG', 'CG', 'RW', 'SN', 'SL', 'TZ', 'UG', 'ZM',
]);

type PaymentProvider = 'pesapal' | 'pawapay';
type PaymentStage = 'idle' | 'redirecting' | 'confirming' | 'success' | 'failed';

type RegistrationSnapshot = {
  full_name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  country?: string;
  role?: string;
  role_detail?: string;
  field_of_activity?: string;
  reason?: string;
  payment_ref: string;
  payment_status?: string;
  payment_method?: string;
  payment_provider?: 'pesapal' | 'pawapay';
  amount_usd?: number | null;
  currency?: string;
};

type PaymentStatusResponse = {
  success?: boolean;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING' | string;
  registration?: RegistrationSnapshot | null;
};

const RECEIPT_CACHE_PREFIX = 'asc-registration-receipt:';

function getCachedReceipt(paymentRef: string): RegistrationSnapshot | null {
  try {
    const rawReceipt = sessionStorage.getItem(`${RECEIPT_CACHE_PREFIX}${paymentRef}`);
    if (!rawReceipt) return null;

    const receipt: unknown = JSON.parse(rawReceipt);
    if (
      typeof receipt === 'object' &&
      receipt !== null &&
      typeof (receipt as { payment_ref?: unknown }).payment_ref === 'string'
    ) {
      return receipt as RegistrationSnapshot;
    }
  } catch (cacheError) {
    console.warn('Unable to read local receipt:', cacheError);
  }

  return null;
}

function cacheReceipt(receipt: RegistrationSnapshot) {
  try {
    sessionStorage.setItem(`${RECEIPT_CACHE_PREFIX}${receipt.payment_ref}`, JSON.stringify(receipt));
  } catch (cacheError) {
    console.warn('Unable to cache local receipt:', cacheError);
  }
}

export default function Register() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tagRole = queryParams.get('tag');
  const returningRef = queryParams.get('ref'); // présent si on revient de la page de paiement hébergée Pesapal

  const [step, setStep] = useState<1 | 2 | 3>(returningRef ? 3 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    organization: '',
    countryCode: 'RW',
    role_detail: tagRole || '',
    field_of_activity: '',
    reason: '',
    paymentMethod: 'card' as 'card' | 'momo',
  });

  const countryName = getCountryName(formData.countryCode);
  const selectedCategory = formData.role_detail ? getCategoryForRoleDetail(formData.role_detail) : null;
  const isMomoAvailable = PAWAPAY_COUNTRIES.has(formData.countryCode);

  // ---- Estimation Early Bird (lecture seule, non-atomique — juste pour l'affichage) ----
  const [priceEstimate, setPriceEstimate] = useState<{ amount: number; isEarlyBird: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchEstimate = async () => {
      if (!selectedCategory) { setPriceEstimate(null); return; }
      const config = PRICING[selectedCategory];
      const { data, error: countError } = await supabase
        .from('pricing_counters')
        .select('count')
        .eq('category', selectedCategory)
        .maybeSingle();
      if (cancelled) return;
      if (countError) {
        console.error('Erreur lecture compteur pricing:', countError);
        setPriceEstimate({ amount: config.normal, isEarlyBird: false });
        return;
      }
      const currentCount = data?.count ?? 0;
      const isEarlyBird = currentCount < EARLY_BIRD_THRESHOLD;
      setPriceEstimate({ amount: isEarlyBird ? config.early : config.normal, isEarlyBird });
    };
    fetchEstimate();
    return () => { cancelled = true; };
  }, [selectedCategory]);

  const displayAmount = priceEstimate?.amount ?? (selectedCategory ? PRICING[selectedCategory].normal : 0);

  // ---- Téléphone ----
  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({ ...prev, phone: value || '' }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setFormData(prev => ({
      ...prev,
      countryCode,
      paymentMethod: PAWAPAY_COUNTRIES.has(countryCode) ? prev.paymentMethod : 'card',
    }));
  };

  // ---- Étape 1 -> Étape 2 ----
  const validateStep1 = () => {
    if (!formData.full_name || !formData.email || !formData.organization || !formData.countryCode) {
      setError(t('register.form.errorMessage'));
      return false;
    }
    setError('');
    return true;
  };

  const goToStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  // ---- Étape 3 : paiement ----
  const [paymentStage, setPaymentStage] = useState<PaymentStage>(returningRef ? 'confirming' : 'idle');
  const [paymentRef, setPaymentRef] = useState<string>(returningRef || '');
  // On ne connaît pas le provider utilisé si on revient d'une redirection
  // externe (returningRef) sans l'avoir stocké — on retente Pesapal en
  // premier par défaut, la valeur cachée reprend le dessus si trouvée.
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(() => {
    if (!returningRef) return 'pesapal';
    const cached = getCachedReceipt(returningRef) as (RegistrationSnapshot & { payment_provider?: string }) | null;
    return cached?.payment_provider === 'pawapay' ? 'pawapay' : 'pesapal';
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [paidAmountUsd, setPaidAmountUsd] = useState<number | null>(null);
  const [regSnapshot, setRegSnapshot] = useState<RegistrationSnapshot | null>(() =>
    returningRef ? getCachedReceipt(returningRef) : null
  );

  // Récupération universelle des données enregistrées dans Supabase.
  // S'exécute aussi bien pour le retour d'URL Pesapal (returningRef) que
  // pour peupler la confirmation une fois le statut connu.
  const saveReceipt = (receipt: RegistrationSnapshot) => {
    setRegSnapshot(receipt);
    cacheReceipt(receipt);
  };

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!selectedCategory) {
      setError(t('register.form.errorMessage'));
      setIsSubmitting(false);
      return;
    }

    if (!formData.phone) {
      setError(t('register.form.errorMessage'));
      setIsSubmitting(false);
      return;
    }

    const priceConfig = PRICING[selectedCategory];

    // Attribution ATOMIQUE et définitive du tarif Early Bird
    const { data: assignedPriceUsd, error: pricingError } = await supabase.rpc(
      'assign_registration_price',
      {
        p_role: selectedCategory,
        p_early_price: priceConfig.early,
        p_normal_price: priceConfig.normal,
        p_threshold: EARLY_BIRD_THRESHOLD,
      }
    );

    if (pricingError || assignedPriceUsd == null) {
      console.error('Erreur attribution du tarif:', pricingError);
      setError(t('register.form.errorMessage'));
      setIsSubmitting(false);
      return;
    }

    const calculatedAmountUsd = assignedPriceUsd as number;
    setPaidAmountUsd(calculatedAmountUsd);

    const customerRef = `CONG-${Date.now()}`;
    setPaymentRef(customerRef);

    const useMomo = formData.paymentMethod === 'momo' && isMomoAvailable;
    const provider: PaymentProvider = useMomo ? 'pawapay' : 'pesapal';
    setPaymentProvider(provider);

    const registrationData: RegistrationSnapshot = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization,
      country: countryName,
      role: selectedCategory,
      role_detail: getRoleLabel(formData.role_detail),
      field_of_activity: formData.field_of_activity,
      reason: formData.reason,
      payment_ref: customerRef,
      payment_status: 'pending',
      payment_method: useMomo ? 'momo' : 'cc',
      payment_provider: provider,
      amount_usd: calculatedAmountUsd,
      currency: 'USD',
    };

    try {
      // La ligne doit exister AVANT l'appel à pesapal-payment / pawapay-payment :
      // les deux fonctions font un update() sur payment_ref pour synchroniser
      // les données de suivi (tracking id Pesapal, deposit id PawaPay...).
      const { error: insertError } = await supabase.from('registrations').insert([registrationData]);
      if (insertError) throw insertError;

      // Copie locale en cas de retour de redirection depuis le provider.
      saveReceipt(registrationData);

      const endpoint = useMomo ? PAWAPAY_ENDPOINT : PESAPAL_ENDPOINT;
      const paymentPayload = {
        action: 'initiate_payment',
        customerRef,
        email: formData.email,
        cname: formData.full_name,
        amount_usd: calculatedAmountUsd,
        // PawaPay attend un numéro sans le préfixe '+' (ex: 250783456789).
        phone: useMomo ? formData.phone.replace(/^\+/, '') : formData.phone,
        countryCode: formData.countryCode,
      };

      const paymentResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      const paymentData = await paymentResponse.json();
      console.log(`${provider} Response via Supabase:`, paymentData);

      if (paymentData.success !== 1 || !paymentData.url) {
        throw new Error(paymentData.reply || t('register.form.errorMessage'));
      }

      setStep(3);
      setPaymentStage('redirecting');
      setTimeout(() => { window.location.href = paymentData.url; }, 1200);

    } catch (err: any) {
      setError(err.message || t('register.form.errorMessage'));
      console.error('Registration error:', err);
      setIsSubmitting(false);
    }
  };

  // ---- Polling du statut à l'étape 3 ----
  useEffect(() => {
    if (step !== 3 || !paymentRef) return;
    if (paymentStage === 'success' || paymentStage === 'failed') return;

    const checkStatus = async () => {
      try {
        const endpoint = paymentProvider === 'pawapay' ? PAWAPAY_ENDPOINT : PESAPAL_ENDPOINT;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', paymentRef: paymentRef }),
        });
        const jsonResponse = await response.json() as PaymentStatusResponse;
        console.log(`Statut récupéré (source ${paymentProvider}):`, jsonResponse);

        const paymentStatus = jsonResponse.status;

        if (paymentStatus === 'SUCCESS') {
          setPaymentStage('success');
          if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }

          if (jsonResponse.registration?.payment_ref === paymentRef) {
            saveReceipt(jsonResponse.registration);
          }

        } else if (paymentStatus === 'FAILED') {
          setPaymentStage('failed');
          setStatusMessage(t('paymentStatus.failed.defaultMessage'));
          if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        } else {
          setPaymentStage(prev => (prev === 'success' || prev === 'failed') ? prev : 'confirming');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du statut:', err);
      }
    };

    checkStatus();
    intervalRef.current = setInterval(checkStatus, 5000);

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, paymentRef, paymentProvider]);

  const resetToStart = () => {
    setStep(1);
    setPaymentStage('idle');
    setPaymentRef('');
    setError('');
    setIsSubmitting(false);
    setFormData({
      full_name: '', email: '', phone: '', organization: '', countryCode: 'RW',
      role_detail: '', field_of_activity: '', reason: '', paymentMethod: 'card',
    });
    navigate('/register');
  };

  const retryPayment = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setStep(2);
    setPaymentStage('idle');
    setIsSubmitting(false);
  };

  // ============================================================
  // RENDU
  // ============================================================
  const StepIndicator = () => (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-8 text-sm font-black uppercase tracking-widest">
      {[
        { n: 1, label: 'Your details' },
        { n: 2, label: 'Role & payment' },
        { n: 3, label: 'Confirmation' },
      ].map((s, idx) => (
        <div key={s.n} className="flex items-center gap-2">
          <span className={`flex items-center gap-2 ${step >= (s.n as 1 | 2 | 3) ? 'text-[#001F54]' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= (s.n as 1 | 2 | 3) ? 'bg-[#001F54] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > (s.n as 1 | 2 | 3) ? <Check size={14} /> : s.n}
            </span>
            {s.label}
          </span>
          {idx < 2 && <span className="w-8 h-px bg-gray-300 hidden sm:block" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={t('register.seo.title')} description={t('register.seo.description')} />

      {/* Header */}
      <section className="relative bg-[#001F54] pt-40 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FDB913] -skew-x-12 translate-x-1/2"></div>
        <div className="absolute inset-0 z-0">
          <img src="/assets/images/k1.jpg" alt="About Background" loading="lazy" className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 uppercase tracking-tighter">
            {t('register.header.heading_line1')} <br />
            <span className="text-[#FDB913]">{t('register.header.heading_highlight')}</span>
          </h1>
          <p className="text-2xl text-blue-200 font-bold max-w-2xl uppercase tracking-wide">
            {t('register.header.subheading')}
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <StepIndicator />

          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-100">

            {/* ============ ÉTAPE 1 : COORDONNÉES ============ */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">Register for ASC 2027</h2>
                  <p className="text-gray-500 font-semibold mt-2">Two short steps. We collect your details first, then take payment.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#001F54] uppercase tracking-widest flex items-center gap-2">
                      <User size={16} /> {t('register.form.fullName.label')} *
                    </label>
                    <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FDB913] focus:bg-white outline-none transition-all font-medium text-lg text-[#001F54]"
                      placeholder={t('register.form.fullName.placeholder')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#001F54] uppercase tracking-widest flex items-center gap-2">
                      <Mail size={16} /> {t('register.form.email.label')} *
                    </label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FDB913] focus:bg-white outline-none transition-all font-medium text-lg text-[#001F54]"
                      placeholder={t('register.form.email.placeholder')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#001F54] uppercase tracking-widest flex items-center gap-2">
                      <Building size={16} /> {t('register.form.organization.label')} *
                    </label>
                    <input type="text" name="organization" required value={formData.organization} onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FDB913] focus:bg-white outline-none transition-all font-medium text-lg text-[#001F54]"
                      placeholder={t('register.form.organization.placeholder')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#001F54] uppercase tracking-widest flex items-center gap-2">
                      <Globe size={16} /> {t('register.form.country.label')} *
                    </label>
                    <select name="countryCode" required value={formData.countryCode} onChange={handleCountryChange}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FDB913] focus:bg-white outline-none transition-all font-medium text-lg text-[#001F54]">
                      {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-[#001F54] uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={16} /> {t('register.form.reason.label')}
                  </label>
                  <textarea name="reason" value={formData.reason} onChange={handleChange} rows={4}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FDB913] focus:bg-white outline-none transition-all font-medium text-lg text-[#001F54] resize-none"
                    placeholder={t('register.form.reason.placeholder')} />
                  <p className="text-xs text-gray-400 font-medium">Optional, but it helps us group you into the right sessions.</p>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-3">
                    <X className="flex-shrink-0" size={20} /> {error}
                  </div>
                )}

                <button type="button" onClick={goToStep2}
                  className="w-full bg-[#001F54] text-white px-10 py-5 rounded-2xl text-xl font-black hover:bg-[#003580] transition-all flex items-center justify-center gap-3 shadow-2xl">
                  Continue to payment <Send size={22} />
                </button>
                <p className="text-center text-xs text-gray-400 font-semibold">Your place is confirmed only after payment succeeds.</p>
              </div>
            )}

            {/* ============ ÉTAPE 2 : RÔLE & PAIEMENT ============ */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">Role & payment</h2>
                  <p className="text-gray-500 font-semibold mt-1">{formData.full_name} · {formData.organization} · {countryName}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-[#001F54] uppercase tracking-widest flex items-center gap-2">
                    <User size={16} /> Participant role *
                  </label>
                  <select required value={formData.role_detail} onChange={(e) => setFormData(prev => ({ ...prev, role_detail: e.target.value }))}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FDB913] focus:bg-white outline-none transition-all font-medium text-lg text-[#001F54]">
                    <option value="">Select your role</option>
                    {ROLE_GROUPS.map(group => (
                      <optgroup key={group.category} label={`${group.groupLabel} — USD ${PRICING[group.category].normal}`}>
                        {group.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {selectedCategory && (
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#001F54] uppercase tracking-widest flex items-center gap-2">
                      <CreditCard size={16} /> Registration fee
                    </label>
                    <div
                      key={`fee-${selectedCategory}-${displayAmount}`}
                      translate="no"
                      className="notranslate w-full px-6 py-5 bg-[#001F54] rounded-2xl flex items-center justify-between"
                    >
                      <span className="text-blue-200 font-bold text-sm uppercase">{ROLE_GROUPS.find(g => g.category === selectedCategory)?.groupLabel}</span>
                      <span className="text-white font-black text-2xl">
                        USD {displayAmount}{priceEstimate?.isEarlyBird ? <span className="text-[#FDB913] text-sm ml-2">Early Bird -50%</span> : null}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-black text-[#001F54] uppercase tracking-widest flex items-center gap-2">
                    <PhoneCall size={16} /> Phone number *
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus-within:border-[#FDB913] focus-within:bg-white transition-all text-lg text-[#001F54]">
                    <PhoneInput
                      key={formData.countryCode}
                      international
                      defaultCountry={formData.countryCode as any}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="phone-input-container"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-1">
                    <HelpCircle size={12} /> {t('register.form.phone.helpText')}
                  </p>
                </div>

                {isMomoAvailable ? (
                  <div className="space-y-3">
                    <label className="text-sm font-black text-[#001F54] uppercase tracking-widest flex items-center gap-2">
                      <CreditCard size={16} /> Payment method *
                    </label>

                    <label className={`block w-full p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-[#FDB913] bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3 font-black text-[#001F54]">
                          <CreditCard size={20} /> Card
                        </span>
                        <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'}
                          onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))} className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-gray-500 font-semibold mt-1 ml-8">Secure checkout via Pesapal, with 3-D Secure.</p>
                    </label>

                    <label className={`block w-full p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'momo' ? 'border-[#FDB913] bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3 font-black text-[#001F54]">
                          <PhoneCall size={20} /> Mobile Money
                        </span>
                        <input type="radio" name="paymentMethod" value="momo" checked={formData.paymentMethod === 'momo'}
                          onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'momo' }))} className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-gray-500 font-semibold mt-1 ml-8">Pay from your MTN, Airtel or other mobile wallet via PawaPay.</p>
                    </label>
                  </div>
                ) : null}

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-2">
                  <p className="font-black text-[#001F54] text-sm uppercase flex items-center gap-2">
                    <ShieldCheck size={16} /> Secure checkout
                  </p>
                  <p className="text-sm text-[#001F54] font-semibold">
                    {formData.paymentMethod === 'momo'
                      ? "You'll be redirected to a secure PawaPay payment page — enter your mobile money PIN there to confirm."
                      : "You'll be redirected to a secure Pesapal payment page to complete your registration by card."}
                  </p>
                  <ul className="text-sm text-[#001F54] font-semibold space-y-1 list-disc list-inside">
                    <li>Do not close or refresh the payment page — it cancels the transaction.</li>
                    <li>You'll be brought back here automatically once payment completes.</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-3">
                    <X className="flex-shrink-0" size={20} /> {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-shrink-0 bg-gray-200 text-[#001F54] px-6 py-5 rounded-2xl font-black hover:bg-gray-300 transition-all flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                  </button>
                  <button type="submit" disabled={isSubmitting} translate="no"
                    className="notranslate flex-1 bg-[#001F54] text-white px-10 py-5 rounded-2xl text-xl font-black hover:bg-[#003580] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl">
                    {isSubmitting ? (<><Loader className="animate-spin" size={24} /> Processing...</>) : (<span key={`pay-btn-${displayAmount}`}>Pay USD {displayAmount} <Send size={22} className="inline" /></span>)}
                  </button>
                </div>
              </form>
            )}

            {/* ============ ÉTAPE 3 : CONFIRMATION ============ */}
            {step === 3 && (
              <div className="text-center space-y-6">
                {(paymentStage === 'idle' || paymentStage === 'redirecting') && (
                  <>
                    <div className="w-20 h-20 bg-blue-50 text-[#001F54] rounded-full flex items-center justify-center mx-auto animate-spin">
                      <Loader size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">Redirecting to secure checkout</h2>
                    <p className="text-gray-600 font-bold">
                      You're being sent to {paymentProvider === 'pawapay' ? 'PawaPay' : 'Pesapal'} to complete your payment.
                    </p>
                  </>
                )}

                {paymentStage === 'confirming' && (
                  <>
                    <div className="w-20 h-20 bg-blue-50 text-[#001F54] rounded-full flex items-center justify-center mx-auto animate-spin">
                      <Loader size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">Confirming your payment</h2>
                    <p className="text-gray-600 font-bold">
                      We're checking with {paymentProvider === 'pawapay' ? 'PawaPay' : 'Pesapal'} that your payment went through. This can take a few seconds.
                    </p>
                    <p className="text-sm text-gray-400 font-mono">Reference {paymentRef}</p>
                  </>
                )}

                {paymentStage === 'success' && (
                  <>
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">Payment received</h2>
                    <p className="text-gray-600 font-bold">
                      You are registered for ASC 2027. A receipt is on the way to <strong>{regSnapshot?.email || formData.email}</strong>.
                    </p>
                    <div className="bg-gray-50 p-5 rounded-2xl text-left space-y-3 text-sm font-semibold text-gray-700">
                      <div className="flex justify-between"><span>Name</span><span className="font-black text-[#001F54]">{regSnapshot?.full_name ?? formData.full_name}</span></div>
                      <div className="flex justify-between"><span>Organisation</span><span className="font-black text-[#001F54]">{regSnapshot?.organization ?? formData.organization}</span></div>
                      <div className="flex justify-between"><span>Country</span><span className="font-black text-[#001F54]">{regSnapshot?.country ?? countryName}</span></div>
                      <div className="flex justify-between"><span>Role</span><span className="font-black text-[#001F54]">{regSnapshot?.role_detail ?? getRoleLabel(formData.role_detail)}</span></div>
                      <div className="flex justify-between"><span>Fee category</span><span className="font-black text-[#001F54]">{ROLE_GROUPS.find(g => g.category === (regSnapshot?.role ?? selectedCategory))?.groupLabel ?? ''}</span></div>
                      <div className="flex justify-between"><span>Amount paid</span><span className="font-black text-[#001F54]">USD {regSnapshot?.amount_usd ?? paidAmountUsd ?? displayAmount}</span></div>
                      <div className="flex justify-between"><span>Method</span><span className="font-black text-[#001F54]">
                        {(regSnapshot?.payment_provider ?? paymentProvider) === 'pawapay'
                          ? `Mobile Money · PawaPay${regSnapshot?.phone ? ` · ${regSnapshot.phone}` : ''}`
                          : 'Card · Pesapal'}
                      </span></div>
                      <div className="flex justify-between"><span>Reference</span><span className="font-black text-[#001F54]">{paymentRef}</span></div>
                    </div>
                    <button onClick={resetToStart}
                      className="w-full bg-[#001F54] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#003580] transition-all shadow-lg">
                      Start a new registration
                    </button>
                  </>
                )}

                {paymentStage === 'failed' && (
                  <>
                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                      <XCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">Payment failed</h2>
                    <p className="text-gray-600 font-bold">{statusMessage || t('paymentStatus.failed.defaultMessage')}</p>
                    <div className="flex gap-4">
                      <button onClick={retryPayment}
                        className="flex-1 bg-gray-200 text-[#001F54] px-6 py-4 rounded-2xl font-black hover:bg-gray-300 transition-all flex items-center justify-center gap-2">
                        <RefreshCw size={20} /> Try again
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}
