import React, { useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, ExternalLink } from "lucide-react";
import heroImg from "../assets/images/hero_duo_neon_1789179015979.jpg";
import { useTranslation } from "react-i18next";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, onOpenBooking }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl">
      <div className="relative w-full max-w-4xl rounded-3xl glass-panel border border-white/20 p-4 sm:p-6 shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black text-white/70 hover:text-white border border-white/10 transition-colors" aria-label="Close video player">
          <X className="w-5 h-5" />
        </button>

        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/90 border border-white/10 group">
          <img
            src={heroImg}
            alt="Master & Beats live festival performance showreel"
            className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? "scale-105 filter brightness-110" : "scale-100 filter brightness-75"}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none"></div>

          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40">
              <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-[#FF0055] to-transparent transform -skew-x-12 animate-pulse"></div>
              <div className="absolute top-0 right-1/4 w-32 h-full bg-gradient-to-b from-[#00E5FF] to-transparent transform skew-x-12 animate-pulse"></div>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF0055] to-[#00E5FF] p-0.5 shadow-[0_0_35px_rgba(255,0,85,0.7)] group-hover:scale-110 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center text-white">
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </div>
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#FF0055]/50 text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-ping"></span>
                {t("video.liveBadge")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-black/60 text-white/80 hover:text-white border border-white/10">
                {isMuted ? <VolumeX className="w-4 h-4 text-[#FF0055]" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div>
            <h4 className="font-bebas text-2xl text-white tracking-wide flex items-center gap-2">
              <span>{t("video.title")}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-sans font-semibold">{t("video.officialAfter")}</span>
            </h4>
            <p className="text-xs text-slate-400 font-sans">{t("video.description")}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors flex items-center gap-1.5">
              <span>{t("video.watchYoutube")}</span><ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button onClick={() => { onClose(); onOpenBooking(); }} className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] shadow-[0_0_15px_rgba(255,0,85,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] transition-all">
              {t("video.bookBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
