import React from 'react';

export default function ErrorScreen({ error, onRetry }) {
  return (
    <div className="error-overlay" role="alert">
      <div className="error-card">
        <div className="error-badge">EXHIBIT LOADING ERROR</div>
        <h2 className="error-title">Unable to Load 3D Asset</h2>
        <p className="error-message">
          {error?.message || 'An unexpected error occurred while parsing or rendering the 3D module.'}
        </p>

        <div className="error-details">
          <strong>Target Asset:</strong> <code>Apollo Lunar Module.glb</code>
          <br />
          <strong>Troubleshooting:</strong>
          <ul>
            <li>Ensure the file is served from the <code>public/</code> root or active server path.</li>
            <li>Verify WebGL is enabled in your browser settings.</li>
            <li>Check network console for CORS or 404 HTTP status.</li>
          </ul>
        </div>

        <button
          className="btn btn-primary"
          onClick={onRetry}
          aria-label="Retry loading the 3D asset"
        >
          ↻ Retry Loading Exhibit
        </button>
      </div>
    </div>
  );
}
