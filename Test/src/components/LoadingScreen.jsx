import React from 'react';

export default function LoadingScreen({ progress, error }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-badge">EXHIBIT PREPARATION</div>
        <h2 className="loading-title">Apollo Lunar Module Inspection</h2>
        <p className="loading-subtitle">
          Mounting 3D exhibit artifact: <code>Apollo Lunar Module.glb</code>
        </p>

        <div className="progress-bar-container" aria-label="Loading progress">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>

        <div className="loading-stats">
          <span>{Math.round(progress)}% loaded</span>
          <span>Asset size: 716.8 KB</span>
        </div>

        <p className="loading-hint">
          Initializing WebGL inspection viewport and parsing 134 scene mesh nodes...
        </p>
      </div>
    </div>
  );
}
