import React, { useState, useEffect } from "react";
import { X, Send, Sparkles, CheckCircle2, Calendar, MapPin, Mail, Phone, User, Music } from "lucide-react";
import confetti from "canvas-confetti";
import { TourDate, BookingFormData } from "../types";
import { useTranslation } from "react-i18next";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledEvent?: TourDate | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, prefilledEvent }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<BookingFormData>({
    name: "", email: "", phone: "", eventType: "Festival", eventDate: "", location: "", estimatedGuests: "500-2,000", message: "", needsRiderInfo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledEvent) {
      setFormData((prev) => ({
        ...prev,
        eventType: prefilledEvent.eventType === "Concert" ? "Festival" : prefilledEvent.eventType,
        location: `${prefilledEvent.venue}, ${prefilledEvent.city}, ${prefilledEvent.country}`,
        eventDate: prefilledEvent.monthYear,
        message: `Inquiring about booking / tickets for: ${prefilledEvent.venue} (${prefilledEvent.date})`,
      }));
    }
  }, [prefilledEvent]);

  // ── Google Apps Script endpoint (ČIST I ISPRAVAN URL) ────────────────────
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbz5d4koZeIDI2Jjq6_sbTgNyAnFwAu6WevPSE5aWpPZwlL52cbvu7XclaYlvoY9Mbk_/exec";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Build the payload expected by the Apps Script Web App
    const payload = {
      name:           formData.name,
      email:          formData.email,
      phone:          formData.phone,
      eventType:      formData.eventType,
      date:           formData.eventDate,
      venue:          formData.location,
      message:        formData.message,
      needsRiderInfo: formData.needsRiderInfo,
    };

    try {
      // mode: 'no-cors' + 'text/plain' garancija da zahtev prolazi bez CORS blokade
      await fetch(APPS_SCRIPT_URL, {
        method:  "POST",
        mode:    "no-cors",
        headers: { "Content-Type": "text/plain" },
        body:    JSON.stringify(payload),
      });

      // Confirmation flow
      const ref = "MB-" + Math.floor(100000 + Math.random() * 900000);
      setBookingRef(ref);
      setIsSubmitted(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF0055", "#00E5FF", "#A000F0", "#FFFFFF"],
        });
      } catch {
        // Non-critical
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Network error — please check your connection and try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => { setIsSubmitted(false); setSubmitError(null); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden my-8">
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#FF0055]/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#00E5FF]/25 rounded-full blur-3xl pointer-events-none"></div>

        <button onClick={handleResetAndClose} className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors z-20" aria-label="Close modal">
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 px-4 space-y-5 relative z-10 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF0055] to-[#00E5FF] p-1 mx-auto">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#00E5FF]" />
              </div>
            </div>
            <div>
              <span className="text-xs uppercase font-sans tracking-widest text-[#00E5FF]">{t("booking.success.ref")} {bookingRef}</span>
              <h3 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide mt-1">{t("booking.success.title")}</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 font-sans">
                {t("booking.success.body").replace("<name/>", formData.name).replace("<location/>", formData.location || "your event")}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 max-w-md mx-auto text-left text-xs text-white/70 space-y-1.5 font-sans">
              <div className="flex justify-between"><span>{t("booking.success.organizer")}</span><span className="text-white font-bold">{formData.name}</span></div>
              <div className="flex justify-between"><span>{t("booking.success.email")}</span><span className="text-white">{formData.email}</span></div>
              <div className="flex justify-between"><span>{t("booking.success.eventFormat")}</span><span className="text-[#00E5FF]">{formData.eventType}</span></div>
              <div className="flex justify-between"><span>{t("booking.success.directContact")}</span><span className="text-white/60">management@masterandbeats.com</span></div>
            </div>
            <button onClick={handleResetAndClose} className="px-8 py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-white text-black hover:bg-[#00E5FF] transition-all shadow-lg">
              {t("booking.success.backBtn")}
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#FF0055]/40 text-[10px] font-bold tracking-widest uppercase text-[#FF0055] mb-2">
                <Sparkles className="w-3 h-3" />{t("booking.officialBadge")}
              </div>
              <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide">{t("booking.title")}</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans">{t("booking.description")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FF0055]" />{t("booking.labels.name")}
                  </label>
                  <input type="text" required placeholder={t("booking.placeholders.name")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF0055] transition-colors placeholder:text-white/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#00E5FF]" />{t("booking.labels.email")}
                  </label>
                  <input type="email" required placeholder={t("booking.placeholders.email")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors placeholder:text-white/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#FF0055]" />{t("booking.labels.phone")}
                  </label>
                  <input type="tel" placeholder={t("booking.placeholders.phone")} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF0055] transition-colors placeholder:text-white/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#00E5FF]" />{t("booking.labels.eventType")}
                  </label>
                  <select value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value as BookingFormData["eventType"] })} className="w-full px-4 py-2.5 rounded-xl bg-black/70 border border-white/15 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors">
                    <option value="Festival" className="bg-[#121218]">{t("booking.eventTypes.festival")}</option>
                    <option value="Club" className="bg-[#121218]">{t("booking.eventTypes.club")}</option>
                    <option value="Corporate" className="bg-[#121218]">{t("booking.eventTypes.corporate")}</option>
                    <option value="Private Event" className="bg-[#121218]">{t("booking.eventTypes.private")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF0055]" />{t("booking.labels.date")}
                  </label>
                  <input type="text" placeholder={t("booking.placeholders.date")} value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF0055] transition-colors placeholder:text-white/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />{t("booking.labels.venue")}
                  </label>
                  <input type="text" required placeholder={t("booking.placeholders.venue")} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors placeholder:text-white/30" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">{t("booking.labels.message")}</label>
                <textarea rows={3} placeholder={t("booking.placeholders.message")} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/30"></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="needsRider" checked={formData.needsRiderInfo} onChange={(e) => setFormData({ ...formData, needsRiderInfo: e.target.checked })} className="rounded accent-[#FF0055] w-4 h-4 bg-black/50 border-white/20" />
                <label htmlFor="needsRider" className="text-xs text-white/70 select-none cursor-pointer">{t("booking.labels.riderCheckbox")}</label>
              </div>

              {submitError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-[#FF0055]/8 border border-[#FF0055]/30 text-xs text-white/70 font-sans">
                  <span className="text-[#FF0055] font-bold shrink-0 mt-0.5">!</span>
                  <span className="flex-1">
                    <strong className="text-[#FF0055] font-bold block mb-0.5">Submission failed</strong>
                    {submitError}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubmitError(null)}
                    className="shrink-0 text-white/40 hover:text-white transition-colors"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-widest text-white relative overflow-hidden transition-all duration-300 shadow-[0_0_25px_rgba(255,0,85,0.4)] hover:shadow-[0_0_35px_rgba(0,229,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#B3002D] via-[#5B0676] to-[#0077D9]"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? <span>{t("booking.submitting")}</span> : <><Send className="w-3.5 h-3.5" /><span>{t("booking.submitBtn")}</span></>}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};