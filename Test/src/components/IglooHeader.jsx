import React, { useState, useEffect } from 'react';
import { soundEngine } from '../utils/audio';

export default function IglooHeader({
  scrollProgress,
  onReassemble,
  onToggleDossier,
  isDossierOpen,
  autoRotate,
  onToggleAutoRotate,
  cameraPreset,
  onSelectPreset,
  isAudioOn,
  onToggleAudio
}) {
  const percent = Math.round((scrollProgress || 0) * 100);
  const [utcTime, setUtcTime] = useState('');

  // Live Mission UTC clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${h}:${m}:${s} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="igloo-header" role="banner">
      {/* Left: Brand Identity & Mission Telemetry */}
      <div className="header-left">
        <div className="brand-dot-pulse" />
        <div className="brand-titles">
          <span className="brand-title">APOLLO LUNAR MODULE</span>
          <span className="brand-sub">ARTIFACT LM-5 // 0.674°N, 23.473°E</span>
        </div>
      </div>

      {/* Center: Live UTC Clock & Camera Preset Dock */}
      <div className="header-center">
        <div className="telemetry-pill">
          <span className="telemetry-time">{utcTime || '12:00:00 UTC'}</span>
          <span className="telemetry-sep">|</span>
          <span className="telemetry-site">TRANQUILITY BASE</span>
        </div>

        {/* Cinematic Camera Angle Presets */}
        <div className="camera-preset-bar" role="group" aria-label="Camera Presets">
          <span className="preset-label">CAM:</span>
          <button
            className={`btn-preset ${cameraPreset === 'orbit' ? 'active' : ''}`}
            onClick={() => onSelectPreset('orbit')}
            title="Isometric 3/4 Orbit View [1]"
            aria-label="Isometric Orbit View"
          >
            3/4 HERO
          </button>
          <button
            className={`btn-preset ${cameraPreset === 'eva' ? 'active' : ''}`}
            onClick={() => onSelectPreset('eva')}
            title="Forward EVA Porch & Ladder View [2]"
            aria-label="EVA Porch View"
          >
            EVA
          </button>
          <button
            className={`btn-preset ${cameraPreset === 'top' ? 'active' : ''}`}
            onClick={() => onSelectPreset('top')}
            title="Overhead Docking Tunnel & Radar View [3]"
            aria-label="Overhead Docking View"
          >
            TOP
          </button>
          <button
            className={`btn-preset ${cameraPreset === 'low' ? 'active' : ''}`}
            onClick={() => onSelectPreset('low')}
            title="Low-Angle Lunar Surface Hero View [4]"
            aria-label="Low Angle View"
          >
            LOW
          </button>
        </div>
      </div>

      {/* Right: Controls & Dossier */}
      <div className="header-right">
        {/* Exploded Progress Chip */}
        <div className="scroll-indicator-chip" title="Current exploded deconstruction progress">
          <span className="chip-label">EXPLODED</span>
          <span className="chip-value">{String(percent).padStart(2, '0')}%</span>
        </div>

        {/* Audio Toggle */}
        <button
          className={`btn-igloo-ghost ${isAudioOn ? 'active' : ''}`}
          onClick={onToggleAudio}
          title="Toggle deep-space ambient audio [M]"
          aria-label="Toggle ambient audio"
        >
          {isAudioOn ? '🔊 AUDIO ON' : '🔇 AUDIO OFF'}
        </button>

        {/* Auto Orbit Toggle */}
        <button
          className={`btn-igloo-ghost ${autoRotate ? 'active' : ''}`}
          onClick={onToggleAutoRotate}
          title="Toggle camera auto orbit [A]"
          aria-label="Toggle camera auto orbit"
        >
          {autoRotate ? '⏸ PAUSE ORBIT' : '⟳ AUTO ORBIT'}
        </button>

        {/* Reassemble Button */}
        <button
          className="btn-igloo-ghost"
          onClick={onReassemble}
          title="Restore assembly to flight configuration [R]"
          aria-label="Reassemble spacecraft"
        >
          ↺ REASSEMBLE
        </button>

        {/* Curatorial Dossier Drawer */}
        <button
          className={`btn-igloo-outline ${isDossierOpen ? 'active' : ''}`}
          onClick={onToggleDossier}
          title="Open Curatorial Dossier & NASA Source Citations [D]"
          aria-label="Toggle Curatorial Dossier"
        >
          {isDossierOpen ? '✕ CLOSE' : '📋 CURATORIAL DOSSIER'}
        </button>
      </div>
    </header>
  );
}
