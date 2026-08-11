import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

// import CountdownTimer from '../components/CountdownTimer';
import {
  Users,
  Target,
  Globe,
  TrendingUp,
  ChevronRight,
  Send,
  //  Ticket,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";

const heroImages = [
  "/assets/images/k2.jpg",
  "/assets/images/1.jpeg",
  "/assets/images/2.jpeg",
  "/assets/images/3.jpeg",
];

const partnersLogos = ["/assets/images/logo.png"];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [newLetterEmail, setNewLetterEmail] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

	if(newLetterEmail=="" || newLetterEmail===null)  throw("No newsletter Email submitted")

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert([{ email: newLetterEmail }])
        .select();

      if (error) {
        console.error("Error subscribing to newsletter:", error);
        toast.error(t("home.newsletter.subscriptionError"));
      } else {
        console.log("Successfully subscribed to newsletter:", data);
        toast.success(t("home.newsletter.subscriptionSuccess"));
        setNewLetterEmail("");
      }
    } catch (err) {
      console.error("couldn't subscribe to newsletter", err);
    }
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Africa Startup Congress 2027",
    startDate: "2027-02-24T09:00:00+02:00",
    endDate: "2027-02-26T18:00:00+02:00",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: t("home.hero.venue"),
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kigali",
        addressCountry: "RW",
      },
    },
    image: ["https://africastartupcongress.org/assets/images/logo.png"],
    description: t("home.seo.description"),
    organizer: {
      "@type": "Organization",
      name: "Africa Startup Congress",
      url: "https://africastartupcongress.org",
    },
  };

  const stats = [
    {
      label: t("home.stats.speakers"),
      value: t("home.stats.values.speakers"),
      icon: Users,
    },
    {
      label: t("home.stats.delegates"),
      value: t("home.stats.values.delegates"),
      icon: Globe,
    },
    {
      label: t("home.stats.panels"),
      value: t("home.stats.values.panels"),
      icon: Target,
    },
    {
      label: t("home.stats.exhibitors"),
      value: t("home.stats.values.exhibitors"),
      icon: TrendingUp,
    },
  ];

  const schedulePreview = [
    {
      time: t("home.schedule.days.day1.time"),
      event: t("home.schedule.days.day1.event"),
    },
    {
      time: t("home.schedule.days.day2.time"),
      event: t("home.schedule.days.day2.event"),
    },
    {
      time: t("home.schedule.days.day3.time"),
      event: t("home.schedule.days.day3.event"),
    },
  ];

  const galleryImages = [
    {
      title: t("home.keyActivities.items.pitch.title"),
      image: "/assets/images/5.jpeg",
      description: t("home.keyActivities.items.pitch.description"),
    },
    {
      title: t("home.keyActivities.items.keynote.title"),
      image: "/assets/images/3.jpeg",
      description: t("home.keyActivities.items.keynote.description"),
    },
    {
      title: t("home.keyActivities.items.panel.title"),
      image: "/assets/images/2.jpeg",
      description: t("home.keyActivities.items.panel.description"),
    },
    {
      title: t("home.keyActivities.items.masterclass.title"),
      image: "/assets/images/8.jpeg",
      description: t("home.keyActivities.items.masterclass.description"),
    },
    {
      title: t("home.keyActivities.items.gala.title"),
      image: "/assets/images/7.jpeg",
      description: t("home.keyActivities.items.gala.description"),
    },
    {
      title: t("home.keyActivities.items.exhibition.title"),
      image: "/assets/images/11.jpeg",
      description: t("home.keyActivities.items.exhibition.description"),
    },
  ];

  const sponsorsPackage = [
    {
      title: t("home.register.packages.delegate.title"),
      price: "delegate",
      tag: t("home.register.packages.delegate.tag"),
      description: t("home.register.packages.delegate.description"),
    },
    {
      title: t("home.register.packages.exhibitor.title"),
      price: "exhibitor",
      tag: t("home.register.packages.exhibitor.tag"),
      description: t("home.register.packages.exhibitor.description"),
    },
    {
      title: t("home.register.packages.sponsor.title"),
      price: "sponsor",
      tag: t("home.register.packages.sponsor.tag"),
      description: t("home.register.packages.sponsor.description"),
    },
  ];

  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <SEO title={t("home.seo.title")} description={t("home.seo.description")}>
        <script type="application/ld+json">
          {JSON.stringify(eventSchema)}
        </script>
      </SEO>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0 text-white">
          {heroImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Hero Background ${idx}`}
              loading={idx === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                idx === currentHeroImage ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001F54] to-[#001F54]/50 "></div>

          {/* Carousel Dots */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroImage(idx)}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  idx === currentHeroImage
                    ? "bg-[#FDB913] w-8"
                    : "bg-white/50 hover:bg-white"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 lg:mx-96 px-4 sm:px-6 lg:px-8 py-20">
          <div className=" leading-loose">
            <p className="text-[#FDB913] font-semibold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-left duration-700">
              {t("home.hero.tagline")}
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-[3.5rem] font-bold text-white mb-8 animate-in fade-in slide-in-from-left duration-1000 lg:leading-snug">
              {t("home.hero.heading_line1")} <br />
              <span className="text-[#FDB913]">
                {t("home.hero.heading_line2")}
              </span>
            </h1>
            <div className="h-1 w-32 bg-[#FDB913] mb-8"></div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-12">
              {t("home.hero.date")}
              <span className="text-[#FDB913]"> {t("home.hero.venue")}</span>
            </p>
          </div>
        </div>
      </section>

      {/* About & Stats Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className=" mb-20 max-w-3xl mx-auto">
            {/*<h2 className="text-4xl sm:text-6xl font-black text-[#001F54] mb-8">
              About
            </h2>*/}
            <p className="text-xl text-gray-600 leading-relaxed">
              {t("home.about.description")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="text-2xl sm:text-5xl font-bold text-[#001F54] mb-2 group-hover:text-[#FDB913] transition-colors">
                  {stat.value}
                </div>
                <div className="text-md font-bold text-gray-500 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-white">
        <div className="lg:mx-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-black text-[#FDB913] mb-6  decoration-[#001F54]">
              {t("home.keyActivities.heading")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto uppercase tracking-widest font-bold">
              {t("home.keyActivities.subheading")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {galleryImages.map((data, idx) => (
              <div
                key={idx}
                className=" lg:overflow-hidden rounded-lg group relative flex flex-col lg:flex-row border border-gray-200 p-4 gap-5"
              >
                <div className="w-full lg:h-full flex flex-col justify-start">
                  <h1 className="text-2xl font-bold text-[#001F54] mb-4">
                    {data.title}
                  </h1>
                  <p className="text-gray-600">{data.description}</p>
                </div>
                <div className="w-full h-[30em] lg:h-full bg-[#001F54] rounded-md overflow-hidden">
                  <img
                    src={data.image}
                    alt={data.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Schedule Preview */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-black text-[#001F54] mb-6">
              {t("home.schedule.heading")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("home.schedule.description")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {schedulePreview.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col lg:flex-row items-center gap-6 mb-4 sm:mb-0">
                  <span className="text-[#FDB913] font-black text-md lg:min-w-[150px]">
                    {item.time}
                  </span>
                  <span className="text-xl font-semibold w-9/12 text-[#001F54] transition-colors text-center lg:text-start">
                    {item.event}
                  </span>
                </div>
                <Link
                  to="/program"
                  className="text-[#001F54] font-bold flex items-center hover:gap-2 transition-all lg:min-w-[150px] group-hover:text-[#FDB913]"
                >
                  {t("home.schedule.viewMore")} <ChevronRight size={20} />
                </Link>
              </div>
            ))}
            <div className="text-center pt-8">
              <Link
                to="/program"
                className="inline-block bg-[#FDB913] text-[#001F54] px-12 py-4 rounded font-black hover:bg-[#FFA500] transition-all"
              >
                {t("home.schedule.fullSchedule")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section className="relative py-48">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/images/k1.png"
            alt="Venue"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001f5460] to-[#001F54]/20 "></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex justify-end px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-12 max-w-xl shadow-2xl border-l-[16px] border-[#FDB913] animate-in zoom-in duration-700">
            <h2 className="text-4xl font-black text-[#001F54] mb-6 leading-tight">
              {t("home.venue.heading_line1")} <br />
              {t("home.venue.heading_line2")}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t("home.venue.description")}
            </p>
            <Link
              to="/about"
              className="inline-block bg-[#FDB913] text-[#001F54] px-8 py-3 rounded font-black hover:bg-[#FFA500] transition-all"
            >
              {t("home.venue.cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-5xl font-black text-[#001F54] mb-4">
              {t("home.register.heading_line1")} <br />{" "}
              {t("home.register.heading_line2")}
            </h2>
            <div className="h-1 w-20 bg-[#FDB913]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sponsorsPackage.map((data) => (
              <div
                className="bg-gray-50 p-10 rounded-2xl border-2 border-transparent hover:border-[#FDB913] transition-all group overflow-hidden relative cursor-pointer"
                onClick={() => navigate(`/register?tag=${data.price}`)}
              >
                <div className="relative z-10">
                  {/*<Ticket className="text-[#FDB913] mb-6" size={48} />*/}
                  <div className="font-bold  text-xl text-[#FDB913]">
                    {data.tag}
                  </div>
                  <h3 className="text-3xl font-black text-[#001F54] mb-4">
                    {data.title}
                  </h3>
                  <p className="text-gray-600">{data.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {" "}
          <h2 className="text-5xl font-black text-[#001F54] mb-6">
            {t("home.partners.heading")}{" "}
            <span className="text-[#FDB913]">
              {t("home.partners.headingHighlight")}
            </span>
          </h2>
        </div>

        {/* create horizontal animated scroll for partner logo and pause on hover */}
        <div className="overflow-hidden py-1">
          <div className="flex animate-scroll pause-on-hover w-max">
            {[
              ...partnersLogos,
              ...partnersLogos,
              ...partnersLogos,
              ...partnersLogos,
              ...partnersLogos,
              ...partnersLogos,
              ...partnersLogos,
              ...partnersLogos,
            ].map((logo, index) => (
              <div key={index} className="flex-shrink-0 w-48 mx-8">
                <img
                  src={logo}
                  alt={`Partner ${index + 1}`}
                  className="h-24 grayscale hover:grayscale-0 transition-all duration-300 object-contain mx-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black text-[#001F54] mb-6">
            {t("home.newsletter.heading")}
          </h2>
          <p className="text-xl text-gray-500 mb-12 font-bold uppercase tracking-widest">
            {t("home.newsletter.subheading")}
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto shadow-2xl p-2 bg-white rounded-2xl">
            <input
              type="email"
              name="email"
              onChange={(e) => setNewLetterEmail(e.target.value)}
			  value={newLetterEmail}
              placeholder={t("home.newsletter.placeholder")}
              className="flex-grow px-8 py-4 bg-transparent outline-none text-lg text-[#001F54] font-medium"
            />
            <button
              className="bg-[#FDB913] text-[#001F54] px-12 py-4 rounded-xl font-black hover:bg-[#FFA500] transition-all flex items-center justify-center gap-2"
              onClick={handleNewsletterSubmit}
            >
              {t("home.newsletter.cta")} <Send size={20} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
