import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar, MapPin, Ticket, Flame, ExternalLink,
  Sparkles, AlertCircle, Loader2, WifiOff,
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
  // ── Date ───────────────────────────────────────────────────────────────
  const rawDate = ev.start.dateTime ?? ev.start.date ?? "";
  const d       = new Date(rawDate);
  const valid   = !isNaN(d.getTime());

  const date      = valid ? `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}` : "TBA";
  const dayOfWeek = valid ? DAYS_FULL[d.getDay()]                                                   : "TBA";
  const monthYear = valid ? `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`                       : "TBA";

  // ── Location  "Stage, City, Country" or "City, Country" ───────────────
  const parts   = (ev.location ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const country = parts.length >= 2 ? parts[parts.length - 1]      : parts[0] ?? "TBA";
  const city    = parts.length >= 2 ? parts[parts.length - 2]      : parts[0] ?? "TBA";
  const stage   = parts.length >= 3 ? parts.slice(0, -2).join(", ") : undefined;

  // ── Venue ─────────────────────────────────────────────────────────────
  const venue = ev.summary?.trim() || "Unknown Venue";

  // ── Description mining ─────────────────────────────────────────────────
  const raw  = ev.description ?? "";
  const desc = raw.toLowerCase();

  // Event type — keyword priority: festival > club > concert
  let eventType: TourDate["eventType"] = "Concert";
  if (/festival|fest\b/.test(desc))                         eventType = "Festival";
  else if (/\bclub\b|club night|electronic night/.test(desc)) eventType = "Club";
  else if (/\bconcert\b|\blive show\b/.test(desc))           eventType = "Concert";

  // Status
  let status: TourDate["status"] = "Tickets Available";
  if    (/sold[\s-]?out/i.test(raw))           status = "Sold Out";
  else if (/selling fast|limited tickets?/i.test(raw)) status = "Selling Fast";
  else if (/vip[\s-]only/i.test(raw))          status = "VIP Only";

  // Price  — matches "€55", "CHF 35", "$30", "Free Adm / VIP €25" etc.
  const priceMatch  = raw.match(/(?:price|ticket|entry|from)[:\s]*([€$£][\d.,\s]+(?:CHF)?[\d.,]*|CHF\s*[\d.,]+|free[^)\n]*)/i);
  const ticketPrice = priceMatch ? priceMatch[1].trim() : undefined;

  // Ticket URL
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
  <div className="rounded-2xl glass-panel border border-white/10 p-4 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 animate-pulse">
    <div className="flex items-center gap-5">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 shrink-0" />
      <div className="space-y-2">
        <div className="h-3 w-16 rounded-full bg-white/10" />
        <div className="h-6 w-48 rounded-full bg-white/10" />
        <div className="h-3 w-32 rounded-full bg-white/5" />
      </div>
    </div>
    <div className="flex-1 md:flex md:justify-end">
      <div className="h-9 w-28 rounded-full bg-white/5" />
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
        // Calendar exists but no upcoming events — show static fallback silently
        setTourDates(TOUR_DATES);
        setUsingFallback(true);
      } else {
        setTourDates(items.map(parseGCalEvent));
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return; // unmounted — no state update
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

  // ── Filtered list ───────────────────────────────────────────────────────
  const filteredDates = tourDates.filter(
    (item) => filter === "all" || item.eventType === filter
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <section ref={sectionRef} id="tour" className="py-20 relative">
      {/* Background glows */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#FF0055]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#00E5FF]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 tour-header">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-[#00E5FF] uppercase tracking-wider mb-2">
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

            {/* Live indicator badge */}
            <div className="flex items-center gap-2 mt-3">
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Syncing with Google Calendar...
                </span>
              ) : usingFallback && fetchError ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#FF0055]/60 uppercase tracking-widest">
                  <WifiOff className="w-3 h-3" />
                  Offline — showing cached schedule
                </span>
              ) : usingFallback ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  Showing announced dates
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#00E5FF]/60 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                  Live from Google Calendar
                </span>
              )}
            </div>
          </div>

          {/* ── Filter Pills ──────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2 bg-white/[0.03] p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {(["all", "Festival", "Club", "Concert"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === f
                    ? "bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] text-white shadow-[0_0_15px_rgba(255,0,85,0.4)]"
                    : "text-white/60 hover:text-white"
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

        {/* ── API Error Banner (non-blocking) ────────────────────────── */}
        {fetchError && !isLoading && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#FF0055]/5 border border-[#FF0055]/20 text-xs text-white/60 font-sans">
            <AlertCircle className="w-4 h-4 text-[#FF0055] shrink-0" />
            <span>
              Could not reach Google Calendar ({fetchError}). Displaying pre-published schedule below.
            </span>
            <button
              onClick={() => {
                const controller = new AbortController();
                fetchEvents(controller.signal);
              }}
              className="ml-auto shrink-0 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Tour Date List ─────────────────────────────────────────── */}
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton placeholders
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filteredDates.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Calendar className="w-10 h-10 text-white/20" />
              <p className="text-sm text-white/40 font-sans">
                No upcoming {filter !== "all" ? filter.toLowerCase() : ""} dates found.
              </p>
              <button
                onClick={() => setFilter("all")}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                Show all events
              </button>
            </div>
          ) : (
            filteredDates.map((item) => {
              const isSoldOut     = item.status === "Sold Out";
              const isSellingFast = item.status === "Selling Fast";

              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl glass-panel border border-white/10 hover:border-white/30 p-4 sm:p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,229,255,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4 tour-row"
                >
                  {/* Left: Date badge + venue info */}
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center shrink-0 group-hover:border-[#00E5FF]/50 transition-colors">
                      <span className="font-bebas text-2xl sm:text-3xl text-white group-hover:text-[#00E5FF] transition-colors leading-none">
                        {item.date}
                      </span>
                      <span className="text-[10px] uppercase font-bold font-sans text-white/50 tracking-wider mt-0.5">
                        {item.dayOfWeek.slice(0, 3)}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-white/80">
                          {item.eventType}
                        </span>
                        <span className="text-xs text-white/40 font-sans">{item.monthYear}</span>
                      </div>
                      <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#00E5FF] transition-all truncate max-w-sm">
                        {item.venue}
                      </h3>
                      <div className="flex items-center gap-2 font-sans text-xs sm:text-sm text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-[#FF0055] shrink-0" />
                        <span>{item.city}, {item.country}</span>
                        {item.stage && (
                          <>
                            <span className="text-white/20">•</span>
                            <span className="text-white/60 truncate">{item.stage}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status + CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                    <div className="text-left md:text-right">
                      {/* Status badge */}
                      <div className="flex items-center gap-1.5 md:justify-end">
                        {isSellingFast && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF0055]/20 border border-[#FF0055]/40 text-[#FF0055] text-[10px] font-bold">
                            <Flame className="w-3 h-3" />
                            {t("tour.status.sellingFast")}
                          </span>
                        )}
                        {isSoldOut && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold">
                            {t("tour.status.soldOut")}
                          </span>
                        )}
                        {!isSellingFast && !isSoldOut && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] text-[10px] font-bold">
                            {t("tour.status.available")}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {item.ticketPrice ? `${t("tour.from")} ${item.ticketPrice}` : t("tour.generalEntry")}
                      </div>
                    </div>

                    {/* Action button */}
                    {isSoldOut ? (
                      <button
                        onClick={() => onSelectEventForBooking(item)}
                        className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {t("tour.vipBtn")}
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectEventForBooking(item)}
                        className="group/btn relative px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,85,0.5)] active:scale-95 flex items-center gap-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9] transition-transform duration-300 group-hover/btn:scale-105" />
                        <span className="relative z-10 flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5" />
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

        {/* ── Promoter CTA Banner ────────────────────────────────────── */}
        <div className="mt-10 p-6 rounded-3xl glass-panel border border-[#FF0055]/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 tour-cta-banner">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#FF0055] flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t("tour.cta.badge")}
            </span>
            <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide">
              {t("tour.cta.title")}
            </h3>
            <p className="text-xs sm:text-sm text-white/60">{t("tour.cta.description")}</p>
          </div>
          <button
            onClick={onOpenGeneralBooking}
            className="shrink-0 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-md transition-all flex items-center gap-2 shadow-lg"
          >
            {t("tour.cta.btn")}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
