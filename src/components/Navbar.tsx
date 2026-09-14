import React, { useState, useEffect, useRef } from "react";
import { Music, Calendar, Users, Sliders, Mail, Images, Menu, X, Disc3, Volume2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useTranslation } from "react-i18next";

interface NavbarProps {
  onOpenBooking: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, isPlaying, onTogglePlay }) => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Entrance: slide down from top on page load
  useGSAP(() => {
    gsap.from(navbarRef.current, {
      y: -15,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      clearProps: "all",
    });
  }, { scope: navbarRef });

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const switchLang = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language;

  return (
    <header
      ref={navbarRef}
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-[#060608]/90 backdrop-blur-xl border-[#1a1a24] py-3 shadow-2xl"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => scrollToSection("hero")}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="relative w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF0055]/30 to-[#00E5FF]/30 blur-sm"></div>
              <div className="relative flex items-center gap-0.5">
                <span className="w-1 h-5 rounded-full bg-[#FF0055] animate-pulse"></span>
                <span className="w-1 h-3 rounded-full bg-white/70"></span>
                <span className="w-1 h-6 rounded-full bg-[#00E5FF]"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bebas text-2xl sm:text-3xl tracking-wider text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FF0055] group-hover:to-[#00E5FF] transition-all">
                  MASTER &amp; BEATS
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/80">
                  DUO
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">
            <button
              id="nav-link-music"
              onClick={() => scrollToSection("player")}
              className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-white/75 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Music className="w-3.5 h-3.5 text-[#FF0055]" />
              {t("nav.music")}
            </button>
            <button
              id="nav-link-tour"
              onClick={() => scrollToSection("tour")}
              className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-white/75 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
              {t("nav.tour")}
            </button>
            <button
              id="nav-link-about"
              onClick={() => scrollToSection("about")}
              className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-white/75 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5 text-[#FF0055]" />
              {t("nav.about")}
            </button>
            <button
              id="nav-link-gear"
              onClick={() => scrollToSection("gear")}
              className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-white/75 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Images className="w-3.5 h-3.5 text-[#00E5FF]" />
              {t("nav.gear")}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 font-sans">
              <button
                onClick={() => switchLang("en")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 ${
                  currentLang === "en"
                    ? "bg-[#00E5FF] text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t("nav.lang.en")}
              </button>
              <button
                onClick={() => switchLang("sr")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 ${
                  currentLang === "sr"
                    ? "bg-[#00E5FF] text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t("nav.lang.sr")}
              </button>
            </div>

        
            {/* Book CTA */}
            <button
              id="nav-book-cta-btn"
              onClick={onOpenBooking}
              className="relative group px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(179,0,45,0.4)] hover:shadow-[0_0_25px_rgba(0,119,217,0.55)] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] transition-transform duration-300 group-hover:scale-105"></div>
              <span className="relative z-10 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                {t("nav.bookDuo")}
              </span>
            </button>

            {/* Mobile Hamburger */}
            <button
              id="nav-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 mt-3 space-y-4 shadow-2xl">
          <button
            onClick={() => scrollToSection("player")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
          >
            <Music className="w-4 h-4 text-[#FF0055]" />
            {t("nav.mobileMenu.music")}
          </button>
          <button
            onClick={() => scrollToSection("tour")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#00E5FF]" />
            {t("nav.mobileMenu.tour")}
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
          >
            <Users className="w-4 h-4 text-[#FF0055]" />
            {t("nav.mobileMenu.about")}
          </button>
          <button
            onClick={() => scrollToSection("gear")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
          >
            <Sliders className="w-4 h-4 text-[#00E5FF]" />
            {t("nav.mobileMenu.gear")}
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF0055] to-[#00E5FF] text-white font-bold text-center tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(255,0,85,0.4)]"
          >
            {t("nav.mobileMenu.bookBtn")}
          </button>
        </div>
      )}
    </header>
  );
};
