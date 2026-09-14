import React, { useState, useRef } from "react";
import { Mail, ArrowRight, Heart, ExternalLink, ShieldCheck } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  onOpenBooking: () => void;
  onScrollToSection: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onScrollToSection }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  useGSAP(() => {
    gsap.from(".footer-col", { y: 15, opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, clearProps: "all", scrollTrigger: { trigger: footerRef.current, start: "top 95%", once: true } });
    gsap.from(".footer-bottom-bar", { opacity: 0, duration: 0.5, ease: "power2.out", clearProps: "all", scrollTrigger: { trigger: ".footer-bottom-bar", start: "top 100%", once: true } });
  }, { scope: footerRef });

  return (
    <footer ref={footerRef} className="relative bg-[#040406] border-t border-white/10 pt-16 pb-12 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-[#FF0055] to-transparent opacity-60"></div>
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4 footer-col">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center overflow-hidden">
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-5 rounded-full bg-[#FF0055]"></span>
                  <span className="w-1 h-3 rounded-full bg-white/70"></span>
                  <span className="w-1 h-6 rounded-full bg-[#00E5FF]"></span>
                </div>
              </div>
              <span className="font-bebas text-3xl text-white tracking-wider">MASTER &amp; BEATS</span>
            </div>
            <p className="text-sm text-slate-400 font-sans max-w-sm leading-relaxed">{t("footer.description")}</p>
            <div className="pt-2">
              <span className="text-xs uppercase font-bold tracking-widest text-white/50 block mb-2">{t("footer.contactLabel")}</span>
              <a href="mailto:management@masterandbeats.com" className="flex items-center gap-2 text-sm text-white/80 hover:text-[#00E5FF] transition-colors group">
                <Mail className="w-4 h-4 text-[#FF0055] group-hover:text-[#00E5FF] transition-colors" />
                management@masterandbeats.com
              </a>
            </div>
          </div>

          {/* Nav Col */}
          <div className="space-y-3 footer-col">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/80">{t("footer.nav.title")}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {(["home","audio","tour","about","gear"] as const).map((key) => (
                <li key={key}>
                  <button onClick={() => onScrollToSection(key === "home" ? "hero" : key === "audio" ? "player" : key)} className="hover:text-white transition-colors">
                    {t(`footer.nav.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Streaming Col */}
          <div className="space-y-3 footer-col">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/80">{t("footer.stream.title")}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {([
                { key: "youtube", href: "https://youtube.com" },
                { key: "soundcloud", href: "https://soundcloud.com" },
                { key: "instagram", href: "https://instagram.com" },
              ]).map(({ key, href }) => (
                <li key={key}>
                  <a href={href} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                    {t(`footer.stream.${key}`)} <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
              <li>
                <button onClick={onOpenBooking} className="hover:text-white transition-colors text-left">
                  {t("footer.stream.riderPdf")}
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="space-y-3 footer-col">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/80">{t("footer.newsletter.title")}</h4>
            <p className="text-xs text-slate-400 font-sans">{t("footer.newsletter.description")}</p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-white/5 border border-[#00E5FF]/40 text-xs text-[#00E5FF] font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {t("footer.newsletter.subscribed")}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("footer.newsletter.placeholder")} className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF] transition-colors" />
                  <button type="submit" className="p-2 rounded-xl bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] text-white hover:opacity-90 transition-opacity">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-white/30">{t("footer.newsletter.spam")}</p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 footer-bottom-bar">
          <div>&copy; {new Date().getFullYear()} Master &amp; Beats. {t("footer.copyright")}</div>
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-[#FF0055]" />
            <span>{t("footer.craftedFor")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
