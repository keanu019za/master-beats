import React, { useState, useRef } from "react";
import { Mail, ArrowRight, Heart, ShieldCheck, Youtube, Instagram, Facebook, Download, FileText, Sparkles } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

gsap.registerPlugin(ScrollTrigger);

const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.899 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.019zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

interface FooterProps {
  onOpenBooking: () => void;
  onScrollToSection: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onScrollToSection }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  useGSAP(
    () => {
      gsap.to(topBarRef.current, {
        backgroundPosition: "200% center",
        duration: 8,
        ease: "none",
        repeat: -1,
      });

      gsap.from(".footer-col", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        clearProps: "all",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 95%",
          once: true,
        },
      });

      gsap.from(".footer-bottom-bar", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".footer-bottom-bar",
          start: "top 100%",
          once: true,
        },
      });
    },
    { scope: footerRef }
  );

  const socialLinks = [
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://youtube.com",
      hoverClass: "hover:text-[#FF0000] hover:border-[#FF0000]/50 hover:shadow-[0_0_15px_rgba(255,0,0,0.35)]",
    },
    {
      name: "Spotify",
      icon: SpotifyIcon,
      href: "https://spotify.com",
      hoverClass: "hover:text-[#1DB954] hover:border-[#1DB954]/50 hover:shadow-[0_0_15px_rgba(29,185,84,0.35)]",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com",
      hoverClass: "hover:text-[#E4405F] hover:border-[#E4405F]/50 hover:shadow-[0_0_15px_rgba(228,64,95,0.35)]",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://facebook.com",
      hoverClass: "hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:shadow-[0_0_15px_rgba(24,119,242,0.35)]",
    },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative bg-[#040406] border-t border-white/10 pt-16 pb-12 overflow-hidden"
    >
      {/* ── Interactive Gradient Top Bar ──────────────────────────── */}
      <div
        ref={topBarRef}
        className="absolute top-0 left-0 right-0 h-[2px] opacity-90 shadow-[0_0_12px_rgba(91,6,118,0.8)]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #B3002D, #5B0676, #0077D9, #FF0055, #B3002D)",
          backgroundSize: "200% 100%",
        }}
      />

      {/* ── Ambient Background Glows ──────────────────────────────── */}
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#0077D9]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-[#B3002D]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* ── Brand Col ─────────────────────────────────────────── */}
          <div className="space-y-5 footer-col">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(255,0,85,0.2)]">
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-5 rounded-full bg-[#FF0055]" />
                  <span className="w-1 h-3 rounded-full bg-white/70" />
                  <span className="w-1 h-6 rounded-full bg-[#00E5FF]" />
                </div>
              </div>
              <span className="font-bebas text-3xl text-white tracking-wider">
                MASTER &amp; BEATS
              </span>
            </div>

            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              {t("footer.description")}
            </p>

            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1.5">
                {t("footer.contactLabel")}
              </span>
              <a
                href="mailto:management@masterandbeats.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-[#00E5FF] transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#FF0055] group-hover:text-[#00E5FF] transition-colors" />
                management@masterandbeats.com
              </a>
            </div>
          </div>

          {/* ── Navigation Col ────────────────────────────────────── */}
          <div className="space-y-3 footer-col">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/80">
              {t("footer.nav.title")}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {(["home", "audio", "tour", "about", "gear"] as const).map((key) => (
                <li key={key}>
                  <button
                    onClick={() =>
                      onScrollToSection(
                        key === "home" ? "hero" : key === "audio" ? "player" : key
                      )
                    }
                    className="hover:text-white transition-colors flex items-center gap-1 group text-left"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                    {t(`footer.nav.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Press & Rider Kit Col (NOVA ZAMENA) ───────────────── */}
          <div className="space-y-3 footer-col">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/80">
              Promoters &amp; Press
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kits, technical requirements &amp; official assets for event organizers.
            </p>
            <div className="pt-1 space-y-2">
              <button
                onClick={onOpenBooking}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#00E5FF]/40 text-xs font-semibold text-white/90 hover:text-[#00E5FF] transition-all flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#00E5FF]" />
                  Tech Rider PDF
                </span>
                <Download className="w-3.5 h-3.5 text-white/40 group-hover:text-[#00E5FF] transition-colors" />
              </button>

              <button
                onClick={onOpenBooking}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#FF0055]/40 text-xs font-semibold text-white/90 hover:text-[#FF0055] transition-all flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF0055]" />
                  Press Kit &amp; Photos
                </span>
                <Download className="w-3.5 h-3.5 text-white/40 group-hover:text-[#FF0055] transition-colors" />
              </button>
            </div>
          </div>

          {/* ── Newsletter & Social Icons Col ─────────────────────── */}
          <div className="space-y-5 footer-col">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/80">
                {t("footer.newsletter.title")}
              </h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {t("footer.newsletter.description")}
              </p>

              {subscribed ? (
                <div className="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-xs text-[#00E5FF] font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {t("footer.newsletter.subscribed")}
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("footer.newsletter.placeholder")}
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF] transition-colors"
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe to newsletter"
                      className="p-2.5 rounded-xl bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] text-white hover:opacity-90 transition-opacity active:scale-95 shrink-0 shadow-[0_0_15px_rgba(179,0,45,0.4)]"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30">
                    {t("footer.newsletter.spam")}
                  </p>
                </form>
              )}
            </div>

            {/* Social Icons Bar */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-3">
                Follow Duo
              </span>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.name}
                      className={`p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 transition-all duration-300 hover:-translate-y-1 ${social.hoverClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Bar ────────────────────────────────────────── */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 footer-bottom-bar">
          <div>
            &copy; {new Date().getFullYear()} Master &amp; Beats. {t("footer.copyright")}
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-[#FF0055] fill-[#FF0055]/20 animate-pulse" />
            <span>{t("footer.craftedFor")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};