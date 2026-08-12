import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, CheckCircle2, XCircle, Building, Globe, ShieldCheck } from 'lucide-react';

const BADGE_ENDPOINT = "https://znyyfswvdtkixqznvlmr.supabase.co/functions/v1/badge";

type BadgeInfo = {
  registration_id: string;
  full_name: string;
  organization: string;
  country: string;
  role_detail: string;
  amount_usd: number;
  date: string;
};

export default function BadgePage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<BadgeInfo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${BADGE_ENDPOINT}?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setInfo(data);
        else setError(data.error || 'Badge introuvable.');
      })
      .catch(() => setError('Impossible de vérifier ce badge.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-[#001F54]" size={40} />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <XCircle className="text-red-500" size={48} />
        <p className="font-black text-red-600 uppercase text-sm">Not verified</p>
        <p className="text-gray-500 font-semibold">{error || 'Badge introuvable.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-gray-100">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center justify-center gap-1">
            <ShieldCheck size={14} /> Verified registration
          </p>
          <p className="text-xs font-black uppercase tracking-widest text-[#FDB913]">Africa Startup Congress #ASC27</p>
        </div>

        <div className="bg-gray-50 p-5 rounded-2xl space-y-3 text-sm font-semibold text-gray-700">
          <div className="flex justify-between"><span>Name</span><span className="font-black text-[#001F54]">{info.full_name}</span></div>
          <div className="flex justify-between"><span>Organisation</span><span className="font-black text-[#001F54] flex items-center gap-1"><Building size={12} />{info.organization}</span></div>
          <div className="flex justify-between"><span>Country</span><span className="font-black text-[#001F54] flex items-center gap-1"><Globe size={12} />{info.country}</span></div>
          <div className="flex justify-between"><span>Category</span><span className="font-black text-[#001F54]">{info.role_detail}</span></div>
          <div className="flex justify-between"><span>Amount paid</span><span className="font-black text-[#001F54]">USD {info.amount_usd}</span></div>
          <div className="flex justify-between"><span>Reference</span><span className="font-black text-[#001F54]">{info.registration_id}</span></div>
        </div>

        <p className="text-center text-xs text-gray-400 font-semibold">
          Compare these details with the printed receipt to confirm it is genuine.
        </p>
      </div>
    </div>
  );
}
