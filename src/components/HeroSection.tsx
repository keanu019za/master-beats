import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Flame, ArrowUpRight, Ticket, Clock, MapPin, Loader2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import heroImg from "../assets/images/hero_duo_neon_1789179015979.jpg";
import harmonikagif from "../assets/images/harmonika.gif";
gsap.registerPlugin(ScrollTrigger);

// ─── Google Calendar config ────────────────────────────────────────────────
const GOOGLE_API_KEY  = "AIzaSyA7qdiPBhIbba43a7_gdx2Pclwy3IDQJaY";
const CALENDAR_ID     =
  "871f63891476fedc59363ce104157fe61bd54489a966f52da9ff2c831579a668@group.calendar.google.com";

// ─── Types ─────────────────────────────────────────────────────────────────
interface GCalEvent {
  id: string;
  summary?: string;
  location?: string;
  description?: string;
  start: { dateTime?: string; date?: string };
}

interface NextGig {
  /** ISO string of the event start — drives the countdown */
  startISO: string;
  /** Human-readable venue/event name (from summary) */
  venue: string;
  /** City extracted from location field */
  city: string;
  /** Country extracted from location field */
  country: string;
  /** Stage extracted from location field (optional) */
  stage?: string;
  /** Formatted date label, e.g. "JUL 11, 2026" */
  dateLabel: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const MONTHS_SHORT = [
  "JAN","FEB","MAR","APR","MAY","JUN",
  "JUL","AUG","SEP","OCT","NOV","DEC",
] as const;

function buildDateLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "TBA";
  return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}, ${d.getFullYear()}`;
}

function parseLocation(raw: string): { city: string; country: string; stage?: string } {
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const country = parts.length >= 2 ? parts[parts.length - 1] : parts[0] ?? "";
  const city    = parts.length >= 2 ? parts[parts.length - 2] : parts[0] ?? "";
  const stage   = parts.length >= 3 ? parts.slice(0, -2).join(", ") : undefined;
  return { city, country, stage };
}

function calcTimeLeft(targetISO: string): TimeLeft {
  const diff = new Date(targetISO).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ─── Static fallback (used when API is unreachable) ───────────────────────
function buildFallbackGig(): NextGig {
  // Fallback: EXIT Festival 2026 — same date the static code used as reference
  const fallbackDate = new Date();
  fallbackDate.setDate(fallbackDate.getDate() + 27);
  fallbackDate.setHours(20, 0, 0, 0);
  return {
    startISO:  fallbackDate.toISOString(),
    venue:     "EXIT Festival",
    city:      "Novi Sad",
    country:   "Serbia",
    stage:     "Dance Arena & Fusion Stage",
    dateLabel: buildDateLabel(fallbackDate.toISOString()),
  };
}

// ─── Props ─────────────────────────────────────────────────────────────────
interface HeroSectionProps {
  onOpenBooking: () => void;
  onOpenVideo: () => void;
  onScrollToPlayer: () => void;
  onScrollToTour: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

// ──────────────────────────────────────────────────────────────────────────
export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onOpenVideo,
  onScrollToPlayer,
  onScrollToTour,
}) => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement>(null);

  // ── GCal fetch state ─────────────────────────────────────────────────────
  const [nextGig, setNextGig]         = useState<NextGig | null>(null);
  const [gigLoading, setGigLoading]   = useState(true);

  // ── Countdown state ──────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 27, hours: 14, minutes: 36, seconds: 52,
  });

  // ── GSAP entrance ────────────────────────────────────────────────────────
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.from(".hero-left-item",  { y: 20, opacity: 0, duration: 0.6, stagger: 0.1,  clearProps: "all" });
    tl.from(".hero-trust-badge",{ opacity: 0, duration: 0.5, clearProps: "all" }, "-=0.1");
    tl.from(".hero-right-item", { scale: 0.98, opacity: 0, duration: 0.55, stagger: 0.08, clearProps: "all" }, "-=0.35");
  }, { scope: heroRef });

  // ── Fetch next gig from Google Calendar ──────────────────────────────────
  const fetchNextGig = useCallback(async (signal: AbortSignal) => {
    setGigLoading(true);
    const now = new Date().toISOString();
    const url =
      `https://www.googleapis.com/calendar/v3/calendars/` +
      `${encodeURIComponent(CALENDAR_ID)}/events` +
      `?key=${GOOGLE_API_KEY}` +
      `&timeMin=${encodeURIComponent(now)}` +
      `&singleEvents=true` +
      `&orderBy=startTime` +
      `&maxResults=1`;

    try {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items: GCalEvent[] = data.items ?? [];

      if (items.length === 0) {
        // Calendar live but no upcoming events — use fallback silently
        setNextGig(buildFallbackGig());
        return;
      }

      const ev = items[0];
      const startISO = ev.start.dateTime ?? ev.start.date ?? "";
      const { city, country, stage } = parseLocation(ev.location ?? "");

      setNextGig({
        startISO,
        venue:     ev.summary?.trim() || "Upcoming Show",
        city:      city  || "TBA",
        country:   country || "TBA",
        stage,
        dateLabel: buildDateLabel(startISO),
      });
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      console.warn("[HeroSection] GCal fetch failed, using fallback:", err);
      setNextGig(buildFallbackGig());
    } finally {
      setGigLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchNextGig(controller.signal);
    return () => controller.abort();
  }, [fetchNextGig]);

  // ── Live countdown — re-evaluates every second against the live GCal target
  useEffect(() => {
    if (!nextGig) return;
    // Kick off immediately so there is no 1-second blank flash
    setTimeLeft(calcTimeLeft(nextGig.startISO));
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(nextGig.startISO));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextGig]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen pt-28 pb-16 overflow-hidden flex flex-col justify-center"
    >
      {/* Background glows */}
      <div className="absolute inset-0 bg-[#060608] z-0">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#FF0055]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-[#00E5FF]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-cyber opacity-30 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* ── Top Badges ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6 hero-left-item">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md text-xs font-semibold text-white/90">
            <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-ping" />
            <span className="text-white/80">{t("hero.badge")}</span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF0055]/15 to-[#00E5FF]/15 border border-[#FF0055]/30 text-xs font-medium text-white/90">
            <Flame className="w-3.5 h-3.5 text-[#FF0055]" />
            <span>{t("hero.instrument")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Headline */}
            <div className="relative hero-left-item">
              <div className="relative inline-block">
                <h1 className="font-bebas text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.88] text-white uppercase select-none">
                  {t("hero.tagline")} <span className="text-white"></span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9]">
                    BEATS
                  </span>
                  <img
                    src={harmonikagif}
                    alt="Harmonika"
                    className="inline-block h-[0.9em] w-auto align-middle ml-3 sm:ml-5 -translate-y-1 select-none pointer-events-none"
                  />
                </h1>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-400 font-sans max-w-xl hero-left-item">
              {t("hero.description").replace(/<[^>]+>/g, "").split("Master&Beats")[0]}
              <strong className="text-white font-semibold">Master&amp;Beats</strong>
              {(() => {
                const after = t("hero.description").replace(/<[^>]+>/g, "");
                const rest  = after.split("Master&Beats")[1] ?? "";
                const mi    = rest.indexOf("Miloš Mladenović");
                const du    = rest.indexOf("Dušan Đorđević");
                if (mi === -1) return rest;
                return (
                  <>
                    {rest.substring(0, mi)}
                    <span className="text-[#FF0055] font-semibold">Dušan Đorđević</span>
                    {rest.substring(mi + "Miloš Mladenović".length, du)}
                    <span className="text-[#00E5FF] font-semibold">Miloš Mladenović</span>
                    {rest.substring(du + "Dušan Đorđević".length)}
                  </>
                );
              })()}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 hero-left-item">
              <button
                id="hero-book-now-btn"
                onClick={onOpenBooking}
                className="group relative px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider text-white overflow-hidden shadow-[0_0_25px_rgba(179,0,45,0.45)] hover:shadow-[0_0_35px_rgba(0,119,217,0.6)] transition-all duration-300 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] transition-all duration-300 group-hover:scale-105" />
                <span className="relative z-10 flex items-center gap-2.5">
                  <Ticket className="w-4 h-4" />
                  {t("hero.bookBtn")}
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>

              <button
                id="hero-watch-video-btn"
                onClick={onOpenVideo}
                className="group flex items-center gap-4 text-white font-medium text-sm hover:text-white/80 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/30 flex items-center justify-center shrink-0 backdrop-blur-md transition-all duration-300 shadow-lg">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
                <span className="whitespace-nowrap">{t("hero.watchBtn")}</span>
              </button>
            </div>

            {/* Trust Marker */}
            <div className="pt-8 border-t border-white/10 max-w-lg hero-trust-badge">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2 overflow-hidden">
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-black object-cover" src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80" alt="Festival stage" />
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-black object-cover" src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&auto=format&fit=crop&q=80" alt="DJ Performance" />
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-black object-cover" src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&auto=format&fit=crop&q=80" alt="Crowd" />
                  <div className="flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-black bg-[#FF0055] text-[10px] font-bold text-white tracking-wider font-sans">+50</div>
                </div>
                <div className="flex flex-col justify-center font-sans">
                  <span className="text-xs font-bold tracking-wider text-white uppercase">{t("hero.trust.title")}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-[#00E5FF] text-xs leading-none">★★★★★</div>
                    <span className="text-xs text-white/60 font-medium leading-none">{t("hero.trust.subtitle")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Main image card — venue name & location from GCal */}
            <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/15 p-2 shadow-2xl group transition-all duration-500 hover:border-white/30 hero-right-item">
              <div className="relative h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden">
                <img
                  src={heroImg}
                  alt="Master & Beats live performance"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 to-transparent" />

                {/* Instrument badges — always static */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#FF0055]/50 text-[11px] font-bold tracking-wider uppercase text-[#FF0055] flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,0,85,0.4)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF0055] animate-pulse" />
                    Acoustic Accordion
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#00E5FF]/50 text-[11px] font-bold tracking-wider uppercase text-[#00E5FF] flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,229,255,0.4)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                    Electric Accordion
                  </span>
                </div>

                {/* Dynamic venue / location overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="min-w-0">
                    <span className="text-xs uppercase font-semibold text-white/70 tracking-wider">
                      {t("hero.heroCard.nextHeadline")}
                    </span>
                    {gigLoading ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                        <span className="text-sm text-white/40 font-sans">Fetching live dates...</span>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide truncate">
                          {nextGig?.venue ?? t("hero.heroCard.venue")}
                        </h3>
                        <p className="text-xs text-[#00E5FF] font-medium flex items-center gap-1">
                          {nextGig?.stage ? (
                            <>{nextGig.stage} &bull; {nextGig.city}, {nextGig.country}</>
                          ) : nextGig ? (
                            <><MapPin className="w-3 h-3" /> {nextGig.city}, {nextGig.country}</>
                          ) : (
                            t("hero.heroCard.stage")
                          )}
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={onScrollToTour}
                    className="p-3 rounded-full bg-white text-black hover:bg-[#00E5FF] transition-colors shadow-lg shrink-0 ml-2"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* ── Countdown Timer Widget — driven by GCal start time ── */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#FF0055]/40 transition-colors shadow-lg hero-right-item">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF0055] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {t("hero.timer.label")}
                  </span>
                  {gigLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-ping" />
                  )}
                </div>

                {/* 2×2 digit grid */}
                <div className="grid grid-cols-2 gap-2">
                  {(["days","hours","minutes","seconds"] as const).map((unit, i) => (
                    <div
                      key={unit}
                      className="bg-black/50 py-3 px-2 rounded-xl border border-white/5 flex flex-col items-center justify-center"
                    >
                      <div
                        className={`font-bebas text-3xl sm:text-4xl leading-none tabular-nums ${
                          unit === "seconds" ? "text-[#00E5FF]" : "text-white"
                        }`}
                      >
                        {String(timeLeft[unit]).padStart(2, "0")}
                      </div>
                      <div
                        className={`text-[9px] uppercase tracking-wider mt-1 font-semibold ${
                          unit === "seconds" ? "text-[#00E5FF]/70" : "text-white/50"
                        }`}
                      >
                        {t(`hero.timer.${["days","hours","mins","secs"][i]}`)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Event date label beneath the grid */}
                {!gigLoading && nextGig && (
                  <p className="mt-3 text-center text-[10px] font-sans text-white/30 tracking-wider uppercase">
                   
                  </p>
                )}
              </div>

              {/* ── Tour Pass Widget — live event metadata ─────────────── */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#00E5FF]/40 transition-colors shadow-lg relative overflow-hidden flex flex-col justify-between hero-right-item">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#00E5FF]">
                    {t("hero.tourCard.title")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] text-[10px] font-bold">
                    {t("hero.tourCard.badge")}
                  </span>
                </div>

                {gigLoading ? (
                  /* Skeleton while fetching */
                  <div className="flex-1 flex flex-col gap-2 my-2 animate-pulse">
                    <div className="h-3.5 w-3/4 rounded-full bg-white/10" />
                    <div className="h-3 w-1/2 rounded-full bg-white/5" />
                    <div className="h-3 w-2/3 rounded-full bg-white/5" />
                  </div>
                ) : (
                  <div className="my-2 min-w-0">
                    {/* Venue */}
                    <div className="text-sm font-semibold text-white truncate">
                      {nextGig?.venue ?? t("hero.tourCard.leg")}
                    </div>
                    {/* City / Country */}
                    {nextGig && (
                      <div className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#FF0055] shrink-0" />
                        {nextGig.city}, {nextGig.country}
                      </div>
                    )}
                    {/* Stage if available */}
                    {nextGig?.stage && (
                      <div className="text-[11px] text-white/40 mt-0.5 truncate">
                        {nextGig.stage}
                      </div>
                    )}
                    {/* Date label */}
                    {nextGig && (
                      <div className="text-[11px] text-[#00E5FF]/70 font-semibold mt-1">
                        {nextGig.dateLabel}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[10px] uppercase text-white/40 block">
                      {t("hero.tourCard.statusLabel")}
                    </span>
                    <span className="text-xs font-bold text-[#FF0055]">
                      {t("hero.tourCard.statusValue")}
                    </span>
                  </div>
                  <button
                    onClick={onScrollToTour}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-[#00E5FF] transition-colors"
                  >
                    {t("hero.tourCard.viewSchedule")}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
