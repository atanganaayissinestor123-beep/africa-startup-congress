import { Calendar, Clock, MapPin, Zap, Award, Users, Rocket, Music, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';

export default function Program() {
  const { t } = useTranslation();

  const schedule = [
    {
      day: t('program.schedule.day1.day'),
      date: t('program.schedule.day1.date'),
      theme: t('program.schedule.day1.theme'),
      sessions: [
        {
          time: t('program.schedule.day1.sessions.contributions.time'),
          title: t('program.schedule.day1.sessions.contributions.title'),
          description: t('program.schedule.day1.sessions.contributions.description'),
          speaker: t('program.schedule.day1.sessions.contributions.speaker'),
          type: 'presentation',
          translatedType: t('program.sessionTypes.presentation'),
          icon: Award,
        },
        {
          time: t('program.schedule.day1.sessions.opening.time'),
          title: t('program.schedule.day1.sessions.opening.title'),
          description: t('program.schedule.day1.sessions.opening.description'),
          speaker: t('program.schedule.day1.sessions.opening.speaker'),
          type: 'ceremony',
          translatedType: t('program.sessionTypes.ceremony'),
          icon: Rocket,
        },
        {
          time: t('program.schedule.day1.sessions.tour.time'),
          title: t('program.schedule.day1.sessions.tour.title'),
          description: t('program.schedule.day1.sessions.tour.description'),
          speaker: t('program.schedule.day1.sessions.tour.speaker'),
          type: 'tour',
          translatedType: t('program.sessionTypes.tour'),
          icon: Globe,
        },
        {
          time: t('program.schedule.day1.sessions.panel.time'),
          title: t('program.schedule.day1.sessions.panel.title'),
          description: t('program.schedule.day1.sessions.panel.description'),
          speaker: t('program.schedule.day1.sessions.panel.speaker'),
          type: 'panel',
          translatedType: t('program.sessionTypes.panel'),
          icon: Zap,
        },
        {
          time: t('program.schedule.day1.sessions.cocktail.time'),
          title: t('program.schedule.day1.sessions.cocktail.title'),
          description: t('program.schedule.day1.sessions.cocktail.description'),
          speaker: t('program.schedule.day1.sessions.cocktail.speaker'),
          type: 'social',
          translatedType: t('program.sessionTypes.social'),
          icon: Music,
        },
      ],
    },
    {
      day: t('program.schedule.day2.day'),
      date: t('program.schedule.day2.date'),
      theme: t('program.schedule.day2.theme'),
      sessions: [
        {
          time: t('program.schedule.day2.sessions.masterclass.time'),
          title: t('program.schedule.day2.sessions.masterclass.title'),
          description: t('program.schedule.day2.sessions.masterclass.description'),
          speaker: t('program.schedule.day2.sessions.masterclass.speaker'),
          type: 'masterclass',
          translatedType: t('program.sessionTypes.masterclass'),
          icon: Users,
        },
        {
          time: t('program.schedule.day2.sessions.roundtable.time'),
          title: t('program.schedule.day2.sessions.roundtable.title'),
          description: t('program.schedule.day2.sessions.roundtable.description'),
          speaker: t('program.schedule.day2.sessions.roundtable.speaker'),
          type: 'roundtable',
          translatedType: t('program.sessionTypes.roundtable'),
          icon: Award,
        },
        {
          time: t('program.schedule.day2.sessions.pitch.time'),
          title: t('program.schedule.day2.sessions.pitch.title'),
          description: t('program.schedule.day2.sessions.pitch.description'),
          speaker: t('program.schedule.day2.sessions.pitch.speaker'),
          type: 'competition',
          translatedType: t('program.sessionTypes.competition'),
          icon: Zap,
        },
      ],
    },
    {
      day: t('program.schedule.day3.day'),
      date: t('program.schedule.day3.date'),
      theme: t('program.schedule.day3.theme'),
      sessions: [
        {
          time: t('program.schedule.day3.sessions.ai.time'),
          title: t('program.schedule.day3.sessions.ai.title'),
          description: t('program.schedule.day3.sessions.ai.description'),
          speaker: t('program.schedule.day3.sessions.ai.speaker'),
          type: 'panel',
          translatedType: t('program.sessionTypes.panel'),
          icon: Rocket,
        },
        {
          time: t('program.schedule.day3.sessions.closing.time'),
          title: t('program.schedule.day3.sessions.closing.title'),
          description: t('program.schedule.day3.sessions.closing.description'),
          speaker: t('program.schedule.day3.sessions.closing.speaker'),
          type: 'ceremony',
          translatedType: t('program.sessionTypes.ceremony'),
          icon: Globe,
        },
        {
          time: t('program.schedule.day3.sessions.gala.time'),
          title: t('program.schedule.day3.sessions.gala.title'),
          description: t('program.schedule.day3.sessions.gala.description'),
          speaker: t('program.schedule.day3.sessions.gala.speaker'),
          type: 'gala',
          translatedType: t('program.sessionTypes.gala'),
          icon: Music,
        },
      ],
    },
  ];

  const getTypeStyles = (type: string) => {
    const styles: { [key: string]: string } = {
      presentation: 'bg-blue-600 text-white',
      ceremony: 'bg-purple-600 text-white',
      panel: 'bg-emerald-600 text-white',
      breakout: 'bg-amber-500 text-white',
      masterclass: 'bg-rose-600 text-white',
      competition: 'bg-orange-600 text-white',
      roundtable: 'bg-[#001F54] text-white',
      gala: 'bg-[#FDB913] text-[#001F54]',
      tour: 'bg-sky-500 text-white',
      break: 'bg-gray-400 text-white',
      social: 'bg-indigo-600 text-white',
    };
    return styles[type] || 'bg-gray-600 text-white';
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO 
        title={t('program.seo.title')}
        description={t('program.seo.description')}
      />
      {/* Header */}
      <section className="relative bg-[#001F54] pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/images/k1.jpg"
            alt="Program Background"
            loading="lazy"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl sm:text-8xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
            {t('program.header.heading_line1')} <span className="text-[#FDB913]">{t('program.header.heading_highlight')}</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <Calendar className="text-[#FDB913]" size={24} />
              <span className="text-white font-black uppercase tracking-widest text-sm">
                {t('program.header.date')}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <MapPin className="text-[#FDB913]" size={24} />
              <span className="text-white font-black uppercase tracking-widest text-sm">
                {t('program.header.venue')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Schedule */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {schedule.map((day, dayIndex) => (
            <div key={dayIndex} className="mb-24 last:mb-0">
              {/* Day Marker */}
              <div className="flex items-end gap-6 mb-12 border-b-8 border-[#001F54] pb-6 flex-col sm:flex-row">
                <span className="text-6xl font-black text-[#001F54] leading-none uppercase">
                  {day.day}
                </span>
                <div className="flex-grow">
                  <span className="text-[#FDB913] text-xl font-black uppercase tracking-widest block mb-2">
                    {day.date}
                  </span>
                  <h2 className="text-3xl font-black text-[#001F54] uppercase tracking-tighter">
                    {day.theme}
                  </h2>
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-6">
                {day.sessions.map((session, sessionIndex) => (
                  <div
                    key={sessionIndex}
                    className="group flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-xl border border-transparent hover:border-[#FDB913] transition-all transform hover:scale-[1.01]"
                  >
                    {/* Time & Icon */}
                    <div className="md:w-64 bg-[#001F54] p-8 flex md:flex-col items-center justify-between md:justify-center text-center">
                      <div className="bg-white/10 p-4 rounded-2xl mb-4 hidden md:block">
                        <session.icon className="text-[#FDB913]" size={40} />
                      </div>
                      <div className="flex items-center gap-3 md:block">
                        <Clock
                          className="text-white/50 mb-2 mx-auto"
                          size={20}
                        />
                        <span className="text-3xl font-black text-white">
                          {session.time}
                        </span>
                      </div>
                      <span
                        className={`md:mt-6 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getTypeStyles(session.type)}`}
                      >
                        {session.translatedType}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-grow p-8 lg:p-12">
                      <h3 className="text-3xl font-black text-[#001F54] mb-4 uppercase leading-none group-hover:text-[#FDB913] transition-colors line-clamp-2">
                        {session.title}
                      </h3>
                      <p className="text-xl text-gray-600 font-medium mb-8 leading-relaxed">
                        {session.description}
                      </p>
                      {session.speaker && (
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border-l-8 border-[#FDB913]">
                          <div className="bg-[#001F54] p-2 rounded-lg">
                            <Users size={20} className="text-white" />
                          </div>
                          <div>
                            <span className="text-xs uppercase font-black text-gray-400 block tracking-widest">
                              {t('program.speakerLabel')}
                            </span>
                            <span className="text-lg font-black text-[#001F54] uppercase">
                              {session.speaker}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Tracks */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-[#001F54] uppercase mb-4 tracking-tighter">
              {t('program.tracks.heading')}
            </h2>
            <div className="h-2 w-24 bg-[#FDB913] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('program.tracks.items.innovation.title'),
                desc: t('program.tracks.items.innovation.desc'),
                icon: Rocket,
                color: "bg-blue-600",
              },
              {
                title: t('program.tracks.items.policy.title'),
                desc: t('program.tracks.items.policy.desc'),
                icon: Zap,
                color: "bg-emerald-600",
              },
              {
                title: t('program.tracks.items.investment.title'),
                desc: t('program.tracks.items.investment.desc'),
                icon: Award,
                color: "bg-purple-600",
              },
            ].map((track, i) => (
              <div
                key={i}
                className="bg-gray-50 p-10 rounded-3xl group hover:bg-[#001F54] transition-all duration-300"
              >
                <div
                  className={`${track.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <track.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase text-[#001F54] group-hover:text-white">
                  {track.title}
                </h3>
                <p className="text-gray-600 font-bold group-hover:text-blue-100">
                  {track.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-[#001F54] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-30"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl sm:text-7xl font-black text-white mb-8 uppercase leading-none italic tracking-tighter scale-y-110">
            {t('program.cta.heading_line1')} <br />
            <span className="text-[#FDB913]">{t('program.cta.heading_highlight')}</span>
          </h2>
          <p className="text-2xl text-blue-200 font-bold mb-12 uppercase tracking-[0.2em]">
            {t('program.cta.subheading')}
          </p>
          <Link
            to="/register"
            className="inline-block bg-[#FDB913] text-[#001F54] px-16 py-6 rounded-2xl text-2xl font-black hover:bg-white hover:scale-105 transition-all shadow-[0_0_50px_rgba(253,185,19,0.3)] uppercase tracking-widest"
          >
            {t('program.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
