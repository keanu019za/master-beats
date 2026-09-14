import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar, MapPin, Ticket, Flame, ExternalLink,
  Sparkles, AlertCircle, Loader2, WifiOff, ArrowRight
} from "lucide-react";
import { TourDate } from "../types";
import { TOUR_DATES } from "../data/tourDates";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
gsap.registerPlugin(ScrollTrigger);

// ─── Google Calendar Config ─────────────────────────────────────────────────
const GOOGLE_API_KEY = "AIzaSyA7qdiPBhIbba43a7_gdx2Pclwy3IDQJaY";
const CALENDAR_ID =
  "871f63891476fedc59363ce104157fe61bd54489a966f52da9ff2c831579a668@group.calendar.google.com";

// ─── Raw GCal Event Shape ───────────────────────────────────────────────────
interface GCalEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

interface GCalResponse {
  items?: GCalEvent[];
  error?: { message: string; code: number };
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const MONTHS_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"] as const;
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"] as const;
const DAYS_FULL    = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;

/** Parse a GCal event into the internal TourDate format */
function parseGCalEvent(ev: GCalEvent, idx: number): TourDate {
  const rawDate = ev.start.dateTime ?? ev.start.date ?? "";
  const d       = new Date(rawDate);
  const valid   = !isNaN(d.getTime());

  const date      = valid ? `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}` : "TBA";
  const dayOfWeek = valid ? DAYS_FULL[d.getDay()]                                            : "TBA";
  const monthYear = valid ? `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`                       : "TBA";

  const parts   = (ev.location ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const country = parts.length >= 2 ? parts[parts.length - 1]      : parts[0] ?? "TBA";
  const city    = parts.length >= 2 ? parts[parts.length - 2]      : parts[0] ?? "TBA";
  const stage   = parts.length >= 3 ? parts.slice(0, -2).join(", ") : undefined;

  const venue = ev.summary?.trim() || "Unknown Venue";
  const raw  = ev.description ?? "";
  const desc = raw.toLowerCase();

  let eventType: TourDate["eventType"] = "Concert";
  if (/festival|fest\b/.test(desc))                     eventType = "Festival";
  else if (/\bclub\b|club night|electronic night/.test(desc)) eventType = "Club";
  else if (/\bconcert\b|\blive show\b/.test(desc))           eventType = "Concert";

  let status: TourDate["status"] = "Tickets Available";
  if    (/sold[\s-]?out/i.test(raw))           status = "Sold Out";
  else if (/selling fast|limited tickets?/i.test(raw)) status = "Selling Fast";
  else if (/vip[\s-]only/i.test(raw))          status = "VIP Only";

  const priceMatch  = raw.match(/(?:price|ticket|entry|from)[:\s]*([€$£][\d.,\s]+(?:CHF)?[\d.,]*|CHF\s*[\d.,]+|free[^)\n]*)/i);
  const ticketPrice = priceMatch ? priceMatch[1].trim() : undefined;

  const linkMatch = raw.match(/(?:tickets?|link|buy|url)[:\s]*(https?:\/\/[^\s\n<]+)/i)
                 ?? raw.match(/(https?:\/\/[^\s\n<]+)/);
  const ticketLink = linkMatch ? linkMatch[1].replace(/[.,)]+$/, "") : "#";

  return { id: ev.id || `gcal-${idx}`, date, dayOfWeek, monthYear, city, country, venue, stage, eventType, status, ticketPrice, ticketLink };
}

// ─── Component Props ────────────────────────────────────────────────────────
interface TourScheduleProps {
  onSelectEventForBooking: (event: TourDate) => void;
  onOpenGeneralBooking: () => void;
}

