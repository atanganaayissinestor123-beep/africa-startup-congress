import { useState } from 'react';
import { Target, Eye, Lightbulb, Zap, ChevronLeft, ChevronRight, Quote, BadgeInfo, Award } from 'lucide-react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  const values = [
    { title: t('about.values.items.inclusion.title'), icon: Target, text: t('about.values.items.inclusion.text') },
    { title: t('about.values.items.innovation.title'), icon: Lightbulb, text: t('about.values.items.innovation.text') },
    { title: t('about.values.items.collaboration.title'), icon: Zap, text: t('about.values.items.collaboration.text') },
    { title: t('about.values.items.impact.title'), icon: Award, text: t('about.values.items.impact.text') },
  ];

  const images = [
    {
      title: t('about.gallery.images.aab_camp'),
      img: "/assets/images/1.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit'),
      img: "/assets/images/2.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit_alt'),
      img: "/assets/images/3.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit_alt'),
      img: "/assets/images/4.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit_alt'),
      img: "/assets/images/5.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit_alt'),
      img: "/assets/images/6.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit_alt'),
      img: "/assets/images/7.jpeg"
    },
    {
      title: t('about.gallery.images.aab_boot'),
      img: "/assets/images/8.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit_alt'),
      img: "/assets/images/9.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit_alt'),
      img: "/assets/images/10.jpeg"
    },
    {
      title: t('about.gallery.images.networking'),
      img: "/assets/images/11.jpeg"
    },
    {
      title: t('about.gallery.images.pitch'),
      img: "/assets/images/12.jpeg"
    },
    {
      title: t('about.gallery.images.panel'),
      img: "/assets/images/13.jpeg"
    },
    {
      title: t('about.gallery.images.masterclass'),
      img: "/assets/images/14.jpeg"
    },
    {
      title: t('about.gallery.images.gala'),
      img: "/assets/images/15.jpeg"
    },
    {
      title: t('about.gallery.images.exhibition'),
      img: "/assets/images/16.jpeg"
    },
    {
      title: t('about.gallery.images.aab_camp'),
      img: "/assets/images/17.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit'),
      img: "/assets/images/18.jpeg"
    },
    {
      title: t('about.gallery.images.aas_summit_alt'),
      img: "/assets/images/19.jpeg"
    },
    {
      title: t('about.gallery.images.aab_boot'),
      img: "/assets/images/20.jpeg"
    },
    {
      title: t('about.gallery.images.networking'),
      img: "/assets/images/21.jpeg"
    },
    {
      title: t('about.gallery.images.pitch'),
      img: "/assets/images/22.jpeg"
    },
    {
      title: t('about.gallery.images.panel'),
      img: "/assets/images/23.jpeg"
    },
    {
      title: t('about.gallery.images.masterclass'),
      img: "/assets/images/24.jpeg"
    },
    {
      title: t('about.gallery.images.gala'),
      img: "/assets/images/25.jpeg"
    },
  ];

  const ChallengePoints = [
    { title: t('about.challenges.items.venture_capital.title'), text: t('about.challenges.items.venture_capital.text') },
    { title: t('about.challenges.items.regulatory.title'), text: t('about.challenges.items.regulatory.text') },
    { title: t('about.challenges.items.infrastructure.title'), text: t('about.challenges.items.infrastructure.text') },
    { title: t('about.challenges.items.talent.title'), text: t('about.challenges.items.talent.text') },
    { title: t('about.challenges.items.investor.title'), text: t('about.challenges.items.investor.text') },
    { title: t('about.challenges.items.ecosystem.title'), text: t('about.challenges.items.ecosystem.text') },
  ];



  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(images.length / itemsPerPage);
  const paginatedImages = images.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Africa Startup Congress",
      "url": "https://africastartupcongress.org",
      "logo": "https://africastartupcongress.org/assets/images/logo.png"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={t('about.seo.title')}
        description={t('about.seo.description')}
      >
        <script type="application/ld+json">{JSON.stringify(aboutSchema)}</script>
      </SEO>
      {/* Header */}
      <section className="relative bg-[#001F54] pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/images/k1.png"
            alt="About Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-[#FDB913] font-semibold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-left duration-700">
            {t('about.header.tagline')}
          </p>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
            {t('about.header.heading_line1')} <span className="text-[#FDB913] pr-1">{t('about.header.heading_highlight1')}</span>
            {t('about.header.heading_line2')} <span className="text-[#FDB913]">{t('about.header.heading_highlight2')}</span>
            {t('about.header.heading_line3')}
          </h1>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className=" ">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-6xl font-black text-[#001F54] uppercase leading-none">
                {t('about.background.heading_line1')} <br />
                <span className="text-[#FDB913]">{t('about.background.heading_highlight')}</span>
              </h2>
              <div className="space-y-6 text-xl leading-relaxed font-medium md:flex gap-16 items-center">
                <div className='p-12 rounded-3xl shadow-xl text-gray-600'>
                  <div className="bg-[#FDB913] p-6 rounded-2xl w-max mb-8">
                    <Quote className="text-[#001F54]" size={40} />
                  </div>
                  <h3 className='text-[#001F54] uppercase leading-none font-bold text-2xl mb-4'>{t('about.background.rationale.heading')}</h3>
                  {t('about.background.rationale.text')}
                </div>
                <div className='p-12 rounded-3xl shadow-xl text-gray-600'>
                  <div className="bg-[#FDB913] p-6 rounded-2xl w-max mb-8">
                    <BadgeInfo className="text-[#001F54]" size={40} />
                  </div>
                  <h3 className='text-[#001F54] uppercase leading-none font-bold text-2xl mb-4'>{t('about.background.about.heading')}</h3>
                  {t('about.background.about.text')}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-12 rounded-3xl shadow-xl transition-all hover:scale-[1.02]">
              <div className="bg-[#FDB913] p-6 rounded-2xl w-max mb-8">
                <Target className="text-[#001F54]" size={40} />
              </div>
              <h3 className="text-4xl font-black text-[#001F54] mb-6 uppercase tracking-tight">
                {t('about.mission.heading')}
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed font-bold  tracking-wide">
                {t('about.mission.text')}
              </p>
            </div>
            <div className="bg-[#001F54] p-12 rounded-3xl shadow-xl transition-all hover:scale-[1.02]">
              <div className="bg-white p-6 rounded-2xl w-max mb-8">
                <Eye className="text-[#001F54]" size={40} />
              </div>
              <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">
                {t('about.vision.heading')}
              </h3>
              <p className="text-xl text-blue-200 leading-relaxed font-bold tracking-wide">
                {t('about.vision.text')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-6xl font-black text-center text-[#001F54] mb-20 uppercase">
            {t('about.values.heading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div
                key={i}
                className="text-center p-8 bg-white rounded-3xl border-2 border-gray-100 hover:border-[#FDB913] transition-all group"
              >
                <div className="mb-6 flex justify-center">
                  <v.icon
                    size={48}
                    className="text-[#001F54] group-hover:text-[#FDB913] transition-colors"
                  />
                </div>
                <h4 className="text-2xl font-black text-[#001F54] mb-4 uppercase">
                  {v.title}
                </h4>
                <p className="text-gray-500 font-bold tracking-tight">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


{/* overview & challenges */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className='mb-10 flex flex-col items-center'>
           <h2 className="text-4xl sm:text-4xl font-black text-center text-[#001F54] uppercase ">
             {t('about.challenges.heading_line1')} <br />
             <span className='text-[#FDB913]'>{t('about.challenges.heading_highlight')}</span>
           </h2>
            <div className="h-1 w-24 bg-[#FDB913] my-8"></div>
          <p className="text-center text-gray-500 font-bold md:w-2/3">
            {t('about.challenges.description')}
          </p>
         </div>



<div className=' grid grid-cols-1 sm:grid-cols-2 gap-10'>
{
  ChallengePoints.map((point, i) => (
  <Points title={point.title} description={point.text} key={i} index={`0${i+1}`}/>
  ))
}
</div>
            
        </div>
          
      </section>

      {/* Why We Are Unique - Stats Style */}
      <section className="py-24 bg-[#001F54] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20 flex flex-col items-center">
            <h2 className="text-4xl sm:text-4xl font-black mb-6 uppercase leading-none text-center">
              {t('about.whyDifferent.heading_line1')} <br />
              <span className="text-[#FDB913]">{t('about.whyDifferent.heading_highlight')}</span>
            </h2>
            <div className="h-1 w-24 bg-[#FDB913]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="flex gap-8 group flex-col sm:flex-row">
              <div className="text-8xl font-black text-[#FDB913]/20 group-hover:text-[#FDB913]/40 transition-colors">
                {t('about.whyDifferent.items.policy.number')}
              </div>
              <div>
                <h3 className="text-3xl font-black mb-4 uppercase">
                   {t('about.whyDifferent.items.policy.title')}
                </h3>
                <p className="text-xl text-blue-200 italic font-medium leading-relaxed">
                  {t('about.whyDifferent.items.policy.text')}
                </p>
              </div>
            </div>
            <div className="flex gap-8 group flex-col sm:flex-row">
              <div className="text-8xl font-black text-[#FDB913]/20 group-hover:text-[#FDB913]/40 transition-colors">
                {t('about.whyDifferent.items.action.number')}
              </div>
              <div>
                <h3 className="text-3xl font-black mb-4 uppercase">
                {t('about.whyDifferent.items.action.title')}
                </h3>
                <p className="text-xl text-blue-200 italic font-medium leading-relaxed">
                  {t('about.whyDifferent.items.action.text')}
                </p>
              </div>
            </div>
            <div className="flex gap-8 group flex-col sm:flex-row">
              <div className="text-8xl font-black text-[#FDB913]/20 group-hover:text-[#FDB913]/40 transition-colors">
                {t('about.whyDifferent.items.panAfrican.number')}
              </div>
              <div>
                <h3 className="text-3xl font-black mb-4 uppercase">
                  {t('about.whyDifferent.items.panAfrican.title')}
                </h3>
                <p className="text-xl text-blue-200 italic font-medium leading-relaxed">
                  {t('about.whyDifferent.items.panAfrican.text')}
                </p>
              </div>
            </div>
            <div className="flex gap-8 group flex-col sm:flex-row">
              <div className="text-8xl font-black text-[#FDB913]/20 group-hover:text-[#FDB913]/40 transition-colors">
                {t('about.whyDifferent.items.investors.number')}
              </div>
              <div>
                <h3 className="text-3xl font-black mb-4 uppercase">
               {t('about.whyDifferent.items.investors.title')}
                </h3>
                <p className="text-xl text-blue-200 italic font-medium leading-relaxed">
               {t('about.whyDifferent.items.investors.text')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-black text-[#001F54] mb-6 uppercase">
              {t('about.gallery.heading_line1')} <span className="text-[#FDB913]">{t('about.gallery.heading_highlight')}</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-bold uppercase tracking-widest">
              {t('about.gallery.subheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedImages.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square overflow-hidden rounded-3xl group relative shadow-xl border-4 border-gray-50 hover:border-[#FDB913] transition-all duration-300 transform hover:scale-[1.02]"
              >
                <img
                  src={img.img}
                  alt={`ASC Event ${idx + 1}`}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001F54] via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-end p-8">
                  <div>
    
                    <h4 className="text-white text-xl font-black uppercase">
                     {img.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 md:gap-8 mt-16">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="flex items-center px-4 md:px-8 py-2 md:py-4 bg-[#001F54] text-white font-black rounded-2xl disabled:opacity-20 hover:bg-[#FDB913] hover:text-[#001F54] transition-all duration-300 group shadow-lg"
            >
              <ChevronLeft
                size={24}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="tracking-widest">{t('about.gallery.pagination.back')}</span>
            </button>

            <div className="flex items-center gap-4">
              {[...Array(totalPages)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-4 md:w-8 rounded-full transition-all duration-300 ${i === currentPage ? "bg-[#FDB913] w-12" : "bg-gray-200"}`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage === totalPages - 1}
              className="flex items-center px-4 md:px-8 py-2 md:py-4 bg-[#001F54] text-white font-black rounded-2xl disabled:opacity-20 hover:bg-[#FDB913] hover:text-[#001F54] transition-all duration-300 group shadow-lg"
            >
              <span className="tracking-widest">{t('about.gallery.pagination.next')}</span>
              <ChevronRight
                size={24}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}



function Points({ index, title, description }: { index: string; title: string; description: string }) {
  return     <div className='p-5 hover:shadow-2xl rounded-lg hover:border border-[#FDB913] transition duration-700'>
            <div className='flex flex-col sm:flex-row gap-5'>
<b className=' text-8xl text-[#FDB913]'>{index}</b>
<div>
  <h3 className='font-bold text-2xl'>{title}</h3>
<p className=' text-gray-500 italic font-medium leading-relaxed'>{description}</p>
</div>
          </div>
    </div>
}