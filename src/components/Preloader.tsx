import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface PreloaderProps {
  onComplete: () => void;
}

// Gradient stops: #FF0055 → purple → #00E5FF
const BAR_COLORS = [
  "#FF0055",
  "#E0004A",
  "#A0006A",
  "#7B00A0",
  "#3A00C8",
  "#0099E5",
  "#00E5FF",
];

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement[]>([]);
  const percentRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);

  useGSAP(() => {
    // ── 1. Pocetno stanje: collapsed ──────────────────────────────────
    gsap.set(barsRef.current, { scaleX: 0.08, transformOrigin: "center center" });
    gsap.set([logoRef.current, taglineRef.current], { opacity: 0, y: 10 });

    const master = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // ── 2. Logo & tagline fade in ───────────────────────────────────
    master.to(logoRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0);
    master.to(taglineRef.current, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.1);

    // ── 3. Accordion bellows ripple ─────────────────────────────────
    const breathe = () => {
      gsap.to(barsRef.current, {
        scaleX: () => gsap.utils.random(0.35, 1.0),
        duration: 0.42,
        ease: "sine.inOut",
        stagger: { each: 0.05, from: "center" },
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.05,
        onComplete: breathe,
      });
    };
    breathe();

    // ── 4. Counter 0 → 100 ──────────────────────────────────────────
    const progressObj = { value: 0 };
    gsap.to(progressObj, {
      value: 100,
      duration: 2.0,
      ease: "power1.inOut",
      onUpdate() {
        const v = Math.round(progressObj.value);
        setPercent(v);
        if (percentRef.current) percentRef.current.textContent = `${v}%`;
      },
      onComplete() {
        // ── 5. Exit ─────────────────────────────────────────────────
        gsap.killTweensOf(barsRef.current);
        const exitTl = gsap.timeline({
          onComplete: onComplete,
        });
        exitTl
          .to(barsRef.current, {
            scaleX: 1,
            duration: 0.35,
            ease: "power3.in",
            stagger: { each: 0.035, from: "center" },
          })
          .to(
            containerRef.current,
            {
              opacity: 0,
              scale: 1.02,
              duration: 0.45,
              ease: "power2.inOut",
              pointerEvents: "none",
            },
            "-=0.1"
          );
      },
    });

    return () => {
      gsap.killTweensOf(barsRef.current);
    };
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b0b0e] overflow-hidden"
      aria-label="Loading Master & Beats experience"
    >
      {/* ── Ambient Background Glows (Smanjeni) ────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-[#FF0055]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#00E5FF]/10 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-700/8 rounded-full blur-[60px]" />
      </div>

      {/* ── Accordion Bellow Bars (Visina smanjena na max 46px, širina na 10px) ── */}
      <div className="relative flex items-end justify-center gap-[4px] h-12 mb-5">
        {BAR_COLORS.map((color, i) => {
          // Proportionally scaled down heights (stari: [52, 68, 80, 92, 80, 68, 52])
          const heights = [26, 34, 40, 46, 40, 34, 26];
          return (
            <div
              key={i}
              ref={(el) => {
                if (el) barsRef.current[i] = el;
              }}
              style={{
                backgroundColor: color,
                height: heights[i],
                width: 10,
                borderRadius: 2,
                willChange: "transform",
                boxShadow: `0 0 8px 1px ${color}44`,
              }}
            />
          );
        })}

        {/* Fine vertical reed lines */}
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center gap-[4px]">
          {BAR_COLORS.map((_, i) => {
            const heights = [26, 34, 40, 46, 40, 34, 26];
            return (
              <div key={i} style={{ width: 10, height: heights[i] }} className="relative overflow-hidden rounded-[2px]">
                {[...Array(4)].map((__, lineIdx) => (
                  <div
                    key={lineIdx}
                    className="absolute inset-x-0 bg-black/20"
                    style={{ top: `${(lineIdx + 1) * 20}%`, height: 1 }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Brand Logo ───────────────────────────────────────────────── */}
      <div ref={logoRef} className="text-center mb-1.5">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          {/* Mini logo mark */}
          <div className="flex items-center gap-0.5 mr-1">
            <span className="block w-0.5 h-3.5 rounded-full bg-[#FF0055]" />
            <span className="block w-0.5 h-2.5 rounded-full bg-white/60" />
            <span className="block w-0.5 h-4 rounded-full bg-[#00E5FF]" />
          </div>
          <h1
            className="font-bebas text-2xl sm:text-3xl text-white uppercase select-none"
            style={{ letterSpacing: "0.02em" }}
          >
            MASTER{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0055] via-purple-400 to-[#00E5FF]">
              &amp;
            </span>{" "}
            BEATS
          </h1>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent mt-0.5" />
      </div>
      {/* ── Status Line (Smanjena širina i font) ────────────────────── */}
      <div ref={taglineRef} className="flex flex-col items-center gap-2 mt-1">
        {/* Progress bar track */}
        <div className="w-32 sm:w-44 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF0055] via-purple-500 to-[#00E5FF] rounded-full transition-all duration-100"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Counter + label */}
        <div className="flex items-center gap-2 font-sans text-[10px] tracking-[0.15em] text-white/50 uppercase">
          <span
            ref={percentRef}
            className="text-white/80 font-bold tabular-nums w-7 text-right"
          >
            0%
          </span>
          <span className="text-white/25">·</span>
          <span>Loading Experience</span>
        </div>
      </div>
    </div>
  );
};