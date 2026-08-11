import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle2, XCircle, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';

export default function PaymentStatus() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const paymentRef = queryParams.get('ref') || queryParams.get('reference');

  const [status, setStatus] = useState<'loading' | 'completed' | 'failed' | 'pending'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Ref pour stopper le polling proprement dès qu'on a un statut définitif
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = async () => {
    if (!paymentRef) {
      setStatus('failed');
      setErrorMessage(t('paymentStatus.errors.noRef'));
      return;
    }

    try {
      setStatus((prev) => (prev === 'completed' || prev === 'failed' ? prev : 'loading'));

      const endpoint = "https://znyyfswvdtkixqznvlmr.supabase.co/functions/v1/xentripay-webhook";

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'status',
          paymentRef: paymentRef,
        }),
      });

      const jsonResponse = await response.json();
      console.log("Statut récupéré (source XentriPay):", jsonResponse);

      // La fonction interroge maintenant XentriPay directement.
      // jsonResponse.status vaut "SUCCESS" | "FAILED" | "PENDING"
      const xpStatus = jsonResponse.status;

      if (xpStatus === 'SUCCESS') {
        setStatus('completed');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (xpStatus === 'FAILED') {
        setStatus('failed');
        setErrorMessage(t('paymentStatus.failed.defaultMessage'));
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setStatus('pending');
      }

    } catch (err: any) {
      console.error("Erreur lors de la vérification du statut:", err);
      setStatus('pending');
      setErrorMessage(err.message || t('paymentStatus.errors.network'));
    }
  };

  useEffect(() => {
    checkStatus();

    intervalRef.current = setInterval(() => {
      checkStatus();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentRef]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <SEO 
        title={t('paymentStatus.seo.title')}
        description={t('paymentStatus.seo.description')}
      />

      <div className="max-w-xl mx-auto px-4 py-32 w-full flex-grow flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12 border border-gray-100 text-center w-full">
          
          {/* État : CHARGEMENT */}
          {status === 'loading' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-blue-50 text-[#001F54] rounded-full flex items-center justify-center mx-auto animate-spin">
                <Loader size={40} />
              </div>
              <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">
                {t('paymentStatus.loading.heading')}
              </h2>
              <p className="text-gray-600 font-bold">
                {t('paymentStatus.loading.message')}
              </p>
            </div>
          )}

          {/* État : PENDING */}
          {status === 'pending' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Clock size={40} />
              </div>
              <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">
                {t('paymentStatus.pending.heading')}
              </h2>
              <p className="text-gray-600 font-bold">
                {t('paymentStatus.pending.message')}
              </p>
              {errorMessage && (
                <p className="text-sm text-red-500 font-semibold">{errorMessage}</p>
              )}
              <button
                onClick={checkStatus}
                className="w-full bg-[#001F54] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#003580] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw size={20} /> {t('paymentStatus.pending.button')}
              </button>
            </div>
          )}

          {/* État : COMPLETED */}
          {status === 'completed' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">
                {t('paymentStatus.completed.heading')}
              </h2>
              <p className="text-gray-600 font-bold">
                {t('paymentStatus.completed.message')}
              </p>
              <div className="bg-gray-50 p-4 rounded-2xl text-left space-y-2 text-sm font-semibold text-gray-700">
                <p><strong>{t('paymentStatus.completed.reference')}</strong> {paymentRef}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-[#001F54] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#003580] transition-all shadow-lg"
              >
                {t('paymentStatus.completed.button')}
              </button>
            </div>
          )}

          {/* État : FAILED */}
          {status === 'failed' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle size={40} />
              </div>
              <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tight">
                {t('paymentStatus.failed.heading')}
              </h2>
              <p className="text-gray-600 font-bold">
                {errorMessage || t('paymentStatus.failed.defaultMessage')}
              </p>
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gray-200 text-[#001F54] px-6 py-4 rounded-2xl font-black hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} /> {t('paymentStatus.failed.button')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
