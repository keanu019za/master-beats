import React, { useState, useRef } from "react";
import { Maximize2, X, Sparkles } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import fotka1 from '../assets/images/fotka1.jpg';
import fotka2 from '../assets/images/fotka2.jpg';
import fotka3 from '../assets/images/fotka3.jpg';
import fotka4 from '../assets/images/fotka4.jpg';
gsap.registerPlugin(ScrollTrigger);

interface GearItem {
  id: number;
  image: string;
  gridClass: string;
}

const gearData: GearItem[] = [
  { id: 1, image: fotka1, gridClass: "col-span-1 md:col-span-2 row-span-2 min-h-[300px]" },
  { id: 2, image: fotka2, gridClass: "col-span-1 md:col-span-1 min-h-[180px]" },
  { id: 3, image: fotka3, gridClass: "col-span-1 md:col-span-1 min-h-[180px]" },
  { id: 4, image: fotka4, gridClass: "col-span-1 md:col-span-2 min-h-[220px]" },
];

export const GearSection: React.FC = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".gear-header", { y: 15, opacity: 0, duration: 0.6, ease: "power2.out", clearProps: "all", scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true } });
    gsap.from(".gear-bento-card", { y: 25, opacity: 0, duration: 0.55, ease: "power2.out", stagger: 0.1, clearProps: "all", scrollTrigger: { trigger: ".gear-bento-card", start: "top 90%", once: true } });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="gear" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 gear-header">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-[#FF0055] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {t("gear.badge")}
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl lg:text-7xl text-white tracking-wide">
            {t("gear.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9]">{t("gear.titleAccent")}</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-sans">{t("gear.description")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
          {gearData.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item.image)}
              className={`group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0D0E12] cursor-pointer transition-all duration-300 hover:border-white/30 gear-bento-card ${item.gridClass}`}
            >
              <img src={item.image} alt={t(`gear.items.${item.id}.title`)} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E5FF] mb-1 block">{t(`gear.items.${item.id}.category`)}</span>
                <span className="font-bebas text-lg text-white tracking-wide">{t(`gear.items.${item.id}.title`)}</span>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Gear" className="w-full h-auto object-cover" />
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white border border-white/20 hover:bg-black transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
