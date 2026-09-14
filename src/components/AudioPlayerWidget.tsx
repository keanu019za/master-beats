import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio, ExternalLink, Sparkles, ListMusic } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { Track } from "../types";
import { TRACKS } from "../data/tracks";
import { soundEngine } from "../utils/soundEngine";
import heroThumb from "../assets/images/hero_duo_neon_1789179015979.jpg";
gsap.registerPlugin(ScrollTrigger);

interface AudioPlayerWidgetProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTrackIndex: number;
  onSelectTrack: (index: number) => void;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  isPlaying,
  onTogglePlay,
  currentTrackIndex,
  onSelectTrack,
}) => {
  const { t } = useTranslation();
  const currentTrack: Track = TRACKS[currentTrackIndex] || TRACKS[0];
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progressSec, setProgressSec] = useState<number>(34);
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".player-animate-in", {
      y: 15, opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.07, clearProps: "all",
      scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
    });
  }, { scope: sectionRef });

  const handlePlayPause = () => onTogglePlay();
  const handleNext = () => onSelectTrack((currentTrackIndex + 1) % TRACKS.length);
  const handlePrev = () => onSelectTrack((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
    soundEngine.setVolume(val);
  };
  const toggleMute = () => {
    if (isMuted) { setIsMuted(false); soundEngine.setVolume(volume); }
    else { setIsMuted(true); soundEngine.setVolume(0); }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressSec((prev) => {
          if (prev >= currentTrack.durationSec) { handleNext(); return 0; }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPlaying, currentTrack.durationSec, currentTrackIndex]);

  useEffect(() => { setProgressSec(0); }, [currentTrackIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const analyser = soundEngine.getAnalyser();
      const numBars = 36;
      const barWidth = 3;
      const gap = (width - numBars * barWidth) / (numBars - 1);
      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < numBars; i++) {
          const sampleIdx = Math.floor((i / numBars) * (bufferLength / 2));
          const value = dataArray[sampleIdx] || 0;
          const percent = Math.max(0.1, value / 255);
          const barHeight = percent * height * 0.88;
          const x = i * (barWidth + gap);
          const y = (height - barHeight) / 2;
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          if (i < numBars / 2) { grad.addColorStop(0, "#FF0055"); grad.addColorStop(1, "#FF77AA"); }
          else { grad.addColorStop(0, "#00E5FF"); grad.addColorStop(1, "#66F0FF"); }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        const time = Date.now() * 0.003;
        for (let i = 0; i < numBars; i++) {
          const barHeight = (0.2 + (Math.sin(i * 0.4) * 0.15)) * height * 0.7;
          const x = i * (barWidth + gap);
          const y = (height - barHeight) / 2;
          ctx.fillStyle = i < numBars / 2 ? "rgba(255,0,85,0.4)" : "rgba(0,229,255,0.4)";
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, Math.max(4, barHeight), 2);
          ctx.fill();
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <section ref={sectionRef} id="player" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 player-animate-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-[#FF0055] uppercase tracking-wider mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              {t("player.badge")}
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
              {t("player.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9]">{t("player.titleAccent")}</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-sans max-w-xl">{t("player.description")}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://open.spotify.com" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#1DB954] border border-[#1DB954]/30 text-xs font-bold tracking-wide flex items-center gap-2 transition-all hover:scale-105">
              <span>{t("player.spotify")}</span><ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://soundcloud.com" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full bg-[#FF5500]/15 hover:bg-[#FF5500]/25 text-[#FF5500] border border-[#FF5500]/30 text-xs font-bold tracking-wide flex items-center gap-2 transition-all hover:scale-105">
              <span>{t("player.soundcloud")}</span><ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full bg-[#FF0000]/15 hover:bg-[#FF0000]/25 text-[#FF0000] border border-[#FF0000]/30 text-xs font-bold tracking-wide flex items-center gap-2 transition-all hover:scale-105">
              <span>{t("player.youtube")}</span><ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="relative rounded-3xl glass-panel border border-white/15 p-6 md:p-8 shadow-2xl overflow-hidden player-animate-in">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#FF0055]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-4 flex items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 shadow-[0_0_20px_rgba(255,0,85,0.3)] border border-white/20 group">
                <img src={heroThumb} alt={currentTrack.title} className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? "scale-110 rotate-1" : "scale-100"}`} referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                {isPlaying && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-0.5">
                    <span className="w-1 h-3 rounded-full bg-[#FF0055] animate-waveform-1"></span>
                    <span className="w-1 h-5 rounded-full bg-white animate-waveform-2"></span>
                    <span className="w-1 h-4 rounded-full bg-[#00E5FF] animate-waveform-3"></span>
                  </div>
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-[#00E5FF]">
                  <Sparkles className="w-3 h-3" />{currentTrack.category}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white truncate tracking-tight">{currentTrack.title}</h3>
                <p className="text-xs text-white/60 truncate font-medium">{currentTrack.subtitle}</p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-white/40 font-mono">
                  <span>{currentTrack.bpm} BPM</span><span>•</span><span>KEY: {currentTrack.key}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <div className="relative h-16 w-full rounded-xl bg-black/40 border border-white/5 px-3 flex items-center justify-center overflow-hidden">
                <canvas ref={canvasRef} width={340} height={60} className="w-full h-full" />
              </div>
              <div className="space-y-1.5">
                <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                  <div className="h-full bg-gradient-to-r from-[#FF0055] via-purple-500 to-[#00E5FF] rounded-full transition-all duration-300" style={{ width: `${(progressSec / currentTrack.durationSec) * 100}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
                  <span>{formatTime(progressSec)}</span>
                  <span className="text-white/30 text-[10px] font-sans uppercase">{t("player.interactiveMode")}</span>
                  <span>{currentTrack.duration}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col items-center sm:items-end justify-center gap-4">
              <div className="flex items-center gap-4">
                <button id="player-prev-btn" onClick={handlePrev} className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors" title={t("player.prev")}>
                  <SkipBack className="w-5 h-5" />
                </button>
                <button id="player-play-btn" onClick={handlePlayPause} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${isPlaying ? "bg-[#FF0055] text-white shadow-[0_0_30px_rgba(255,0,85,0.7)] scale-105" : "bg-white text-black hover:bg-[#00E5FF] hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"}`} title={isPlaying ? t("player.pause") : t("player.play")}>
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>
                <button id="player-next-btn" onClick={handleNext} className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors" title={t("player.next")}>
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors" title={isMuted ? t("player.unmute") : t("player.mute")}>
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-[#FF0055]" /> : <Volume2 className="w-4 h-4 text-white/70" />}
                  </button>
                  <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-16 sm:w-20 accent-[#00E5FF] h-1 bg-white/20 rounded-lg cursor-pointer" />
                </div>
                <button id="player-playlist-toggle-btn" onClick={() => setShowPlaylist(!showPlaylist)} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors border ${showPlaylist ? "bg-white/20 border-white/40 text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"}`}>
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>{t("player.tracks")} ({TRACKS.length})</span>
                </button>
              </div>
            </div>
          </div>

          {showPlaylist && (
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn">
              {TRACKS.map((track, idx) => {
                const isCurrent = idx === currentTrackIndex;
                return (
                  <button key={track.id} onClick={() => { onSelectTrack(idx); if (!isPlaying) onTogglePlay(); }} className={`text-left p-3 rounded-2xl transition-all border flex flex-col justify-between ${isCurrent ? "bg-white/15 border-[#FF0055]/50 shadow-[0_0_15px_rgba(255,0,85,0.25)]" : "bg-black/30 border-white/5 hover:bg-white/10 hover:border-white/20"}`}>
                    <div className="flex items-start justify-between w-full mb-2">
                      <span className="text-[10px] font-mono text-white/40">0{idx + 1}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCurrent ? "bg-[#FF0055] text-white" : "bg-white/5 text-white/60"}`}>{track.category}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white truncate">{track.title}</h4>
                      <p className="text-[11px] text-white/50 truncate">{track.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between w-full mt-3 pt-2 border-t border-white/5 text-[11px] text-white/60 font-mono">
                      <span>{track.bpm} BPM</span><span>{track.duration}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
