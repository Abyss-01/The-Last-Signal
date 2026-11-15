import React from 'react';

export default function IglooHeader({
  scrollProgress,
  onReassemble,
  onToggleDossier,
  isDossierOpen,
  autoRotate,
  onToggleAutoRotate
}) {
  const percent = Math.round((scrollProgress || 0) * 100);

  return (
    <header className="igloo-header" role="banner">
      <div className="header-left">
        <span className="brand-dot" />
        <span className="brand-title">APOLLO LUNAR MODULE</span>
        <span className="brand-sub">ARTIFACT L-01</span>
      </div>

      <div className="header-center">
        <div className="status-pill">
          <span className="pulse-green" />
          <span>IN SITU LUNAR RECONNAISSANCE</span>
          <span className="coord-text">0.67408° N, 23.47297° E</span>
        </div>
      </div>

      <div className="header-right">
        <div className="scroll-indicator-chip" title="Current exploded deconstruction progress">
          <span className="chip-label">EXPLODED</span>
          <span className="chip-value">{String(percent).padStart(2, '0')}%</span>
        </div>

        <button
          className={`btn-igloo-ghost ${autoRotate ? 'active' : ''}`}
          onClick={onToggleAutoRotate}
          title="Toggle camera auto orbit [A]"
          aria-label="Toggle camera auto orbit"
        >
          {autoRotate ? '⏸ PAUSE ORBIT' : '⟳ AUTO ORBIT'}
        </button>

        <button
          className="btn-igloo-ghost"
          onClick={onReassemble}
          title="Restore assembly to original flight configuration [R]"
          aria-label="Reassemble spacecraft"
        >
          ↺ REASSEMBLE
        </button>

        <button
          className={`btn-igloo-outline ${isDossierOpen ? 'active' : ''}`}
          onClick={onToggleDossier}
          aria-label="Toggle Curatorial Dossier [D]"
        >
          {isDossierOpen ? '✕ CLOSE DOSSIER' : '📋 CURATORIAL DOSSIER'}
        </button>
      </div>
    </header>
  );
}