// ─── Skeleton Row ────────────────────────────────────────────────────────────
const SkeletonRow: React.FC = () => (
  <div className="rounded-2xl bg-[#0B0B0F] border border-white/5 p-4 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 animate-pulse">
    <div className="flex items-center gap-5">
      <div className="w-20 h-20 rounded-2xl bg-white/5 shrink-0" />
      <div className="space-y-2">
        <div className="h-3 w-16 rounded-full bg-white/10" />
        <div className="h-6 w-48 rounded-full bg-white/10" />
        <div className="h-3 w-32 rounded-full bg-white/5" />
      </div>
    </div>
    <div className="flex-1 md:flex md:justify-end">
      <div className="h-10 w-32 rounded-xl bg-white/5" />
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export const TourSchedule: React.FC<TourScheduleProps> = ({
  onSelectEventForBooking,
  onOpenGeneralBooking,
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | "Festival" | "Club" | "Concert">("all");
  const [tourDates, setTourDates]     = useState<TourDate[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // ── GSAP ────────────────────────────────────────────────────────────────
  useGSAP(() => {
    gsap.from(".tour-header", {
      y: 15, opacity: 0, duration: 0.6, ease: "power2.out", clearProps: "all",
      scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
    });
    gsap.from(".tour-row", {
      y: 15, opacity: 0, duration: 0.55, ease: "power2.out", stagger: 0.08, clearProps: "all",
      scrollTrigger: { trigger: ".tour-row", start: "top 90%", once: true },
    });
    gsap.from(".tour-cta-banner", {
      y: 20, opacity: 0, duration: 0.6, ease: "power2.out", clearProps: "all",
      scrollTrigger: { trigger: ".tour-cta-banner", start: "top 92%", once: true },
    });
  }, { scope: sectionRef });

  // ── Fetch from Google Calendar ──────────────────────────────────────────
  const fetchEvents = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    setFetchError(null);
    setUsingFallback(false);

    const now = new Date().toISOString();
    const url =
      `https://www.googleapis.com/calendar/v3/calendars/` +
      `${encodeURIComponent(CALENDAR_ID)}/events` +
      `?key=${GOOGLE_API_KEY}` +
      `&timeMin=${encodeURIComponent(now)}` +
      `&singleEvents=true` +
      `&orderBy=startTime` +
      `&maxResults=50`;

    try {
      const res = await fetch(url, { signal });

      if (!res.ok) {
        const body: GCalResponse = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? `HTTP ${res.status}`);
      }

      const data: GCalResponse = await res.json();
      if (data.error) throw new Error(data.error.message);

      const items = data.items ?? [];
      if (items.length === 0) {
        setTourDates(TOUR_DATES);
        setUsingFallback(true);
      } else {
        setTourDates(items.map(parseGCalEvent));
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      console.warn("[TourSchedule] GCal fetch failed, using static fallback:", err);
      setFetchError((err as Error).message ?? "Unknown error");
      setTourDates(TOUR_DATES);
      setUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal);
    return () => controller.abort();
  }, [fetchEvents]);

  const filteredDates = tourDates.filter(
    (item) => filter === "all" || item.eventType === filter
  );

  return (
    <section ref={sectionRef} id="tour" className="py-20 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#FF0055]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 tour-header">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] text-xs font-semibold text-[#00E5FF] uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              {t("tour.badge")}
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
              {t("tour.title")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9]">
                {t("tour.titleAccent")}
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-sans max-w-xl">
              {t("tour.description")}
            </p>

            {/* Live status badge */}
            <div className="flex items-center gap-2 mt-3">
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Syncing with Google Calendar...
                </span>
              ) : usingFallback && fetchError ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#FF0055]/80 uppercase tracking-widest">
                  <WifiOff className="w-3 h-3" />
                  Offline — showing cached schedule
                </span>
              ) : usingFallback ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  Showing announced dates
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                  Live from Google Calendar
                </span>
              )}
            </div>
          </div>

          {/* ── Filter Pills ───────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/5">
            {(["all", "Festival", "Club", "Concert"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  filter === f
                    ? "bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {t(
                  `tour.filters.${
                    f === "all" ? "all" :
                    f === "Festival" ? "festival" :
                    f === "Club" ? "club" : "concert"
                  }`
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── API Error Banner ───────────────────────────────────────── */}
        {fetchError && !isLoading && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#FF0055]/10 text-xs text-white/80 font-sans border border-[#FF0055]/20">
            <AlertCircle className="w-4 h-4 text-[#FF0055] shrink-0" />
            <span>
              Could not reach Google Calendar ({fetchError}). Displaying pre-published schedule below.
            </span>
            <button
              onClick={() => {
                const controller = new AbortController();
                fetchEvents(controller.signal);
              }}
              className="ml-auto shrink-0 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Tour Date List ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filteredDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Calendar className="w-10 h-10 text-white/20" />
              <p className="text-sm text-white/40 font-sans">
                No upcoming {filter !== "all" ? filter.toLowerCase() : ""} dates found.
              </p>
              <button
                onClick={() => setFilter("all")}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Show all events
              </button>
            </div>
          ) : (
            filteredDates.map((item) => {
              const isSoldOut     = item.status === "Sold Out";
              const isSellingFast = item.status === "Selling Fast";
              const [monthStr, dayNum] = item.date.split(" ");

              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl bg-[#09090D] border border-[#1A1A24] hover:border-[#00E5FF]/40 hover:bg-[#0E0E14] p-5 sm:p-6 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 tour-row overflow-hidden"
                >
                  {/* Hover side bar accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF0055] via-[#5B0676] to-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Left Section: Datum + Info */}
                  <div className="flex items-center gap-5 sm:gap-6">
                    
                    {/* Datum Box */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#040406] border border-white/5 flex flex-col items-center justify-center shrink-0 group-hover:border-[#00E5FF]/30 transition-colors overflow-hidden">
                      <span className="text-[11px] font-black tracking-widest text-[#00E5FF] uppercase font-sans">
                        {monthStr}
                      </span>
                      <span className="font-bebas text-3xl sm:text-4xl text-white group-hover:scale-105 transition-transform leading-none my-0.5">
                        {dayNum}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                        {item.dayOfWeek.slice(0, 3)}
                      </span>
                    </div>

                    {/* Venue & Location Details */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-white/90">
                          {item.eventType}
                        </span>
                        <span className="text-xs text-white/40 font-sans">{item.monthYear}</span>
                      </div>

                      <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide group-hover:text-[#00E5FF] transition-colors truncate max-w-md">
                        {item.venue}
                      </h3>

                      <div className="flex items-center gap-2 font-sans text-xs sm:text-sm text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-[#FF0055] shrink-0" />
                        <span className="text-white/90">{item.city}, {item.country}</span>
                        {item.stage && (
                          <>
                            <span className="text-white/20">•</span>
                            <span className="text-white/50 truncate">{item.stage}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Status + Action */}
                  <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="text-left md:text-right">
                      <div className="flex items-center gap-1.5 md:justify-end">
                        {isSellingFast && (
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FF0055]/20 text-[#FF0055] text-[10px] font-extrabold uppercase tracking-wider">
                            <Flame className="w-3 h-3 animate-bounce" />
                            {t("tour.status.sellingFast")}
                          </span>
                        )}
                        {isSoldOut && (
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-extrabold uppercase tracking-wider">
                            {t("tour.status.soldOut")}
                          </span>
                        )}
                        {!isSellingFast && !isSoldOut && (
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-extrabold uppercase tracking-wider">
                            {t("tour.status.available")}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-white/50 font-medium mt-1">
                        {item.ticketPrice ? `${t("tour.from")} ${item.ticketPrice}` : t("tour.generalEntry")}
                      </div>
                    </div>

                    {isSoldOut ? (
                      <button
                        onClick={() => onSelectEventForBooking(item)}
                        className="px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
                      >
                        {t("tour.vipBtn")}
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectEventForBooking(item)}
                        className="group/btn relative px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 active:scale-95 flex items-center gap-2 shrink-0 outline-none"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] transition-transform duration-300 group-hover/btn:scale-110" />
                        <span className="relative z-10 flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                          {t("tour.bookBtn")}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Promoter CTA Banner ───────────────────────────────────── */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-[#B3002D]/20 via-[#5B0676]/20 to-[#0077D9]/20 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 tour-cta-banner border border-white/5">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[11px] uppercase font-black tracking-widest text-[#FF0055] flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-4 h-4" />
              {t("tour.cta.badge")}
            </span>
            <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide">
              {t("tour.cta.title")}
            </h3>
            <p className="text-xs sm:text-sm text-white/70 max-w-lg">{t("tour.cta.description")}</p>
          </div>

          <button
            onClick={onOpenGeneralBooking}
            className="shrink-0 px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center gap-2.5 active:scale-95 group outline-none"
          >
            {t("tour.cta.btn")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#00E5FF]" />
          </button>
        </div>

      </div>
    </section>
  );
};