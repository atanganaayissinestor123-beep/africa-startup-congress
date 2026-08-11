import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#001F54] text-white overflow-hidden pt-24 pb-12 font-sans relative">
      {/* Decorative Brand Text Background */}
      <div className="absolute top-0 left-0 w-full text-[25vw] font-black text-white/5 uppercase select-none pointer-events-none -translate-y-1/2 leading-none">
        AFRICA
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-8 text-center lg:text-left">
            <div className="">
              <img
                src="/assets/images/w-logo.png"
                alt="Africa Startup Congress"
                width={150}
              />
            </div>
            <p className="text-gray-400 font-medium leading-relaxed max-w-sm mx-auto lg:mx-0">
              {t('footer.description')}
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center lg:justify-start space-x-4 pt-4">
              {[Linkedin, Twitter, Facebook, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="bg-white/10 p-4 rounded-2xl hover:bg-[#FDB913] transition-all transform hover:scale-110 hover:rotate-3 shadow-xl"
                >
                  <Icon
                    size={24}
                    className="text-white hover:text-[#001F54] transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <h4 className="text-xs font-black text-[#FDB913] uppercase tracking-[0.3em] mb-10">
              {t('footer.discoverHeading')}
            </h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              {[
                { name: t('footer.links.home'), path: "/" },
                { name: t('footer.links.about'), path: "/about" },
                { name: t('footer.links.schedule'), path: "/program" },
                { name: t('footer.links.speakers'), path: "/speakers" },
                { name: t('footer.links.registration'), path: "/register" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-lg font-bold text-white hover:text-[#FDB913] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <h4 className="text-xs font-black text-[#FDB913] uppercase tracking-[0.3em] mb-10">
              {t('footer.reachOutHeading')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center lg:justify-start space-x-6 group">
                <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-[#FDB913]/20 transition-all">
                  <MapPin size={24} className="text-[#FDB913]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white ">
                    Kigali Convention Center
                  </p>
                  <p className="text-gray-400 font-bold  text-xs ">
                    {t('footer.contact.location_r')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-6 group">
                <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-[#FDB913]/20 transition-all">
                  <Mail size={24} className="text-[#FDB913]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white  break-all">
                    africa@accelerateafrica.org
                  </p>
                  <p className="text-gray-400 font-bold  text-xs ">
                    {t('footer.contact.support')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-6 group">
                <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-[#FDB913]/20 transition-all">
                  <Phone size={24} className="text-[#FDB913]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    +250 781 722 859
                  </p>
                  <p className="text-gray-400 font-bold  text-xs">
                    {t('footer.contact.hotline')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
            {t('footer.bottom.copy', { year: new Date().getFullYear() })}
          </p>
          <div className="flex space-x-8 text-xs font-black text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">
              {t('footer.bottom.privacy')}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t('footer.bottom.terms')}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t('footer.bottom.refund')}
            </a>
          </div>
        </div>
      </div>

      {/* Another big brand text decoration (bottom) */}
      <div className="absolute bottom-0 right-0 w-full text-[25vw] font-black text-white/5 uppercase select-none pointer-events-none translate-y-1/2 leading-none text-right">
        STARTUP
      </div>
    </footer>
  );
}
