import { Link } from 'react-router-dom';
import { Mic2 } from 'lucide-react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';

export default function Speakers() {
  const { t } = useTranslation();

  const speakersData = t('speakers.items', { returnObjects: true });
  const speakers = Array.isArray(speakersData) ? speakersData : [];

  const speakersSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": t('speakers.seo.title'),
    "url": "https://africastartupcongress.org/speakers",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": speakers.map((speaker: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Person",
          "name": speaker.name,
          "jobTitle": speaker.title,
          "image": `https://africastartupcongress.org${speaker.image}`
        }
      }))
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO 
        title={t('speakers.seo.title')}
        description={t('speakers.seo.description')}
      >
        <script type="application/ld+json">{JSON.stringify(speakersSchema)}</script>
      </SEO>
      {/* Header */}
      <section className="relative bg-[#001F54] pt-40 pb-24 overflow-hidden h-[80vh]">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/images/6.jpeg"
            alt="Speakers Background"
            loading="lazy"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center h-full flex flex-col justify-center">
          <p className="text-[#FDB913] font-semibold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-left duration-700">
            {t('speakers.header.tagline')}
          </p>
          <h1 className="text-3xl sm:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
            {t('speakers.header.heading_line1')} <span className="text-[#FDB913]">{t('speakers.header.heading_highlight')}</span>
          </h1>
          <p className="text-2xl text-blue-200 font-semibold max-w-2xl mx-auto">
            {t('speakers.header.subheading')}
          </p>
        </div>
      </section>

      {/* Speakers Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16">
            {speakers.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="bg-[#001F54] p-4 rounded-2xl shadow-2xl transform transition-all mx-auto mb-4 w-fit h-fit">
                  <Mic2 size={48} className="text-[#FDB913] mx-auto mb-4" />
                </div>
                <h2 className="text-3xl font-black text-[#001F54] uppercase">{t('speakers.empty.heading')}</h2>
                <p className="text-gray-500 text-xl">{t('speakers.empty.subtext')}</p>
              </div>
            )}
            {speakers.map((speaker, index) => (
              <div key={index} className="group relative">
                {/* Background Card */}
                <div className="absolute inset-0 bg-[#001F54] rounded-[2rem] transform rotate-3 group-hover:rotate-1 transition-transform duration-500 shadow-2xl"></div>

                {/* Main Card */}
                <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-xl border-2 border-gray-100 group-hover:border-[#FDB913] transition-all duration-500">
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={speaker.image}
                      alt={speaker.name}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                    />
                    <div className="absolute top-6 right-6">
                      <div className="bg-[#FDB913] p-4 rounded-2xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all">
                        <Mic2 size={24} className="text-[#001F54]" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="inline-block bg-[#FDB913] text-[#001F54] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                        {speaker.category}
                      </div>
                      <h3 className="text-3xl font-black text-white uppercase">
                        {speaker.name}
                      </h3>
                       <p className="text-[#FDB913] font-bold text-sm mb-4">
                      {speaker.title}
                    </p>
                    
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Speaker */}
      <section className="py-24 bg-gray-50 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-gray-200/50 uppercase leading-none select-none tracking-tighter whitespace-nowrap">
          {t('speakers.becomeASpeaker.watermark')}
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black text-[#001F54] mb-8 uppercase leading-none tracking-tighter">
            {t('speakers.becomeASpeaker.heading_line1')} <br />
            <span className="text-[#FDB913]">{t('speakers.becomeASpeaker.heading_highlight')}</span>
          </h2>
          <p className="text-xl text-gray-500 font-bold mb-12 uppercase tracking-widest leading-relaxed">
            {t('speakers.becomeASpeaker.subheading')}
          </p>
          <Link
            to="/register?tag=speaker"
            className="inline-block bg-[#001F54] text-white px-12 py-5 rounded-2xl text-xl font-black hover:bg-[#003580] transition-all transform hover:scale-105 shadow-2xl"
          >
            {t('speakers.becomeASpeaker.cta')}
          </Link>
        </div>
      </section>

      {/* Final Register CTA */}
      <section className="py-24 bg-[#FDB913]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-[#001F54] p-12 lg:p-20 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,31,84,0.4)]">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl sm:text-6xl font-black text-white mb-4 uppercase tracking-tighter leading-none">
                {t('speakers.cta.heading_line1')} <br />
                <span className="text-[#FDB913]">{t('speakers.cta.heading_highlight')}</span>
              </h2>
              <p className="text-xl text-blue-200 font-bold uppercase tracking-widest">
                {t('speakers.cta.subheading')}
              </p>
            </div>
            <Link
              to="/register"
              className="bg-[#FDB913] text-[#001F54] px-16 py-6 rounded-2xl text-2xl font-black hover:bg-white hover:scale-105 transition-all uppercase tracking-widest shadow-2xl"
            >
              {t('speakers.cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
