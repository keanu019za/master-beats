import React, { useState, useEffect, useRef } from "react";
import { Maximize2, X, Sparkles, ChevronDown, ChevronUp, Loader2, Image as ImageIcon } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

gsap.registerPlugin(ScrollTrigger);

// Povlačenje isključivo iz okruženja (bez rezervnih ključeva u kôdu)
const GOOGLE_API_KEY = __GOOGLE_DRIVE_API_KEY__;
const FOLDER_ID = "1PkhyofoNITjuadSME6JM2xF_yTh15IjF";

interface DriveImage {
  id: string;
  name: string;
  url: string;
}

// Funkcija za dinamičku dodelu Bento rasporeda za proizvoljan broj slika
const getBentoClass = (index: number) => {
  const patternIndex = index % 4;
  switch (patternIndex) {
    case 0:
      return "col-span-1 md:col-span-2 row-span-2 min-h-[300px]";
    case 1:
      return "col-span-1 md:col-span-1 min-h-[180px]";
    case 2:
      return "col-span-1 md:col-span-1 min-h-[180px]";
    case 3:
      return "col-span-1 md:col-span-2 min-h-[220px]";
    default:
      return "col-span-1 min-h-[200px]";
  }
};

export const GearSection: React.FC = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Povlačenje slika sa Google Drive API-ja
  useEffect(() => {
    async function fetchImages() {
      if (!GOOGLE_API_KEY) {
        console.error("VITE_GOOGLE_DRIVE_API_KEY nedostaje u .env fajlu.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const query = encodeURIComponent(`'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`);
        const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&key=${GOOGLE_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.files && data.files.length > 0) {
          const formattedImages: DriveImage[] = data.files.map((file: { id: string; name: string }) => ({
            id: file.id,
            name: file.name.replace(/\.[^/.]+$/, ""), // Uklanja ekstenziju fajla (.jpg, .png)
            url: `https://lh3.googleusercontent.com/d/${file.id}`, // Stabilan CDN URL
          }));
          setImages(formattedImages);
        }
      } catch (error) {
        console.error("Greška pri učitavanju slika sa Google Drive-a:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  // GSAP Animacija zaglavlja
  useGSAP(() => {
    gsap.from(".gear-header", {
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      clearProps: "all",
      scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
    });
  }, { scope: sectionRef });

  // GSAP Animacija za kartice
  useEffect(() => {
    if (!loading && images.length > 0) {
      gsap.fromTo(
        ".gear-bento-card",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.05, clearProps: "all" }
      );
    }
  }, [visibleCount, loading, images]);

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, images.length));
  };

  const handleShowLess = () => {
    setVisibleCount(4);
  };

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  return (
    <section ref={sectionRef} id="gear" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Sekcije */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 gear-header">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-[#FF0055] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {t("gear.badge")}
          </div>
          <h2 className="font-bebas text-4xl sm:text-6xl lg:text-7xl text-white tracking-wide">
            {t("gear.title")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9]">
              {t("gear.titleAccent")}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-sans">{t("gear.description")}</p>
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Učitavanje slika...</p>
          </div>
        )}

        {/* Bento Grid Kartice */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
            {visibleImages.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item.url)}
                className={`group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0D0E12] cursor-pointer transition-all duration-300 hover:border-white/30 gear-bento-card ${getBentoClass(index)}`}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://drive.google.com/thumbnail?id=${item.id}&sz=w1600`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E5FF] mb-1 block">
                    {t("gear.badge")}
                  </span>
                  <span className="font-bebas text-lg text-white tracking-wide">{item.name}</span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dugmad za proširivanje */}
        {!loading && images.length > 4 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            {hasMore ? (
              <button
                onClick={handleShowMore}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#00E5FF]/50 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xl transition-all duration-300 active:scale-95 group shadow-lg"
              >
                <ImageIcon className="w-4 h-4 text-[#00E5FF]" />
                <span>Show More (+{Math.min(4, images.length - visibleCount)})</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleShowLess}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#FF0055]/50 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xl transition-all duration-300 active:scale-95 group shadow-lg"
              >
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Fullscreen View" 
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[85vh] object-contain mx-auto" 
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white border border-white/20 hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};