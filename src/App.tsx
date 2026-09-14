import React, { useState, useEffect } from 'react';
import { Preloader } from './components/Preloader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, Volume2, X, Sparkles, ChevronUp, Music, Calendar, Users } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AudioPlayerWidget } from './components/AudioPlayerWidget';
import { TourSchedule } from './components/TourSchedule';
import { AboutDuoSection } from './components/AboutDuoSection';
import { GearSection } from './components/GearSection';
import { BookingModal } from './components/BookingModal';
import { VideoModal } from './components/VideoModal';
import { Footer } from './components/Footer';
import { soundEngine } from './utils/soundEngine';
import { TRACKS } from './data/tracks';
import { TourDate } from './types';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedTourEvent, setSelectedTourEvent] = useState<TourDate | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(true);

  // Lock body scroll while preloader is active
  useEffect(() => {
    document.body.style.overflow = preloaderDone ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [preloaderDone]);

  // Initialize GSAP scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle entrance animation for sections
      gsap.utils.toArray<HTMLElement>('section').forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0.85, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Audio Play / Pause handler
  const handleTogglePlay = () => {
    if (isPlaying) {
      soundEngine.pause();
      setIsPlaying(false);
    } else {
      soundEngine.playTrack(currentTrackIndex);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    if (isPlaying) {
      soundEngine.playTrack(index);
    }
  };

  const handleOpenBooking = () => {
    setSelectedTourEvent(null);
    setBookingModalOpen(true);
  };

  const handleSelectEventForBooking = (event: TourDate) => {
    setSelectedTourEvent(event);
    setBookingModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const currentTrack = TRACKS[currentTrackIndex] || TRACKS[0];

  return (
    <div className="relative min-h-screen bg-[#060608] text-slate-100 selection:bg-[#FF0055] selection:text-white">
      {/* Preloader — mounts on first visit, unmounts after exit animation */}
      {!preloaderDone && (
        <Preloader onComplete={() => setPreloaderDone(true)} />
      )}

      {/* Top Fixed Navbar */}
      <Navbar
        onOpenBooking={handleOpenBooking}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Dynamic Hero Section */}
        <HeroSection
          onOpenBooking={handleOpenBooking}
          onOpenVideo={() => setVideoModalOpen(true)}
          onScrollToPlayer={() => scrollToSection('player')}
          onScrollToTour={() => scrollToSection('tour')}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
        />

        {/* 2. Embedded Music Player & Media Widget */}
        <AudioPlayerWidget
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          currentTrackIndex={currentTrackIndex}
          onSelectTrack={handleSelectTrack}
        />

        {/* 3. Interactive Tour & Booking Dates */}
        <TourSchedule
          onSelectEventForBooking={handleSelectEventForBooking}
          onOpenGeneralBooking={handleOpenBooking}
        />

        {/* 4. About Duo Section (Miloš Mladenović & Dušan Đorđević) */}
        <AboutDuoSection />

        {/* 5. Stage Tech & Sound Engineering Breakdown */}
        <GearSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={handleOpenBooking}
        onScrollToSection={scrollToSection}
      />

      {/* Floating Mini Player Widget (when user scrolls through the page) */}
      {isMiniPlayerVisible && (
        <div className="fixed bottom-6 left-6 z-40 hidden md:block animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="glass-panel px-4 py-2.5 rounded-full border border-white/15 flex items-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:border-white/25 transition-all">
            <button
              onClick={handleTogglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                isPlaying
                  ? 'bg-[#FF0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.6)]'
                  : 'bg-white text-black hover:bg-[#00E5FF]'
              }`}
              title={isPlaying ? 'Pause' : 'Play Live Synth Audio'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="text-left cursor-pointer pr-1" onClick={() => scrollToSection('player')}>
              <div className="text-xs font-bold text-white max-w-[130px] truncate hover:text-[#00E5FF] transition-colors">
                {currentTrack.title}
              </div>
              <div className="text-[10px] text-white/50 truncate flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#00E5FF] animate-ping' : 'bg-white/30'}`}></span>
                <span>{isPlaying ? 'Now Playing' : 'Synthesizer Ready'}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-white/10 my-auto ml-1" />

            {/* Modern Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMiniPlayerVisible(false);
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all ml-0.5 outline-none"
              title="Close Player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Back to top floating button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full glass-panel border border-white/20 text-white/80 hover:text-white hover:border-[#00E5FF] transition-all shadow-xl hover:scale-110 active:scale-95"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Interactive Booking Inquiry Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        prefilledEvent={selectedTourEvent}
      />

      {/* Video Showreel Modal */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        onOpenBooking={handleOpenBooking}
      />
    </div>
  );
}