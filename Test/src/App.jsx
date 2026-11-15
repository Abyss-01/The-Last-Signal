import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import Viewport3D from './components/Viewport3D';
import IglooHeader from './components/IglooHeader';
import ScrollStages, { SCROLL_CHAPTERS } from './components/ScrollStages';
import ScrollProgressHUD from './components/ScrollProgressHUD';
import HoverCard from './components/HoverCard';
import InfoPanel from './components/InfoPanel';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import { getPrefersReducedMotion, subscribePrefersReducedMotion } from './utils/motion';
import { soundEngine } from './utils/audio';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0.0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [selectedAssemblyId, setSelectedAssemblyId] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('orbit');
  const [isAudioOn, setIsAudioOn] = useState(false);

  // Loading & Error states
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const lenisRef = useRef(null);

  const handleLoadingComplete = useCallback(() => setIsLoaded(true), []);
  const handleLoadError = useCallback((err) => setLoadError(err), []);

  // Motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion());

  useEffect(() => {
    return subscribePrefersReducedMotion((matches) => {
      setPrefersReducedMotion(matches);
    });
  }, []);

  // Lenis Ultra-Silky Smooth Scroll System
  useEffect(() => {
    if (prefersReducedMotion) {
      const handleScroll = () => {
        const scrollY = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(1.0, Math.max(0.0, scrollY / docHeight)) : 0.0;
        setScrollProgress(progress);
        const chapterIdx = Math.min(
          SCROLL_CHAPTERS.length - 1,
          Math.floor(progress * (SCROLL_CHAPTERS.length - 0.2))
        );
        setActiveChapterIndex(chapterIdx);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false
    });
    lenisRef.current = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    lenis.on('scroll', ({ scroll, limit }) => {
      const progress = limit > 0 ? Math.min(1.0, Math.max(0.0, scroll / limit)) : 0.0;
      setScrollProgress(progress);

      const chapterIdx = Math.min(
        SCROLL_CHAPTERS.length - 1,
        Math.floor(progress * (SCROLL_CHAPTERS.length - 0.2))
      );
      setActiveChapterIndex(chapterIdx);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  // Jump to Chapter
  const handleJumpToChapter = useCallback((index) => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetRatio = index / (SCROLL_CHAPTERS.length - 1);
    const targetScrollY = targetRatio * docHeight;

    if (lenisRef.current && !prefersReducedMotion) {
      lenisRef.current.scrollTo(targetScrollY, { duration: 1.1 });
    } else {
      window.scrollTo({
        top: targetScrollY,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
    soundEngine.playStageTransition();
  }, [prefersReducedMotion]);

  // Reassemble action
  const handleReassemble = useCallback(() => {
    if (lenisRef.current && !prefersReducedMotion) {
      lenisRef.current.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
    setSelectedAssemblyId(null);
    setCameraPreset('orbit');
    soundEngine.playChirp(520, 0.08, 0.08);
  }, [prefersReducedMotion]);

  // Toggle Audio
  const handleToggleAudio = useCallback(() => {
    const active = soundEngine.toggle();
    setIsAudioOn(active);
  }, []);

  // Hover Handler from 3D Viewport
  const handleHoverComponent = useCallback((component, pos) => {
    setHoveredComponent(component);
    setMousePos(pos);
    if (component) {
      soundEngine.playChirp(1200, 0.02, 0.03);
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'r' || e.key === 'R') {
        handleReassemble();
      } else if (e.key === 'a' || e.key === 'A') {
        setAutoRotate((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleAudio();
      } else if (e.key === 'd' || e.key === 'D') {
        setIsDossierOpen((prev) => !prev);
      } else if (e.key === '1') {
        setCameraPreset('orbit');
        soundEngine.playChirp(700, 0.03, 0.05);
      } else if (e.key === '2') {
        setCameraPreset('eva');
        soundEngine.playChirp(800, 0.03, 0.05);
      } else if (e.key === '3') {
        setCameraPreset('top');
        soundEngine.playChirp(900, 0.03, 0.05);
      } else if (e.key === '4') {
        setCameraPreset('low');
        soundEngine.playChirp(600, 0.03, 0.05);
      } else if (e.key === 'Escape') {
        setSelectedAssemblyId(null);
        setIsDossierOpen(false);
      } else if (e.key === ']') {
        handleJumpToChapter(Math.min(SCROLL_CHAPTERS.length - 1, activeChapterIndex + 1));
      } else if (e.key === '[') {
        handleJumpToChapter(Math.max(0, activeChapterIndex - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReassemble, handleJumpToChapter, handleToggleAudio, activeChapterIndex]);

  return (
    <div className="igloo-app-root">
      {/* Fixed Fullscreen 3D Viewport */}
      <Viewport3D
        scrollProgress={scrollProgress}
        onHoverComponent={handleHoverComponent}
        selectedAssemblyId={selectedAssemblyId}
        setSelectedAssemblyId={setSelectedAssemblyId}
        autoRotate={autoRotate}
        prefersReducedMotion={prefersReducedMotion}
        onLoadingProgress={setLoadingProgress}
        onLoadingComplete={handleLoadingComplete}
        onError={handleLoadError}
        cameraPreset={cameraPreset}
      />

      {/* Floating Cursor Hover Card */}
      <HoverCard
        hoveredComponent={hoveredComponent}
        mousePos={mousePos}
      />

      {/* Igloo Header */}
      <IglooHeader
        scrollProgress={scrollProgress}
        onReassemble={handleReassemble}
        onToggleDossier={() => setIsDossierOpen(!isDossierOpen)}
        isDossierOpen={isDossierOpen}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        cameraPreset={cameraPreset}
        onSelectPreset={(p) => {
          setCameraPreset(p);
          soundEngine.playChirp(750, 0.03, 0.05);
        }}
        isAudioOn={isAudioOn}
        onToggleAudio={handleToggleAudio}
      />

      {/* Vertical Timeline Progress HUD */}
      <ScrollProgressHUD
        scrollProgress={scrollProgress}
        activeChapterIndex={activeChapterIndex}
        onJumpToChapter={handleJumpToChapter}
      />

      {/* Interactive Scroll Chapters that glide over the fixed 3D canvas */}
      <main className="scroll-content-wrapper">
        <ScrollStages
          activeChapterIndex={activeChapterIndex}
          onJumpToChapter={handleJumpToChapter}
        />
      </main>

      {/* Curatorial Dossier & NASA Source Verification Drawer */}
      <InfoPanel
        selectedAssemblyId={selectedAssemblyId}
        setSelectedAssemblyId={setSelectedAssemblyId}
        isOpen={isDossierOpen}
        setIsOpen={setIsDossierOpen}
      />

      {/* Loading Screen with Draco & Byte Indicators */}
      {!isLoaded && !loadError && (
        <LoadingScreen progress={loadingProgress} />
      )}

      {/* Error Fallback */}
      {loadError && (
        <ErrorScreen
          error={loadError}
          onRetry={() => {
            setLoadError(null);
            setIsLoaded(false);
            setLoadingProgress(0);
          }}
        />
      )}
    </div>
  );
}
