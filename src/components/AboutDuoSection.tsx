import React, { useState, useRef } from "react";
import { Users, Zap, Award, Youtube, Instagram, Facebook, Disc3, Radio } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

// Slika profila (Avatar)
import milosImg from "../assets/images/milos_profil.jpg";
import dusanImg from "../assets/images/dusan_profil.jpg";

// Pozadinske slike
import milosBgImg from "../assets/images/milospozadina.jpg";
import dusanBgImg from "../assets/images/dusanpozadina.jpg";

gsap.registerPlugin(ScrollTrigger);

export const AboutDuoSection: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"profile" | "sound">("profile");
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".about-header", { y: 15, opacity: 0, duration: 0.6, ease: "power2.out", clearProps: "all", scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true } });
    gsap.from(".about-bio-card", { y: 30, opacity: 0, duration: 0.65, ease: "power2.out", stagger: 0.15, clearProps: "all", scrollTrigger: { trigger: ".about-bio-card", start: "top 90%", once: true } });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="about" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#FF0055]/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 about-header">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-[#FF0055] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            {t("about.badge")}
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl lg:text-7xl text-white tracking-wide">
            {t("about.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9]">{t("about.titleAccent")}</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed">
            <strong className="text-white font-semibold">Master&amp;Beats</strong>
            {t("about.description").replace(/<[^>]+>/g, "").split("Master&Beats")[1]?.split("Miloš Mladenović")[0]}
            <span className="text-[#FF0055] font-semibold">Dušan Đorđević</span>
            {t("about.description").replace(/<[^>]+>/g, "").split("Miloš Mladenović")[1]?.split("Dušan Đorđević")[0]}
            <span className="text-[#00E5FF] font-semibold">Miloš Mladenović</span>
            {t("about.description").replace(/<[^>]+>/g, "").split("Dušan Đorđević")[1]}
          </p>

          {/* Tab Toggle */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button onClick={() => setActiveTab("profile")} className={`group/btn relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,85,0.5)] active:scale-95 flex items-center gap-2 ${activeTab === "profile" ? "bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] text-white border-transparent shadow-[0_0_20px_rgba(255,0,85,0.4)]" : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10"}`}>
              {t("about.tabs.profile")}
            </button>
            <button onClick={() => setActiveTab("sound")} className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === "sound" ? "bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] text-white border-transparent shadow-[0_0_20px_rgba(0,229,255,0.4)]" : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10"}`}>
              {t("about.tabs.sound")}
            </button>
          </div>
        </div>

        {activeTab === "profile" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Miloš Card */}
            <div className="group rounded-3xl glass-panel-milos p-6 sm:p-8 transition-all duration-500 hover:shadow-[0_0_35px_rgba(255,0,85,0.3)] flex flex-col justify-between relative overflow-hidden about-bio-card">
              
              <img 
                src={dusanBgImg} 
                alt="Dušan Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-700 z-0" 
              />
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF0055]/10 rounded-bl-full pointer-events-none z-0"></div>

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start gap-5 mb-6">
                  <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden border-2 border-[#FF0055]/40 shrink-0 shadow-[0_0_20px_rgba(255,0,85,0.3)]">
                    <img src={dusanImg} alt="Dušan Đorđević" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  
                  {/* Izbačen space-y-2 radi preciznije kontrole razmaka */}
                  <div className="pt-1">
                    {/* Dodato mb-3 (ili mb-4) za odvajanje bedža od imena ispod */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF0055]/15 border border-[#FF0055]/30 text-[11px] font-bold uppercase tracking-wider text-[#FF0055] mb-3">
                      <Zap className="w-3 h-3" />{t("about.dusan.role")}
                    </div>
                    
                    <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide mb-1">{t("about.dusan.name")}</h3>
                    <p className="text-xs text-white/60 font-sans mb-3">{t("about.dusan.instrument")}</p>
                    
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FF0055]/10 border border-[#FF0055]/20 text-[#FF0055] font-sans">{t("about.milos.tag1")}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FF0055]/10 border border-[#FF0055]/20 text-[#FF0055] font-sans">{t("about.milos.tag2")}</span>
                    </div>
                  </div>
                </div>
                  <p className="text-sm text-slate-300 font-sans leading-relaxed mb-5">{t("about.dusan.bio")}</p>
                  
                                    <div className="mb-6">
                    {/* Dodat block i mb-3 za veći razmak od stavki */}
                    <span className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-3">
                      {t("about.dusan.sigTitle")}
                    </span>

                    {/* Kontejner samo za stavke sa manjim razmakom (space-y-2) */}
                    <div className="space-y-2">
                      {[t("about.dusan.sig1"), t("about.dusan.sig2"), t("about.dusan.sig3")].map((sig, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-[#00E5FF] font-bold mt-0.5">→</span>
                          <span>{sig}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Micro Performance Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-[#FF0055]/20 text-[11px] font-sans font-semibold text-white/80">
                    <Disc3 className="w-3.5 h-3.5 text-[#FF0055] animate-spin-slow" />
                    <span>ACOUSTIC & BALKAN RESONANCE</span>
                  </div>
                </div>

                {/* Footer sa citatom i Social Ikonama */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <span className="text-xs italic text-white/50 font-sans line-clamp-1">{t("about.milos.quote")}</span>
                  
                  {/* Modern Flat Social Icons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#FF0055] hover:bg-[#FF0055]/10 hover:border-[#FF0055]/40 transition-all">
                      <Youtube className="w-4 h-4" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#FF0055] hover:bg-[#FF0055]/10 hover:border-[#FF0055]/40 transition-all">
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#FF0055] hover:bg-[#FF0055]/10 hover:border-[#FF0055]/40 transition-all">
                      <Facebook className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Dušan Card */}
            <div className="group rounded-3xl glass-panel-dusan p-6 sm:p-8 transition-all duration-500 hover:shadow-[0_0_35px_rgba(0,229,255,0.3)] flex flex-col justify-between relative overflow-hidden about-bio-card">
              
              <img 
                src={milosBgImg} 
                alt="Dušan Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-700 z-0" 
              />
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#00E5FF]/10 rounded-bl-full pointer-events-none z-0"></div>

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-start gap-5 mb-6">
                    <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden border-2 border-[#00E5FF]/40 shrink-0 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                      <img src={milosImg} alt="Miloš" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    
                    {/* Izbačen space-y-2 radi preciznije kontrole razmaka */}
                    <div className="pt-1">
                      {/* Dodat mb-3 za veći razmak od imena ispod */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[11px] font-bold uppercase tracking-wider text-[#00E5FF] mb-3">
                        <Award className="w-3 h-3" />{t("about.milos.role")}
                      </div>
                      
                      <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide mb-1">{t("about.milos.name")}</h3>
                      <p className="text-xs text-white/60 font-sans mb-3">{t("about.milos.instrument")}</p>
                      
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] font-sans">{t("about.milos.tag1")}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] font-sans">{t("about.milos.tag2")}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 font-sans leading-relaxed mb-5">{t("about.milos.bio")}</p>
                  
                  {/* Signature Elements */}
                <div className="mb-6">
                      {/* Dodat block i mb-3 za veći razmak od stavki */}
                      <span className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-3">
                        {t("about.milos.sigTitle")}
                      </span>

                      {/* Kontejner samo za stavke sa manjim razmakom (space-y-2) */}
                      <div className="space-y-2">
                        {[t("about.milos.sig1"), t("about.milos.sig2"), t("about.milos.sig3")].map((sig, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="text-[#00E5FF] font-bold mt-0.5">→</span>
                            <span>{sig}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  {/* Micro Performance Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-[#00E5FF]/20 text-[11px] font-sans font-semibold text-white/80">
                    <Radio className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>ELECTRIC &amp; MIDI</span>
                  </div>
                </div>

                {/* Footer sa citatom i Social Ikonama */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <span className="text-xs italic text-white/50 font-sans line-clamp-1">{t("about.milos.quote")}</span>
                  
                  {/* Modern Flat Social Icons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/40 transition-all">
                      <Youtube className="w-4 h-4" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/40 transition-all">
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/40 transition-all">
                      <Facebook className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["el1","el2","el3"] as const).map((key) => (
              <div key={key} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                <h4 className="font-bebas text-xl text-white tracking-wide mb-3">{t(`about.sonic.${key}Title`)}</h4>
                <p className="text-sm text-slate-400 font-sans leading-relaxed">{t(`about.sonic.${key}Body`)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};