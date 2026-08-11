import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navigation() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.speakers'), href: '/speakers' },
    { name: t('nav.program'), href: '/program' },
  ];


  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-[#001F54]/95 backdrop-blur-md text-white fixed w-full z-50 top-0 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
           <img src="/assets/images/w-logo.png" alt="Africa Startup Congress" width={170} />
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`transition-all duration-200 font-medium relative py-1 ${
                  isActive(link.href)
                    ? 'text-[#FDB913]'
                    : 'text-white hover:text-[#FDB913]'
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FDB913] rounded-full"></span>
                )}
              </Link>
            ))}
            <Link
              to="/register"
              className={`px-6 py-2.5 rounded font-semibold transition-all duration-200 ${
                isActive('/register')
                  ? 'bg-white text-[#001F54]'
                  : 'bg-[#FDB913] text-[#001F54] hover:bg-[#FFA500] hover:scale-105 active:scale-95'
              }`}
            >
              {t('nav.register')}
            </Link>

            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm"
              title={i18n.language === 'en' ? t('nav_tooltips.switch_fr') : t('nav_tooltips.switch_en')}
            >
              <Globe size={16} />
              <span>{i18n.language === 'en' ? t('nav_tooltips.fr') : t('nav_tooltips.en')}</span>
            </button>

          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-[#FDB913] transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#001F54] border-t border-white/10 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-lg transition-colors ${
                  isActive(link.href) ? 'text-[#FDB913]' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="block bg-[#FDB913] text-[#001F54] px-6 py-2.5 rounded font-semibold hover:bg-[#FFA500] transition-colors text-center"
            >
              {t('nav.register')}
            </Link>
            
            <button
              onClick={() => {
                toggleLanguage();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 text-lg font-bold border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Globe size={20} />
              <span>{i18n.language === 'en' ? t('nav_tooltips.french') : t('nav_tooltips.english')}</span>
            </button>

          </div>
        </div>
      )}
    </nav>
  );
}
