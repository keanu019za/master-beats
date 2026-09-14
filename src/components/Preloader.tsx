import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface PreloaderProps {
  onComplete: () => void;
}

// Number of accordion bellow bars
const BAR_COUNT = 7;

// Gradient stops distributed across bars: #FF0055 → purple → #00E5FF
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
    // ── 1. Initial state: bars start collapsed ──────────────────────
    gsap.set(barsRef.current, { scaleX: 0.08, transformOrigin: "center center" });
    gsap.set([logoRef.current, taglineRef.current], { opacity: 0, y: 18 });

    const master = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // ── 2. Logo & tagline fade in ───────────────────────────────────
    master.to(logoRef.current, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, 0);
    master.to(taglineRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.15);

    // ── 3. Accordion bellows: ripple-expand animation ───────────────
    // Each bar expands to a random "breath" width then contracts, staggered
    const breathe = () => {
      gsap.to(barsRef.current, {
        scaleX: () => gsap.utils.random(0.35, 1.0),
        duration: 0.42,
        ease: "sine.inOut",
        stagger: { each: 0.06, from: "center" },
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.05,
        onComplete: breathe,
      });
    };
    breathe();

    // ── 4. Fake progress counter: 0 → 100 over ~2.2s ───────────────
    const progressObj = { value: 0 };
    gsap.to(progressObj, {
      value: 100,
      duration: 2.2,
      ease: "power1.inOut",
      onUpdate() {
        const v = Math.round(progressObj.value);
        setPercent(v);
        if (percentRef.current) percentRef.current.textContent = `${v}%`;
      },
      onComplete() {
        // ── 5. Exit: bars all expand full-width, then entire overlay fades out
        gsap.killTweensOf(barsRef.current);
        const exitTl = gsap.timeline({
          onComplete: onComplete,
        });
        exitTl
          .to(barsRef.current, {
            scaleX: 1,
            duration: 0.38,
            ease: "power3.in",
            stagger: { each: 0.045, from: "center" },
          })
          .to(
            containerRef.current,
            {
              opacity: 0,
              scale: 1.04,
              duration: 0.55,
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
      {/* ── Ambient Background Glows ──────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#FF0055]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#00E5FF]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-700/8 rounded-full blur-[100px]" />
      </div>

      {/* ── Accordion Bellow Bars ─────────────────────────────────── */}
      <div className="relative flex items-end justify-center gap-[6px] h-24 mb-10">
        {BAR_COLORS.map((color, i) => {
          // Bar heights vary slightly to give a realistic bellows silhouette
          const heights = [52, 68, 80, 92, 80, 68, 52];
          return (
            <div
              key={i}
              ref={(el) => {
                if (el) barsRef.current[i] = el;
              }}
              style={{
                backgroundColor: color,
                height: heights[i],
                width: 18,
                borderRadius: 4,
                willChange: "transform",
                // Subtle inner-shadow via box-shadow for depth
                boxShadow: `0 0 12px 2px ${color}55`,
              }}
            />
          );
        })}

        {/* Fine vertical reed lines overlaid on the bars for texture */}
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center gap-[6px]">
          {BAR_COLORS.map((_, i) => {
            const heights = [52, 68, 80, 92, 80, 68, 52];
            return (
              <div key={i} style={{ width: 18, height: heights[i] }} className="relative overflow-hidden rounded-[4px]">
                {[...Array(5)].map((__, lineIdx) => (
                  <div
                    key={lineIdx}
                    className="absolute inset-x-0 bg-black/20"
                    style={{ top: `${(lineIdx + 1) * 16}%`, height: 1 }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Brand Logo ───────────────────────────────────────────────── */}
      <div ref={logoRef} className="text-center mb-3">
        <div className="flex items-center justify-center gap-3 mb-1">
          {/* Mini logo mark */}
          <div className="flex items-center gap-0.5">
            <span className="block w-1 h-6 rounded-full bg-[#FF0055]" />
            <span className="block w-1 h-4 rounded-full bg-white/60" />
            <span className="block w-1 h-7 rounded-full bg-[#00E5FF]" />
          </div>
          <h1
            className="font-bebas text-5xl sm:text-6xl tracking-widest text-white uppercase select-none"
            style={{ letterSpacing: "0.12em" }}
          >
            MASTER{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0055] via-purple-400 to-[#00E5FF]">
              &amp;
            </span>{" "}
            BEATS
          </h1>
        </div>
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-1" />
      </div>

      {/* ── Status Line ─────────────────────────────────────────────── */}
      <div ref={taglineRef} className="flex flex-col items-center gap-3 mt-2">
        {/* Progress bar track */}
        <div className="w-48 sm:w-64 h-[3px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF0055] via-purple-500 to-[#00E5FF] rounded-full transition-all duration-100"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Counter + label */}
        <div className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-white/50 uppercase">
          <span
            ref={percentRef}
            className="text-white/80 font-bold tabular-nums w-9 text-right"
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
